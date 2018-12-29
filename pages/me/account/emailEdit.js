// pages/me/account/emailEdit.js
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
    token: '',
    accountValue: '获取邮箱失败',
    focus: [{ focus: false }, { focus: false }, { focus: false }, { focus: false }, { focus: false }, { focus: false }],
    focus_value1: '',
    focus_value2: '',
    focus_value3: '',
    focus_value4: '',
    focus_value5: '',
    focus_value6: '',
    second: 60,
    secondMsg: '发送验证码',
    sendCodeBtnDisabled: false
  },

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
  onShareAppMessage: function () { }, /*清除密码和检测输入*/
  bindKeyInput: function (e) {
    var index = e.currentTarget.dataset.hi;
    var thisText = e.detail.value;
    var focus = [];
    switch (parseInt(index)) {
      case 0:
        this.setData({ focus_value1: thisText });
        for (var i = 0; i < 6; i++) {
          if (i == 0) {
            focus.push({ focus: false, focus_value: this.data.focus_value1 });
          }
          if (i == 1) {
            if (thisText != null && thisText != "") {
              focus.push({ focus: true, focus_value: this.data.focus_value2 });
            } else {
              focus.push({ focus: false, focus_value: this.data.focus_value2 });
            }
          }
          if (i == 2) {
            focus.push({ focus: false, focus_value: this.data.focus_value3 });
          }
          if (i == 3) {
            focus.push({ focus: false, focus_value: this.data.focus_value4 });
          }
          if (i == 4) {
            focus.push({ focus: false, focus_value: this.data.focus_value5 });
          }
          if (i == 5) {
            focus.push({ focus: false, focus_value: this.data.focus_value6 });
          }
        }
        break;
      case 1:
        this.setData({ focus_value2: thisText });
        for (var i = 0; i < 6; i++) {
          if (i == 0) {
            focus.push({ focus: false, focus_value: this.data.focus_value1 });
          }
          if (i == 1) {
            focus.push({ focus: false, focus_value: this.data.focus_value2 });
          }
          if (i == 2) {
            if (thisText != null && thisText != "") {
              focus.push({ focus: true, focus_value: this.data.focus_value3 });
            } else {
              focus.push({ focus: false, focus_value: this.data.focus_value3 });
            }
          }
          if (i == 3) {
            focus.push({ focus: false, focus_value: this.data.focus_value4 });
          }
          if (i == 4) {
            focus.push({ focus: false, focus_value: this.data.focus_value5 });
          }
          if (i == 5) {
            focus.push({ focus: false, focus_value: this.data.focus_value6 });
          }
        }
        break;
      case 2:
        this.setData({ focus_value3: thisText });
        for (var i = 0; i < 6; i++) {
          if (i == 0) {
            focus.push({ focus: false, focus_value: this.data.focus_value1 });
          }
          if (i == 1) {
            focus.push({ focus: false, focus_value: this.data.focus_value2 });
          }
          if (i == 2) {
            focus.push({ focus: false, focus_value: this.data.focus_value3 });
          }
          if (i == 3) {
            if (thisText != null && thisText != "") {
              focus.push({ focus: true, focus_value: this.data.focus_value4 });
            } else {
              focus.push({ focus: false, focus_value: this.data.focus_value4 });
            }
          }
          if (i == 4) {
            focus.push({ focus: false, focus_value: this.data.focus_value5 });
          }
          if (i == 5) {
            focus.push({ focus: false, focus_value: this.data.focus_value6 });
          }
        }
        break;
      case 3:
        this.setData({ focus_value4: thisText });
        for (var i = 0; i < 6; i++) {
          if (i == 0) {
            focus.push({ focus: false, focus_value: this.data.focus_value1 });
          }
          if (i == 1) {
            focus.push({ focus: false, focus_value: this.data.focus_value2 });
          }
          if (i == 2) {
            focus.push({ focus: false, focus_value: this.data.focus_value3 });
          }
          if (i == 3) {
            focus.push({ focus: false, focus_value: this.data.focus_value4 });
          }
          if (i == 4) {
            if (thisText != null && thisText != "") {
              focus.push({ focus: true, focus_value: this.data.focus_value5 });
            } else {
              focus.push({ focus: false, focus_value: this.data.focus_value5 });
            }
          }
          if (i == 5) {
            focus.push({ focus: false, focus_value: this.data.focus_value6 });
          }
        }
        break;
      case 4:
        this.setData({ focus_value5: thisText });
        for (var i = 0; i < 6; i++) {
          if (i == 0) {
            focus.push({ focus: false, focus_value: this.data.focus_value1 });
          }
          if (i == 1) {
            focus.push({ focus: false, focus_value: this.data.focus_value2 });
          }
          if (i == 2) {
            focus.push({ focus: false, focus_value: this.data.focus_value3 });
          }
          if (i == 3) {
            focus.push({ focus: false, focus_value: this.data.focus_value4 });
          }
          if (i == 4) {
            focus.push({ focus: false, focus_value: this.data.focus_value5 });
          }
          if (i == 5) {
            if (thisText != null && thisText != "") {
              focus.push({ focus: true, focus_value: this.data.focus_value6 });
            } else {
              focus.push({ focus: false, focus_value: this.data.focus_value6 });
            }
          }
        }
        break;
      case 5:
        this.setData({ focus_value6: thisText });
        for (var i = 0; i < 6; i++) {
          if (i == 0) {
            focus.push({ focus: false, focus_value: this.data.focus_value1 });
          }
          if (i == 1) {
            focus.push({ focus: false, focus_value: this.data.focus_value2 });
          }
          if (i == 2) {
            focus.push({ focus: false, focus_value: this.data.focus_value3 });
          }
          if (i == 3) {
            focus.push({ focus: false, focus_value: this.data.focus_value4 });
          }
          if (i == 4) {
            focus.push({ focus: false, focus_value: this.data.focus_value5 });
          }
          if (i == 5) {
            focus.push({ focus: false, focus_value: this.data.focus_value6 });
          }
        }
        break;
      default:
        break;
    }
    this.setData({
      password_value: e.detail.value,
      password_lenght: thisText.length,
      focus: focus
    });
    var yzm = this.data.focus_value1 + this.data.focus_value2 + this.data.focus_value3 + this.data.focus_value4 + this.data.focus_value5 + this.data.focus_value6;
    if (yzm.length == 6) {
      this.checkCode();
    }
    // var pos = e.detail.cursor;
    // if (pos != -1) {
    //   //光标在中间
    //   var left = e.detail.value.slice(0, pos);
    //   //计算光标的位置
    //   pos = left.replace(/11/g, '2').length;
    // }

    // //直接返回对象，可以对输入进行过滤处理，同时可以控制光标的位置
    // return {
    //   value: value.replace(/11/g, '2'),
    //   cursor: pos
    // }
  },
  checkCode: function () {
    if (this.data.focus_value1 == "" || this.data.focus_value2 == "" || this.data.focus_value3 == "" || this.data.focus_value4 == "" || this.data.focus_value5 == "" || this.data.focus_value6 == "") {
      swan.showToast({
        title: '请输入6位验证码',
        icon: 'success',
        duration: 1500
      });
    } else {
      var yzm = this.data.focus_value1 + this.data.focus_value2 + this.data.focus_value3 + this.data.focus_value4 + this.data.focus_value5 + this.data.focus_value6;
      if (yzm.length == 6) {
        this.checkyzm(yzm);
      } else {
        swan.showToast({
          title: '请输入6位验证码',
          icon: 'success',
          duration: 1500
        });
      }
    }
  },
  accountInput: function (event) {
    this.setData({
      accountValue: event.detail.value
    });
  },
  checkemail: function () {
    this.data.account.email = this.data.accountValue;
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
        email: this.data.accountValue
      },
      success: res => {
        var data = res.data;
        var that = this;
        if (data.errcode == 0) {
          if (data.isvalid == "1") {
            swan.showModal({
              title: '温馨提示',
              content: '此邮箱已验证！',
              confirmText: "确定",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  that.editaccount();
                } else {
                  return;
                }
              }
            });
          } else {
            this.setData({ token: data.token });
            this.countdown(this);
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
  },
  checkyzm: function (yzm) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    if (sessionid == undefined) {
      return;
    }
    api.checkyzm({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        token: this.data.token,
        yzm: yzm
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          swan.showModal({
            title: '温馨提示',
            content: '邮箱验证成功！',
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                this.editaccount();
              } else {
                return;
              }
            }
          });
        } else {
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              // if (res.confirm) {
              //   return;
              // } else {
              //   return;
              // }
            }
          });
        }
      }
    });
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
  // 从从60到到0倒计时  
  countdown: function (that) {
    var second = that.data.second;
    if (second == 0) {
      that.setData({
        second: 60,
        secondMsg: "重新获取",
        sendCodeBtnDisabled: false
      });
      return;
    }
    var time = setTimeout(function () {
      that.setData({
        second: second - 1,
        sendCodeBtnDisabled: true
      });
      that.setData({
        secondMsg: that.data.second + 's后重新获取'
      });
      that.countdown(that);
    }, 1000);
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});