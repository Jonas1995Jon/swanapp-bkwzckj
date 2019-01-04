// video.js
import api from '../../api/api.js';
import request from '../../api/request.js';
import common from '../../utils/common.js';
//获取应用实例
var app = getApp();

var bk_userinfo;
var sessionid;
var uid;
var courseid;
var videoCourseid;
var videoKpid;
var videoCategoryid;

var logsTimer = null;
var onlineTimer = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentindex: 0,
    navigation: {
      centerBtnTitle: '视频',
      centerBtnClick: 0
    },
    show: false,
    arrow_up: '/image/video/arrow_up.png',
    arrow_down: '/image/video/arrow_down.png',
    firstNodeShow: true,
    secondNodeShow: true,
    thirdNodeShow: true,
    firstNodeHidden: false,
    secondNodeHidden: false,
    thirdNodeHidden: false,
    knowpointList: '',
    videoUrl: '',
    lecturenotes: '',
    selectFirstNodeIndex: 0,
    selectSecondNodeIndex: 0,
    selectThirdNodeIndex: 0,
    playIcon: '/image/video/play.png',
    playActionIcon: '/image/video/play_action.png',
    videoContext: '',
    kpid: '', //如果没有该项，则填入每次请求视频地址时使用的节点ID或者知识点ID,
    nameArr: [],
    idArr: [],
    fistImplement: 0,
    isGetList: 0,
    navIndex: '-1',
    isShowCoverView: true,
    mobileOS: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var categoryid = swan.getStorageSync('categoryid');
    var back = options.back;
    if (back == 1) {
      this.setData({
        navigation: {
          leftBtn: 1,
          leftBtnImg: '../../../image/navigation/back.png',
          centerBtnTitle: '视频',
          centerBtnClick: 0
        }
      });
      this.setData({ back: back });
    }

    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    videoCourseid = options.videoCourseid;
    videoCategoryid = options.videoCategoryid;
    videoKpid = options.videoKpid;
    if (videoCategoryid != undefined && videoCategoryid != "") {
      swan.setStorageSync('categoryid', videoCategoryid);
    }
    if (videoCourseid != undefined) {
      courseid = videoCourseid;
      swan.setStorageSync('courseid', videoCourseid);
    } else {
      courseid = swan.getStorageSync('courseid');
    }
    if (courseid.length < 1) {
      //解决分享出去的直播页面无courseid问题
      courseid = options.courseid;
      swan.setStorageSync('courseid', courseid); //已经选择
    }
    this.checkSystemOS();
    // this.getList();
    this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
    this.getfreetryvideolist(categoryid, 1);
    this.getfreetryvideolist(categoryid, 2);
    this.getcover();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // wx.setNavigationBarTitle({
    //   title: wx.getStorageSync('categoryname')
    // })
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
          this.setData({ isGetList: 0 });
          this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
        }
      } else {
        if (this.data.videoContext == '') {
          var videoContext = swan.createVideoContext('home_video');
          this.setData({ videoContext: videoContext });
        }
      }
      this.videoCtx = swan.createVideoContext('home_video');
    }
    // console.log(this.data.auditionlist)
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
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log('/pages/video/video?videoCourseid=' + courseid + '&videoKpid=' + this.data.kpid + '&courseid=' + courseid + '&videoCategoryid=' + swan.getStorageSync('categoryid'));
    var courseName = swan.getStorageSync('coursename');
    var videoName = this.data.knowpointList.fst[this.data.selectFirstNodeIndex].snd[this.data.selectSecondNodeIndex].trd[this.data.selectThirdNodeIndex].name;
    return {
      title: courseName + "—" + videoName,
      desc: '直播课程，互动式教学，真人在线直播。',
      path: '/pages/video/video?videoCourseid=' + courseid + '&videoKpid=' + this.data.kpid + '&courseid=' + courseid + '&videoCategoryid=' + swan.getStorageSync('categoryid')
    };
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
  },
  auditionsSwiperChange: function (e) {
    var currnet = e.detail.current;
    if (currnet == 0) {
      //录播试听
      this.setData({ currentindex: 0 });
    } else if (currnet == 1) {
      //直播试听
      this.setData({ currentindex: 1 });
    }
  },
  /**
   * 获取视频列表
   */
  getList: function () {
    if (this.data.videoContext == '') {
      var videoContext = swan.createVideoContext('home_video');
      this.setData({ videoContext: videoContext });
    } else {
      this.data.videoContext.play();
    }
    this.knowpointGetList();
  },
  firstNodeClick: function (event) {
    var index = event.currentTarget.dataset.index;
    if (this.data.auditionlist[index].show == true) {
      this.data.auditionlist[index].show = false;
    } else {
      this.data.auditionlist[index].show = true;
    }
    this.setData({ auditionlist: this.data.auditionlist });
    if (this.data.liveauditionlist[index].show == true) {
      this.data.liveauditionlist[index].show = false;
    } else {
      this.data.liveauditionlist[index].show = true;
    }
    this.setData({ liveauditionlist: this.data.liveauditionlist });
  },
  secondNodeClick: function (event) {
    var fstindex = event.currentTarget.dataset.fst;
    var sndindex = event.currentTarget.dataset.snd;
    // console.log(fstindex + '' + sndindex);
    if (this.data.knowpointList.fst[fstindex].snd[sndindex].trd[0]['show'] == true) {
      this.data.knowpointList.fst[fstindex].snd[sndindex]['show'] = false;
      for (var j = 0; j < this.data.knowpointList.fst[fstindex].snd[sndindex].trd.length; j++) {
        this.data.knowpointList.fst[fstindex].snd[sndindex].trd[j]['show'] = false;
      }
      console.log('节展开');
    } else {
      this.data.knowpointList.fst[fstindex].snd[sndindex]['show'] = true;
      for (var j = 0; j < this.data.knowpointList.fst[fstindex].snd[sndindex].trd.length; j++) {
        this.data.knowpointList.fst[fstindex].snd[sndindex].trd[j]['show'] = true;
      }
      console.log('节收缩');
    }
    this.setData({ knowpointList: this.data.knowpointList });
  },
  thirdNodeClick: function (event) {
    var videoid;
    var bindex;
    var index;
    var type;
    var that = this;
    if (event.currentTarget == undefined) {
      videoid = event;
      bindex = -1;
      index = -1;
      type = -1;
    } else {
      videoid = event.currentTarget.id;
      bindex = event.currentTarget.dataset.bindex;
      index = event.currentTarget.dataset.index;
      type = event.currentTarget.dataset.type;
    }
    var play = -1;
    api.getfreetryvideodetail({
      method: 'POST',
      data: {
        id: videoid
      },
      success: function (res) {
        if (event.currentTarget == undefined) {
          play = event;
        } else {
          play = 1;
        }
        that.setData({
          videoUrl: res.data.videocode
        });
        if (play == 1) {
          that.play();
        }
      }
    });
    if (this.data.auditionlist != undefined || this.data.liveauditionlist != undefined) {
      if (type == 1) {
        for (var i = 0; i < this.data.auditionlist.length; i++) {
          if (bindex == i) {
            for (var j = 0; j < this.data.auditionlist[i].list.length; j++) {
              if (j == index) {
                this.data.auditionlist[i].list[j].firstactionid = true;
              } else {
                this.data.auditionlist[i].list[j].firstactionid = false;
              }
            }
          } else {
            for (var j = 0; j < this.data.auditionlist[i].list.length; j++) {
              this.data.auditionlist[i].list[j].firstactionid = false;
            }
          }
        }
        for (var i = 0; i < this.data.liveauditionlist.length; i++) {
          for (var j = 0; j < this.data.liveauditionlist[i].list.length; j++) {
            this.data.liveauditionlist[i].list[j].firstactionid = false;
          }
        }
      } else if (type == 2) {
        for (var i = 0; i < this.data.liveauditionlist.length; i++) {
          if (bindex == i) {
            for (var j = 0; j < this.data.liveauditionlist[i].list.length; j++) {
              if (j == index) {
                this.data.liveauditionlist[i].list[j].firstactionid = true;
              } else {
                this.data.liveauditionlist[i].list[j].firstactionid = false;
              }
            }
          } else {
            for (var j = 0; j < this.data.liveauditionlist[i].list.length; j++) {
              this.data.liveauditionlist[i].list[j].firstactionid = false;
            }
          }
        }
        for (var i = 0; i < this.data.auditionlist.length; i++) {
          for (var j = 0; j < this.data.auditionlist[i].list.length; j++) {
            this.data.auditionlist[i].list[j].firstactionid = false;
          }
        }
      }
      this.setData({
        auditionlist: this.data.auditionlist,
        liveauditionlist: this.data.liveauditionlist,
        isShowCoverView: false
      });
    }
  },
  buycourseclick: function () {
    swan.navigateTo({
      url: '../course/buyCourse/buyCourseDetail/buyCourseDetail'
    });
  },
  //获取视频列表
  knowpointGetList: function (event) {
    api.knowpointGetList({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        havevideo: 1,
        version: 1.0
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          for (var i = 0; i < data.fst.length; i++) {
            if (i == 0) {
              data.fst[i]['show'] = false;
            } else {
              data.fst[i]['show'] = true;
            }
            for (var j = 0; j < data.fst[i].snd.length; j++) {
              if (j == 0) {
                data.fst[i].snd[j]['show'] = false;
              } else {
                data.fst[i].snd[j]['show'] = true;
              }

              for (var k = 0; k < data.fst[i].snd[j].trd.length; k++) {
                if (j == 0) {
                  data.fst[i].snd[j].trd[k]['show'] = false;
                } else {
                  data.fst[i].snd[j].trd[k]['show'] = true;
                }
              }
            }
          }
          //是否为扫描二维码进入
          var kpid;
          if ((videoCourseid && videoKpid) != undefined) {
            // var courselist = JSON.parse(wx.getStorageSync('bk_courselist'));
            // for (var i = 0; i < courselist.length; i++) {
            //   if (courselist[i].id == videoCourseid) {
            //     this.getCourseByCategory(courselist[i].categoryid);
            //   }
            // }
            if (videoCategoryid == undefined) {
              this.getcourselistbycourseid(videoCourseid);
            }

            kpid = videoKpid;
            this.setData({ kpid: kpid });
            var kIndex;
            for (var i = 0; i < data.fst.length; i++) {
              data.fst[i]['show'] = true;
              for (var j = 0; j < data.fst[i].snd.length; j++) {
                data.fst[i].snd[j]['show'] = true;
                for (var k = 0; k < data.fst[i].snd[j].trd.length; k++) {
                  data.fst[i].snd[j].trd[k]['show'] = true;
                  if (data.fst[i].snd[j].trd[k].id == kpid) {
                    kIndex = j;
                    data.fst[i].show = false;
                    data.fst[i].snd[j].show = false;
                    data.fst[i].snd[j].trd[k].show = false;
                    this.setData({ selectFirstNodeIndex: i });
                    this.setData({ selectSecondNodeIndex: j });
                    this.setData({ selectThirdNodeIndex: k });
                  }
                  if (kIndex == j) {
                    for (var k = 0; k < data.fst[i].snd[j].trd.length; k++) {
                      data.fst[i].snd[j].trd[k].show = false;
                    }
                  }
                }
              }
            }
            this.setData({ kpid: kpid });
            // this.knowpointGetDetail(kpid);
          } else {
            kpid = data.fst[0].snd[0].trd[0].id;
            this.setData({ kpid: kpid });
            // this.knowpointGetDetail(kpid);
          }
          this.setData({ knowpointList: data });
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
  // knowpointGetDetail: function (kpid) {
  //   if ((videoCourseid && videoKpid) != undefined) {
  //     this.checkAccount();
  //   }
  //   api.knowpointGetDetail({
  //     methods: 'POST',
  //     data: {
  //       sessionid: sessionid,
  //       uid: uid,
  //       courseid: courseid,
  //       kpid: kpid,
  //       videosource: app.globalData.videosource,
  //       screenwidth: '640',
  //       screenheight: '1136',
  //       definition: app.globalData.definition,
  //       version: '1.0',
  //     },
  //     success: (res) => {
  //       wx.hideToast();
  //       var data = res.data;
  //       if (data.errcode == 0) {
  //         this.setData({ knowpointDetail: data });
  //         var videoUrl = this.removeBaiFenHao(data.videocode);
  //         this.setData({ videoUrl: videoUrl });
  //         var lecturenotes = data.lecturenotes;
  //         lecturenotes = lecturenotes.replace("http://", "https://");
  //         this.setData({ lecturenotes: lecturenotes });
  //         if (lecturenotes.length > 0) {
  //           // this.PDFPreview();
  //         }
  //       } else if (data.errcode == 40002) {
  //         wx.showModal({
  //           title: '温馨提示',
  //           content: data.errmsg,
  //           confirmText: "立即购买",
  //           cancelText: "残忍拒绝",
  //           success: function (res) {
  //             if (res.confirm) {
  //               wx.navigateTo({
  //                 url: '../course/buyCourse/buyCourseDetail/buyCourseDetail',
  //               });
  //               return;
  //             } else {
  //               return;
  //             }
  //           }
  //         })
  //       } else {
  //         swan.showToast({
  //           title: data.errmsg
  //         });
  //       }

  //     }
  //   })
  // },
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
  PDFPreview: function () {
    var that = this;
    swan.downloadFile({
      url: that.data.lecturenotes,
      success: function (res) {
        console.log("成功下载后返回参数==");
        console.log(res);
        var filePath = res.tempFilePath;
        swan.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功');
            console.log(res);
            show('打开文档成功');
          },
          fail: function (res) {
            console.log('openDocument fail');
            console.log(res);
          },
          complete: function (res) {
            console.log('openDocument complete');
            console.log(res);
          }
        });
      },
      fail: function (res) {
        console.log('downloadFile  fail');
        console.log(res);
      },
      complete: function (res) {
        console.log('downloadFile  complete');
        console.log(res);
      }
    });
  },
  //视频错误
  listenerVideo: function (event) {
    this.logsTimerStopHandler();
    this.onlineTimerStopHandler();
    console.log('listenerVideo' + event);
  },
  play: function () {
    this.videoCtx = swan.createVideoContext('home_video');

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
      logsTimer = setInterval(function () {
        var data = {
          action: 'watchvod',
          channelnumber: that.data.kpid,
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
        }; if (that.data.kpid == undefined) {
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
        type: 14,
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
        type: 14
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
  mdFolder: function () {
    var data = this.data.knowpointList;
    var name;
    var id;
    var nameArr = [];
    var idArr = [];
    var fstdname;
    var sndname;
    var trdname;
    for (var i = 0; i < data.fst.length; i++) {
      for (var j = 0; j < data.fst[i].snd.length; j++) {
        for (var k = 0; k < data.fst[i].snd[j].trd.length; k++) {
          fstdname = data.fst[i].name.replace(" ", "-");
          sndname = data.fst[i].snd[j].name.replace(" ", "-");
          trdname = data.fst[i].snd[j].trd[k].name;
          name = 'MD ' + fstdname + '/\/' + sndname + '' + trdname;
          // name = name.replace(/\\/g, "/");
          id = fstdname + '\\' + sndname + '\\' + data.fst[i].snd[j].trd[k].id;
          idArr.push(id);
          nameArr.push(name);
        }
      }
    }
    this.setData({ nameArr: nameArr });
    this.setData({ idArr: idArr });
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
          var bigclass = swan.getStorageSync('bk_bigclass');
          var smallclassTemp;
          var categoryidTemp;
          for (var i = 0; i < courselist.length; i++) {
            courselist[i].title = decodeURI(courselist[i].title);
            courselist[i].shorttitle = decodeURI(courselist[i].shorttitle);
          }
          for (var i = 0; i < courselist.length; i++) {
            if (videoCourseid == courselist[i].id) {
              this.setSwitchClassCategory(i);
              this.setData({ fistImplement: 1 });
              swan.setStorageSync('navIndex', i);
              this.setData({ navIndex: i });
              for (var i = 0; i < bigclass.length; i++) {
                smallclassTemp = bigclass[i].smallclass;
                for (var j = 0; j < smallclassTemp.length; j++) {
                  categoryidTemp = smallclassTemp[j].id;
                  if (videoCategoryid == categoryidTemp) {
                    swan.setNavigationBarTitle({
                      title: smallclassTemp[j].title
                    });
                    swan.setStorageSync('categoryname', smallclassTemp[j].title);
                  }
                }
              }
            }
          }
          var courselist = JSON.stringify(courselist);
          swan.setStorageSync('bk_courselist', courselist);
          if (courselist != undefined && courselist.length > 0) {
            swan.setStorageSync('centerBtnClickIndex', 0);
            swan.setStorageSync('courseid', data.courselist[0].id);
            swan.setStorageSync('coursename', data.courselist[0].title);
            swan.setStorageSync('categoryid', id);
          }
          // videoCategoryid = "";
          // videoCourseid = "";
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
  //根据课程ID获取考试信息
  getcourselistbycourseid: function (courseid) {
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
          // for (var i = 0; i < courselist.length; i++) {
          //   courselist[i].title = decodeURI(courselist[i].title);
          //   courselist[i].shorttitle = decodeURI(courselist[i].shorttitle);
          // }
          swan.setStorageSync('bk_courselist', JSON.stringify(courselist));
          swan.setStorageSync('categoryname', data.categorytitle);
          for (var i = 0; i < courselist.length; i++) {
            courselistItem = courselist[i];
            if (videoCourseid == courselistItem.id) {
              swan.setStorageSync('courseid', courselist[i].id);
              swan.setStorageSync('coursename', courselist[i].title);
              swan.setStorageSync('categoryid', data.categoryid);
              this.setData({ isGetList: 1 });
              this.setSwitchClassCategory(i);
              this.setData({ fistImplement: 1 });
              swan.setStorageSync('navIndex', i);
              this.setData({ navIndex: i });
              swan.setNavigationBarTitle({
                title: data.categorytitle
              });
              // this.setSwitchClassCategory(i);
              // this.setData({ fistImplement: 1 });
              videoCourseid = undefined;
              videoKpid = undefined;
              // for (var i = 0; i < bigclass.length; i++) {
              //   smallclassTemp = bigclass[i].smallclass;
              //   for (var j = 0; j < smallclassTemp.length; j++) {
              //     categoryidTemp = smallclassTemp[j].id;
              //     if (videoCategoryid == categoryidTemp) {
              //       wx.setNavigationBarTitle({
              //         title: smallclassTemp[j].title,
              //       })
              //       wx.setStorageSync('categoryname', smallclassTemp[j].title);
              //     }
              //   }
              // }
            }
          }
          // if (courselist != undefined && courselist.length > 0) {
          //   wx.setStorageSync('centerBtnClickIndex', 0);
          //   wx.setStorageSync('courseid', data.courselist[0].id);
          //   wx.setStorageSync('coursename', data.courselist[0].title);
          //   wx.setStorageSync('categoryid', id);
          // }
          // videoCategoryid = "";
          // videoCourseid = "";
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
    if (this.data.back == 1) {
      swan.navigateBack({});
    } else {
      var url = '../learn/classCategory/classCategory';
      swan.navigateTo({
        url: url
      });
    }
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
        leftBtnTitle: '分类',
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
  downviewClick: function (event) {
    var centerBtnIndex = this.data.navigation.centerBtnIndex;
    if (centerBtnIndex == 0) {
      centerBtnIndex = 1;
    } else {
      centerBtnIndex = 0;
    }

    var index = event.currentTarget.dataset.index;

    this.setData({
      navigation: {
        leftBtn: 0,
        // leftBtnImg: '../../image/navigation/back.png',
        leftBtnTitle: '分类',
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
    swan.setStorageSync('centerBtnClickIndex', index);
    swan.setStorageSync('courseid', this.data.courselist[index].id);
    courseid = swan.getStorageSync('courseid');
    this.getList();
  },
  /**
  * 选择分类后相关设置
  */
  setSwitchClassCategory: function (index) {
    if ((swan.getStorageSync('bk_courselist') == "" || videoCategoryid != undefined) && this.data.fistImplement == 0) {
      if (videoCategoryid == undefined) {
        swan.redirectTo({
          url: '../learn/classCategory/classCategory'
        });
        return;
      }
      this.getCourseByCategory(videoCategoryid);
      // this.getList();
    } else {
      var courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
      this.setData({ courselist: courselist });
      if (courselist != undefined && courselist.length > 0) {
        var sectionArr = [];
        for (var i = 0; i < courselist.length; i++) {
          // if (wx.getStorageSync('navIndex') == ""  && videoCourseid == courselist[i].id){
          //   index = i;
          // }
          sectionArr.push({ name: courselist[i].title, id: courselist[i].id });
        }
        var courseid = courselist[index].id;
        this.setData({
          nav: {
            section: sectionArr,
            currentId: courseid.length > 0 ? courseid : courselist[0].id,
            backgroundColor: 0,
            scrollLeft: index >= 4 ? 78 * index : 0
          }
        });
        if (this.data.isGetList == 0) {
          this.getList();
          this.setData({ isGetList: 0 });
        }
      }
    }
  },
  swiperChange: function (e) {
    var currnet = e.detail.current;
    if (currnet == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (currnet == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  // handleTap: function (event) {
  //   var index = event.currentTarget.dataset.index;
  //   if (this.data.navIndex != -1) {
  //     if (index == this.data.navIndex) {
  //       return;
  //     }
  //   } else {
  //     if (index == wx.getStorageSync('navIndex')) {
  //       return;
  //     }
  //   }
  //   this.setData({ isGetList: 0 });
  //   // console.log(index);
  //   // that.setData({
  //   //   nav: {
  //   //     section: that.data.nav.section,
  //   //     currentId: that.data.nav.section[index].id,
  //   //     backgroundColor: 0,
  //   //     scrollLeft: 78 * index,
  //   //   },
  //   // });
  //   courseid = this.data.courselist[index].id;
  //   this.setData({ navIndex: index });
  //   wx.setStorageSync('navIndex', index);
  //   wx.setStorageSync('courseid', this.data.courselist[index].id);
  //   wx.setStorageSync('coursename', this.data.courselist[index].title);
  //   request.request_checkcourse();
  //   this.setSwitchClassCategory(index);
  // },
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
  getfreetryvideolist: function (categoryid, type) {
    var that = this;
    api.getfreetryvideolist({
      methods: 'POST',
      data: {
        categoryid_number: categoryid,
        type: type
      },
      success: function (res) {
        console.log(res.data);
        var data = res.data.courselist;
        if (data != undefined) {
          for (var i = 0; i < data.length; i++) {
            data[i].show = false;
            for (var j = 0; j < data[i].list.length; j++) {
              data[i].list[j].firstactionid = false;
              data[i].list[j].type = 1;
            }
          }
          if (type == 1) {
            var videoid = data[0].list[0].id;
            that.thirdNodeClick(videoid);
            data[0].list[0].firstactionid = true;
            that.setData({
              auditionlist: data
            });
          } else if (type == 2) {
            for (var i = 0; i < data.length; i++) {
              for (var j = 0; j < data[i].list.length; j++) {
                data[i].list[j].type = 2;
              }
            }
            that.setData({
              liveauditionlist: data
            });
          }
        }
      }
    });
  },
  getcover: function () {
    var that = this;
    api.getfreetryvideocategory({
      methods: 'POST',
      success: function (res) {
        console.log(res.data);
        var data = res.data.list;
        var categoryname = app.globalData.categoryname;
        for (var i = 0; i < data.length; i++) {
          if (categoryname == data[i].title) {
            that.setData({
              cover: data[i].cover
            });
          }
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