// pages/redPacket/redPacket.js
import api from '../../api/api.js';
import request from '../../api/request.js';
import common from '../../utils/common.js';

//获取应用实例
var app = getApp();
var bk_userinfo;
var sessionid;
var uid;
var courseid;

var recordArr = [{
  id: '36',
  icon: '../../image/learn/record/introductory_learn.png',
  title: '入门导学',
  show: true
}, {
  id: '',
  icon: '../../image/learn/record/textbook_refinement.png',
  title: '国家教材精讲',
  show: true
}, {
  id: '23',
  icon: '../../image/learn/record/fine_exercises.png',
  title: '习题精讲',
  show: true
}, {
  id: '18',
  icon: '../../image/learn/record/exam_crosstalk.png',
  title: '考前串讲',
  show: true
}];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 0,
      leftBtnImg: '../../image/navigation/back.png',
      leftBtnTitle: '切换',
      centerBtn: 1,
      centerBtnUpImg: '../../image/navigation/up.png',
      centerBtnDownImg: '../../image/navigation/down.png',
      centerBtnTitle: '学习',
      backgroundColor: '1',
      centerBtnClick: 0
    },
    templateList: '',
    switchClassCategory: 0, //是否选择分类用于回调
    touchStart: '0',
    redpacketHidden: true,
    animationData: '',
    record: [],

    live: [],
    imgUrls: ['../../image/home/lunbo1.png', '../../image/home/lunbo2.png', '../../image/home/lunbo3.png'],
    bigmoduleicon: ['../../image/home/home_icon_listening.png', '../../image/home/home_icon_live.png', '../../image/home/home_icon_video.png', '../../image/home/home_icon_subject.png'],
    indicatorDots: false, //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔
    duration: 1000, //滑动动画时长
    inputShowed: false,
    inputVal: "",
    currentSwiper: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var sharecourseid = options.sharecourseid;
    var sharecategoryid = options.sharecategoryid;
    var sharecoursename = options.sharecoursename;
    var sharecategoryname = options.sharecategoryname;
    console.log(sharecourseid + sharecategoryid + sharecoursename + sharecategoryname);
    if (sharecourseid != undefined && sharecategoryid != undefined && sharecoursename != undefined && sharecategoryname != undefined) {
      swan.setStorageSync('courseid', sharecourseid);
      swan.setStorageSync('categoryid', sharecategoryid);
      swan.setStorageSync('coursename', sharecoursename);
      swan.setStorageSync('categoryname', sharecategoryname);
      this.getCourseByCategory(sharecategoryid);
    } else {
      this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
    }
    this.checkSystemOS();
    this.getTemplateByCategoryid();
    // this.lunbo();
    this.checkcourse_v9();
    this.bkwappindexadlist();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var animation = swan.createAnimation({
      transformOrigin: "50% 50%",
      duration: 800,
      timingFunction: "ease",
      delay: 1000
    });
    this.animation = animation;

    this.animation.scale(2, 2).rotate(45).step();

    this.slideupshow(this, 'animationData', -200, 0);
    setTimeout(function () {
      this.slideupshow(this, 'animationData', 0, 1);
    }.bind(this), 800);
    this.setData({
      animationData: this.animation.export()
    });
  },
  //滑动渐入渐出
  slideupshow: function (that, param, px, opacity) {
    var animation = swan.createAnimation({
      duration: 800,
      timingFunction: 'ease'
    });
    animation.translateY(px).opacity(opacity).step();
    //将param转换为key
    var json = '{"' + param + '":""}';
    json = JSON.parse(json);
    json[param] = animation.export();
    //设置动画
    that.setData(json);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //红包返回后变小
    if (swan.getStorageSync('backhome') != undefined) {
      this.redpacketCloseClick();
    }
    var index = swan.getStorageSync('navIndex');
    if (index == null || index == '') {
      index = 0;
    }
    swan.setStorageSync('courseid', this.data.courselist[index].id);
    app.globalData.courseid = this.data.courselist[index].id;
    var redPacketReceivestate = swan.getStorageSync('redPacketReceivestate');
    if (redPacketReceivestate == 1) {
      this.setData({ redpacketHidden: true });
    }
    swan.setNavigationBarTitle({
      title: swan.getStorageSync('categoryname')
    });
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var userinfo = swan.getStorageSync('userinfo');
    if (userinfo != "") {
      // this.setData({ userinfo: userinfo });
      // this.setData({ headPortrait: userinfo.avatarUrl });
      // this.setData({ username: userinfo.nickName });
      // // this.checkOpenPower();
      // this.checkFight();
    } else {
      this.showCustomModal(false);
    }
    this.showLiveModel();
    //切换课程两种情况1、从我的课程进入2、从选择分类进入
    if (this.data.switchClassCategory == 1) {
      this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
    } else {
      //解决切换考试数据刷新问题
      var courseidSNC = swan.getStorageSync('courseid');
      // console.log(courseid + "////" + courseidSNC);
      if (courseid != courseidSNC && courseid != undefined) {
        courseid = courseidSNC;
        if (courseid.length > 0) {
          var categoryid = swan.getStorageSync('categoryid');
          this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
        }
      }
    }
    //修改考期后重新请求检查课程信息
    if (this.data.refresh == 1) {
      request.request_checkcourse();
    }
    // this.checkcourse_v9();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log('/pages/find/monthExam/monthExam?sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid'));
    var courseName = swan.getStorageSync('coursename');
    return {
      title: swan.getStorageSync('categoryname') + '-' + swan.getStorageSync('coursename'),
      desc: '帮考网学习中心',
      path: '/pages/redpacket/redPacket?sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid') + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname')
    };
  },
  swiperChange: function (e) {
    this.setData({
      currentSwiper: e.detail.current
    });
  },
  brushClick: function (event) {
    var index = event.currentTarget.dataset.index;
    switch (index) {
      case 0:
        //智能刷题
        var url = '../index/index';
        swan.switchTab({
          url: url
        });
        break;
      case 1:
        this.checkIsBindding(null, 30);
        break;
      case 2:
        this.checkIsBindding(null, 11);
        break;
      case 3:
        this.checkIsBindding(null, 5);
        break;
      case 4:
        this.checkIsBindding(null, 6);
        break;
      case 5:
        this.checkIsBindding(null, 17);
        break;
      case 6:
        var url = '../find/learningAnalysis/learningAnalysis';
        this.checkIsBindding(url, null);
        break;
      case 7:
        var url = '../find/learningRecord/learningRecord';
        this.checkIsBindding(url, null);
        break;
      case 8:
        //错题回顾
        var url = '../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[4][0].type + '&name=' + getApp().globalData.learnType[4][1].name;
        this.checkIsBindding(url, null);
        break;
      case 9:
        //收藏题库
        var url = '../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[6][0].type + '&name=' + getApp().globalData.learnType[6][1].name;
        this.checkIsBindding(url, null);
        break;
      case 10:
        //笔记题库
        var url = '../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[7][0].type + '&name=' + getApp().globalData.learnType[7][1].name;
        this.checkIsBindding(url, null);
        break;
      case 11:
        //月度考试
        var url = '../find/monthExam/monthExam?learnType=' + getApp().globalData.learnType[14][0].type + '&name=' + getApp().globalData.learnType[14][1].name;
        this.checkIsBindding(url, null);
        break;
      default:
        break;

    }
  },
  checkIsBindding: function (url, type) {
    //url也当作index在使用
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未登录帮考网，请先登录！',
        confirmText: "立即登录",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../me/bind/bind';
            swan.navigateTo({
              url: url
            });
          } else {
            return;
          }
        }
      });
    } else {
      if (type == 5 || type == 6 || type == 11 || type == 17 || type == 30 || type == 18 || type == 23 || type == 36 || type == 26) {
        this.checkIsBuy(url, type);
      } else {
        swan.navigateTo({
          url: url
        });
      }
    }
  },
  checkIsBuy: function (index, type) {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    var learnType;
    if (type == 18 || type == 23 || type == 36 || type == 26) {
      if (type == 18 && checkcourseVO.m18 == 1 || type == 23 && checkcourseVO.m23 == 1 || type == 36 && checkcourseVO.m36 == 1 || type == 26 && checkcourseVO.m26 == 1) {
        // console.log(type);
        if (type == 18) {
          swan.navigateTo({
            url: '../video/videoList/videoList?learnType=' + this.data.record[index].id + '&name=' + this.data.record[index].title
          });
        }
        if (type == 23) {
          swan.navigateTo({
            url: '../video/videoList/videoList?learnType=' + this.data.record[index].id + '&name=' + this.data.record[index].title
          });
        }
        if (type == 36) {
          swan.navigateTo({
            url: '../video/videoList/videoList?learnType=' + this.data.record[index].id + '&name=' + this.data.record[index].title
          });
        }
        if (type == 26) {
          swan.navigateTo({
            url: '../video/videoList/videoList?learnType=' + type + '&name=' + this.data.record[index].title + '&id=' + this.data.record[index].id
          });
        }
      } else {
        common.hintInfo(this.data.mobileOS);
      }
    }
    if (checkcourseVO.m5 == 1 || checkcourseVO.m6 == 1 || checkcourseVO.m6 == 3) {
      if (type == 5) {
        //模拟测试
        swan.navigateTo({
          url: '../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[2][0].type + '&name=' + getApp().globalData.learnType[2][1].name
        });
      }

      if (type == 6 && checkcourseVO.m6 == 3) {
        if (parseInt(checkcourseVO.changekaoqitimes) < 1) {
          swan.showModal({
            title: '温馨提示',
            content: '考前押题在您当次考试前20天推出，请先完成其它模块的学习！',
            confirmText: "修改考期",
            cancelText: "取消",
            success: function (res) {
              if (res.confirm) {
                var url = 'updateExamTime/updateExamTime';
                swan.navigateTo({
                  url: url
                });
              } else {
                return;
              }
            }
          });
        } else {
          swan.showModal({
            title: '温馨提示',
            content: '您已修改过考期，考前押题在您当次考试前20天推出，请先完成其它模块的学习',
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              if (res.confirm) { } else {
                return;
              }
            }
          });
        }
      } else if (type == 6 && checkcourseVO.m6 == 1) {
        //考前押题
        swan.navigateTo({
          url: '../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[3][0].type + '&name=' + getApp().globalData.learnType[3][1].name
        });
      }

      if (type == 11) {
        //历年真题
        swan.navigateTo({
          url: '../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[5][0].type + '&name=' + getApp().globalData.learnType[5][1].name
        });
      }

      if (type == 17) {
        //猜你会错
        swan.navigateTo({
          url: '../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[11][0].type + '&name=' + getApp().globalData.learnType[11][1].name
        });
      }

      if (type == 30) {
        //猜你会错
        swan.navigateTo({
          url: '../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[12][0].type + '&name=' + getApp().globalData.learnType[12][1].name
        });
      }
    } else {
      common.hintInfo(this.data.mobileOS);
    }
  },
  liveClick: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == 0) {
      var categoryid = swan.getStorageSync('categoryid');
      var url = '../livelist/livePublicList?courseid=' + courseid + '&categoryid=' + categoryid;
      swan.navigateTo({
        url: url
      });
    } else {
      swan.setStorageSync('learnCheckIndex', index - 1);
      //直播列表
      var liveindex = index - 1;
      var url = '../live/liveNew?liveindex=' + liveindex;
      swan.navigateTo({
        url: url
      });
    }

    // wx.switchTab({
    //   url: url
    // })
  },
  serviceClick: function (event) {
    var index = event.currentTarget.dataset.index;
    // console.log(index);
    switch (index) {
      // case 0:
      //   wx.navigateTo({
      //     url: '../learn/classCategory/classCategory'
      //   })
      //   break;
      case 1:
        this.calling();
        break;
      case 2:
        swan.navigateTo({
          url: '../me/wechatService/wechatService'
        });
        break;
      case 3:
        var checkcourseVO = swan.getStorageSync('checkcourseVO');
        if (checkcourseVO.banxing_tiku == 0) {
          common.hintInfo(this.data.mobileOS);
        } else {
          // wx.switchTab({
          //   url: '../answerquestion/answerQuestion'
          // })
          swan.navigateTo({
            url: '../answerquestion/answerQuestion'
          });
        }
        break;
      case 4:
        swan.navigateTo({
          url: '../me/checkin/checkin'
        });
        break;
      default:
        break;
    }
  },
  //拨打电话
  calling: function () {
    swan.makePhoneCall({
      phoneNumber: '4006601360', //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！");
      },
      fail: function () {
        console.log("拨打电话失败！");
      }
    });
  },
  //显示直播
  showLiveModel: function () {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    if (checkcourseVO == "") {
      return;
    }
    if (checkcourseVO.live_module.length > 0) {
      var iconArrs = ['../../image/learn/live/teaching_materials.png', '../../image/learn/live/mine_sweeping.png', '../../image/learn/live/example_explanation.png', '../../image/learn/live/case_studies.png', '../../image/learn/live/true_explain.png', '../../image/learn/live/examination_skills.png', '../../image/learn/live/strengthen_crosstalk.png'];

      var title = null;
      var icon = null;
      var liveItem = {};
      var liveArrs = [];
      liveArrs.push({
        icon: '../../image/learn/live/case_studies.png',
        title: '公开课',
        show: true
      });
      for (var i = 0; i < checkcourseVO.live_module.length; i++) {
        title = checkcourseVO.live_module[i].shorttitle;
        if (title.length < 1) {
          title = checkcourseVO.live_module[i].title;
        }
        if (i >= iconArrs.length) {
          icon = iconArrs[3];
        } else {
          icon = iconArrs[i];
        }
        liveItem = {
          icon: icon,
          title: title,
          show: true
        };
        liveArrs.push(liveItem);
      }
      // console.log(liveArrs.length % 3);
      if (liveArrs.length % 3 != 0) {
        var liveArrLength = liveArrs.length % 3 - 1;
        if (liveArrLength < 1) {
          liveArrLength = 2;
        }
        for (var i = 0; i < liveArrLength; i++) {
          liveArrs.push({
            icon: '',
            title: '',
            show: true
          });
        }
      }
      this.setData({ live: liveArrs });
    }
  },
  getformalcourseterm: function () {
    var courseid = swan.getStorageSync('courseid');
    var categoryid = swan.getStorageSync('categoryid');
    if (categoryid == '' || categoryid == null) {
      swan.setStorageSync('bk_courselist', app.globalData.bk_courselist);
      if (courseid.length < 1) {
        swan.setStorageSync('categoryid', app.globalData.categoryid); //已经选择
        swan.setStorageSync('categoryname', app.globalData.categoryname);
        swan.setStorageSync('courseid', app.globalData.courseid);
        swan.setStorageSync('coursename', app.globalData.coursename);
      }
    }
    api.getformalcourseterm({
      methods: 'POST',
      data: {
        courseid: courseid,
        categoryid: categoryid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          var formalCourseList = data.list;
          if (formalCourseList.length > 0) {
            var iconArrs = ['../../image/learn/record/introductory_learn.png', '../../image/learn/record/textbook_refinement.png', '../../image/learn/record/fine_exercises.png', '../../image/learn/record/exam_crosstalk.png'];

            var title = null;
            var icon = null;
            var id = null;
            var recordItem = {};
            var recordArrs = this.data.record;
            for (var i = 0; i < formalCourseList.length; i++) {
              title = formalCourseList[i].title;
              id = formalCourseList[i].id;
              if (title.length < 1) {
                title = formalCourseList[i].subtitle;
              }
              if (i >= recordArrs.length - 4) {
                icon = iconArrs[i];
              } else {
                icon = iconArrs[3];
              }
              recordItem = {
                id: id,
                icon: icon,
                title: title,
                show: true
              };
              recordArrs.push(recordItem);
            }
            // console.log((recordArrs.length-4) % 3);
            if (recordArrs.length % 3 != 0) {
              var recordArrsLength = (recordArrs.length - 4) % 3 - 1;
              if (recordArrsLength < 1) {
                recordArrsLength = 1;
              }
              for (var i = 0; i < recordArrsLength; i++) {
                recordArrs.push({
                  id: '',
                  icon: '',
                  title: '',
                  show: true
                });
              }
            }
            this.setData({ record: recordArrs });
          }
          //this.setData({ publicCourse: data });
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  recordClick: function (event) {
    var index = event.currentTarget.dataset.index;
    var id = event.currentTarget.dataset.id;
    if (this.data.showmoduletohome[index].title < 1) {
      return;
    }
    if (id == null || id == "") {
      //国家教材精讲
      var url = '../video/video?back=1';
      swan.switchTab({
        url: url
      });
      return;
    }
    switch (parseInt(id)) {
      case 36:
        this.checkIsBindding(index, 36);
        break;
      case 23:
        this.checkIsBindding(index, 23);
        break;
      case 18:
        this.checkIsBindding(index, 18);
        break;
      default:
        this.checkIsBindding(index, 26); //26当作直播正式课
        break;

    }
  },
  redPacketClick: function () {
    console.log();
    var url = '../activity/fightgroups/fightgroups';
    swan.switchTab({
      url: url
    });
  },
  redpacketCloseClick: function () {
    this.setData({ redpacketHidden: true });
  },
  getTemplateByCategoryid: function () {
    var categoryid = swan.getStorageSync('categoryid');
    if (categoryid == '' || categoryid == null) {
      swan.setStorageSync('bk_courselist', app.globalData.bk_courselist);
      if (courseid.length < 1) {
        swan.setStorageSync('categoryid', app.globalData.categoryid); //已经选择
        swan.setStorageSync('categoryname', app.globalData.categoryname);
        swan.setStorageSync('courseid', app.globalData.courseid);
        swan.setStorageSync('coursename', app.globalData.coursename);
        // wx.redirectTo({
        // url: '../course/changeCategory/changeCategory'
        // url: '../course/changeSubject/changeSubject'
        // });
      }
      // wx.redirectTo({
      //   url: '../learn/classCategory/classCategory'
      // });
      // return;
    }
    api.getTemplateByCategoryid({
      methods: 'POST',
      data: {
        categoryid: categoryid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;

        if (data.errcode == 0) {
          var templateList = data.list;
          this.setData({ templateList: templateList });
          var redPacketReceivestate = swan.getStorageSync('redPacketReceivestate');
          if (templateList.length > 0 && redPacketReceivestate != 1) {
            this.setData({ redpacketHidden: false });
          } else {
            this.setData({ redpacketHidden: true });
          }
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  // onPageScroll: function (e) {
  //   if(e.scrollTop > 0){
  //     this.setData({ touchStart: 1 });
  //   }else{
  //     this.setData({ touchStart: 0 });
  //   }
  // },
  // 触摸开始事件  
  touchStart: function (e) {
    this.setData({ touchStart: 1 });
  },
  // 触摸结束事件  
  touchEnd: function (e) {
    this.setData({ touchStart: 0 });
  },
  getShuaticountLivecountVodcount: function () {
    if (courseid == undefined) {
      courseid = swan.getStorageSync('courseid');
      bk_userinfo = swan.getStorageSync('bk_userinfo');
      sessionid = app.globalData.default_sessionid;
      uid = app.globalData.default_uid;
      if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
        sessionid = bk_userinfo.sessionid;
        uid = bk_userinfo.uid;
      }
    }
    api.getShuaticountLivecountVodcount({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          data.shuaticount = data.shuaticount + '道';
          data.live_timelength = this.parseTime(data.live_timelength);
          data.vod_timelength = this.parseTime(data.vod_timelength);
          this.setData({ topCountList: data });
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  leftBtnClick: function () {
    var url = 'classCategory/classCategory';
    swan.navigateTo({
      url: url
    });
  },
  centerBtnClick: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == 0) {
      index = 1;
    } else {
      index = 0;
    }
    this.setData({ centerBtnIndex: index });
    var centerBtnClickIndex = swan.getStorageSync('centerBtnClickIndex');
    if (centerBtnClickIndex == undefined) {
      centerBtnClickIndex = 0;
    }
    this.setData({
      navigation: {
        leftBtn: 0,
        // leftBtnImg: '../../image/navigation/back.png',
        leftBtnTitle: '切换',
        centerBtn: 1,
        centerBtnUpImg: '../../image/navigation/up.png',
        centerBtnDownImg: '../../image/navigation/down.png',
        centerBtnTitle: this.data.navigation.viewTitleList[centerBtnClickIndex],
        backgroundColor: '1',
        centerBtnClick: index,
        viewTitleList: this.data.navigation.viewTitleList
        // rightBtn: 0,
        // rightBtnImg: '../../image/navigation/back.png',
        // rightBtnTitle: '',
      }
    });
  },
  downviewClick: function (event) {
    var centerBtnIndex = this.data.navigation.centerBtnIndex;
    if (centerBtnIndex == 0) {
      centerBtnIndex = 1;
    } else {
      centerBtnIndex = 0;
    }
    var index = event.currentTarget.dataset.index;
    if (this.data.navigation.centerBtnTitle == this.data.navigation.viewTitleList[index]) {
      this.setData({
        navigation: {
          leftBtn: 0,
          // leftBtnImg: '../../image/navigation/back.png',
          leftBtnTitle: '切换',
          centerBtn: 1,
          centerBtnUpImg: '../../image/navigation/up.png',
          centerBtnDownImg: '../../image/navigation/down.png',
          centerBtnTitle: this.data.navigation.viewTitleList[index],
          backgroundColor: '1',
          centerBtnClick: centerBtnIndex,
          viewTitleList: this.data.navigation.viewTitleList
          // rightBtn: 0,
          // rightBtnImg: '../../image/navigation/back.png',
          // rightBtnTitle: '',
        }
      });
      return;
    } else {
      this.setData({
        navigation: {
          leftBtn: 0,
          // leftBtnImg: '../../image/navigation/back.png',
          leftBtnTitle: '切换',
          centerBtn: 1,
          centerBtnUpImg: '../../image/navigation/up.png',
          centerBtnDownImg: '../../image/navigation/down.png',
          centerBtnTitle: this.data.navigation.viewTitleList[index],
          backgroundColor: '1',
          centerBtnClick: centerBtnIndex,
          viewTitleList: this.data.navigation.viewTitleList
          // rightBtn: 0,
          // rightBtnImg: '../../image/navigation/back.png',
          // rightBtnTitle: '',
        }
      });
    }
    swan.setStorageSync('centerBtnClickIndex', index);
    swan.setStorageSync('courseid', this.data.courselist[index].id);
    courseid = swan.getStorageSync('courseid');
    //单单切换顶部课程只需重新组装直播数据和顶部数据
    this.setformalcourseterm();
    this.getShuaticountLivecountVodcount();
  },
  /**
   * 选择分类后相关设置
   */
  setSwitchClassCategory: function (index) {
    swan.setStorageSync('bk_courselist', app.globalData.bk_courselist);
    // if (courseid) {
    swan.setStorageSync('categoryid', app.globalData.categoryid); //已经选择
    swan.setStorageSync('categoryname', app.globalData.categoryname);
    swan.setStorageSync('courseid', app.globalData.courseid);
    swan.setStorageSync('coursename', app.globalData.coursename);

    var courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
    index = index > courselist.length ? 0 : index;
    this.setData({ courselist: courselist });
    if (courselist != undefined && courselist.length > 0) {
      var sectionArr = [];
      for (var i = 0; i < courselist.length; i++) {
        sectionArr.push({ name: courselist[i].shorttitle, id: courselist[i].id });
      }
      var courseid = courselist[index].id;
      this.setData({
        nav: {
          section: sectionArr,
          currentId: courseid.length > 0 ? courseid : courselist[0].id,
          backgroundColor: 1,
          scrollLeft: index >= 4 ? 78 * index : 0
        }
      });
      this.getShuaticountLivecountVodcount();
      this.setformalcourseterm();
    }
  },
  setformalcourseterm: function () {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    this.setData({ record: [] });
    if (checkcourseVO.m36 != 0) {
      this.data.record.push(recordArr[0]);
    }
    this.data.record.push(recordArr[1]);
    if (checkcourseVO.m23 != 0) {
      this.data.record.push(recordArr[2]);
    }
    if (checkcourseVO.m18 != 0) {
      this.data.record.push(recordArr[3]);
    }
    this.getformalcourseterm();
  },
  parseTime: function (time) {
    var dd = parseInt(time / 60 / 60 / 24);
    var hh = parseInt(time / 60 / 60 % 24);
    // if (hh < 10) hh = '0' + hh;
    var mm = parseInt(time / 60 % 60);
    // if (mm < 10) mm = '0' + mm;
    var ss = parseInt(time % 60);
    // if (ss < 10) ss = '0' + ss;
    // var ssss = parseInt(this.data.time % 100);
    // if(ssss<10) ssss = '0'+ssss;
    // return `${mm}:${ss}:${ssss}`
    if (dd > 0) {
      return `${dd}天${hh}时${mm}分${ss}秒`;
    }
    if (hh > 0) {
      return `${hh}时${mm}分${ss}秒`;
    }
    return `${mm}分${ss}秒`;
  },
  bigmoduleTap: function (even) {
    var index = even.currentTarget.dataset.index;
    switch (index) {
      case 0:
        swan.switchTab({
          url: '../auditions/auditions'
        });
        break;
      case 1:
        var categoryid = swan.getStorageSync('categoryid');
        var courseid = swan.getStorageSync('courseid');
        var live_module = JSON.stringify(this.data.live_module);
        var url = '../livelist/livePublicList?courseid=' + courseid + '&categoryid=' + categoryid + '&live_module=' + encodeURIComponent(live_module);
        swan.navigateTo({
          url: url
        });
        break;
      case 2:
        if (bk_userinfo == '' || bk_userinfo == null) {
          swan.showModal({
            title: '温馨提示',
            content: '您尚未登录帮考网，请先登录！',
            confirmText: "立即登录",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                var url = '../me/bind/bind';
                swan.navigateTo({
                  url: url
                });
              } else {
                return;
              }
            }
          });
        } else {
          swan.navigateTo({
            url: '../learn/liveVideoNum/liveVideoNum'
          });
        }
        break;
      case 3:
        swan.switchTab({
          url: '../learn/brushNum/brushNum'
        });
        break;
      default:
        break;
    }
  },
  handleTap: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == swan.getStorageSync('navIndex')) {
      return;
    }
    var that = this;
    swan.setStorageSync('navIndex', index);
    swan.setStorageSync('courseid', this.data.courselist[index].id);
    app.globalData.courseid = this.data.courselist[index].id;
    swan.setStorageSync('coursename', this.data.courselist[index].title);
    request.request_checkcourse();
    that.setSwitchClassCategory(index);
    this.checkcourse_v9();
  },
  //获取考试类别
  getCourseByCategory: function (id) {
    api.getCourseByCategory({
      methods: 'POST',
      data: {
        categoryid: id
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var courselist = data.courselist;
          var smallclass;
          for (var i = 0; i < courselist.length; i++) {
            courselist[i].title = decodeURI(courselist[i].title);
            courselist[i].shorttitle = decodeURI(courselist[i].shorttitle);
          }
          var courselist = JSON.stringify(courselist);
          swan.setStorageSync('bk_courselist', courselist);
          if (courselist != undefined && courselist.length > 0) {
            swan.setStorageSync('centerBtnClickIndex', 0);
            swan.setStorageSync('courseid', data.courselist[0].id);
            swan.setStorageSync('coursename', data.courselist[0].title);
            this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
          } else {
            var url = '../me/me';
            swan.switchTab({
              url: url
            });
          }
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  fadeIn: function () {
    // this.animation.scale(1).step();
    this.animation.translateY(10).step();
    this.setData({
      animationData: this.animation.export()
    });
  },
  checkcourse_v9: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var courseid = swan.getStorageSync('courseid');
    var that = this;
    var bigmoduleicon = this.data.bigmoduleicon;
    api.checkcourse({
      method: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid
      },
      success: function (res) {
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          if (data.bigmodule != undefined) {
            for (var i = 0; i < data.bigmodule.length; i++) {
              data.bigmodule[i].icon = bigmoduleicon[i];
            }
            that.setData({
              bigmodule: data.bigmodule,
              showmoduletohome: data.showmoduletohome,
              live_module: data.live_module
            });
          }
        } else if (data.errcode == 40036) {//请先购买课程

        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          request.request_thirdauth(0);
        } else {
          //尚未绑定帮考网账号等错误
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },
  bkwappindexadlist: function () {
    var categoryid = swan.getStorageSync('categoryid');
    var that = this;
    api.bkwappindexadlist({
      method: 'POST',
      data: {
        categoryid: categoryid,
        market: app.globalData.market
      },
      success: function (res) {
        var data = res.data;
        console.log(data);
        if (data.errcode == '0') {
          if (data.list.length > 0) {
            that.setData({
              lunbolist: data.list
            });
          }
        }
      }
    });
  },
  recordClick: function (event) {
    var index = event.currentTarget.dataset.index;
    var id = event.currentTarget.dataset.id;
    console.log(index, id);
    this.checkIsBindding(index, parseInt(id));
  },
  checkIsBindding: function (url, type) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未登录帮考网，请先登录！',
        confirmText: "立即登录",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../me/bind/bind';
            swan.navigateTo({
              url: url
            });
          } else {
            return;
          }
        }
      });
    } else {
      if (type == 14) {
        this.checkIsBuy(url, type);
      } else { }
    }
  },
  checkIsBuy: function (index, type) {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    var learnType;
    if (type == 14) {
      if (type == 14 && checkcourseVO.m14 == 1) {
        if (type == 14) {
          //国家精讲
          var url = '../video/video?back=1&cover=' + this.data.showmoduletohome[1].cover;
          swan.navigateTo({
            url: url
          });
        }
      } else {
        if (this.data.mobileOS == 'ios') {
          swan.showModal({
            title: '温馨提示',
            content: '请先使用帮考网APP或前往官网购买该课程!',
            showCancel: false,
            success: function (res) {
              return;
            }
          });
        } else {
          common.hintInfo(this.data.mobileOS);
        }
      }
    }
  },
  buycourse: function () {
    var url = '../course/buyCourse/buyCourseDetail/buyCourseDetail';
    swan.navigateTo({
      url: url
    });
  },
  checkSystemOS: function () {
    var that = this;
    swan.getSystemInfo({
      success: function (res) {
        that.setData({ "mobileOS": res.platform });
      }
    });
  },
  showCustomModal: function (authorizationHidden) {
    this.setData({
      modal: {
        modalType: 1,
        modalTitle: '帮考网',
        modalDes: '为了更好的为你提供考试服务\n将获得你的公开信息',
        modalBtnTitle: '确定',
        modalBtnType: 0,
        authorizationHidden: authorizationHidden
      }
    });
  }
});