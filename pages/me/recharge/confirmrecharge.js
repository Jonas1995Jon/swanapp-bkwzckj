import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
import md5 from '../../../utils/md5.js';
//获取应用实例
var app = getApp();
var interval;

Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkSystemOS();
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

  checkSystemOS: function () {
    var that = this;
    swan.getSystemInfo({
      success: function (res) {
        that.setData({ "mobileOS": res.platform });
      }
    });
  },

  rechargeInput: function (event) {
    this.setData({
      price: event.detail.value
    });
  },

  confirmClick: function (event) {
    if (this.data.mobileOS == 'ios') {
      common.showModalHint();
    } else {
      swan.showModal({
        title: '提示',
        content: '该小程序支付模块还未完善，现阶段仅用于测试，是否继续？',
        confirmText: '继续',
        success: res => {
          if (res.confirm) {
            this.accountrecharge();
          } else {
            return;
          }
        }
      });
    }
  },

  // 下单
  accountrecharge: function () {
    var wx_openid = swan.getStorageSync('wx_openid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.accountrecharge({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        price: this.data.price,
        gateway: app.globalData.gateway
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ out_trade_no: data.out_trade_no });
          this.setData({ price: data.total_fee });
          // this.weixinpay();
          this.requestPolymerPayment();
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

  // 从后台获取百度支付参数
  requestPolymerPayment() {
    let that = this;
    swan.request({
      url: 'https://mbd.baidu.com/ma/nuomi/createorder',
      success: res => {
        let data = res.data;
        if (data.errno == 0) {
          that.setData({ baiduPayParams: data });
        } else {
          console.log('create order err', data);
          return;
        }
        that.baiduPay();
      },
      fail: err => {
        swan.showToast({
          title: '订单创建失败'
        });
        console.log('create order fail', err);
      }
    });
  },

  // 调用百度支付接口
  baiduPay: function () {
    swan.requestPolymerPayment({
      orderInfo: this.data.baiduPayParams.data,
      success: res => {
        this.setData({ hiddenModal: true });
        swan.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1500
        });
      },
      fail: err => {
        swan.showToast({
          title: '支付失败',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },
  //统一支付订单
  weixinpay: function () {
    var wx_openid = swan.getStorageSync('wx_openid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.weixinpay({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        orderid: this.data.out_trade_no,
        openid: wx_openid,
        market: app.globalData.market
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var prepay_id = data.prepay_id;
          this.setData({ prepay_id: prepay_id });
          this.paySign();
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
  //调起支付签名
  //注：key为商户平台设置的密钥key
  mixedencryMD5: function (prepay_id, randomString, timeStamp) {
    return "appId=" + getApp().globalData.appid + "&nonceStr=" + randomString + "&package=prepay_id=" + prepay_id + "&signType=MD5" + "&timeStamp=" + timeStamp + "&key=" + getApp().globalData.sh_key;
  },
  //请求微信支付
  paySign: function () {
    var nonceStr = common.randomString(32);
    var timeStamp = common.timeStamp();
    var mixedencryMD5 = this.mixedencryMD5(this.data.prepay_id, nonceStr, timeStamp);
    var paySign = md5.hexMD5(mixedencryMD5);
    var that = this;
    swan.requestPayment({
      'timeStamp': timeStamp,
      'nonceStr': nonceStr,
      'package': 'prepay_id=' + this.data.prepay_id,
      'signType': 'MD5',
      'paySign': paySign,
      'success': function (res) {
        //console.log(res);
        //循环执行，检测课程开通情况
        // that.weixinpaynotify();
        interval = setInterval(function () {
          that.checkState();
        }, 3000); //循环时间 这里是3秒
      },
      'fail': function (res) {
        console.log('fail:' + JSON.stringify(res));
      }
    });
  },
  checkState: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    var that = this;
    api.checkstate({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        // orderguid: '704db7bc-9708-4eb8-a16a-6460777d9ccb',
        orderguid: this.data.orderguid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          clearInterval(interval);
          swan.showModal({
            title: '温馨提示',
            content: '充值成功',
            showCancel: false,
            success: function (res) {
              that.setData({ hiddenModal: true });
              that.mybalance();
            }
          });
        } else {
          swan.showModal({
            title: '温馨提示',
            content: '请求异常，如支付成功，请联系客服或拨打客服电话进行咨询！',
            showCancel: false,
            success: function (res) {
              that.setData({ hiddenModal: true });
              that.mybalance();
            }
          });
          clearInterval(interval);
        }
      }
    });
  }
});