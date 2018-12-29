// pages/me/bind/bind.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '绑定手机'
    },
    phone_num_lenght: 0,
    phone_num_value: '',
    mobile: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var wx_openid = swan.getStorageSync('wx_openid');
    var wx_session_key = swan.getStorageSync('wx_session_key');
    var wx_unionid = swan.getStorageSync('wx_unionid');
    if (wx_openid == "" || wx_session_key == "") {
      this.wxLogin();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

  leftBtnClick: function () {
    swan.navigateBack({});
  },

  /*清除手机号和检测输入*/
  bindKeyInput: function (e) {
    var thisText = e.detail.value;
    this.setData({
      mobile: e.detail.value,
      phone_num_lenght: thisText.length
    });
  },

  clear_val: function (event) {
    this.setData({
      phone_num_value: '',
      phone_num_lenght: 0
    });
  },

  go_inputPassword: function (e) {
    if (common.validatemobile(this.data.mobile)) {
      request.request_bindinguser_step1(this.data.mobile);
    }
  },

  onGetUserInfo: function (e) {
    this.setData({
      modal: {
        authorizationHidden: true
      }
    });
    var that = this;
    that.setData({ encryptedData: e.detail.encryptedData });
    that.setData({ iv: e.detail.iv });
    request.request_thirdauth(0);
  },

  //获取unionid
  getweixin_unionid: function () {
    api.getweixin_unionid({
      methods: 'POST',
      data: {
        encryptedData: this.data.encryptedData,
        iv: this.data.iv,
        session_key: this.data.session_key,
        code: this.data.code
      },
      success: res => {
        var data = res.data;
        console.log(data);
        swan.hideToast();
        if (data.errcode == 0) {
          this.setData({ headPortrait: data.avatarUrl });
          this.setData({ username: data.nickname });
          var userinfo = {
            nickName: data.nickname,
            avatarUrl: data.avatarUrl,
            gender: data.gender,
            province: data.province,
            city: data.city,
            country: data.country,
            language: data.language
          };
          this.setData({ userinfo: userinfo });
          swan.setStorageSync('userinfo', userinfo);
          swan.setStorageSync('wx_unionid', data.unionid);
          this.go_inputPassword();
        }
      }
    });
  },

  /**
  * 百度登录
  */
  wxLogin: function () {
    var that = this;
    swan.login({
      success: function (res) {
        if (res.code) {
          that.getOpenIdAndSessionKey(res.code);
        } else {
          console.log('获取用户登录态失败！' + res.errMsg);
        }
      }
    });
  },
  //获取opened 
  getOpenIdAndSessionKey: function (code) {
    var that = this;
    swan.request({
      url: 'https://openapi.baidu.com/nalogin/getSessionKeyByCode?code=' + code + '&client_id=' + getApp().globalData.sh_key + '&sk=' + getApp().globalData.appsecret,
      success: res => {
        var data = res.data;
        console.log(data);
        console.log("openid=" + data.openid + "&session_key=" + data.session_key);
        swan.setStorageSync('wx_openid', data.openid);
        swan.setStorageSync('wx_session_key', data.session_key);
        this.setData({ session_key: data.session_key });
        this.setData({ code: code });
        if (data.unionid != undefined) {
          swan.setStorageSync('wx_unionid', data.unionid);
        }
      }
    });
  }
});