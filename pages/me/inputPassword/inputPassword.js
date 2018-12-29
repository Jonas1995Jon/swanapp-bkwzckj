// pages/me/inputPassword/inputPassword.js
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
      centerBtnTitle: '绑定'
    },
    password_value: '',
    password_length: '',
    token: '',
    infoid: ''
  },
  wangjimima: function (e) {
    swan.navigateTo({
      url: '../getCode/getCode'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var token = options.token;
    var mobile = options.mobile;
    this.setData({ token: token });
    this.setData({ mobile: mobile });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.infoid != '') {
      swan.showModal({
        title: '提示',
        content: '密码重置成功，请重新登录！',
        showCancel: false
      });
      // var url = '../resetPassword/resetPassword?infoid=' + this.data.infoid;
      // wx.navigateTo({
      //   url: url
      // });
      // this.setData({ infoid: '' });
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
  loginBtnClick: function () {
    var data = {
      yzm: this.data.password_value,
      token: this.data.token
    };
    request.request_bindinguser_step3(data);
  },
  /*清除密码和检测输入*/
  bindKeyInput: function (e) {
    var thisText = e.detail.value;
    this.setData({
      password_value: e.detail.value,
      password_lenght: thisText.length
    });
  },
  clear_val: function (event) {
    this.setData({
      password_value: '',
      password_lenght: 0
    });
  },
  forgotPassword: function (event) {
    api.finduser({
      methods: 'POST',
      data: {
        username: this.data.mobile
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //验证码发送成功
          //codeType=1 is forgotPassword
          var url = '../getCode/getCode?codeType=1&mobile=' + this.data.mobile + '&infoid=' + data.infoid;
          // var url = '../resetPassword/resetPassword';
          swan.navigateTo({
            url: url
          });
        } else {
          //验证码发送失败等错误
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