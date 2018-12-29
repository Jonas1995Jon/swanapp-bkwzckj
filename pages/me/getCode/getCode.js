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
      centerBtnTitle: '个人信息'
    },
    token: '',
    mobile: '获取手机号失败',
    infoid: '',
    codeType: 0, //0绑定账户获取手机验证码，1忘记密码获取手机验证码
    // focus: [
    //   { focus: false },
    //   { focus: false },
    //   { focus: false },
    //   { focus: false },
    //   { focus: false },
    //   { focus: false },
    // ],
    // focus_value1: '',
    // focus_value2: '',
    // focus_value3: '',
    // focus_value4: '',
    // focus_value5: '',
    // focus_value6: '',
    focus_value: '',
    second: 60,
    secondMsg: '发送验证码',
    sendCodeBtnDisabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var token = options.token;
    var mobile = options.mobile;
    this.setData({ token: token });
    this.setData({ mobile: mobile });
    var codeType = options.codeType;
    if (codeType == 1) {
      var infoid = options.infoid;
      this.setData({ infoid: infoid });
      this.setData({ codeType: codeType });
      swan.setNavigationBarTitle({
        title: '忘记密码'
      });
    }
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
    // var focus = [];
    // switch (parseInt(index)) {
    //   case 0:
    //     this.setData({ focus_value1: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value2 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //         }
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   case 1:
    //     this.setData({ focus_value2: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value3 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //         }
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   case 2:
    //     this.setData({ focus_value3: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value4 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //         }
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   case 3:
    //     this.setData({ focus_value4: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value5 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //         }
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   case 4:
    //     this.setData({ focus_value5: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         if (thisText != null && thisText != "") {
    //           focus.push({ focus: true, focus_value: this.data.focus_value6 });
    //         } else {
    //           focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //         }
    //       }
    //     }
    //     break;
    //   case 5:
    //     this.setData({ focus_value6: thisText });
    //     for (var i = 0; i < 6; i++) {
    //       if (i == 0) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value1 });
    //       }
    //       if (i == 1) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value2 });
    //       }
    //       if (i == 2) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value3 });
    //       }
    //       if (i == 3) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value4 });
    //       }
    //       if (i == 4) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value5 });
    //       }
    //       if (i == 5) {
    //         focus.push({ focus: false, focus_value: this.data.focus_value6 });
    //       }
    //     }
    //     break;
    //   default:
    //     break;
    // }
    this.setData({
      password_value: e.detail.value,
      password_lenght: thisText.length,
      // focus: focus,
      focus_value: thisText
    });
    // var yzm = this.data.focus_value1 + this.data.focus_value2 + this.data.focus_value3 + this.data.focus_value4 + this.data.focus_value5 + this.data.focus_value6;
    var yzm = thisText;
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
    if (this.data.focus_value == "" || this.data.focus_value.length < 6) {
      swan.showModal({
        title: '提示',
        content: '请输入6位验证码',
        showCancel: false
      });
    } else {
      var yzm = this.data.focus_value;
      if (yzm.length == 6) {
        if (this.data.codeType == 0) {
          var data = {
            token: this.data.token,
            yzm: yzm
          };
          //sendCode();
          //request_bindinguser_step3(data);
          request.request_bindinguser_step3(data);
        } else {
          api.checkcode({
            methods: 'POST',
            data: {
              infoid: this.data.infoid,
              code: yzm
            },
            success: res => {
              var data = res.data;
              if (data.errcode == 0) {
                //验证码发送成功,微信小程序页面限制只能返回一个页面再跳转
                var pages = getCurrentPages();
                var prevPage = pages[pages.length - 2];
                //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
                prevPage.setData({
                  infoid: this.data.infoid
                });
                // wx.navigateBack({
                //   delta: 1,
                // })
                var url = '../resetPassword/resetPassword?infoid=' + this.data.infoid;
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
              console.log(data);
            }
          });
        }
      } else {
        swan.showModal({
          title: '提示',
          content: '请输入6位验证码',
          showCancel: false
        });
      }
    }
  },
  sendCode: function () {
    if (this.data.codeType == 0) {
      var data = {
        token: this.data.token,
        mobile: this.data.mobile
      };
      this.request_bindinguser_step2(data);
    } else {
      api.sendinfo({
        methods: 'POST',
        data: {
          infoid: this.data.infoid,
          type: 'mobile'
        },
        success: res => {
          var data = res.data;
          if (data.errcode == 0) {
            //验证码发送成功
            this.countdown(this);
          } else {
            //验证码发送失败等错误
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
        secondMsg: that.data.second + 's后重发'
      });
      that.countdown(that);
    }, 1000);
  },
  request_bindinguser_step2: function (data) {
    var random = common.random(6);
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    timestamp = timestamp.toString();
    var token = getApp().globalData.bkw_token;
    var singatureArr = [];
    singatureArr.push(token);
    singatureArr.push(timestamp.toString());
    singatureArr.push(random);
    singatureArr = singatureArr.sort();
    var singatureStr = '';
    for (var i = 0; i < singatureArr.length; i++) {
      singatureStr += singatureArr[i];
    }
    // console.log(singatureStr);
    singatureStr = common.sha1(singatureStr);
    api.bindinguser_step2({
      methods: 'POST',
      data: {
        mobile: data.mobile,
        token: data.token,
        timestamp: timestamp,
        nonce: random,
        signature: singatureStr
      },
      success: res => {
        var resData = res.data;
        if (resData.errcode == 0) {
          //验证码发送成功
          this.countdown(this);
          // var url = '../getCode/getCode?token=' + data.token + '&mobile=' + data.mobile;
          // wx.navigateTo({
          //   url: url,
          // })
        } else {
          //验证码发送失败等错误
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
        console.log(data);
      }
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});