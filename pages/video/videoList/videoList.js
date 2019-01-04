// pages/video/videoList/videoList.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
//获取应用实例
var app = getApp();

var bk_userinfo;
var sessionid;
var uid;
var id; //往期课程ID
var vid;
var channelnumber;
var courseid;
var videoType;
var videoName;

var logsTimer = null;
var onlineTimer = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '视频'
    },
    videoList: '',
    arrow_up: '/image/video/arrow_up.png',
    arrow_down: '/image/video/arrow_down.png',
    playIcon: '/image/video/play.png',
    playActionIcon: '/image/video/play_action.png',
    videoContext: '',
    videoUrl: '',
    selectFirstNodeIndex: 0,
    selectSecondNodeIndex: 0,
    formalCourse: '',
    vid: '',
    channelnumber: '',
    type: -1,
    isShowCoverView: true,
    currentindex: 0
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
    videoType = options.learnType;
    if (options.learnType != undefined) {
      this.setData({
        type: videoType
      });
    }
    if (options.cover != undefined) {
      this.setData({
        cover: options.cover.replace('https:/', 'https://')
      });
    }
    courseid = options.courseid;
    if (courseid == undefined || courseid == "") {
      courseid = swan.getStorageSync('courseid');
    } else {
      swan.setStorageSync('courseid', courseid);
    }
    videoName = options.name;
    id = options.id;
    console.log(id + "00000000");

    if (options.type != undefined && options.type != "") {
      videoType = options.type;
    }
    // if (options.id != undefined && options.id != ""){
    //   courseid = options.id;
    //   console.log(courseid + "00000000");
    // }
    console.log(courseid + "000111111");
    vid = options.vid;

    // videoType = "81";
    // vid = "5E55E139C15283EA";
    // courseid = "1581";
    // console.log("courseid" + courseid);
    if (courseid != undefined && courseid != "" && courseid != "undefined" && courseid != swan.getStorageSync('courseid') && courseid.length > 0) {
      // console.log(111111);

      this.getcourselistbycourseid(courseid);
    } else {
      // console.log(22222);
      // courseid = wx.getStorageSync('courseid');

      // wx.setStorageSync('courseid', courseid);
    }
    channelnumber = options.channelnumber;
    swan.setNavigationBarTitle({
      title: videoName
    });
    if (videoType == 26) {
      this.getFormalCourse();
    } else {
      this.getvideolist();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.videoCtx = swan.createVideoContext('list_video');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //解决中途注销
    var courseidSNC = swan.getStorageSync('courseid');
    var bk_userinfoSnc = swan.getStorageSync('bk_userinfo');
    if (courseid != courseidSNC) {
      courseid = courseidSNC;
      // if (courseid.length < 1) {
      //   return;
      // }
      if (videoType == 26) {
        this.getFormalCourse();
      } else {
        this.getvideolist();
      }
    } else if (bk_userinfo != undefined && bk_userinfo.toString() != bk_userinfoSnc.toString()) {
      if (bk_userinfoSnc.sessionid != null && bk_userinfoSnc.sessionid != '') {
        sessionid = bk_userinfoSnc.sessionid;
        uid = bk_userinfoSnc.uid;
      }
      if (courseid.length < 1) {
        return;
      }
      if (videoType == 26) {
        this.getFormalCourse();
      } else {
        this.getvideolist();
      }
    } else {
      if (this.data.videoContext == '') {
        var videoContext = swan.createVideoContext('list_video');
        this.setData({ videoContext: videoContext });
      } else {
        this.data.videoContext.play();
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
    if (that.data.videoContext != undefined) {
      that.data.videoContext.pause();
    }
    that.logsTimerStopHandler();
    that.onlineTimerStopHandler();
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
    var title = '帮考' + videoName;
    if (videoType == 26) {
      return {
        title: title,
        desc: '直播课程，互动式教学，真人在线直播。',
        path: '/pages/video/videoList/videoList?learnType=' + videoType + '&name=' + videoName + '&channelnumber=' + this.data.channelnumber + '&id=' + id + '&courseid=' + courseid
      };
    } else {
      return {
        title: title,
        desc: '直播课程，互动式教学，真人在线直播。',
        path: '/pages/video/videoList/videoList?learnType=' + videoType + '&name=' + videoName + '&vid=' + this.data.vid + '&courseid=' + courseid
      };
    }
  },
  //获取视频列表
  getvideolist: function (event) {
    // if (courseid.length < 1){
    //   return;
    // }
    api.getvideolist({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: videoType,
        ip: '',
        from: getApp().globalData.from,
        videosource: getApp().globalData.videosource
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          var videoList = data.list;
          console.log(videoList);
          for (var i = 0; i < videoList.length; i++) {
            if (i == 0) {
              console.log(videoList[i].first);
              videoList[i]['show'] = false;
            } else {
              videoList[i]['show'] = true;
            }
          }
          //是否为扫描二维码进入
          console.log("xxxxx" + videoType + videoName + vid);
          console.log("yyyyy" + "id=" + id + "courseid=" + courseid);
          if ((courseid && videoType && videoName && vid) != undefined) {
            var kIndex;
            var videoList = data.list;
            for (var i = 0; i < videoList.length; i++) {
              videoList[i]['show'] = true;
              for (var j = 0; j < videoList[i].second.length; j++) {
                videoList[i].second[j]['show'] = true;

                if (videoList[i].second[j].vid == vid) {
                  kIndex = j;
                  videoList[i].show = false;
                  videoList[i].second[j].show = false;
                  this.setData({ selectFirstNodeIndex: i });
                  this.setData({ selectSecondNodeIndex: j });
                }
              }
            }
          } else {
            vid = videoList[0].second[0].vid;
          }
          this.setData({ vid: vid });
          this.getvideocode(vid);
          this.setData({ videoList: videoList });
        } else if (data.errcode == 40002) {
          swan.showModal({
            title: '提示',
            content: '此课程暂无视频讲解',
            showCancel: false
          });
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
        // this.mdFolder();
      }
    });
  },
  getvideocode: function (vid) {
    console.log("getvideocode" + courseid + id);
    if (courseid.length < 1) {
      courseid = id;
      if (courseid.length < 1) {
        return;
      }
    }
    api.getvideocode({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: videoType,
        vid: vid,
        videosource: app.globalData.videosource,
        definition: app.globalData.definition
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var videocodeArr = common.splitToArray(data.videocode, "%");
          var videoUrl = this.removeBaiFenHao(data.videocode);
          this.setData({ videoUrl: videoUrl });
        } else if (data.errcode == 40002) {
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "立即购买",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                swan.navigateTo({
                  url: '../../course/buyCourse/buyCourseDetail/buyCourseDetail'
                });
                return;
              } else {
                return;
              }
            }
          });
        } else {
          // swan.showToast({
          //   title: data.errmsg
          // });
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "前往签署",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                var bk_userinfo = swan.getStorageSync('bk_userinfo');
                var sessionid = app.globalData.default_sessionid;
                var uid = app.globalData.default_uid;
                if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
                  sessionid = bk_userinfo.sessionid;
                  uid = bk_userinfo.uid;
                }
                var courseid = swan.getStorageSync('courseid');

                api.checksupplement({
                  methods: 'POST',
                  data: {
                    courseid: courseid,
                    sessionid: sessionid,
                    uid: uid,
                    coursetype: app.globalData.learnType[13][0].type
                  },
                  success: res => {
                    var data = res.data;
                    //不做任何处理
                    console.log(data);
                    if (data.errcode == 0) {
                      var url = '../../agreement/agreement?agreementList=' + JSON.stringify(data);
                      swan.navigateTo({
                        url: url
                      });
                    } else {
                      request.request_loadnewpaper(paperdata);
                    }
                  },
                  //这个接口请求iOS真机上会报错，待解决官网解释是服务器返回不是utf8编码问题
                  fail: res => {
                    request.request_loadnewpaper(paperdata);
                  }
                });
                // wx.navigateTo({
                //   url: '../../agreement/agreement',
                // });
                return;
              } else {
                return;
              }
            }
          });
        }
      }
    });
  },
  firstNodeClick: function (event) {
    // 默认展开第一个菜单
    //1级是否展开
    var index = event.currentTarget.dataset.index;
    if (this.data.videoList[index]['show'] == true) {
      this.data.videoList[index]['show'] = false;
      for (var j = 0; j < this.data.videoList[index].second.length; j++) {
        this.data.videoList[index].second[j]['show'] = true;
      }
      console.log('章展开');
    } else {
      this.data.videoList[index]['show'] = true;
      for (var j = 0; j < this.data.videoList[index].second.length; j++) {
        this.data.videoList[index].second[j]['show'] = true;
      }
      console.log('章收缩');
    }
    this.setData({ videoList: this.data.videoList });
  },
  secondNodeClick: function (event) {
    if (uid == app.globalData.default_uid) {
      swan.showModal({
        title: '温馨提示',
        content: '前往个人中心，完善账户观看更多视频',
        confirmText: "立即完善",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../../me/me';
            swan.switchTab({
              url: url
            });
            // var url = '../../me/account/account';
            // wx.navigateTo({
            //   url: encodeURI(url)
            // })
            return;
          } else {
            return;
          }
        }
      });
      return;
    }
    var fstindex = event.currentTarget.dataset.fst;
    var sndindex = event.currentTarget.dataset.snd;
    if (videoType == 26) {
      //解决%问题,替换http
      var videoUrl = this.removeBaiFenHao(this.data.videoList[fstindex].second[sndindex].videocode);
      this.setData({ channelnumber: this.data.videoList[fstindex].second[sndindex].channelnumber });
      this.setData({ videoUrl: videoUrl });
    } else {
      var vid = this.data.videoList[fstindex].second[sndindex].vid;
      this.setData({ vid: vid });
      this.getvideocode(vid);
    }

    this.setData({ selectFirstNodeIndex: fstindex });
    this.setData({ selectSecondNodeIndex: sndindex });
    this.play();
  },
  getFormalCourse: function () {
    api.getFormalCourse({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        videosource: app.globalData.videosource,
        ip: '',
        definition: app.globalData.definition,
        from: app.globalData.from,
        termid: id
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({
            cover: data.cover.replace('https:/', 'https://')
          });
          var videoList = data.list;
          console.log(videoList);
          for (var i = 0; i < videoList.length; i++) {
            if (i == 0) {
              console.log(videoList[i].first);
              videoList[i]['show'] = false;
            } else {
              videoList[i]['show'] = true;
            }
          }
          //是否为扫描二维码进入
          var videoUrl;
          //console.log("xxxxx" + videoType + videoName + channelnumber + 'ooo' + id);
          if ((courseid && videoType && videoName && channelnumber && id) != undefined) {
            var kIndex;
            var videoList = data.list;
            for (var i = 0; i < videoList.length; i++) {
              videoList[i]['show'] = true;
              for (var j = 0; j < videoList[i].second.length; j++) {
                videoList[i].second[j]['show'] = true;

                if (videoList[i].second[j].channelnumber == channelnumber) {
                  kIndex = j;
                  videoList[i].show = false;
                  videoList[i].second[j].show = false;
                  videoUrl = this.removeBaiFenHao(videoList[i].second[j].videocode);
                  this.setData({ selectFirstNodeIndex: i });
                  this.setData({ selectSecondNodeIndex: j });
                }
              }
            }
          } else {
            if (videoList.length != undefined && videoList.length > 0) {
              channelnumber = videoList[0].second[0].channelnumber;
              //解决%问题,替换http
              videoUrl = this.removeBaiFenHao(videoList[0].second[0].videocode);
            }
          }
          this.setData({ channelnumber: channelnumber });
          this.setData({ videoUrl: videoUrl });
          this.setData({ videoList: videoList });
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      },
      fail: res => {
        console.log(res);
      }
    });
  },
  removeBaiFenHao: function (videoUrl) {
    //解决%问题
    var videocodeArr = common.splitToArray(videoUrl, "%");
    if (videocodeArr.length > 0) {
      var videocodeStr = "";
      for (var i = 0; i < videocodeArr.length; i++) {
        if (videocodeArr[i] != undefined) {
          if (i == videocodeArr.length - 1) {
            videocodeStr = videocodeStr + encodeURI(videocodeArr[i]);
          } else {
            videocodeStr = videocodeStr + encodeURI(videocodeArr[i]) + '%';
          }
        }
      }
      videoUrl = videocodeStr;
    } else {
      videoUrl = encodeURI(videoUrl);
    }
    videoUrl = videoUrl.replace("http://", "https://");
    return videoUrl;
  },
  //视频错误
  listenerVideo: function (event) {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
    console.log('listenerVideo' + event);
  },
  play: function () {

    this.videoCtx.play();
  },
  // 开始播发
  startPlay: function (event) {
    this.setData({
      isShowCoverView: false
    });
    console.log('startPlay' + event);
    this.logsTimerHandler(); //视频日志记录
    this.onlineTimerHandler();
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
    var that = this;
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
          action: 'watchvod',
          channelnumber: videoType == 26 ? that.data.channelnumber : that.data.vid,
          module: 14,
          courseid: courseid,
          // unitid: this.data.unitid,
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
        };if ((videoType == 26 ? that.data.channelnumber : that.data.vid) == undefined) {
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
        type: videoType,
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
        type: videoType
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
  },
  //根据课程ID获取考试信息
  getcourselistbycourseid: function (courseid) {
    if (courseid == undefined || courseid.length < 1) {
      return;
    }
    api.getcourselistbycourseid({
      methods: 'POST',
      data: {
        courseid: courseid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var courselist = data.courselist;
          var smallclass;
          var bigclass = swan.getStorageSync('bk_bigclass');
          var smallclassTemp;
          var categoryidTemp;
          var courseidTemp;
          var courselistItem;
          swan.setStorageSync('bk_courselist', JSON.stringify(courselist));
          swan.setStorageSync('categoryname', data.categorytitle);
          for (var i = 0; i < courselist.length; i++) {
            courselistItem = courselist[i];
            if (courseid == courselistItem.id) {
              swan.setStorageSync('courseid', courselist[i].id);
              swan.setStorageSync('coursename', courselist[i].title);
              swan.setStorageSync('categoryid', data.categoryid);
              var paperindex = this.data.paperindex;
              // this.loadquestionByQid(paperindex, 1);
              swan.setStorageSync('navIndex', i);
              swan.setNavigationBarTitle({
                title: data.categorytitle
              });
            }
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
  auditionsBtnClick: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      //录播试听
      this.setData({ currentindex: 0 });
    } else if (index == 1) {
      //直播试听
      this.setData({ currentindex: 1 });
    }
  }
});