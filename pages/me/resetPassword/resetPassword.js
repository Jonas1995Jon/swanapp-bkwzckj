// pages/me/resetPassword/resetPassword.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '重置密码'
    },
    infoid: '',
    password: '',
    newpassword: '',
    password_num_lenght: 0,
    newpassword_num_lenght: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var infoid = options.infoid;
    this.setData({ infoid: infoid });
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
  passwordInput: function (e) {
    var thisText = e.detail.value;
    this.setData({
      password: e.detail.value,
      password_num_lenght: thisText.length
    });
  },
  newpasswordInput: function (e) {
    var thisText = e.detail.value;
    this.setData({
      newpassword: e.detail.value,
      newpassword_num_lenght: thisText.length
    });
  },
  password_clear_val: function (event) {
    this.setData({
      password: '',
      password_num_lenght: 0
    });
  },
  newpassword_clear_val: function (event) {
    this.setData({
      newpassword: '',
      newpassword_num_lenght: 0
    });
  },
  updatePassword: function (event) {
    api.resetpwd({
      methods: 'POST',
      data: {
        infoid: this.data.infoid,
        newpwd: this.data.newpassword
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //修改成功
          // var pages = getCurrentPages();
          // var prevPage = pages[pages.length - this.data.prevPage];
          // var delta = (this.data.prevPage == 3 ? 2 : 1);

          // //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          // prevPage.setData({
          //   paperindex: 0,
          //   parsingType: 2,
          // });
          swan.navigateBack({
            delta: 2
          });
        } else {
          //修改失败
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