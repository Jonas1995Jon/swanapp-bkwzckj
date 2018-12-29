// pages/me/answerQuestions/answerQuestions.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';

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
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '我的提问'
    },
    sessionid: "",
    uid: "",
    currentindex: 0,
    questionSuccess: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var questionCourseid = options.courseid;
    this.setData({ questionCourseid: questionCourseid });
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    this.setData({ sessionid, sessionid });
    this.setData({ uid, uid });
    this.getQuestionList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.questionSuccess == 1) {
      this.getQuestionList();
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
  swiperChange: function (e) {
    var currnet = e.detail.current;
    if (currnet == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (currnet == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    } else if (currnet == 2) {
      //未完成
      this.setData({ currentindex: 2 });
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
    } else if (index == 2) {
      //未完成
      this.setData({ currentindex: 2 });
    }
  },
  addQuestionClick: function () {
    var url = 'addQuestion';
    swan.navigateTo({
      url: url
    });
  },
  questionDetailTap: function (event) {
    var index = event.currentTarget.dataset.index;
    var orderid;
    var state;
    if (this.data.currentindex == 0) {
      orderid = this.data.questionList[index].orderid;
      state = this.data.questionList[index].state;
    }
    if (this.data.currentindex == 1) {
      orderid = this.data.questionIngList[index].orderid;
      state = this.data.questionIngList[index].state;
    }
    if (this.data.currentindex == 2) {
      orderid = this.data.questionFinishList[index].orderid;
      state = this.data.questionFinishList[index].state;
    }
    var url = 'questionDetail?orderid=' + orderid + "&state=" + state;
    swan.navigateTo({
      url: url
    });
  },
  //有问必答_获取提问列表
  getQuestionList: function (questionCourseid) {
    var categoryid = swan.getStorageSync('categoryid');
    var courseid = this.data.questionCourseid;
    api.getQuestionList({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        // orderid: this.data.orderid,
        courseid: courseid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        var questionIngList = [];
        var questionFinishList = [];
        if (data.errcode == 0) {
          for (var i = 0; i < data.list.length; i++) {
            data.list[i].addtime = data.list[i].addtime.substring(0, 19);
            // console.log(data.list[i].problem_title);
            data.list[i].problem_title = data.list[i].problem_title.length >= 20 ? data.list[i].problem_title + '...' : data.list[i].problem_title;
            data.list[i].problem_title = this.escape2Html(data.list[i].problem_title);
            if (data.list[i].state == 0) {
              data.list[i].stateTitle = "未处理";
              questionIngList.push(data.list[i]);
            } else if (data.list[i].state == 1) {
              data.list[i].stateTitle = "处理中";
              questionIngList.push(data.list[i]);
            } else if (data.list[i].state == 2) {
              data.list[i].stateTitle = "待补充";
              questionIngList.push(data.list[i]);
            } else if (data.list[i].state == 3) {
              data.list[i].stateTitle = "待评价";
              questionFinishList.push(data.list[i]);
            } else if (data.list[i].state == 4) {
              data.list[i].stateTitle = "已完成";
              questionFinishList.push(data.list[i]);
            }
          }
          this.setData({ questionIngList: questionIngList });
          this.setData({ questionFinishList: questionFinishList });
          this.setData({ questionList: data.list });
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
  //有问必答_撤销工单
  undoQuestion: function () {
    api.undoQuestion({
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
          console.log(data);
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
  //有问必答_删除工单
  webdelQuestion: function () {
    api.webdelQuestion({
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
          console.log(data);
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
  //有问必答_修改对话状态
  modifyConversationState: function () {
    api.modifyConversationState({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        orderid: this.data.orderid,
        state: this.data.state
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          console.log(data);
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
  //有问必答_学习顾问回复
  addConversation: function () {
    api.addConversation({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        orderid: this.data.orderid,
        content: '',
        reply_attachment: ''
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          console.log(data);
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
    * 字符串转换为时间
    * @param  {String} src 字符串
    */
  strToDate: function (dateObj) {
    dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/');
    dateObj = dateObj.slice(0, dateObj.indexOf("."));
    return new Date(dateObj);
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