// pages/course/myorder/myorderDetail.js
import api from '../../../api/api.js';
import common from '../../../utils/common.js';
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    state: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderguid = options.orderguid;
    var state = options.state;
    this.setData({ state: state });
    if (orderguid == undefined) {
      swan.navigateBack({});
    } else {
      this.getorderdetail(orderguid);
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
  getorderdetail: function (orderguid) {
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo.sessionid != '' && bk_userinfo.sessionid != null) {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.getorderdetail({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        orderguid: orderguid
      },
      success: res => {
        var data = res.data;

        if (data.errcode == 0) {
          for (var i = 0; i < data.courselist.length; i++) {
            data.courselist[i].commodity_costprice = parseFloat(data.courselist[i].commodity_costprice).toFixed(2);
          }
          console.log(data);
          this.setData({
            order: data
          });
        }
      }
    });
  },
  buyBtnClick: function (event) {
    // var commodityid = "";
    // for(var i = 0; i < this.data.order.courselist.length; i++){
    //   if ((i == 0 || i == this.data.order.courselist.length)) {
    //     commodityid = commodityid + this.data.order.courselist[i].commodityid;
    //   } else {
    //     commodityid = commodityid + "|" + this.data.order.courselist[i].commodityid;
    //   }
    // }
    var commodityid = this.data.order.courselist[0].commodityid;
    var price = this.data.order.totalprice;
    var orderguid = this.data.order.orderguid;
    var orderid = this.data.order.orderid;

    var coursePackage = {
      price: price
    };
    var courselist = this.data.order.courselist;
    for (var i = 0; i < courselist.length; i++) {
      if (this.data.order.createtime != undefined) {
        courselist[i].createtime = this.data.order.createtime;
      }
    }
    var url = '../buyCourse/buyCourse?commodityid=' + commodityid + '&price=' + this.data.order.totalprice + '&coursePackage=' + JSON.stringify(coursePackage) + '&courselist=' + encodeURIComponent(JSON.stringify(courselist)) + '&state=1' + '&orderguid=' + orderguid + '&orderid=' + orderid + '&price=' + price;
    swan.navigateTo({
      url: url
    });
  }
});