// pages/me/account/account.js
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
      centerBtnTitle: '个人信息'
    },
    headPortrait: 'http://attachment.cnbkw.com/bkwimg/up/201705/d6b6f2b54fa34bc3822c7cfb02f00625.jpg',
    nickName: '',
    phone: '未填写',
    refresh: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userinfo = swan.getStorageSync('userinfo');
    this.setData({ headPortrait: userinfo.avatarUrl });
    this.setData({ nickName: userinfo.nickName });
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    this.setData({ phone: bk_userinfo.username });
    this.myaccount();
    var account = swan.getStorageSync('bk_account');
    if (account == "") {
      this.myaccount();
    } else {
      this.setData({ "account": account });
      this.checkemail(account.email);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.refresh == 1) {
      this.myaccount();
    }
  },

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
  //绑定
  bindClick: function () {
    swan.navigateTo({
      url: '../bind/bind'
    });
  },
  //解绑
  unBindClick: function () {
    var that = this;
    swan.showModal({
      title: '温馨提示',
      content: '是否立即解绑',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          that.unBindingUser();
        } else {
          return;
        }
      }
    });
  },
  myaccount: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    if (sessionid == undefined) {
      return;
    }
    api.myaccount({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid
      },
      success: res => {
        var data = res.data;
        console.log(data);
        if (data.errcode == 0) {
          data.linkman = decodeURI(data.linkman);
          data.address = decodeURI(data.address);
          swan.setStorageSync('bk_account', data);
          this.setData({ "account": data });
          this.checkemail(data.email);
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
  accountEditClick: function (e) {
    var index = e.currentTarget.dataset.index;
    var value = e.currentTarget.dataset.value;
    switch (parseInt(index)) {
      case 0:
        swan.navigateTo({
          url: 'accountEdit?accountMsg=昵称&accountValue=' + value + '&account=' + JSON.stringify(this.data.account) + '&accountType=' + index
        });
        break;
      case 1:
        swan.navigateTo({
          url: 'accountEdit?accountMsg=姓名&accountValue=' + value + '&account=' + JSON.stringify(this.data.account) + '&accountType=' + index
        });
        break;
      case 2:
        swan.navigateTo({
          url: 'emailEdit?accountMsg=邮箱&accountValue=' + value + '&account=' + JSON.stringify(this.data.account) + '&accountType=' + index
        });
        break;
      case 3:
        swan.navigateTo({
          url: 'accountEdit?accountMsg=QQ&accountValue=' + value + '&account=' + JSON.stringify(this.data.account) + '&accountType=' + index
        });
        break;
      case 4:
        swan.navigateTo({
          url: 'accountEdit?accountMsg=收件地址&accountValue=' + value + '&account=' + JSON.stringify(this.data.account) + '&accountType=' + index
        });
        break;
      default:
        break;
    }
  },
  sureBtnClick: function () { },
  checkemail: function (email) {
    if (this.data.account != ("" && undefined) && this.data.account.email != ("" && undefined)) {
      var bk_userinfo = swan.getStorageSync('bk_userinfo');
      var sessionid = bk_userinfo.sessionid;
      var uid = bk_userinfo.uid;
      if (sessionid == undefined) {
        return;
      }
      api.checkemail({
        methods: 'POST',
        data: {
          sessionid: sessionid,
          uid: uid,
          email: email
        },
        success: res => {
          var data = res.data;
          var that = this;
          if (data.errcode == 0) {
            if (data.isvalid == "1") {
              this.setData({ emaliIsValid: "已验证" });
            } else {
              this.setData({ emaliIsValid: "未验证" });
            }
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
  },
  unBindingUser: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.unBindingUser({
      methods: 'POST',
      data: {
        source: getApp().globalData.source,
        sessionid: sessionid,
        uid: uid
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //解除绑定成功
          swan.showToast({
            title: '解绑成功',
            icon: 'success',
            duration: 1500
          });
          swan.removeStorage({
            key: 'bk_userinfo'
          });
          swan.removeStorage({
            key: 'bk_account'
          });
          swan.removeStorage({
            key: 'bk_userinfo_tell'
          });
          this.setData({ phone: '未填写' });
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面

          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            refresh: 1
          });
          swan.navigateBack();
        } else {
          //尚未绑定帮考网账号等错误
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
        console.log(data);
      }
    });
  }
});