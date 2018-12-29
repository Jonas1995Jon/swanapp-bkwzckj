// pages/video/videoPlayer/videoPlayer.js
import api from '../../../../api/api.js';
import request from '../../../../api/request.js';
import common from '../../../../utils/common.js';
//获取应用实例
var app = getApp();
var logsTimer = null;

var bk_userinfo;
var sessionid;
var uid;
var courseid;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '视频讲解'
    },
    videoUrl: '',
    videoContext: '',
    channelnumber: ''
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

    var videoUrl = options.videoUrl;
    console.log(decodeURI(videoUrl));
    this.setData({ videoUrl: decodeURI(videoUrl) });
    var channelnumber = options.channelnumber;
    if (channelnumber != undefined) {
      this.setData({ channelnumber: channelnumber });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    if (this.data.videoContext == '') {
      var videoContext = swan.createVideoContext('paper_play');
      this.setData({ videoContext: videoContext });
    } else {
      this.data.videoContext.play();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.data.videoContext.pause();
    this.logsTimerStopHandler();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.logsTimerStopHandler();
  },

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
  //视频错误
  listenerVideo: function (event) {
    this.logsTimerStopHandler();
  },
  // 开始播发
  startPlay: function (event) {
    this.logsTimerHandler(); //视频日志记录
  },
  // 暂停播放
  pausePlay: function (event) {
    this.logsTimerStopHandler();
  },
  // 播放至末尾
  endPlay: function (event) {
    this.logsTimerStopHandler();
  },
  //刷题记录日志定时器
  logsTimerHandler: function () {
    var nowDate = new Date();
    var addtime = common.formatTime(nowDate);
    var model;
    var os;
    var resolution;
    swan.getSystemInfo({
      success: function (res) {
        model = res.model;
        os = res.system;
        resolution = res.windowWidth + '*' + res.windowHeight;
      }
    });
    var pageid = common.randomString(32);
    if (!logsTimer) {
      logsTimer = setInterval(() => {
        var data = {
          action: 'kaodianjingjie',
          module: '17',
          channelnumber: this.data.channelnumber,
          courseid: courseid,
          addtime: addtime,
          sessionid: sessionid,
          userid: uid,
          from: getApp().globalData.from,
          duration: 10,
          pageid: pageid,
          ip: '',
          os: os,
          browser: '',
          resolution: resolution,
          appname: getApp().globalData.appname,
          appversion: getApp().globalData.appversion,
          appbuild: getApp().globalData.appbuild,
          mobiletype: model
          //防止错误上传日志
        };if (this.data.channelnumber == undefined) {
          return;
        }
        request.request_collectLog(data);
      }, 10000);
    }
  },
  logsTimerStopHandler: function () {
    console.log('logsTimer stop');
    if (logsTimer) {
      clearInterval(logsTimer);
      logsTimer = null;
    }
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});