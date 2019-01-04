// pages/find/learningRecord/learningRecord.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var app = getApp();

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
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '学习记录'
    },
    studyhistoryYes: '',
    studyhistoryNo: '',
    learnType: '',
    currentindex: 0,
    isHideLoadMore: true,
    pageindex: 1,
    pagesize: 10,
    loadMoreMsg: '加载更多',
    index: '', //以下三个都是继续学习传过来的参数
    unitid: '',
    isLearnContinue: '',
    wastetime: 0,
    /*动画*/
    arc_lData: '',
    arc_rData: '',
    currentaccuracy: 0 //正确率
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

    this.studyhistory(1); //已完成
    this.studyhistory(2); //未完成
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    //点击继续学习后续操作
    var isLearnContinue = this.data.isLearnContinue;
    if (isLearnContinue != '') {
      this.setData({ isLearnContinue: '' });
      var index = this.data.index;
      var unitid = this.data.unitid;
      var data = {
        courseid: swan.getStorageSync('courseid'),
        unitid: unitid,
        learnType: this.data.studyhistoryYes.val[index].type,
        from: 1
      };
      console.log(this.data.studyhistoryYes.val);
      request.request_loadnewpaper(data);
    }
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
  onShareAppMessage: function () { },
  studyhistory: function (state) {
    var courseid = swan.getStorageSync('courseid');
    api.studyhistory({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        state: state,
        pageindex: this.data.pageindex,
        pagesize: this.data.pagesize
      },
      success: res => {
        swan.hideToast();
        // this.setData({ isHideLoadMore: true })
        swan.hideNavigationBarLoading(); //完成停止加载
        var data = res.data;
        if (data.errcode == 0) {
          var learnType = app.globalData.learnType;

          for (var i = 0; i < learnType.length; i++) {
            var type = learnType[i][0].type;
            for (var j = 0; j < data.val.length; j++) {
              if (type == data.val[j].type) {
                data.val[j]['typename'] = learnType[i][1].name;
              }
            }
          }
          if (state == 1) {
            for (var i = 0; i < data.val.length; i++) {
              var wastetime = data.val[i].wastetime; //本次自测时间
              if (wastetime.indexOf('秒') == -1) {
                data.val[i].wastetime = this.parseTime(wastetime);
              }
              data.val[i].accuracy = data.val[i].accuracy.replace(/%/g, '');
            }
            if (this.data.pageindex > 1) {
              var studyhistoryYesVal = this.data.studyhistoryYes.val;
              studyhistoryYesVal = studyhistoryYesVal.concat(data.val);
              this.data.studyhistoryYes.val = studyhistoryYesVal;
              this.setData({ studyhistoryYes: this.data.studyhistoryYes });
            } else {
              var arc_data = new Array();
              var arc_data2 = new Array();
              var arc_l_rotate = new Array();
              var arc_r_rotate = new Array();
              for (let i = 0; i < data.val.length; i++) {
                var animation1 = swan.createAnimation({
                  transformOrigin: "50% 50%",
                  duration: 600,
                  timingFunction: "linear",
                  delay: 0
                });
                if (data.val[i].accuracy <= 50) {
                  var dataa = data.val[i].accuracy;
                  arc_l_rotate[i] = -135 + 3.6 * data.val[i].accuracy;
                  for (var h = 0; h < data.val.length; h++) {
                    if (arc_l_rotate[h] == undefined) {
                      arc_l_rotate[h] = 45;
                    }
                  }
                  setTimeout(function () {
                    for (var j = 0; j < arc_l_rotate.length; j++) {
                      animation1.rotate(arc_l_rotate[j]).step();
                      arc_data[j] = animation1.export();
                    }
                    this.setData({
                      arc_lData: arc_data
                    });
                  }.bind(this), 500);
                } else {
                  setTimeout(function () {
                    animation1.rotate(45).step();
                    arc_data[i] = animation1.export();

                    this.setData({
                      arc_lData: arc_data
                    });
                  }.bind(this), 500);
                  var animation2 = swan.createAnimation({
                    transformOrigin: "50% 50%",
                    duration: 600,
                    timingFunction: "linear",
                    delay: 600
                  });
                  arc_r_rotate[i] = -135 + 3.6 * (data.val[i].accuracy - 50);
                  for (var k = 0; k < data.val.length; k++) {
                    if (arc_r_rotate[k] == undefined) {
                      arc_r_rotate[k] = -135;
                    }
                  }
                  setTimeout(function () {
                    for (var j = 0; j < arc_r_rotate.length; j++) {
                      animation2.rotate(arc_r_rotate[j]).step();
                      arc_data2[j] = animation2.export();
                    }
                    this.setData({
                      arc_rData: arc_data2
                    });
                  }.bind(this), 600);
                }
              }
              // console.log(arc_data);
              // console.log(arc_data2);
              this.setData({
                studyhistoryYes: data,
                arc_lData: arc_data,
                arc_rData: arc_data2
              });
            }
          } else if (state == 2) {
            if (this.data.pageindex > 1) {
              var studyhistoryNoVal = this.data.studyhistoryNo.val;
              studyhistoryNoVal = studyhistoryNoVal.concat(data.val);
              this.data.studyhistoryNo.val = studyhistoryNoVal;
              this.setData({ studyhistoryNo: this.data.studyhistoryNo });
            } else {
              this.setData({ studyhistoryNo: data });
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
  learnBtnClick: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (index == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  studyhistoryYesListClick: function (e) {
    var index = e.currentTarget.dataset.index;
    var paperid = this.data.studyhistoryYes.val[index].paperid;
    var unitid = this.data.studyhistoryYes.val[index].unitid;
    var learnType = this.data.studyhistoryYes.val[index].type;
    var url = '../../course/paper/report/report?paperid=' + paperid + '&unitid=' + unitid + '&learnType=' + learnType + '&showLearn=false';
    swan.navigateTo({
      url: url
    });
  },
  studyhistoryNoListClick: function (e) {
    var index = e.currentTarget.dataset.index;
    var paperid = this.data.studyhistoryNo.val[index].paperid;
    var unitid = this.data.studyhistoryNo.val[index].unitid;
    var learnType = this.data.studyhistoryNo.val[index].type;
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
  // request_loadinitbylid: function (paperid, unitid, learnType, free) {
  //   api.loadinitbylid({
  //     methods: 'POST',
  //     data: {
  //       sessionid: sessionid,
  //       uid: uid,
  //       paperid: paperid,
  //       videosource: app.globalData.videosource,
  //       free: free,
  //     },
  //     success: (res) => {
  //       var data = res.data;
  //       if (data.errcode == 0) {
  //         var question = JSON.stringify(data);
  //         var url = '../../course/paper/studyPage/studyPage?unitid=' + unitid + '&paperid=' + data.paperid + '&question=' + question + '&learnType=' + learnType + '&history=1' + '&paperTitle=' + data.unitname;
  //         //console.log('url=' + url);
  //         wx.navigateTo({
  //           url: encodeURI(url)
  //         });
  //       } else {
  //         swan.showToast({
  //           title: data.errmsg
  //         });
  //       }
  //     }
  //   })
  // },
  //加载更多
  scrolltolower: function (e) {
    console.log('加载更多' + e);
    if (this.data.currentindex == 0) {
      if (this.data.studyhistoryYes.val.length % 10 != 0) {
        this.setData({ isHideLoadMore: false });
        this.setData({ loadMoreMsg: '暂无更多数据' });
        setTimeout(() => {
          this.setData({ isHideLoadMore: true });
        }, 1000);
      } else {
        swan.showNavigationBarLoading(); //在标题栏中显示加载
        this.setData({ pageindex: this.data.pageindex + 1 });
        this.studyhistory(1);
      }
    } else if (this.data.currentindex == 1) {
      if (this.data.studyhistoryNo.val.length % 10 != 0) {
        this.setData({ isHideLoadMore: false });
        this.setData({ loadMoreMsg: '暂无更多数据' });
        setTimeout(() => {
          this.setData({ isHideLoadMore: true });
        }, 1000);
      } else {
        this.setData({ pageindex: this.data.pageindex + 1 });
        this.studyhistory(2);
      }
    }
  },
  leftBtnClick: function () {
    swan.navigateBack({});
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
      return `${hh}时${mm}分${ss}秒`;
    }
    return `${mm}分${ss}秒`;
  }
  // showCicle: function (e,index){
  //   var currentaccuracy = e;
  //   console.log(currentaccuracy)
  //   var arc_l_rotate = -135 + 3.6 * currentaccuracy;
  //   var arc_r_rotate = -135 + 3.6 * (currentaccuracy - 50);
  //   var animation1 = wx.createAnimation({
  //     transformOrigin: "50% 50%",
  //     duration: 600,
  //     timingFunction: "linear",
  //     delay: 0
  //   })
  //   if (currentaccuracy <= 50) {
  //     setTimeout(function () {
  //       animation1.rotate(arc_l_rotate).step()
  //       this.setData({
  //         arc_lData: animation1.export()
  //       })
  //       this.data.studyhistoryYes.val[index].arc_lData = animation1.export();
  //       console.log(this.data.arc_lData)
  //       console.log(this.data.studyhistoryYes.val[index].arc_lData)
  //     }.bind(this), 500)
  //   } else {
  //     setTimeout(function () {
  //       animation1.rotate(45).step()
  //       this.setData({
  //         arc_lData: animation1.export()
  //       })
  //       this.data.studyhistoryYes.val[index].arc_lData = animation1.export();
  //     }.bind(this), 500)
  //     var animation2 = wx.createAnimation({
  //       transformOrigin: "50% 50%",
  //       duration: 600,
  //       timingFunction: "linear",
  //       delay: 600
  //     })
  //     setTimeout(function () {
  //       animation2.rotate(arc_r_rotate).step()
  //       this.setData({
  //         arc_rData: animation2.export()
  //       })
  //       this.data.studyhistoryYes.val[index].arc_rData = animation2.export();
  //     }.bind(this), 500)
  //   }
  // },
});