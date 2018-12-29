// pages/learn/brushNum/brushNum.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
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
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '刷题数量'
    },
    brushlist: [{
      icon: '../../../image/learn/brush/icon_person_brush.png',
      title: '智能刷题',
      littletitle: '大数据分析用户数据，智能分配题库',
      show: true
    }, {
      icon: '../../../image/learn/brush/guess_wrong.png',
      title: '猜你会错',
      show: false
    }, {
      icon: '../../../image/learn/brush/linianzhenti.png',
      title: '历年真题',
      littletitle: '历年考试真题再现，真实考察的仿真训练',
      show: true
    }, {
      icon: '../../../image/learn/brush/icon_person_test.png',
      title: '模拟测试',
      littletitle: '仿照考试出题规则模拟考试，用于考前摸底',
      show: true
    }, {
      icon: '../../../image/learn/brush/icon_person_custody.png',
      title: '考前押题',
      littletitle: '考前精准预测，紧贴命题主线，考前最后冲刺',
      show: true
    }, {
      icon: '../../image/learn/brush/exam_point.png',
      title: '考点精解',
      show: false
    }, {
      icon: '../../image/learn/brush/learn_analysis.png',
      title: '学情分析',
      show: false
    }, {
      icon: '../../../image/learn/brush/icon_person_record.png',
      title: '刷题记录',
      littletitle: '可在这里查看你的每次刷题的记录',
      show: true
    }, {
      icon: '../../image/learn/brush/my_mistakes.png',
      title: '我的错题',
      show: false
    }, {
      icon: '../../image/learn/brush/my_collection.png',
      title: '我的收藏',
      show: false
    }, {
      icon: '../../image/learn/brush/my_note.png',
      title: '我的笔记',
      show: false
    }, {
      icon: '../../image/learn/brush/month_exam.png',
      title: '月度考试',
      show: false
    }],
    isHideLoadMore: true,
    pageindex: 1,
    pagesize: 10,
    loadMoreMsg: '加载更多',
    arc_lData: {},
    arc_rData: {},
    correct_rate: 12, //正确率
    cicleStr: '0',
    cicleSymbol: '%'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');
    this.getshuaticount();
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
    this.getTemplateByCategoryid();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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
    if (courseid != swan.getStorageSync('courseid')) {
      this.getshuaticount();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  handleTap: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == swan.getStorageSync('navIndex')) {
      return;
    }
    var that = this;
    swan.setStorageSync('navIndex', index);
    console.log(this.data.courselist[index].id);
    swan.setStorageSync('courseid', this.data.courselist[index].id);
    app.globalData.courseid = this.data.courselist[index].id;
    swan.setStorageSync('coursename', this.data.courselist[index].title);
    request.request_checkcourse();
    that.setSwitchClassCategory(index);
    that.getshuaticount();
  },
  //获取考试类别
  getshuaticount: function () {
    var courseid = swan.getStorageSync('courseid');
    api.getshuaticount({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid
      },
      success: res => {
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          data.wastetime = this.parseTime(data.wastetime);
          data.accuracy = data.accuracy.replace('%', '');
          this.setData({ brush: data });
          this.studyhistory();
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
  studyhistory: function () {
    var courseid = swan.getStorageSync('courseid');
    api.studyhistory_v3({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        state: -1,
        pageindex: this.data.pageindex,
        pagesize: this.data.pagesize,
        sort: 'desc'

      },
      success: res => {
        swan.hideToast();
        // this.setData({ isHideLoadMore: true })
        swan.hideNavigationBarLoading(); //完成停止加载
        var data = res.data;
        if (data.errcode == 0) {
          var learnType = app.globalData.learnType;
          if (this.data.pageindex > 1) {
            var learnlist = this.data.learnlist;
            learnlist = learnlist.concat(data.val);
            this.data.learnlist = learnlist;
            this.setData({ learnlist: this.data.learnlist });
          } else {
            this.setData({ learnlist: data.val });
          }
          for (var i = 0; i < this.data.learnlist.length; i++) {
            if (this.data.learnlist[i].wastetime > 0) {
              this.data.learnlist[i].wastetime = this.parseTime(this.data.learnlist[i].wastetime);
            } else {
              this.data.learnlist[i].wastetime = '0分0秒';
            }
            var optionArr = common.splitToArray(this.data.learnlist[i].accuracy, "%");
            this.data.learnlist[i].accuracy = optionArr[0];
          }
          this.setData({ learnlist: this.data.learnlist });
          for (var i = 0; i < this.data.learnlist.length; i++) {
            var correct_rate = this.data.learnlist[i].accuracy;
            this.drawCicle(correct_rate, i);
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
  scrolltolower: function (e) {
    console.log('加载更多' + e);
    if (this.data.learnlist.length % 10 != 0 || this.data.pageindex >= 10) {
      this.setData({ isHideLoadMore: false });
      this.setData({ loadMoreMsg: '暂无更多数据' });
      setTimeout(() => {
        this.setData({ isHideLoadMore: true });
      }, 1000);
    } else {
      swan.showNavigationBarLoading(); //在标题栏中显示加载
      this.setData({ pageindex: this.data.pageindex + 1 });
      this.studyhistory();
    }
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
  drawCicle: function (correct_rate, index) {
    var learnlist = this.data.learnlist;
    var arc_l_rotate = -135 + 3.6 * correct_rate;
    var arc_r_rotate = -135 + 3.6 * (correct_rate - 50);
    var animation1 = swan.createAnimation({
      transformOrigin: "50% 50%",
      duration: 600,
      timingFunction: "linear",
      delay: 0
    });
    if (correct_rate <= 50) {
      setTimeout(function () {
        animation1.rotate(arc_l_rotate).step();
        this.data.learnlist[index].arc_lData = animation1.export();
        this.setData({
          learnlist: this.data.learnlist
        });
      }.bind(this), 500);
    } else {
      setTimeout(function () {
        animation1.rotate(45).step();
        this.data.learnlist[index].arc_lData = animation1.export();
        this.setData({
          learnlist: this.data.learnlist
        });
      }.bind(this), 500);
      var animation2 = swan.createAnimation({
        transformOrigin: "50% 50%",
        duration: 600,
        timingFunction: "linear",
        delay: 600
      });
      setTimeout(function () {
        animation2.rotate(arc_r_rotate).step();
        this.data.learnlist[index].arc_rData = animation2.export();
        this.setData({
          learnlist: this.data.learnlist
        });
      }.bind(this), 500);
    }
  },
  studyhistoryYesListClick: function (e) {
    var index = e.currentTarget.dataset.index;
    var paperid = this.data.learnlist[index].paperid;
    var unitid = this.data.learnlist[index].unitid;
    var learnType = this.data.learnlist[index].type;
    var url = '../../course/paper/report/report?paperid=' + paperid + '&unitid=' + unitid + '&learnType=' + learnType + '&showLearn=false';
    swan.navigateTo({
      url: url
    });
  },
  studyhistoryNoListClick: function (e) {
    var index = e.currentTarget.dataset.index;
    var paperid = this.data.learnlist[index].paperid;
    var unitid = this.data.learnlist[index].unitid;
    var learnType = this.data.learnlist[index].type;
    // this.request_loadinitbylid(paperid, unitid, learnType, 0);
    this.request_loadrecordpaper(paperid, unitid, learnType, 0);
  },
  /**
  * 获取学习历史试卷_v2
  */
  request_loadrecordpaper: function (paperid, unitid, learnType, free) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    var courseid = swan.getStorageSync('courseid');
    if (sessionid == '' || sessionid == null || uid == '' || uid == null) {
      return;
    }
    api.loadrecordpaper({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        unitid: unitid,
        paperid: paperid,
        type: learnType,
        videosource: app.globalData.videosource,
        market: app.globalData.market
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var question = JSON.stringify(data);
          var url = '../../course/paper/studyPage/studyPage?unitid=' + unitid + '&paperid=' + data.paperid + '&question=' + question + '&learnType=' + learnType + '&history=1' + '&paperTitle=' + data.unitname;
          //console.log('url=' + url);
          swan.navigateTo({
            url: encodeURI(url)
          });
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
  getTemplateByCategoryid: function () {
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
  /**
   * 选择分类后相关设置
   */
  setSwitchClassCategory: function (index) {
    swan.setStorageSync('bk_courselist', app.globalData.bk_courselist);
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
  brushClick: function (event) {
    var index = event.currentTarget.dataset.index;
    switch (index) {
      case 0:
        //智能刷题
        var url = '../../index/index';
        swan.navigateTo({
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
        var url = '../../find/learningAnalysis/learningAnalysis';
        this.checkIsBindding(url, null);
        break;
      case 7:
        var url = '../../find/learningRecord/learningRecord';
        this.checkIsBindding(url, null);
        break;
      case 8:
        //错题回顾
        var url = '../../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[4][0].type + '&name=' + getApp().globalData.learnType[4][1].name;
        this.checkIsBindding(url, null);
        break;
      case 9:
        //收藏题库
        var url = '../../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[6][0].type + '&name=' + getApp().globalData.learnType[6][1].name;
        this.checkIsBindding(url, null);
        break;
      case 10:
        //笔记题库
        var url = '../../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[7][0].type + '&name=' + getApp().globalData.learnType[7][1].name;
        this.checkIsBindding(url, null);
        break;
      case 11:
        //月度考试
        var url = '../../find/monthExam/monthExam?learnType=' + getApp().globalData.learnType[14][0].type + '&name=' + getApp().globalData.learnType[14][1].name;
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
            var url = '../../me/bind/bind';
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
            url: '../../video/videoList/videoList?learnType=' + this.data.record[index].id + '&name=' + this.data.record[index].title
          });
        }
        if (type == 23) {
          swan.navigateTo({
            url: '../../video/videoList/videoList?learnType=' + this.data.record[index].id + '&name=' + this.data.record[index].title
          });
        }
        if (type == 36) {
          swan.navigateTo({
            url: '../../video/videoList/videoList?learnType=' + this.data.record[index].id + '&name=' + this.data.record[index].title
          });
        }
        if (type == 26) {
          swan.navigateTo({
            url: '../../video/videoList/videoList?learnType=' + type + '&name=' + this.data.record[index].title + '&id=' + this.data.record[index].id
          });
        }
      } else {
        swan.showModal({
          title: '温馨提示',
          content: '您尚未购买此课程，请先购买！',
          confirmText: "立即购买",
          cancelText: "残忍拒绝",
          success: function (res) {
            if (res.confirm) {
              var url = '../../course/buyCourse/buyCourseDetail/buyCourseDetail';
              swan.navigateTo({
                url: url
              });
            } else {
              return;
            }
          }
        });
      }
    }
    if (checkcourseVO.m5 == 1 || checkcourseVO.m6 == 1 || checkcourseVO.m6 == 3 || checkcourseVO.m6 == 2) {
      if (type == 5) {
        //模拟测试
        swan.navigateTo({
          url: '../../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[2][0].type + '&name=' + getApp().globalData.learnType[2][1].name
        });
      }
      console.log(checkcourseVO.m6);
      if (type == 6 && (checkcourseVO.m6 == 3 || checkcourseVO.m6 == 2)) {
        if (parseInt(checkcourseVO.changekaoqitimes) < 1) {
          swan.showModal({
            title: '温馨提示',
            content: '考前押题在您当次考试前20天推出，请先完成其它模块的学习！',
            confirmText: "修改考期",
            cancelText: "取消",
            success: function (res) {
              if (res.confirm) {
                var url = '../updateExamTime/updateExamTime';
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
              if (res.confirm) {} else {
                return;
              }
            }
          });
        }
      } else if (type == 6 && checkcourseVO.m6 == 1) {
        //考前押题
        swan.navigateTo({
          url: '../../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[3][0].type + '&name=' + getApp().globalData.learnType[3][1].name
        });
      }

      if (type == 11) {
        //历年真题
        swan.navigateTo({
          url: '../../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[5][0].type + '&name=' + getApp().globalData.learnType[5][1].name
        });
      }

      if (type == 17) {
        //猜你会错
        swan.navigateTo({
          url: '../../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[11][0].type + '&name=' + getApp().globalData.learnType[11][1].name
        });
      }

      if (type == 30) {
        //猜你会错
        swan.navigateTo({
          url: '../../find/unitExam/unitExam?learnType=' + getApp().globalData.learnType[12][0].type + '&name=' + getApp().globalData.learnType[12][1].name
        });
      }
    } else {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未购买此课程，请先购买！',
        confirmText: "立即购买",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../../course/buyCourse/buyCourseDetail/buyCourseDetail';
            swan.navigateTo({
              url: url
            });
          } else {
            return;
          }
        }
      });
    }
  }
});