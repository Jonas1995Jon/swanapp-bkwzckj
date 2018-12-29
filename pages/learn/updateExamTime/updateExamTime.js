// pages/learn/updateExamTime/updateExamTime.js
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
    signUpHidden: true,
    kqTimeHidden: true,
    signUpList: [{
      title: "已经报名",
      selected: 0
    }, {
      title: "还未报名",
      selected: 1
    }],
    signUpTitle: "还未报名",
    kqTimeTitle: "",
    signUpIndex: 1,
    kqTimeIndex: -1

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ signUpListCopy: this.data.signUpList });
    this.setData({ signUpTitle: this.data.signUpList[this.data.signUpIndex].title });
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
  signUpActionSheetTap: function () {
    this.setData({
      signUpHidden: !this.data.signUpHidden
    });
  },
  signUpClick: function () {
    this.setData({
      signUpHidden: !this.data.signUpHidden
    });
  },
  kqTimeClick: function () {
    if (this.data.signUpIndex == 1) {
      swan.showModal({
        title: '温馨提示',
        content: '建议您在帮考网官方网站（www.bkw.cn）报名后，再来修改考期！',
        confirmText: "确定",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {}
        }
      });
    } else {
      this.getkqlist();
    }
  },
  actionSheetbindchange1: function () {
    this.setData({
      signUpHidden: !this.data.signUpHidden
    });
    this.setData({
      signUpList: this.data.signUpListCopy
    });
  },
  actionSheetbindchange2: function () {
    this.setData({
      kqTimeHidden: !this.data.kqTimeHidden
    });
    this.setData({
      kqTimeList: this.data.kqTimeListCopy
    });
  },
  signUpChoiceTap: function (event) {
    var index = event.currentTarget.dataset.index;
    this.setData({ signUpIndex: index });
    var signUpListSelected = [];
    for (var i = 0; i < this.data.signUpList.length; i++) {
      if (this.data.signUpList[i].selected == 1) {
        this.data.signUpList[i].selected = 0;
      }
    }
    this.data.signUpList[index].selected = 1;
    this.setData({ signUpList: this.data.signUpList });
  },
  kqTimeChoiceTap: function (event) {
    var index = event.currentTarget.dataset.index;
    this.setData({ kqTimeIndex: index });
    var signUpListSelected = [];
    for (var i = 0; i < this.data.kqTimeList.length; i++) {
      if (this.data.kqTimeList[i].selected == 1) {
        this.data.kqTimeList[i].selected = 0;
      }
    }
    this.data.kqTimeList[index].selected = 1;
    this.setData({ kqTimeList: this.data.kqTimeList });
  },
  sureChoiceSignUpTap: function (event) {
    this.setData({
      signUpHidden: !this.data.signUpHidden
    });
    this.setData({ signUpListCopy: this.data.signUpList });
    this.setData({ signUpTitle: this.data.signUpList[this.data.signUpIndex].title });
  },
  sureChoiceKqTimeTap: function (event) {
    this.setData({
      kqTimeHidden: !this.data.kqTimeHidden
    });
    this.setData({ kqTimeListCopy: this.data.kqTimeList });
    this.setData({ kqTimeTitle: this.data.kqTimeList[this.data.kqTimeIndex].starttime });
  },
  //获取考期列表
  getkqlist: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid;
    var uid;

    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    } else {
      return;
    }
    api.getkqlist({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: swan.getStorageSync('courseid')
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var list = data.list;
          for (var i = 0; i < list.length; i++) {
            list[i].selected = 0;
          }
          this.setData({ kqTimeList: list });
          this.setData({ kqTimeListCopy: list });
          this.setData({
            kqTimeHidden: !this.data.kqTimeHidden
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
  //获取考期列表
  changekaoqi: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid;
    var uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    } else {
      return;
    }
    api.changekaoqi({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: swan.getStorageSync('courseid'),
        kaoqi: this.data.kqTimeList[this.data.kqTimeIndex].kaoqi
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          swan.navigateTo({
            url: 'updateExamTimeCheck?token=' + data.token
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
  sureChoiceTap: function () {
    if (this.data.signUpIndex == 1 || this.data.kqTimeIndex == -1) {
      var content = "建议您在帮考网官方网站（www.bkw.cn）报名后，再来修改考期！";
      if (this.data.kqTimeIndex == -1) {
        content = '请选择考试时间！';
      }
      swan.showModal({
        title: '温馨提示',
        content: content,
        confirmText: "确定",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {}
        }
      });
    } else {
      this.changekaoqi();
    }
  }
});