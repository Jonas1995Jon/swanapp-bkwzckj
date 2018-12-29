// pages/agreement/agreement.js
import common from '../../utils/common.js';
import api from '../../api/api.js';
//获取应用实例
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
      centerBtnTitle: '保过协议'
    },
    checkboxClick: false,
    checkboxDefault: '../../image/other/agreement_checkbox_default@2x.png',
    checkboxSel: '../../image/other/agreement_checkbox_sel@2x.png',
    agreementList: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var agreementList = JSON.parse(options.agreementList);
    this.setData({ agreementList: agreementList });
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
   * 选中协议
   */
  checkboxClick: function (e) {
    var click = e.currentTarget.dataset.click;
    console.log(click);
    if (click == true) {
      this.setData({ checkboxClick: false });
    } else {
      this.setData({ checkboxClick: true });
    }
  },
  /**
   * 提交
   */
  sureOrderClick: function (e) {
    var click = e.currentTarget.dataset.click;
    if (click == true) {
      this.supplement();
    } else {
      swan.showModal({
        title: '提示',
        content: '请勾选同意签署保过协议',
        showCancel: false
      });
    }
  },
  /**
   * 查看协议
   */
  agreementDetailClick: function (e) {
    var url = 'detail/detail?supplementid=' + this.data.agreementList.supplementid + '&agreementList=' + JSON.stringify(this.data.agreementList);
    //console.log('url=' + url);
    swan.navigateTo({
      url: url
    });
  },
  /** 
  * 补签协议-查询是否可以补签协议
  */
  supplement: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var agreementList = this.data.agreementList;
    var supplementid = agreementList.supplementid;
    var linkman = agreementList.linkman;
    var idcard = agreementList.idcard;
    var mobile = agreementList.mobile;
    var address = agreementList.address;
    var email = agreementList.email;
    var zip = agreementList.zip;

    api.supplement({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        supplementid: supplementid,
        linkman: linkman,
        idcard: idcard,
        mobile: mobile,
        address: address,
        email: email,
        zip: zip
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var page = pages[pages.length - 2];
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          page.setData({
            isSignAgreement: true
          });
          swan.navigateBack({
            delta: pages.length - 2
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
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  bindKeyInput: function (e) {
    var val = e.detail.value;
    var index = e.currentTarget.dataset.index;
    var agreementList = this.data.agreementList;
    if (index == '0') {
      agreementList.linkman = val;
    } else if (index == '1') {
      agreementList.mobile = val;
    } else if (index == '2') {
      agreementList.zip = val;
    } else if (index == '3') {
      agreementList.address = val;
    } else if (index == '4') {
      agreementList.email = val;
    } else if (index == '5') {
      agreementList.idcard = val;
    }
    this.setData({
      agreementList: agreementList
    });
  }
});