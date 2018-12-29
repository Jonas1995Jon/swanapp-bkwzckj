// pages/course/paper/report.js
import api from '../../../../api/api.js';
import request from '../../../../api/request.js';
import common from '../../../../utils/common.js';
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '答题报告'
    },
    /*动画*/
    arc_lData: {},
    arc_rData: {},
    layeranimation: {},
    shadeimation: {},
    modal: true,
    paperid: '',
    unitid: '',
    learnType: '',
    paperHistory: '',
    paperHistoryCopy: '',
    branchNum: 0,
    rightNum: 0,
    wrongNum: 0,
    wastetime: 0,
    currentaccuracy: 0, //正确率
    handintime: '00:00', //交卷时间
    unitlist: '', //练习推荐内容
    prevPage: 2,
    showLearn: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var prevPage = options.prevPage;
    // var page;
    // var pages = getCurrentPages();
    // if (prevPage != undefined){
    //   this.setData({ prevPage: prevPage});
    // }
    // page = pages[pages.length - this.data.prevPage];
    // //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    // page.setData({
    //   submitPaperBtnHidden: true,
    // });
    var paperid = options.paperid;
    this.setData({ paperid: paperid });
    var unitid = options.unitid;
    this.setData({ unitid: unitid });
    var learnType = options.learnType;
    if (learnType != undefined) {
      this.setData({ learnType: learnType });
    }
    this.setData({ learnType: learnType });
    var showLearn = options.showLearn;
    if (showLearn != undefined) {
      this.setData({ showLearn: showLearn });
    }
    this.loadinitbylid(); //获取学习历史试卷_v2
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },
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
  onShareAppMessage: function () { },
  loadinitbylid: function () {
    if (this.data.learnType == 46) {
      this.getpaperdetail();
    } else {
      this.request_loadrecordpaper();
    }

    this.getUnitList();
  },
  /**
   * 获取学习历史试卷_v2
   */
  getpaperdetail: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    var courseid = swan.getStorageSync('courseid');
    if (sessionid == '' || sessionid == null || uid == '' || uid == null) {
      return;
    }
    api.getpaperdetail({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.learnType,
        paperid: this.data.paperid
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //交卷成功
          this.setData({ paperHistory: data });
          this.setData({ paperHistoryCopy: data });
          var list = this.data.paperHistory.list;
          var rightNum = 0; //答对道数
          var branchNum = 0; //支题道数
          for (var i = 0; i < list.length; i++) {
            if (list[i].parentqid.length > 1) {
              branchNum = branchNum + 1;
            }
          }
          for (var i = 0; i < list.length; i++) {
            if (list[i].isright == 1 && list[i].parentqid.length < 1) {
              rightNum = rightNum + 1;
            }
          }
          var wrongNum = list.length - branchNum - rightNum; //答错道数
          this.setData({ branchNum: branchNum });
          this.setData({ rightNum: rightNum });
          this.setData({ wrongNum: wrongNum });

          var currentaccuracy = this.data.paperHistory.currentaccuracy.replace('%', '');
          this.setData({ currentaccuracy: currentaccuracy });
          this.showCicle();

          var wastetime = this.data.paperHistory.wastetime; //本次自测时间
          this.setData({ wastetime: this.parseTime(wastetime) });

          var handintime = this.data.paperHistory.handintime; //本次交卷时间
          this.setData({ handintime: handintime });
          // newDate = handintime;
          // handintime = common.formatTime(newDate)
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
   * 获取学习历史试卷_v2
   */
  request_loadrecordpaper: function (data) {
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
        unitid: this.data.unitid,
        paperid: this.data.paperid,
        type: this.data.learnType,
        videosource: app.globalData.videosource,
        market: app.globalData.market
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //交卷成功
          this.setData({ paperHistory: data });
          this.setData({ paperHistoryCopy: data });
          var list = this.data.paperHistory.list;
          var rightNum = 0; //答对道数
          var branchNum = 0; //支题道数
          for (var i = 0; i < list.length; i++) {
            if (list[i].parentqid.length > 1) {
              branchNum = branchNum + 1;
            }
          }
          for (var i = 0; i < list.length; i++) {
            if (list[i].isright == 1 && list[i].parentqid.length < 1) {
              rightNum = rightNum + 1;
            }
          }
          var wrongNum = list.length - branchNum - rightNum; //答错道数
          this.setData({ branchNum: branchNum });
          this.setData({ rightNum: rightNum });
          this.setData({ wrongNum: wrongNum });

          var currentaccuracy = this.data.paperHistory.currentaccuracy.replace('%', '');
          this.setData({ currentaccuracy: currentaccuracy });
          this.showCicle();

          var wastetime = this.data.paperHistory.wastetime; //本次自测时间
          this.setData({ wastetime: this.parseTime(wastetime) });

          var handintime = this.data.paperHistory.handintime; //本次交卷时间
          this.setData({ handintime: handintime });
          // newDate = handintime;
          // handintime = common.formatTime(newDate)
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
  //获取opened 
  getUnitList: function () {
    var courseid = swan.getStorageSync('courseid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var firstLoginTime = swan.getStorageSync('firstLoginTime');
    var newDate = new Date();
    if (firstLoginTime == '' || firstLoginTime == null) {
      firstLoginTime = common.formatTime(newDate);
    }
    api.getUnitList({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: swan.getStorageSync('courseid'),
        ip: '',
        from: 'xiaochengxu',
        begintime: firstLoginTime,
        endtime: common.formatTime(newDate)
      },
      success: res => {
        var data = res.data;
        swan.hideToast();
        if (data.errcode == 0) {
          var data = res.data;
          this.setData({ unitlist: data.unitlist });
        } else if (data.errcode == 40052) {
          request.request_thirdauth(0);
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
  //错题解析
  errorParsing: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null || bk_userinfo == undefined) {
      this.checkBindAccount();
      return;
    }
    var list = this.data.paperHistory.list;
    var isWrong = 0; //是否有做错的题
    for (var i = 0; i < list.length; i++) {
      if (list[i].isright != 1) {
        isWrong = 1;
        break;
      }
    }
    if (isWrong == 1) {
      var pages = getCurrentPages();
      console.log(pages.length);
      var prevPage2 = pages[1];
      prevPage2.setData({
        paperindex: 0,
        parsingType: 1
      });
      var question = [];
      question = this.data.paperHistoryCopy;
      for (var i = question.list.length - 1; i >= 0; i--) {
        if (question.list[i].isright == 1) {
          question.list.splice(i, 1);
        }
      }
      question = JSON.stringify(question);
      var url = '../studyPage/studyPage?unitid=' + this.data.unitid + '&paperid=' + this.data.paperHistoryCopy.paperid + '&question=' + question + '&learnType=' + this.data.learnType + '&history=2' + '&paperTitle=' + this.data.paperHistoryCopy.unitname + '&parsingType=1' + '&titlename=0';
      url = url.replace(/%/g, '%25');
      swan.navigateTo({
        url: encodeURI(url)
      });
    } else {
      swan.showToast({
        title: '暂无做错的题',
        icon: 'success',
        duration: 1500
      });
    }
  },
  //全部解析
  allParsing: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null || bk_userinfo == undefined) {
      this.checkBindAccount();
      return;
    }
    var pages = getCurrentPages();
    var prevPage2 = pages[1];
    prevPage2.setData({
      paperindex: 0,
      parsingType: 2
    });
    //console.log(this.data.paperHistory);
    var question = JSON.stringify(this.data.paperHistory);
    // question = question.replace('%', '');
    var url = '../studyPage/studyPage?unitid=' + this.data.unitid + '&paperid=' + this.data.paperHistory.paperid + '&question=' + question + '&learnType=' + this.data.learnType + '&history=2' + '&paperTitle=' + this.data.paperHistory.unitname + '&parsingType=2' + '&titlename=0';
    url = url.replace(/%/g, '%25');
    swan.navigateTo({
      url: encodeURI(url)
    });
  },
  //继续学习
  learnContinue: function (event) {
    var index = event.currentTarget.dataset.index;
    var unitid = this.data.unitlist[index].unitid;
    var paperTitle = this.data.unitlist[index].title;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - (this.data.prevPage + 1)];
    var delta = this.data.prevPage == 2 ? 2 : 1;
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      index: index,
      unitid: unitid,
      isLearnContinue: 1,
      paperTitle: paperTitle
    });
    swan.navigateBack({
      delta: delta
    });
  },
  parseTime: function (wastetime) {
    var hh = parseInt(wastetime / 60 / 60);
    if (hh < 10) hh = '0' + hh;

    var mm = parseInt(wastetime / 60 % 60);
    if (mm < 10) mm = '0' + mm;
    var ss = parseInt(wastetime % 60);
    if (ss < 10) ss = '0' + ss;
    // var ssss = parseInt(this.data.time % 100);
    // if(ssss<10) ssss = '0'+ssss;
    // return `${mm}:${ss}:${ssss}`
    if (hh > 0) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  },
  /*打开弹框带动画*/
  openLayer: function () {
    this.setData({
      modal: false
    });
    var animationlayer = swan.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    animationlayer.opacity(1).rotateX(0).step();
    this.setData({
      layeranimation: animationlayer.export()
    });
    var animationshade = swan.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    animationshade.opacity(1).step();
    this.setData({
      modal: false,
      shadeimation: animationshade.export()
    });
  },
  /*打开弹框，防止点击内容被关闭*/
  showLyaer: function () {
    this.setData({
      modal: false
    });
  },
  /*关闭弹框，带动画*/
  closeLayer: function () {
    var animationlayer = swan.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    animationlayer.opacity(0).rotateX(-120).step();
    this.setData({
      layeranimation: animationlayer.export()
    });
    var animationshade = swan.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    animationshade.opacity(0).step();
    this.setData({
      shadeimation: animationshade.export()
    });
    setTimeout(function () {
      this.setData({
        modal: true
      });
    }.bind(this), 200);
  },
  showCicle: function () {
    var currentaccuracy = this.data.currentaccuracy;
    var arc_l_rotate = -135 + 3.6 * currentaccuracy;
    var arc_r_rotate = -135 + 3.6 * (currentaccuracy - 50);
    var animation1 = swan.createAnimation({
      transformOrigin: "50% 50%",
      duration: 600,
      timingFunction: "linear",
      delay: 0
    });
    if (currentaccuracy <= 50) {
      setTimeout(function () {
        animation1.rotate(arc_l_rotate).step();
        this.setData({
          arc_lData: animation1.export()
        });
        console.log(this.data.arc_lData);
      }.bind(this), 500);
    } else {
      setTimeout(function () {
        animation1.rotate(45).step();
        this.setData({
          arc_lData: animation1.export()
        });
        console.log(this.data.arc_lData);
      }.bind(this), 500);
      var animation2 = swan.createAnimation({
        transformOrigin: "50% 50%",
        duration: 600,
        timingFunction: "linear",
        delay: 600
      });
      setTimeout(function () {
        animation2.rotate(arc_r_rotate).step();
        this.setData({
          arc_rData: animation2.export()
        });

        console.log(this.data.arc_rData);
      }.bind(this), 500);
    }
  },
  checkBindAccount: function () {
    // var bk_userinfo = wx.getStorageSync('bk_userinfo');
    // if (bk_userinfo == '' || bk_userinfo == null || bk_userinfo == undefined){
    swan.showModal({
      title: '温馨提示',
      content: '完善账户后查看答案解析',
      confirmText: "立即完善",
      cancelText: "残忍拒绝",
      success: function (res) {
        if (res.confirm) {
          swan.navigateTo({
            url: '../../../me/bind/bind'
          });
        } else {
          // var pages = getCurrentPages()
          // var num = pages.length
          // wx.navigateBack({
          //   delta: num
          // })
        }
      }
    });
    return;
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }

  // }

});