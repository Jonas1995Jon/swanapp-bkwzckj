import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
import md5 from '../../../utils/md5.js';
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.mycoupon(1);
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
  //我的优惠券
  mycoupon: function (isexpired) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.mycoupon({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        isexpired: isexpired
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          for (var i = 0; i < data.list.length; i++) {
            data.list[i].price = parseInt(data.list[i].price);
          }
          this.setData({ couponList: data.list });
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});