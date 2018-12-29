// pages/me/answerQuestions/questionDetail.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var CusBase64 = require('../../../utils/base64.js');

//获取应用实例
var app = getApp();
var bk_userinfo;
var sessionid;
var uid;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '我的提问'
    },
    questionContinue: 0
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
    this.setData({ sessionid, sessionid });
    this.setData({ uid, uid });
    var orderid = options.orderid;
    this.setData({ orderid, orderid });
    var state = options.state;
    this.setData({ state, state });

    this.getConversation();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.questionContinue == 1) {
      this.getConversation();
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
  //有问必答_获取对话详情
  getConversation: function () {
    api.getConversation({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        orderid: this.data.orderid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var titleList = data.title;
          var list = data.list;
          var questionList = [];
          titleList[0].addtime = titleList[0].addtime.substring(0, 19);
          titleList[0].problem_title = this.escape2Html(titleList[0].problem_title);
          titleList[0].problem_description = this.escape2Html(titleList[0].problem_description);
          var starrank = titleList[0].starrank;
          if (starrank == undefined || starrank == "") {
            starrank = 0;
          }
          this.setData({ starSelectIndex: parseInt(starrank) });
          this.setData({ starSelectNoIndex: parseInt(5 - starrank) });
          var arr = common.splitToArray(titleList[0].problem_attachment, "|");
          // console.log(arr);
          var title = titleList[0].problem_description;
          var titleHeight = 40;
          if (arr.length > 0 && arr[0] != "" && arr[0] != undefined) {
            if (title.length > 20) {
              if (title.length % 20 == 0) {
                titleHeight = title.length / 20 * 40;
              } else {
                titleHeight = (parseInt(title.length / 20) + 1) * 40;
              }
            }
            // console.log(titleHeight + "xxxx");
            if (arr.length < 3) {
              titleList[0].lineheight = 150 + titleHeight + 60;
            } else {
              if (arr.length % 3 == 0) {
                titleList[0].lineheight = arr.length / 3 * 150 + titleHeight + 60;
              } else {
                titleList[0].lineheight = (parseInt(arr.length / 3) + 1) * 150 + titleHeight + 60;
              }
            }
            titleList[0].problem_attachmentArr = arr;
          } else {
            titleList[0].lineheight = titleHeight + 60;
          }
          questionList.push(titleList[0]);
          if (list.length > 0) {
            var arr = [];
            var reply_content = "";
            var reply_contentHeight = 40;
            for (var i = 0; i < list.length; i++) {
              list[i].reply_content = this.escape2Html(list[i].reply_content);
              arr = common.splitToArray(list[i].reply_attachment, "|");
              reply_content = list[i].reply_content; //回复中带了html标签则计算不准
              if (reply_content.length > 20) {
                if (reply_content.length % 20 == 0) {
                  reply_contentHeight = reply_content.length / 20 * 40;
                } else {
                  reply_contentHeight = (parseInt(reply_content.length / 20) + 1) * 40;
                }
              }
              if (arr.length > 0 && arr[0] != "" && arr[0] != undefined) {
                if (arr.length < 3) {
                  list[i].lineheight = 150 + reply_contentHeight + 60;
                } else {
                  if (arr.length % 3 == 0) {
                    list[i].lineheight = arr.length / 3 * 150 + reply_contentHeight + 60;
                  } else {
                    list[i].lineheight = (parseInt(arr.length / 3) + 1) * 150 + reply_contentHeight + 60;
                  }
                }
                list[i].reply_attachmentArr = arr;
                list[i].addtime = list[i].addtime.substring(0, 19);
              } else {
                list[i].lineheight = reply_contentHeight + 60;
              }
              questionList.push(list[i]);
              // console.log("heigetxx=" + titleList[0].lineheight);
            }
          }
          this.setData({ questionList: questionList });
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
  //有问必答_修改工单状态
  modifyConversationState: function () {
    api.modifyConversationState({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        orderid: this.data.orderid,
        state: 3
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          // var delta = (this.data.prevPage == 2 ? 2 : 1);
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            questionSuccess: 1
          });
          swan.navigateBack({
            delta: 1
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
  continueMessagetap: function () {
    var orderid = this.data.orderid;
    var url = 'addQuestion?orderid=' + orderid;
    swan.navigateTo({
      url: url
    });
  },
  sureComplateTap: function () {
    this.modifyConversationState();
  },
  starTap: function (event) {
    var index = event.currentTarget.dataset.index;
    index = parseInt(index) + 1;
    this.setData({ starSelectIndex: index });
    this.setData({ starSelectNoIndex: 5 - index });
    this.setData({ state: 4 });
    this.addquestionjudge(index);
  },
  //有问必答_评价工单
  addquestionjudge: function (index) {
    api.addquestionjudge({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        orderid: this.data.orderid,
        judge: '',
        starrank: index
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          // var delta = (this.data.prevPage == 2 ? 2 : 1);
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            questionSuccess: 1
          });
          swan.navigateBack({
            delta: 1
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
  //图片点击事件
  imgPreview: function (event) {
    var src = event.currentTarget.dataset.src; //获取data-src
    var imgList = event.currentTarget.dataset.list; //获取data-list
    //图片预览
    swan.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  escape2Html: function (str) {
    var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
      return arrEntities[t];
    });
  }
});