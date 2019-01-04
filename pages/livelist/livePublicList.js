// pages/livelist/livePublicList.js
import api from '../../api/api.js';
import common from '../../utils/common.js';
//获取应用实例
var app = getApp();
var interval = null;
var courseid = null;
var categoryid = null;
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
      centerBtnClick: 0
    },
    live_list_icon: ['../../image/live/yxjd.png', '../../image/live/jcyd.png', '../../image/live/chuanjiang.png', '../../image/live/jdtj.png', '../../image/live/jcyd.png', '../../image/live/zdcj.png', '../../image/live/kqmx.png'],
    templateList: '',
    ymCategory: '',
    public_list: '',
    vip_list: '',
    centerBtnClickIndex: 0,
    publicshow: true,
    vipshow: false,
    time: '',
    countDownTime: '',
    scrollTop: 0,
    floorstatus: false,
    switchClassCategory: 0, //是否选择分类用于回调
    isScanCodeJoin: 0 //是否扫描二维码进入
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    courseid = options.courseid;
    categoryid = options.categoryid;
    this.setData({
      live_module_all: JSON.parse(options.live_module)
    });
    this.checkSystemOS();
    //是否二维码进入
    if (categoryid != undefined && courseid != undefined) {
      this.setData({ isScanCodeJoin: 1 });
      swan.setStorageSync('categoryid', categoryid);
      swan.setStorageSync('courseid', courseid);
    }
    // this.getPublicCourseList();
    this.getgongkaikelistByCategoryid(categoryid);
    // this.setSwitchClassCategory(wx.getStorageSync('categoryNavIndex'));
    this.checkcourse();
    this.checkcourse_live_module();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //切换课程两种情况1、从我的课程进入2、从选择分类进入
    if (this.data.switchClassCategory == 1) {
      // this.setSwitchClassCategory(wx.getStorageSync('categoryNavIndex'));
      this.getPublicCourseList();
    } else {
      //解决切换考试数据刷新问题
      var courseidSNC = swan.getStorageSync('courseid');
      // console.log(courseid + "////" + courseidSNC);
      if (courseid != courseidSNC && courseid != undefined) {
        courseid = courseidSNC;
        if (courseid.length > 0) {
          var categoryid = swan.getStorageSync('categoryid');
          // this.setSwitchClassCategory(wx.getStorageSync('categoryNavIndex'));
          this.getPublicCourseList();
        }
      }
    }
    this.checkcourse_live_module();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopcountDownHandler();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.stopcountDownHandler();
  },

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
  onShareAppMessage: function () { },
  //获取考试类别
  getExamCategory: function (categoryid, courseid) {
    api.getExamCategory({
      methods: 'GET',
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var bigclass = data.bigclass;
          var smallclass;
          // var sectionArr = [];
          // var isCategorid = 0;
          // var bigclassIndex = 0;
          // var smallclassIndex = 0;
          for (var i = 0; i < bigclass.length; i++) {
            bigclass[i].title = decodeURI(bigclass[i].title);
            smallclass = bigclass[i].smallclass;
            switch (i) {
              case 0:
                bigclass[i].title = '金融学院';
                break;
              case 1:
                bigclass[i].title = '财会学院';
                break;
              case 2:
                bigclass[i].title = '工程学院';
                break;
              case 3:
                bigclass[i].title = '综合学院';
                break;
              case 4:
                bigclass[i].title = '医药学院';
                break;
              default:
                break;
            }
            for (var j = 0; j < smallclass.length; j++) {
              smallclass[j].title = decodeURI(smallclass[j].title);
              smallclass[j].shorttitle = decodeURI(smallclass[j].shorttitle);
              // if (categoryid == smallclass[j].id) {
              //   isCategorid = 1;
              //   bigclassIndex = i;
              //   smallclassIndex = j;
              // }
            }
          }
          // if (isCategorid == 1){
          //   this.getCourseByCategory(categoryid);
          //   smallclass = bigclass[bigclassIndex].smallclass;
          //   for (var j = 0; j < smallclass.length; j++) {
          //     sectionArr.push({ name: smallclass[j].shorttitle, id: smallclass[j].id });
          //   }
          //   wx.setStorageSync('categoryid', smallclass[smallclassIndex].id);
          //   wx.setStorageSync('categoryname', smallclass[smallclassIndex].title);
          //   wx.setStorageSync('bk_smallclass', smallclass);
          //   if (smallclass != undefined && smallclass.length > 0) {
          //     this.setData({ smallclass: smallclass });
          //     this.setData({
          //       nav: {
          //         section: sectionArr,
          //         currentId: categoryid,
          //         backgroundColor: 0,
          //         scrollLeft: smallclassIndex >= 4 ? 78 * smallclassIndex : 0,
          //       },
          //     });
          //     this.getlivelistByCategoryid(smallclassIndex);
          //   }
          // }
          this.setData({ bigclass: bigclass });
          swan.setStorageSync('bk_bigclass', bigclass);
          this.getPublicCourseList();
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
  //根据考试ID读取所有直播
  getgongkaikelistByCategoryid: function (categoryid) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.getlivelistByCategoryid({
      methods: 'POST',
      data: {
        categoryid: categoryid,
        // sessionid: sessionid,
        // uid: uid,
        uid: '',
        showsijiaolive: '',
        liveid: ''
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data.vip_list);
        if (data.errcode == 0) {
          this.setData({ public_list: data.vip_list });
          this.setData({ public_list_copy: data.vip_list });
          this.makeData("public", data.vip_list);
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
  getlivelistByCategoryid: function (index) {
    // var categoryid = wx.getStorageSync('categoryid');
    api.getlivelistByCategoryid({
      methods: 'POST',
      data: {
        categoryid: categoryid,
        type: '25,26'
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ vip_list: data.vip_list });
          this.setData({ vip_list_copy: data.vip_list });
          this.makeData("vip", data.vip_list);
          // // 二维码扫描进入
          // if (courseid != undefined && categoryid != undefined && this.data.isScanCodeJoin == 1){
          //   this.setData({ isScanCodeJoin: 0 });
          //   this.scanCodeJoin(categoryid, courseid, index);
          // }
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
   * 组装直播列表导航
   */
  getPublicCourseList: function () {
    api.getPublicCourseList({
      methods: 'POST',
      data: {
        from: app.globalData.from
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var liveBigclass = [];
          liveBigclass = data.list;
          var bigclass = swan.getStorageSync('bk_bigclass');
          if (bigclass == undefined || bigclass.length < 1) {
            this.getExamCategory(categoryid, courseid);
          } else {
            var smallclassTemp;
            var categoryidTemp;
            for (var i = 0; i < bigclass.length; i++) {
              smallclassTemp = bigclass[i].smallclass;
              for (var j = 0; j < smallclassTemp.length; j++) {
                categoryidTemp = smallclassTemp[j].id;
                for (var k = 0; k < liveBigclass.length; k++) {
                  if (categoryidTemp == liveBigclass[k].categoryid) {
                    liveBigclass[k].shorttitle = smallclassTemp[j].shorttitle;
                  }
                }
              }
            }
            //扫描二维码直接进入
            if (this.data.isScanCodeJoin == 1) {
              var sectionArr = [];
              var liveBigclassIndex = 0;
              for (var i = 0; i < liveBigclass.length; i++) {
                sectionArr.push({ name: liveBigclass[i].shorttitle, id: liveBigclass[i].categoryid });
                if (liveBigclass[i].categoryid == categoryid) {
                  liveBigclassIndex = i;
                  // wx.setNavigationBarTitle({
                  //   title: liveBigclass[i].title
                  // })
                  this.setData({
                    nav: {
                      section: sectionArr,
                      currentId: categoryid,
                      backgroundColor: 0,
                      scrollLeft: i >= 4 ? 78 * i : 0
                    }
                  });
                }
              }
              this.setData({ liveBigclass: liveBigclass });
              this.setSwitchClassCategory(liveBigclassIndex);
            } else {
              this.setData({ liveBigclass: liveBigclass });
              this.setSwitchClassCategory(swan.getStorageSync('categoryNavIndex'));
            }
            this.checkAccount();
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
  makeLiveData: function () { },
  makeData: function (listType, data) {
    var todayData = {};
    var publicData = {};
    var nowTime = this.getNowTime(false);
    var startminutes;
    var endminutes;
    var ymVipCategory = [];
    var ymCategory = [];
    var length = data.length;
    if (data.length > 10) {
      // length = 30;
    }
    var startTime;
    var endTime;
    var yearStr;
    var monthStr;
    var ymdata = {};
    var todayData = {};
    var nowTime = this.getNowTime(false);
    for (var a = 0; a < length; a++) {
      startTime = this.strToDate(data[a].startTime.replace(/-/g, '/'));
      endTime = this.strToDate(data[a].endTime.replace(/-/g, '/'));
      if (data[a].teacher == "" || data[a].teacher == null) {
        data[a].teacher = "帮考老师";
      }
      if (data[a].teachericon == "" || data[a].teachericon == null) {
        data[a].teachericon = "../../image/video/head.png";
      }

      //近期直播
      var arr = common.splitToArray(data[a].liveday, "-");
      yearStr = arr[0];
      monthStr = parseInt(arr[1]);
      ymdata = {
        year: yearStr,
        month: monthStr
      };
      if (ymCategory.length > 0) {
        var isExistence = 0;
        for (var b = 0; b < ymCategory.length; b++) {
          if (yearStr + "" + monthStr == ymCategory[b].year + ymCategory[b].month) {
            isExistence = 1;
          }
        }
        if (isExistence == 0) {
          ymCategory.push(ymdata);
        }
      } else {

        ymCategory.push(ymdata);
      }

      startminutes = startTime.getMinutes(); //定义个变量保存秒数
      endminutes = endTime.getMinutes(); //定义个变量保存秒数
      if (startminutes < 10) {
        startminutes = "0" + startminutes;
      } //秒数前加个0   
      if (endminutes < 10) {
        endminutes = "0" + endminutes;
      }
      data[a].year = startTime.getFullYear();
      data[a].month = parseInt(startTime.getMonth()) + 1;
      data[a].day = startTime.getDate();
      data[a].startTimeHour = startTime.getHours() + ":" + startminutes;
      data[a].endTimeHour = endTime.getHours() + ":" + endminutes;

      var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000;
      var timestamp2 = Date.parse(startTime);
      timestamp2 = timestamp2 / 1000;

      if (timestamp2 >= timestamp) {
        data[a].countDownTime = this.parseTime(timestamp2 - timestamp);
      }
    }
    if (listType == "public") {
      this.setData({ ymPublicCategory: ymCategory });
      this.setData({ public_list: data });
    } else if (listType == "vip") {
      this.setData({ ymVipCategory: ymCategory });
      this.setData({ vip_list: data });
    }

    this.countDownHandler();
  },
  getNowTime: function (isHMS) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    if (month < 10) {
      month = '0' + month;
    };
    if (day < 10) {
      day = '0' + day;
    };
    var formatDate;
    if (isHMS == true) {
      //  如果需要时分秒，就放开
      var h = now.getHours();
      var m = now.getMinutes();
      var s = now.getSeconds();
      if (h < 10) {
        h = '0' + h;
      };
      if (m < 10) {
        m = '0' + m;
      };
      if (s < 10) {
        s = '0' + s;
      };
      formatDate = year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
    } else {
      formatDate = year + '-' + month + '-' + day;
    }

    return formatDate;
  },
  publicClick: function () {
    if (this.data.publicshow != true) {
      this.setData({ publicshow: true });
      this.setData({ vipshow: false });
    }
  },
  vipClick: function () {
    if (this.data.vipshow != true) {
      this.setData({ publicshow: false });
      this.setData({ vipshow: true });
    }
  },
  publicCellClick: function (event) {
    var index = event.currentTarget.dataset.index;
    var channelnumber = this.data.public_list[index].channelNumber;
    var chatroomid = this.data.public_list[index].roomid;
    var videotype = this.data.public_list[index].type;
    var courseid = this.data.public_list[index].courseId;
    var nowTime = this.getNowTime(false);
    if (courseid == 0) {
      var clicktype;
      if (this.data.public_list[index].state == 2 && nowTime == this.data.public_list[index].liveday) {
        clicktype = "today";
        // this.checkIsBuy(videotype, channelnumber, chatroomid, index, "today");
      } else {
        clicktype = "public";
        // this.checkIsBuy(videotype, channelnumber, chatroomid, index, "public");
      }
      if (clicktype == "today" && this.data.public_list[0].state == 2) {
        swan.showModal({
          title: '温馨提示',
          content: '直播回放正在火速剪切上传中，敬请期待。',
          confirmText: "确定",
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              return;
            } else { }
          }
        });
      } else {
        var url = '../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
        // console.log(url);
        swan.navigateTo({
          url: url
        });
      }
    } else {
      if (this.data.public_list[index].state == 2 && nowTime == this.data.public_list[index].liveday) {
        this.getvideocodebychannelnumber(courseid, videotype, channelnumber, chatroomid, index, "today");
      } else {
        this.getvideocodebychannelnumber(courseid, videotype, channelnumber, chatroomid, index, "public");
      }
    }
  },
  vipCellClick: function (event) {
    var index = event.currentTarget.dataset.index;
    var channelnumber = this.data.vip_list[index].channelNumber;
    var chatroomid = this.data.vip_list[index].roomid;
    var videotype = this.data.vip_list[index].type;
    var courseid = this.data.vip_list[index].courseId;
    var nowTime = this.getNowTime(false);
    if (courseid == 0) {
      var clicktype;
      if (this.data.vip_list[index].state == 2 && nowTime == this.data.vip_list[index].liveday) {
        clicktype = "today";
        // this.checkIsBuy(videotype, channelnumber, chatroomid, index, "today");
      } else {
        clicktype = "today";
        // this.checkIsBuy(videotype, channelnumber, chatroomid, index, "public");
      }
      if (clicktype == "today" && this.data.public_list[0].state == 2) {
        swan.showModal({
          title: '温馨提示',
          content: '今日直播回放正在火速剪切上传中，敬请期待。',
          confirmText: "确定",
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              return;
            } else { }
          }
        });
      } else {
        var url = '../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
        swan.navigateTo({
          url: url
        });
      }
    } else {
      if (this.data.vip_list[index].state == 2 && nowTime == this.data.vip_list[index].liveday) {
        this.getvideocodebychannelnumber(courseid, videotype, channelnumber, chatroomid, index, "today");
      } else {
        this.getvideocodebychannelnumber(courseid, videotype, channelnumber, chatroomid, index, "public");
      }
    }
  },
  checkIsBuy: function (videotype, channelnumber, chatroomid, index, clicktype) {
    // var checkcourseVO = wx.getStorageSync('checkcourseVO');
    var checkcourseVO = this.data.liveCheckcourseVO;
    //已经购买直接进入，未购买检测免费时长

    if (videotype == 25) {
      if (clicktype == "today" && this.data.public_list[0].state == 2) {
        swan.showModal({
          title: '温馨提示',
          content: '直播回放正在火速剪切上传中，敬请期待。',
          confirmText: "确定",
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

              return;
            } else { }
          }
        });
      } else {
        var url = '../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
        swan.navigateTo({
          url: url
        });
      }
    } else if (videotype == 26) {

      if (clicktype == "today" && this.data.public_list[0].state == 2) {
        swan.showModal({
          title: '温馨提示',
          content: '今日直播回放正在火速剪切上传中，敬请期待。',
          confirmText: "确定",
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

              return;
            } else { }
          }
        });
      } else {
        var url = '../live/liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
        swan.navigateTo({
          url: url
        });
      }
    }
  },
  makeTimeData: function (listType, data) {
    if (data.length > 0) {
      var length = data.length;
      for (var i = 0; i < length; i++) {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;

        var timestamp2 = Date.parse(this.strToDate(data[i].startTime.replace(/-/g, '/')));
        timestamp2 = timestamp2 / 1000;
        var timestamp3 = Date.parse(this.strToDate(data[i].endTime.replace(/-/g, '/')));

        timestamp3 = timestamp3 / 1000;
        // console.log(timestamp3 + "|" + timestamp2 + "|" + timestamp);
        if (timestamp2 >= timestamp) {
          data[i].countDownTime = this.parseTime(timestamp2 - timestamp);
        }
        // console.log(timestamp2 - timestamp + "/" + timestamp3 - timestamp);
        if (timestamp2 - timestamp <= 0 && timestamp3 - timestamp >= 0) {
          data[i].state = '1';
        } else if (timestamp2 - timestamp <= 0 && timestamp3 - timestamp < 0) {
          data[i].state = '2';
        } else if (timestamp3 - timestamp > 0 && timestamp3 - timestamp <= 60 * 60 * 24) {
          data[i].state = '3';
        } else {
          data[i].state = '0';
        }
      }
      if (listType == "public") {
        this.setData({ public_list: data });
      } else if (listType == "vip") {
        this.setData({ vip_list: data });
      }
    }
  },
  //直播倒计时
  countDownHandler: function () {
    if (!interval) {
      interval = setInterval(() => {
        if (this.data.public_list.length > 0) {
          this.makeTimeData("public", this.data.public_list);
        }
        if (this.data.public_list.length > 0) {
          this.makeTimeData("public", this.data.public_list);
        }
        if (this.data.vip_list.length > 0) {
          this.makeTimeData("vip", this.data.vip_list);
        }
        //console.log('计时开始' + this.data.displayTime);
      }, 1000);
    }
  },
  stopcountDownHandler: function () {
    console.log('stop');
    if (interval) {
      clearInterval(interval);
      interval = null;
    } else { }
  },
  parseTime: function (time) {
    var dd = parseInt(time / 60 / 60 / 24);

    var hh = parseInt(time / 60 / 60 % 24);
    if (hh < 10) hh = '0' + hh;

    var mm = parseInt(time / 60 % 60);
    if (mm < 10) mm = '0' + mm;
    var ss = parseInt(time % 60);
    if (ss < 10) ss = '0' + ss;
    // var ssss = parseInt(this.data.time % 100);
    // if(ssss<10) ssss = '0'+ssss;
    // return `${mm}:${ss}:${ssss}`

    if (dd > 0) {
      return `${dd}天${hh}:${mm}:${ss}`;
    }
    if (hh > 0) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  },
  /**
    * 字符串转换为时间
    * @param  {String} src 字符串
    */
  strToDate: function (dateObj) {
    dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/');
    dateObj = dateObj.slice(0, dateObj.indexOf("."));
    return new Date(dateObj);
  },
  goTop: function (e) {
    this.setData({
      scrollTop: 0
    });
  },
  scrollclick: function (e) {
    if (e.detail.scrollTop > 500) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },
  leftBtnClick: function () {
    var url = '../learn/classCategory/classCategory?liveListType=1';
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
    var centerBtnClickIndex = this.data.centerBtnClickIndex;
    this.setData({
      navigation: {
        leftBtn: 0,
        // leftBtnImg: '../../image/navigation/back.png',
        leftBtnTitle: '切换',
        centerBtn: 1,
        centerBtnUpImg: '../../image/navigation/up.png',
        centerBtnDownImg: '../../image/navigation/down.png',
        centerBtnTitle: this.data.navigation.viewTitleList[centerBtnClickIndex],
        centerBtnClick: index,
        viewTitleList: this.data.navigation.viewTitleList
        // rightBtn: 0,
        // rightBtnImg: '../../image/navigation/back.png',
        // rightBtnTitle: '',
      }
    });
  },
  scanCodeJoin: function (categoryid, courseid, index) {
    var smallclass = swan.getStorageSync('bk_smallclass');
    if (smallclass == undefined || smallclass.length < 1) {
      this.getExamCategory(categoryid, courseid);
    } else {
      this.scanCodeJoinNext(categoryid, index);
    }
  },
  scanCodeJoinNext: function (categoryid, index) {
    var smallclass = swan.getStorageSync('bk_smallclass');
    // var centerBtnClickIndex = 0;
    for (var i = 0; i < smallclass.length; i++) {
      if (smallclass[i].id == categoryid) {
        // wx.setNavigationBarTitle({
        //   title: smallclass[i].title
        // })
        console.log(12312312 + categoryid);
        swan.setStorageSync('categoryNavIndex', i);
        // this.setSwitchClassCategory(i);
        this.setData({
          nav: {
            section: this.data.nav.section,
            currentId: categoryid,
            backgroundColor: 0,
            scrollLeft: i >= 4 ? 78 * i : 0
          }
        });
      }
    }
  },
  downviewClick: function (event) {
    var centerBtnIndex = this.data.navigation.centerBtnIndex;
    if (centerBtnIndex == 0) {
      centerBtnIndex = 1;
    } else {
      centerBtnIndex = 0;
    }
    var index = event.currentTarget.dataset.index;
    this.setData({ "centerBtnClickIndex": index });
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
          centerBtnClick: centerBtnIndex,
          viewTitleList: this.data.navigation.viewTitleList
          // rightBtn: 0,
          // rightBtnImg: '../../image/navigation/back.png',
          // rightBtnTitle: '',
        }
      });
    }
    // wx.setStorageSync('centerBtnClickIndex', index > 0 ? index - 1 : wx.getStorageSync('centerBtnClickIndex'));

    var public_list_temp = [];
    var vip_list_temp = [];
    if (index == 0) {
      courseid = swan.getStorageSync('courseid');
      this.setData({ public_list: this.data.public_list_copy });
      this.setData({ vip_list: this.data.vip_list_copy });

      this.makeData("public", this.data.public_list);
      this.makeData("vip", this.data.vip_list);
    } else {
      swan.setStorageSync('courseid', this.data.courselist[index - 1].id);
      courseid = swan.getStorageSync('courseid');
      for (var i = 0; i < this.data.public_list_copy.length; i++) {
        if (this.data.public_list_copy[i].courseId == courseid) {
          public_list_temp.push(this.data.public_list_copy[i]);
        }
      }
      for (var i = 0; i < this.data.vip_list_copy.length; i++) {
        if (this.data.vip_list_copy[i].courseId == courseid) {
          vip_list_temp.push(this.data.vip_list_copy[i]);
        }
      }
      this.setData({ public_list: public_list_temp });
      this.setData({ vip_list: vip_list_temp });

      this.makeData("public", this.data.public_list);
      this.makeData("vip", this.data.vip_list);
    }
    //单单切换顶部课程只需重新组装直播数据和顶部数据
    // this.setformalcourseterm();
    // this.getShuaticountLivecountVodcount();
  },
  /**
   * 选择分类后相关设置
   */
  // setSwitchClassCategory: function () {
  //   var courselist = JSON.parse(wx.getStorageSync('bk_courselist'));
  //   var smallclass;
  //   var viewTitleList = ["默认全部课程"];
  //   for (var i = 0; i < courselist.length; i++) {
  //     viewTitleList.push(courselist[i].title);
  //   }
  //   this.setData({ courselist: courselist });
  //   if (courselist != undefined && courselist.length > 0) {
  //     var centerBtnClickIndex = 0;
  //     this.setData({
  //       navigation: {
  //         leftBtn: 0,
  //         // leftBtnImg: '../../image/navigation/back.png',
  //         leftBtnTitle: '切换',
  //         centerBtn: 1,
  //         centerBtnUpImg: '../../image/navigation/up.png',
  //         centerBtnDownImg: '../../image/navigation/down.png',
  //         centerBtnTitle: viewTitleList[centerBtnClickIndex],
  //         centerBtnClick: 0,
  //         viewTitleList: viewTitleList
  //         // rightBtn: 0,
  //         // rightBtnImg: '../../image/navigation/back.png',
  //         // rightBtnTitle: '',
  //       },
  //     });
  //     this.setData({ centerBtnClickIndex : 0});
  //     this.getlivelistByCategoryid();
  //   }
  // },
  /**
  * 选择分类后相关设置
  */
  setSwitchClassCategory: function (index) {
    var liveBigclass = this.data.liveBigclass;
    index = index == "" ? 0 : index;
    // index = index > liveBigclass.length ? 0 : index;
    if (liveBigclass != undefined && liveBigclass.length > 0) {
      // wx.setNavigationBarTitle({
      //   title: liveBigclass[index].title
      // })
      var sectionArr = [];
      for (var i = 0; i < liveBigclass.length; i++) {
        sectionArr.push({ name: liveBigclass[i].shorttitle, id: liveBigclass[i].categoryid });
      }
      categoryid = liveBigclass[index].categoryid;
      courseid = swan.getStorageSync('courseid');
      this.setData({
        nav: {
          section: sectionArr,
          currentId: categoryid,
          backgroundColor: 0,
          scrollLeft: index >= 4 ? 78 * index : 0
        }
      });
      this.getlivelistByCategoryid(index);
    } else {
      this.getExamCategory(categoryid, courseid);
    }
    // var smallclass = wx.getStorageSync('bk_smallclass');
    // index = index > smallclass.length ? 0 : index;
    // if (smallclass != undefined && smallclass.length > 0) {
    //   this.setData({ smallclass: smallclass });

    // }
    this.checkAccount();
  },
  vipClick: function () {
    if (this.data.vipshow != true) {
      this.setData({ publicshow: false });
      this.setData({ vipshow: true });
    }
  },
  otherClick: function () {
    var url = '../learn/classCategory/classCategory?liveListType=1';
    swan.navigateTo({
      url: url
    });
  },
  handleTap: function (event) {
    var index = event.currentTarget.dataset.index;
    // if (index - 1 == wx.getStorageSync('categoryNavIndex')) {
    //   return;
    // }
    categoryid = this.data.liveBigclass[index].categoryid;
    swan.setStorageSync('categoryNavIndex', index);
    // wx.setStorageSync('categoryid', this.data.liveBigclass[index].categoryid);
    // wx.setNavigationBarTitle({
    //   title: this.data.liveBigclass[index].title
    // })
    this.setSwitchClassCategory(index);
  },
  checkAccount: function () {
    var userinfo = swan.getStorageSync('userinfo');
    if (userinfo == "" || userinfo == null || userinfo == undefined) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未选择课程，请先切换考试',
        confirmText: "确定",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            var url = '../me/me';
            swan.switchTab({
              url: url
            });
            return;
          } else {
            return;
          }
        }
      });
      return;
    }
  },
  /**
  * 检查课程信息
  */
  checkcourse: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.checkcourse({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        ip: ''
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          this.setData({
            liveCheckcourseVO: data
          });
          // this.checkIsBuy(videotype, channelnumber, chatroomid, index, clicktype);
          // wx.setStorageSync('liveCheckcourseVO', data);
        } else if (data.errcode == 40036) {//请先购买课程

        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          request_thirdauth(0);
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
  /**
  * 检查课程信息
  */
  getvideocodebychannelnumber: function (courseid, videotype, channelnumber, chatroomid, index, clicktype) {
    var checkBind = this.checkUserInfo();
    if (checkBind == false) {
      return;
    }
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.getvideocodebychannelnumber({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        channelnumber: channelnumber,
        videosource: app.globalData.videosource,
        definition: app.globalData.definition
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          this.checkIsBuy(videotype, channelnumber, chatroomid, index, clicktype);
        } else if (data.errcode == 40003) {
          //请先购买课程
          common.hintInfo();
        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          request_thirdauth(0);
        } else {
          //尚未绑定帮考网账号等错误
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "确定",
            showCancel: false,
            success: function (res) { }
          });
        }
      }
    });
  },
  checkUserInfo: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未登录帮考网，请先登录！',
        confirmText: "立即登录",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var bindurl = '../me/bind/bind';
            swan.navigateTo({
              url: bindurl
            });
          } else {
            return;
          }
        }
      });
      return false;
    } else {
      return true;
    }
  },
  live_moduleClick: function (event) {
    var index = event.currentTarget.dataset.index;
    swan.setStorageSync('learnCheckIndex', index);
    //直播列表
    var live_module = this.data.live_module;
    var liveindex = index;
    var url = '../live/liveNew?liveindex=' + liveindex + '&title=' + live_module[index].shorttitle;
    swan.navigateTo({
      url: url
    });
  },
  /**
  * 检查课程信息
  */
  checkcourse_live_module: function () {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    console.log(checkcourseVO);
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var courseid = swan.getStorageSync('courseid');
    var that = this;
    api.checkcourse({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        ip: ''
      },
      success: res => {
        // that.checkcourse();
        var data = res.data;
        console.log(data);
        var live_list_icon = this.data.live_list_icon;
        var live_module_all = this.data.live_module_all;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          for (var i = 0; i < live_module_all.length; i++) {
            live_module_all[i].icon = live_list_icon[i];
            live_module_all[i].show = false;
            for (var j = 0; j < data.live_module.length; j++) {
              if (data.live_module[j].liveid == live_module_all[i].liveid) {
                live_module_all[i].show = true;
              }
            }
          }
          this.setData({
            live_module: live_module_all
          });
        } else if (data.errcode == 40036) {//请先购买课程

        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          request_thirdauth(0);
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
  checkSystemOS: function () {
    var that = this;
    swan.getSystemInfo({
      success: function (res) {
        that.setData({ "mobileOS": res.platform });
      }
    });
  }
});