// pages/me/account/accountEdit.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var account = JSON.parse(options.account);
    var accountType = options.accountType;
    var accountMsg = options.accountMsg;
    var accountValue = options.accountValue;
    this.setData({ account: account });
    this.setData({ accountMsg: "请输入" + accountMsg });
    this.setData({ accountType: accountType });
    this.setData({ accountValue: accountValue });
    swan.setNavigationBarTitle({
      title: "设置" + accountMsg
    });
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
  accountInput: function (event) {
    this.setData({
      accountValue: event.detail.value
    });
  },
  sureBtnClick: function () {
    switch (parseInt(this.data.accountType)) {
      case 0:
        if (this.data.accountValue == this.data.account.nickname) {
          swan.navigateBack({});
        }
        this.data.account.nickname = this.data.accountValue;
        break;
      case 1:
        if (this.data.accountValue == this.data.account.linkman) {
          swan.navigateBack({});
        }
        this.data.account.linkman = this.data.accountValue;
        break;
      case 2:
        if (this.data.accountValue == this.data.account.email) {
          swan.navigateBack({});
        }
        this.data.account.email = this.data.accountValue;
        break;
      case 3:
        if (this.data.accountValue == this.data.account.qq) {
          swan.navigateBack({});
        }
        this.data.account.qq = this.data.accountValue;
        break;
      case 4:
        if (this.data.accountValue == this.data.account.address) {
          swan.navigateBack({});
        }
        this.data.account.address = this.data.accountValue;
        break;
      default:
        break;
    }
    this.setData({ account: this.data.account });
    if (parseInt(this.data.accountType) == 0) {
      this.editnickname();
    } else {
      this.editaccount();
    }
  },
  editaccount: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    if (sessionid == undefined) {
      return;
    }
    api.editaccount({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        nickname: this.data.account.nickname,
        linkman: this.data.account.linkman,
        email: this.data.account.email,
        tel: this.data.account.tel,
        qq: this.data.account.qq,
        idcard: this.data.account.idcard,
        address: this.data.account.address
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面

          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            refresh: 1
          });
          swan.navigateBack({});
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
  editnickname: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    if (sessionid == undefined) {
      return;
    }
    api.editnickname({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        nickName: this.data.account.nickname
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面

          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            refresh: 1
          });
          swan.navigateBack({});
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