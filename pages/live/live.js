// pages/live.js
import api from '../../api/api.js';
import request from '../../api/request.js';
import common from '../../utils/common.js';
//获取应用实例
var app = getApp();
var bk_userinfo;
var sessionid;
var uid;
var courseid;
var categoryid;
var logsTimer = null;
var onlineTimer = null; //检测是否同时在线定时器
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '帮考直播课堂'
    },
    /*直播开始liveType为false,liveAction为空，
    直播未开始liveType为true，liveAction为liveAction*/
    liveType: false,
    liveAction: '',
    // liveCourseList: '',
    // publicCourseList: '',
    // publicCourse: '',
    formalCourse: '',
    videoUrl: '',
    selectFirstNodeIndex: 0,
    selectSecondNodeIndex: 0,
    arrow_up: '/image/video/arrow_up.png',
    arrow_down: '/image/video/arrow_down.png',
    videoContext: '',
    channelnumber: '',
    action: '',
    module: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.hideShareMenu();
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = options.courseid;
    categoryid = options.categoryid;
    if (courseid == undefined || categoryid == undefined) {
      //解决分享出去的直播页面无courseid问题
      courseid = swan.getStorageSync('courseid');
      categoryid = swan.getStorageSync('categoryid');
    } else {
      swan.setStorageSync('categoryid', categoryid); //已经选择
      swan.setStorageSync('courseid', courseid); //已经选择
    }
    this.getLiveList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //解决中途注销
    var courseidSNC = swan.getStorageSync('courseid');
    var bk_userinfoSnc = swan.getStorageSync('bk_userinfo');
    if (courseid != courseidSNC) {
      courseid = courseidSNC;
      if (courseid.length < 1) {
        return;
      }
      this.getLiveList();
    } else if (bk_userinfo != undefined && bk_userinfo.toString() != bk_userinfoSnc.toString()) {
      if (bk_userinfoSnc.sessionid != null && bk_userinfoSnc.sessionid != '') {
        sessionid = bk_userinfoSnc.sessionid;
        uid = bk_userinfoSnc.uid;
      }
      if (courseid.length < 1) {
        return;
      }
      this.getLiveList();
    } else {
      if (this.data.videoContext == '') {
        var videoContext = swan.createVideoContext('home_video');
        this.setData({ videoContext: videoContext });
      } else {
        this.data.videoContext.play();
      }
    }
    var learnCheckIndex = swan.getStorageSync('learnCheckIndex');
    if (learnCheckIndex != undefined) {
      this.learnJump(learnCheckIndex);
    }

    // this.getLiveCourseList();
    // this.getPublicCourseList();
    // this.getPublicCourse();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.data.videoContext != undefined) {
      this.data.videoContext.pause();
    }
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
    swan.removeStorageSync('learnCheckIndex');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
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
  onShareAppMessage: function () {
    return {
      title: '帮考直播课堂',
      desc: '直播课程，互动式教学，真人在线直播。',
      path: '/pages/live/live?courseid=' + courseid + '&categoryid=' + categoryid
    };
  },
  /**
   * 获取直播列表
   */
  getLiveList: function () {
    if (this.data.videoContext == '') {
      var videoContext = swan.createVideoContext('home_live');
      this.setData({ videoContext: videoContext });
    } else {
      this.data.videoContext.play();
    }
    this.getFormalCourse();
  },

  firstNodeClick: function (event) {
    // 默认展开第一个菜单
    //1级是否展开
    var index = event.currentTarget.dataset.index;
    console.log(index);
    if (this.data.formalCourse.list[index]['show'] == true) {
      this.data.formalCourse.list[index]['show'] = false;
      for (var j = 0; j < this.data.formalCourse.list[index].second.length; j++) {
        this.data.formalCourse.list[index].second[j]['show'] = false;
      }
      console.log('节展开');
    } else {
      this.data.formalCourse.list[index]['show'] = true;
      for (var j = 0; j < this.data.formalCourse.list[index].second.length; j++) {
        this.data.formalCourse.list[index].second[j]['show'] = true;
      }
      console.log('节收缩');
    }
    this.setData({ formalCourse: this.data.formalCourse });
  },
  secondNodeClick: function (event) {
    if (uid == app.globalData.default_uid) {
      swan.showModal({
        title: '温馨提示',
        content: '完善账户观看更多视频',
        confirmText: "立即完善",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../me/account/account';
            swan.navigateTo({
              url: url
            });
            return;
          } else {
            return;
          }
        }
      });
    } else {
      var fstindex = event.currentTarget.dataset.fst;
      var sndindex = event.currentTarget.dataset.snd;

      //检测是否免费学习
      this.checkfreelearningstate('watchvod', fstindex, sndindex);
    }
  },
  getFormalCourse: function () {
    api.getFormalCourse({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        // uid: uid,
        courseid: courseid,
        videosource: app.globalData.videosource,
        definition: app.globalData.definition
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          for (var i = 0; i < data.list.length; i++) {
            if (i == 0) {
              data.list[i]['show'] = false;
            } else {
              data.list[i]['show'] = true;
            }
            for (var j = 0; j < data.list[i].second.length; j++) {
              if (j == 0) {
                data.list[i].second[j]['show'] = false;
              } else {
                data.list[i].second[j]['show'] = true;
              }
            }
          }
          var videoUrl;
          //有直播时播放直播，没直播播放回看
          if (data.living.title != undefined && data.living.title != '' && data.living.title != null) {
            videoUrl = data.living.aly_domain + '/' + data.living.aly_appname + '/' + data.living.aly_streamname + '.m3u8';
            // videoUrl = encodeURI(videoUrl);
            videoUrl = videoUrl.replace("http://", "https://");
            videoUrl = encodeURI(videoUrl);
            this.setData({ channelnumber: data.living.channelnumber });
            this.setData({ action: 'watchlive' });
            this.setData({ module: '26' });
          } else {
            if (data.list.length > 0 && data.list[0].second.length > 0) {
              // videoUrl = encodeURI(data.list[0].second[0].videocode);
              videoUrl = data.list[0].second[0].videocode;
              videoUrl = videoUrl.replace("http://", "https://");
              videoUrl = encodeURI(videoUrl);
              this.setData({ channelnumber: data.list[0].second[0].channelnumber });
              this.setData({ action: 'watchvod' });
              this.setData({ module: '26' });
            } else {
              swan.showModal({
                title: '提示',
                content: '此课程暂无直播课程！',
                showCancel: false
              });
              if (this.data.videoContext.action.data != undefined) {
                this.data.videoContext.stop();
              }
              return;
            }
          }
          this.setData({ videoUrl: videoUrl });

          this.setData({ formalCourse: data });
          var learnCheckIndex = swan.getStorageSync('learnCheckIndex');
          if (learnCheckIndex != undefined) {
            this.learnJump(learnCheckIndex);
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
  checkfreelearningstate: function (watch, fstindex, sndindex) {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    var type = 26;
    //已经购买直接进入，未购买检测免费时长
    if (checkcourseVO.m26 == 1) {
      if (watch == 'watchlive') {
        type = 26;
        // 正在直播进入直播教室
        var title = this.data.formalCourse.living.title;
        var chatroomid = this.data.formalCourse.living.chatroomid;
        var channelnumber = this.data.formalCourse.living.channelnumber;
        var videoUrl = this.data.videoUrl;
        videoUrl = encodeURI(videoUrl);
        var teacher = JSON.stringify(this.data.formalCourse.teacher);
        var url = 'liveRoom/liveRoom?title=' + title + '&videoUrl=' + videoUrl + '&teacher=' + teacher + '&chatroomid=' + chatroomid + '&channelnumber=' + channelnumber;
        swan.navigateTo({
          url: url
        });
      } else if (watch == 'watchvod') {
        type = 25;
        // if (fstindex == 0 && sndindex == 0) {
        //   this.joinToPlay(fstindex, sndindex);
        // } else {
        var videoUrl = this.data.formalCourse.list[fstindex].second[sndindex].videocode;
        if (videoUrl == "") {
          return;
        }
        videoUrl = videoUrl.replace("http://", "https://");
        videoUrl = encodeURI(videoUrl);
        // var videoUrl = encodeURI(this.data.formalCourse.list[fstindex].second[sndindex].videocode);

        this.setData({ videoUrl: videoUrl });
        this.setData({ selectFirstNodeIndex: fstindex });
        this.setData({ selectSecondNodeIndex: sndindex });
        // 非正在直播进入直播教室
        this.joinToPlay(fstindex, sndindex);
        // }
      }
    } else {
      //免费只能观看正在直播的视频，非正在直播提示购买
      if (watch == 'watchvod') {
        type = 25;
        // if (fstindex == 0 && sndindex == 0) {
        //   this.joinToPlay(fstindex, sndindex);
        //   return;
        // }
        swan.showModal({
          title: '温馨提示',
          content: '仅正在直播课程可免费试听，如需观看往期课程，请先购买课程！',
          confirmText: "立即购买",
          cancelText: "残忍拒绝",
          success: function (res) {
            if (res.confirm) {
              swan.navigateTo({
                url: '../course/buyCourse/buyCourseDetail/buyCourseDetail'
              });
              return;
            } else {
              return;
            }
          }
        });
      } else {
        api.checkfreelearningstate({
          methods: 'POST',
          data: {
            sessionid: sessionid,
            uid: uid,
            courseid: courseid,
            type: type
          },
          success: res => {
            swan.hideToast();
            var data = res.data;
            if (data.errcode == 0) {
              var title = this.data.formalCourse.living.title;
              var videoUrl = this.data.videoUrl;
              var chatroomid = this.data.formalCourse.living.chatroomid;
              var channelnumber = this.data.formalCourse.living.channelnumber;
              videoUrl = encodeURI(videoUrl);
              var teacher = JSON.stringify(this.data.formalCourse.teacher);
              var url = 'liveRoom/liveRoom?title=' + title + '&videoUrl=' + videoUrl + '&teacher=' + teacher + '&chatroomid=' + chatroomid + '&channelnumber=' + channelnumber;
              swan.navigateTo({
                url: url
              });
            } else {
              var msg = data.errmsg;
              if (msg == undefined) {
                swan.showModal({
                  title: '温馨提示',
                  content: '您尚未绑定帮考网账号，请先绑定！',
                  confirmText: "立即绑定",
                  cancelText: "残忍拒绝",
                  success: function (res) {
                    if (res.confirm) {
                      swan.navigateTo({
                        url: '../me/bind/bind'
                      });
                      return;
                    } else {
                      return;
                    }
                  }
                });
              } else {
                swan.showModal({
                  title: '温馨提示',
                  content: msg,
                  confirmText: "立即购买",
                  cancelText: "残忍拒绝",
                  success: function (res) {
                    if (res.confirm) {
                      swan.navigateTo({
                        url: '../course/buyCourse/buyCourseDetail/buyCourseDetail'
                      });
                      return;
                    } else {
                      return;
                    }
                  }
                });
              }
            }
          },
          fail: res => {
            console.log(res);
            //fail response data convert to UTF8此问题未解决，貌似解释是服务器返回数据问题
            var title = this.data.formalCourse.living.title;
            var videoUrl = this.data.videoUrl;
            var chatroomid = this.data.formalCourse.living.chatroomid;
            var channelnumber = this.data.formalCourse.living.channelnumber;
            videoUrl = encodeURI(videoUrl);
            var teacher = JSON.stringify(this.data.formalCourse.teacher);
            var url = 'liveRoom/liveRoom?title=' + title + '&videoUrl=' + videoUrl + '&teacher=' + teacher + '&chatroomid=' + chatroomid + '&channelnumber=' + channelnumber;
            swan.navigateTo({
              url: url
            });
          }
        });
      }
    }
  },
  //进入教室
  joinClassRoom: function () {
    //检测是否免费学习
    // if (fstindex == undefined){
    //   fstindex = 0;
    //   sndindex = 0;
    // }
    this.checkfreelearningstate('watchlive', 0, 0);
  },
  //进入回看
  joinToPlay: function (fstindex, sndindex) {
    var url = 'liveRoom/liveRoom';
    var fstIndex = fstindex;
    var sndIndex = sndindex;
    var title = this.data.formalCourse.list[fstIndex].second[sndIndex].title;
    var chatroomid = this.data.formalCourse.list[fstIndex].second[sndIndex].chatroomid;
    var videoUrl = this.data.videoUrl;
    videoUrl = encodeURI(videoUrl);
    var teacher = JSON.stringify(this.data.formalCourse.teacher);
    var url = 'liveRoom/liveRoom?title=' + title + '&videoUrl=' + videoUrl + '&teacher=' + teacher + '&action=' + this.data.action + '&module=' + this.data.module + '&channelnumber=' + this.data.channelnumber + '&chatroomid=' + chatroomid;
    swan.navigateTo({
      url: url
    });
  },
  learnJump: function (learnCheckIndex) {
    // 默认展开第一个菜单
    //1级是否展开
    var index = learnCheckIndex;
    if (this.data.formalCourse == "") {
      return;
    }
    for (var j = 0; j < this.data.formalCourse.list.length; j++) {
      this.data.formalCourse.list[j]['show'] = true;
    }

    if (this.data.formalCourse.list[index]['show'] == true) {
      this.data.formalCourse.list[index]['show'] = false;
      for (var j = 0; j < this.data.formalCourse.list[index].second.length; j++) {
        this.data.formalCourse.list[index].second[j]['show'] = false;
      }
      console.log('节展开');
    }
    this.setData({ formalCourse: this.data.formalCourse });
  },
  //视频错误
  listenerVideo: function (event) {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
    console.log('listenerVideo' + event);
  },
  // 开始播发
  startPlay: function (event) {
    console.log('startPlay' + event);
    this.logsTimerHandler(); //视频日志记录
    this.onlineTimerHandler(); //扣除学时检测同时在线登录
  },
  // 暂停播放
  pausePlay: function (event) {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
    console.log('pausePlay' + event);
  },
  // 播放至末尾
  endPlay: function (event) {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
    console.log('endPlay' + event);
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
          action: this.data.action,
          module: this.data.module,
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
        };if (this.data.action == undefined || this.data.module == undefined || this.data.channelnumber == undefined) {
          return;
        }
        request.request_collectLog(data);
      }, 10000);
    }
  },
  //扣除学时、判断是否同时在线学习定时器
  onlineTimerHandler: function () {
    if (!onlineTimer) {
      onlineTimer = setInterval(() => {
        this.setremainder();
        this.setonline();
      }, 60000);
    }
  },
  //扣除学时
  setremainder: function () {
    api.setremainder({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.module,
        times: 60,
        market: app.globalData.market
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //不处理
        } else if (data.errcode == -1) {
          //60分钟免费试用时间已经用完,无法继续观看！
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "立即购买",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                swan.navigateTo({
                  url: '../../buyCourseNew'
                });
              } else {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        } else if (data.errcode == -2) {
          //您的学时已经用完，无法继续学习，请联系学习顾问加时！
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        }
      }
    });
  },
  //判断是否同时在线学习
  setonline: function () {
    api.setonline({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.module
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //
        } else if (data.errcode == 40057) {
          //您的账号在其他地方登录学习，您将被迫退出
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        }
      }
    });
  },
  logsTimerStopHandler: function () {
    console.log('logsTimer stop');
    if (logsTimer) {
      clearInterval(logsTimer);
      logsTimer = null;
    }
  },
  onlineTimerStopHandler: function () {
    console.log('onlineTimer stop');
    if (onlineTimer) {
      clearInterval(onlineTimer);
      onlineTimer = null;
    }
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});