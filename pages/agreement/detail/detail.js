// pages/agreement/details/detail.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var DOMParser = require('../../../utils/xmldom/dom-parser').DOMParser;
var XMLSerializer = require('../../../utils/xmldom/dom-parser').XMLSerializer;
var WxParse = require('../../../utils/wxParse/wxParse.js');
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 0,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '保过协议'
    },
    agreement: '',
    supplementid: '',
    agreementList: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var agreementList = JSON.parse(options.agreementList);
    this.setData({ agreementList: agreementList });
    var supplementid = options.supplementid;
    this.setData({ supplementid: supplementid });
    this.getagreement();
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
  /** 
  * 补签协议-查询是否可以补签协议
  */
  getagreement: function () {
    api.getagreement({
      methods: 'POST',
      data: {
        supplementid: this.data.supplementid
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var agreement = decodeURIComponent(data.agreement);
          // agreement = decodeURIComponent(agreement);
          agreement = agreement.replace(/\+/g, " ");
          agreement = agreement.replace(/\{LinkMan}/g, this.data.agreementList.linkman);
          agreement = agreement.replace(/\{IDCard}/g, this.data.agreementList.idcard);
          agreement = agreement.replace(/\{Tel}/g, this.data.agreementList.mobile);
          agreement = agreement.replace(/\{Email}/g, this.data.agreementList.email);
          agreement = agreement.replace(/\{Price}/g, this.data.agreementList.courselist[0].price);
          this.setData({ agreement: agreement });
          WxParse.wxParse('agreement', 'html', agreement, this, 5);
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