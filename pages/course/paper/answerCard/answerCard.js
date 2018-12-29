// pages/course/paper/answerCard.js
import api from '../../../../api/api.js';
import request from '../../../../api/request.js';
import common from '../../../../utils/common.js';
//获取应用实例
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
      leftBtnImg: '../../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '答题卡'
    },
    paperid: '',
    unitid: '',
    learnType: '',
    state: '',
    answerArr: '',
    submitPaperBtnHidden: false,
    paperTitle: ''
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

    var paperid = options.paperid;
    this.setData({ paperid: paperid });
    var state = options.state;
    var unitid = options.unitid;
    this.setData({ state: state });
    this.setData({ unitid: unitid });
    var learnType = options.learnType;
    if (learnType != undefined) {
      this.setData({ learnType: learnType });
    }

    var paperTitle = decodeURI(options.paperTitle);
    if (paperTitle != undefined) {
      this.setData({ paperTitle: paperTitle });
    }

    var accuracy = options.accuracy;
    this.setData({ accuracy: accuracy });
    // var answerArr = options.answerArr;
    var answerArr = decodeURI(options.answerArr); //decodeURI模拟器报错，真机可以，去掉则相反

    var answerArr = JSON.parse(answerArr);
    this.setData({ answerArr: answerArr });

    var submitPaperBtnHidden = options.submitPaperBtnHidden;
    if (submitPaperBtnHidden == false || submitPaperBtnHidden == "false") {
      this.setData({ submitPaperBtnHidden: false });
    } else {
      this.setData({ submitPaperBtnHidden: true });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
  submitPaper: function (e) {
    var cardData = {
      paperid: this.data.paperid,
      state: this.data.state,
      accuracy: this.data.accuracy
    };
    this.handinpaper(cardData);
    // var url = '../report/report';
    // //console.log('url=' + url);
    // wx.navigateTo({
    //   url: url
    // })
  },
  paperIndexClick: function (e) {
    var index = e.currentTarget.dataset.hi;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      paperindex: index
    });
    swan.navigateBack(); //返回上一个页面
  },
  /**
   * 交卷
   */
  handinpaper: function (data) {
    var paperid = data.paperid;
    api.handinpaper({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        state: data.state,
        paperid: paperid,
        accuracy: data.accuracy,
        type: this.data.learnType
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //交卷成功
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面

          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            submitPaperBtnHidden: true,
            isAnswer: 0
          });
          this.setData({ 'submitPaperBtnHidden': true });
          var url = '../report/report?paperid=' + paperid + '&unitid=' + this.data.unitid + '&learnType=' + this.data.learnType;
          swan.redirectTo({
            url: url
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
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});