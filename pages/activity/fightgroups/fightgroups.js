// pages/activity/fightgroups/fightgroups.js

import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
import md5 from '../../../utils/md5.js';

//获取应用实例
var app = getApp();
var interval = null;
var payInterval = null;
// var userinfo;
var categoryid;
// var openid;
// var unionid;
var shareTitle = "送你一份一级注册消防工程师考试资料包，点击立即领取";
var shareImg = "../../../image/fightgroups/redpacket_share.jpg";
// var shareImg = "";
var groupid = "";
var templateid = "";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '拼团',
      backgroundColor: '#ff5558'
    },
    animationMiddleHeaderItem: '',
    templateList: '',
    categoryid: '',
    groupid: '',
    templateid: '',
    userinfo: '',
    groups: '',
    unionid: '',
    openid: '',
    // headImg: '',
    // headName: '',
    residueNumber: '0',
    numberofpeople: '3',
    fightGroupsSuccess: '0',
    courseCommodityList: '',
    receivestate: '0',
    receiveBtnTitle: '',
    addTime: '',
    countDownTime: '',
    validity: '1',
    fightGroupsIsOverState: '0', //拼团失效与否 0 未失效 1失效
    countDownTimeTitle: '00:00:00后结束',
    touchStart: 0,
    giftBagHidden: true,
    lingquBtn: true,
    disabled: false,
    groupCompleteList: {
      "errcode": 0, "errmsg": "ok", "list": [{
        "addtime": "", "receivestate": "0", "nickname": "", "unionid": "", "templateid": "", "openid": "", "groupid": "", "headimgurl": "../../../image/fightgroups/user_noportrait.png"
      }, {
        "addtime": "", "receivestate": "0", "nickname": "", "unionid": "", "templateid": "", "openid": "", "groupid": "", "headimgurl": "../../../image/fightgroups/user_noportrait.png"
      }, {
        "addtime": "", "receivestate": "0", "nickname": "", "unionid": "", "templateid": "", "openid": "", "groupid": "", "headimgurl": "../../../image/fightgroups/user_noportrait.png"
      }]
    },
    noportrait: '../../../image/fightgroups/user_noportrait.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    categoryid = options.sharecategoryid;
    // categoryid = "1183";
    groupid = options.sharegroupid;
    templateid = options.sharetemplateid;
    // groupid = 3378;
    // templateid = 11;
    this.checkFight();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var circleCount = 0;
    // 心跳的外框动画  
    this.animationMiddleHeaderItem = swan.createAnimation({
      duration: 1000, // 以毫秒为单位  
      /** 
      * http://cubic-bezier.com/#0,0,.58,1   
      *  linear  动画一直较为均匀 
      *  ease    从匀速到加速在到匀速 
      *  ease-in 缓慢到匀速 
      *  ease-in-out 从缓慢到匀速再到缓慢 
      *  
      *  http://www.tuicool.com/articles/neqMVr 
      *  step-start 动画一开始就跳到 100% 直到动画持续时间结束 一闪而过 
      *  step-end   保持 0% 的样式直到动画持续时间结束        一闪而过 
      */
      timingFunction: 'linear',
      delay: 50,
      transformOrigin: '50% 50%',
      success: function (res) { }
    });

    setInterval(function () {
      if (circleCount % 2 == 0) {
        this.animationMiddleHeaderItem.scale(0.8).step();
      } else {
        this.animationMiddleHeaderItem.scale(1.0).step();
      }

      this.setData({
        animationMiddleHeaderItem: this.animationMiddleHeaderItem.export()
      });

      circleCount++;
      if (circleCount == 1000) {
        circleCount = 0;
      }
    }.bind(this), 1000);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    swan.hideTabBar({});
    swan.setNavigationBarTitle({
      title: swan.getStorageSync('categoryname')
    });
    this.setData({ categoryname: swan.getStorageSync('categoryname') });
    if (this.data.switchClassCategory == 1) {
      this.setData({ switchClassCategory: 0 });
      this.checkFight();
    }
    //判断缓存里是否已经存在userinfo
    var userinfo = swan.getStorageSync('userinfo');
    if (userinfo != "") {
      this.setData({ userinfo: userinfo });
      this.setData({ headPortrait: userinfo.avatarUrl });
      this.setData({ username: userinfo.nickName });
      // this.checkOpenPower();
      this.checkFight();
    } else {
      this.showCustomModal(false);
    }
    // var openid = wx.getStorageSync('wx_openid');
    // if (openid == undefined || openid == null || openid == "") {
    //   this.wxLogin();
    // }
    // var unionid = wx.getStorageSync('wx_unionid');
    // if (unionid == undefined || unionid == null || unionid == "") {
    //   this.wxLogin();
    // }
    var openid = swan.getStorageSync('wx_openid');
    var wx_session_key = swan.getStorageSync('wx_session_key');
    var unionid = swan.getStorageSync('wx_unionid');
    if (openid == "" || wx_session_key == "") {
      this.wxLogin();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    swan.showTabBar({});
    this.stopcountDownHandler();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.stopcountDownHandler();
  },

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
  onShareAppMessage: function () {
    var sharegroupid = this.data.groupid;
    var sharetemplateid = this.data.templateid;
    var sharecategoryid = this.data.categoryid;
    console.log(this.data.categoryid + "/" + this.data.groupid + "/" + this.data.templateid);
    if (sharegroupid == undefined || sharetemplateid == undefined || sharecategoryid == undefined) { } else {
      return {
        title: shareTitle,
        imageUrl: shareImg,
        path: '/pages/activity/fightgroups/fightgroups?sharegroupid=' + sharegroupid + '&sharetemplateid=' + sharetemplateid + '&sharecategoryid=' + sharecategoryid,
        success: function (res) {
          // 转发成功

        },
        fail: function (res) {
          // 转发失败
        }
      };
    }
  },
  checkFight: function () {
    if (categoryid == "" || categoryid == undefined) {
      categoryid = swan.getStorageSync('categoryid');
    }
    this.setData({ categoryid: categoryid });

    var wx_openid = swan.getStorageSync('wx_openid');
    var wx_session_key = swan.getStorageSync('wx_session_key');
    var wx_unionid = swan.getStorageSync('wx_unionid');
    if (wx_openid == "" || wx_session_key == "") {
      this.wxLogin();
    } else {
      //判断缓存里是否已经存在userinfo
      var userinfo = swan.getStorageSync('userinfo');
      if (userinfo != "") {
        this.setData({ userinfo: userinfo });
        this.setData({ headPortrait: userinfo.avatarUrl });
        this.setData({ username: userinfo.nickName });
        this.checkOpenPower();
      } else {
        this.showCustomModal(false);
      }
    }
  },
  directOpenClick: function () { },
  getTemplateByCategoryid: function () {
    var categoryid = this.data.categoryid;
    if (categoryid == "" || categoryid == null || categoryid == undefined) {
      // var url = '../../learn/classCategory/classCategory';
      // wx.navigateTo({
      //   url: url
      // })
      return;
    }
    api.getTemplateByCategoryid({
      methods: 'POST',
      data: {
        categoryid: this.data.categoryid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var templateList = data.list;
          if (templateList.length > 0) {
            this.setData({ templateList: templateList });
            shareTitle = templateList[0].share_title;
            // shareImg = templateList[0].share_backgroundimage;
            this.setData({ numberofpeople: templateList[0].numberofpeople });
            this.setData({ validity: templateList[0].validity });
            this.setData({ receiveBtnTitle: "¥" + templateList[0].price + "获取" });
            // if (templateList[0].price == 0 ){
            //   this.setData({ receiveBtnTitle: "免费开通取证班" });
            // }else{
            //   this.setData({ receiveBtnTitle: "¥" + templateList[0].price + "，元开通" });
            // }
            // if (templateList.length != this.data.numberofpeople) {
            this.setGroups();
            // }
          } else {
            swan.showModal({
              title: '温馨提示',
              content: '您选择的课程暂未开放拼团功能！',
              confirmText: "确定",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  var url = '../../redpacket/redPacket';
                  swan.switchTab({
                    url: url
                  });
                } else { }
              }
            });
          }
          //this.setData({ publicCourse: data });
        } else {
          // swan.showToast({
          //   title: data.errmsg
          // });
        }
      }
    });
  },
  /**
   * 开始创建拼团
   */
  setGroups: function () {
    // console.log(this.data.templateList);
    if (this.data.templateList.length < 1) {
      return;
    }
    var userinfo = swan.getStorageSync('userinfo');
    var nickname = userinfo.nickname;
    if (nickname == undefined) {
      nickname = userinfo.nickName;
    }
    var headimgurl = userinfo.avatarUrl;
    console.log(nickname, headimgurl);
    if (nickname == undefined || headimgurl == undefined) {
      nickname = "未授权用户";
      headimgurl = this.data.noportrait;
      // this.showCustomModal(false);
      return;
    }
    var openid = swan.getStorageSync('wx_openid');
    var unionid = swan.getStorageSync('wx_unionid');
    api.setGroups({
      methods: 'POST',
      data: {
        templateid: this.data.templateList[0].templateid,
        openid: openid,
        unionid: unionid,
        nickname: nickname,
        headimgurl: headimgurl,
        receivestate: 0 //0已领取，1未领取
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        // this.setData({ headImg: this.data.userinfo.avatarUrl })
        // this.setData({ headName: this.data.userinfo.nickName })
        if (data.errcode == 0) {
          this.setData({ groupid: data.groupid });
          this.setData({ templateid: data.templateid });
          this.getGroupCompleteList();
        } else if (data.errcode == 40002) {
          //已经加入该拼团
          // this.setData({ groupid: 33 });
          // this.setData({ templateid: 1 });
          this.setData({ fightGroupsSuccess: 0 });
          this.setData({ groupid: data.groupid });
          this.setData({ templateid: data.templateid });
          this.getGroupCompleteList();
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
  /**
   * 开始拼团
   */
  setGroupsDetails: function () {
    if (this.data.templateList.length < 1) {
      this.getGroupCompleteList();
    }
    var nickname = this.data.userinfo.nickName;
    var headimgurl = this.data.userinfo.avatarUrl;
    if (nickname == undefined || headimgurl == undefined) {
      return;
      // nickname = "干嘛不授权";
      // headimgurl = this.data.noportrait;
    }
    var that = this;
    var openid = swan.getStorageSync('wx_openid');
    api.setGroupsDetails({
      methods: 'POST',
      data: {
        groupid: this.data.groupid,
        templateid: this.data.templateid,
        openid: openid,
        nickname: nickname,
        headimgurl: headimgurl,
        receivestate: 0, //0已领取，1未领取
        groupcount: this.data.numberofpeople
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ groups: data });
        } else if (data.errcode == 40002) {//已经加入该拼团，查询拼团列表
          // this.getGroupCompleteList();
        } else if (data.errcode == 40003) {
          //该拼团已经完成，请重新发起拼团
          swan.showModal({
            title: '温馨提示',
            content: '该拼团已经完成，请重新进入发起拼团',
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                that.setData({ fightGroupsSuccess: 0 });
                swan.setStorageSync('fightgroupsover', 1);
                that.setGroups();
                swan.navigateBack({
                  // delta: 1,
                });
              } else {
                swan.setStorageSync('fightgroupsover', 1);
                that.setData({ receivestate: 2 });
                that.setData({ receiveBtnTitle: '该拼团已经完成，点击重新发起拼团' });
              }
            }
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
  /**
   * 获取拼团成员列表
   */
  getGroupCompleteList: function () {
    api.getGroupCompleteList({
      methods: 'POST',
      data: {
        // groupid: 3378,
        // templateid: 11,
        templateid: this.data.templateid,
        groupid: this.data.groupid,
        groupcount: this.data.numberofpeople
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var groupCompleteList = data.list;
          if (groupCompleteList.length > 0) {
            var complateItem = {
              "addtime": "", "receivestate": "0", "nickname": "", "unionid": "", "templateid": "", "openid": "", "groupid": "", "headimgurl": "../../../image/fightgroups/user_noportrait.png"
            };

            var length = this.data.numberofpeople - groupCompleteList.length;

            if (length > 0) {
              this.setData({ peopleNumbers: length });
              this.setData({ giftBagHidden: false });
            } else {
              this.setData({ giftBagHidden: true });
            }
            this.setData({ residueNumber: length });
            if (length > 0) {
              for (var i = 0; i < length; i++) {
                data.list.push(complateItem);
              }
              this.setData({ groupCompleteList: data });
              this.setData({ addTime: data.list[0].addtime });
            } else {
              this.setData({ groupCompleteList: data });
              this.setData({ addTime: data.list[0].addtime });
              //拼团成功
              this.setData({ fightGroupsSuccess: 1 });
              this.getCourseCommodityByCommodityid();
            }

            var groupCompleteList = data.list;
            var countDownBegin = 0;
            for (var i = 0; i < groupCompleteList.length; i++) {
              if (groupCompleteList[i].openid == this.data.openid && groupCompleteList[i].unionid == this.data.unionid && groupCompleteList[i].receivestate == 1) {
                this.setData({ receivestate: 1 });
                this.setData({ receiveBtnTitle: '已领取' });
              }
              if (groupCompleteList[i].groupid == "" || groupCompleteList[i].groupid == null || groupCompleteList[i].groupid == undefined) {
                countDownBegin = 1;
              }
            }
            //console.log(groupCompleteList);

            if (countDownBegin == 1) {
              //开始倒计时
              this.countDownHandler();
            }
          }
        } else {
          // swan.showToast({
          //   title: data.errmsg,
          //   icon: 'success',
          //   duration: 1500
          // });
          this.setData({
            lingquBtn: false,
            disabled: true
          });
          swan.showModal({
            title: '提示',
            content: '活动已结束!',
            showCancel: false,
            success: res => {
              return;
            }
          });
        }
      }
    });
  },
  /**
   * 
   */
  getCourseCommodityByCommodityid: function () {
    var commodityid = this.data.templateList[0].commodityid;
    api.getCourseCommodityByCommodityid({
      methods: 'POST',
      data: {
        commodityid: commodityid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ courseCommodityList: data.list });
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
  receiveCommodity: function () {
    var commodityid = swan.getStorageSync('commodityid');
    var openid = swan.getStorageSync('wx_openid');
    api.receiveCommodity({
      methods: 'POST',
      data: {
        // groupid: 3378,
        // templateid: 11,
        groupid: this.data.groupid,
        templateid: this.data.templateid,
        openid: openid,
        market: app.globalData.market
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          //修改领取成功状态后续操作
          swan.setStorageSync('redPacketReceivestate', 1);
          this.setData({ receivestate: 1 });
          this.setData({ receiveBtnTitle: '已领取' });
          swan.showModal({
            title: '温馨提示',
            content: '领取成功',
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              if (res.confirm) { }
            }
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
  createpintuanorder: function (receivestate) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var openid = swan.getStorageSync('wx_openid');
    api.createpintuanorder({
      methods: 'POST',
      data: {
        groupid: this.data.groupid,
        uid: bk_userinfo.uid,
        market: app.globalData.market
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          if (data.receivestate == 0 && data.orderprice > 0) {
            console.log(parseInt(data.orderprice));
            this.createpayorder(data.orderguid, data.orderid, data.orderprice);
          } else if (data.receivestate == 1) {
            swan.setStorageSync('redPacketReceivestate', 1);
            this.setData({ receivestate: 1 });
            this.setData({ receiveBtnTitle: '已领取' });
            swan.showModal({
              title: '温馨提示',
              content: '领取成功！',
              confirmText: "确定",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  // var url = '../../course/myCourse/myCourse';
                  // wx.navigateTo({
                  //   url: url
                  // })
                }
              }
            });
            // this.receiveCommodity();
          } else if (receivestate == 2) {
            this.setGroups();
          }
        } else if (data.errcode == 40002) {
          var that = this;
          swan.setStorageSync('redPacketReceivestate', 1);
          if (this.data.receivestate == 1) {
            var url = '../../learn/brushNum/brushNum';
            swan.switchTab({
              url: url
            });
          } else {
            swan.showModal({
              title: '温馨提示',
              content: data.errmsg,
              confirmText: "确定",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  if (data.errmsg == "该商品您已领取,感谢您的关注！") {
                    that.setData({ receivestate: 1 });
                    swan.setStorageSync('redPacketReceivestate', 1);
                  } else {
                    var url = '../../learn/brushNum/brushNum';
                    swan.switchTab({
                      url: url
                    });
                  }
                }
              }
            });
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
  getCourseClick: function (event) {
    var receivestate = event.currentTarget.dataset.receivestate;
    this.checkIsBindding(receivestate);
  },
  //生成微信订单
  createpayorder: function (orderguid, orderid, price) {
    //测试代码
    // interval = setInterval(function () {
    //   that.checkState();
    //   //循环执行代码  
    // }, 3000) //循环时间 这里是3秒
    var that = this;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.createpayorder({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        orderguid: orderguid,
        orderid: orderid,
        orderprice: price,
        // orderprice: 0.01,
        gateway: app.globalData.gateway,
        market: app.globalData.market
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          //生成同一订单成功后调用微信支付
          this.weixinpay(orderguid, orderid, data.out_trade_no);
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
    console.log();
    return "appId=" + getApp().globalData.appid + "&nonceStr=" + randomString + "&package=prepay_id=" + prepay_id + "&signType=MD5" + "&timeStamp=" + timeStamp + "&key=" + getApp().globalData.sh_key;
  },
  //请求微信支付
  paySign: function (prepay_id, orderguid) {
    var nonceStr = common.randomString(32);
    var timeStamp = common.timeStamp();
    var mixedencryMD5 = this.mixedencryMD5(prepay_id, nonceStr, timeStamp);
    var paySign = md5.hexMD5(mixedencryMD5);
    paySign = paySign.toUpperCase();
    var that = this;
    swan.requestPayment({
      'timeStamp': timeStamp,
      'nonceStr': nonceStr,
      'package': 'prepay_id=' + prepay_id,
      'signType': 'MD5',
      'paySign': paySign,
      'success': function (res) {
        //console.log(res);
        //循环执行，检测课程开通情况
        payInterval = setInterval(function () {
          that.checkState(orderguid);
        }, 3000); //循环时间 这里是3秒
      },
      'fail': function (res) {
        console.log('fail:' + JSON.stringify(res));
      }
    });
  },
  //统一支付订单
  weixinpay: function (orderguid, orderid, out_trade_no) {
    // var wx_openid = wx.getStorageSync('wx_openid');
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    var openid = swan.getStorageSync('wx_openid');
    api.weixinpay({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        orderid: out_trade_no,
        openid: openid,
        market: app.globalData.market
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var prepay_id = data.prepay_id;
          this.paySign(prepay_id, orderguid);
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
  checkState: function (orderguid) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;
    api.checkstate({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        // orderguid: 'b87e33c5-fcb6-4eff-bd53-3d3c0fc491b6',
        orderguid: orderguid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          console.log('课程开通成功');
          clearInterval(payInterval);
          swan.showModal({
            title: '温馨提示',
            content: '购买拼团完成，课程开通成功！',
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var url = '../../course/myCourse/myCourse';
                swan.navigateTo({
                  url: url
                });
              }
            }
          });
        } else {
          swan.showModal({
            title: '温馨提示',
            content: '请求异常，请至我的课程查看课程是否开通，如支付成功未开通课程，请添加微信客服或拨打客服电话进行咨询！',
            showCancel: false,
            success: function (res) {
              var url = '../../redpacket/redPacket';
              swan.switchTab({
                url: url
              });
            }
          });
          // swan.showToast({
          //   title: data.errmsg
          // });
          clearInterval(payInterval);
        }
      }
    });
  },
  checkIsBindding: function (receivestate) {
    var that = this;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null || bk_userinfo == undefined) {
      var url = '../../me/bind/bind';
      swan.navigateTo({
        url: url
      });
    } else {
      if (receivestate == 2) {
        swan.showModal({
          title: '温馨提示',
          content: '该拼团已经完成，是否重新发起拼团',
          confirmText: "确定",
          cancelText: '取消',
          success: function (res) {
            if (res.confirm) {
              that.setData({ fightGroupsSuccess: 0 });
              that.setGroups();
            } else {
              return;
            }
          }
        });
      } else {
        that.createpintuanorder(receivestate);
      }
    }
  },
  //拼团倒计时
  countDownHandler: function () {
    var that = this;
    if (!interval) {
      interval = setInterval(() => {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        console.log(this.data.addTime);
        var addtimestamp = Date.parse(this.strToDate(this.data.addTime.replace(/-/g, '/')));

        addtimestamp = addtimestamp / 1000 + 60 * 60 * 24 * this.data.validity;
        var time = this.parseTime(addtimestamp - timestamp);
        console.log(addtimestamp);
        console.log(timestamp);
        if (addtimestamp - timestamp <= 0) {
          this.setData({ countDownTimeTitle: "拼团已失效" });
          this.setData({ fightGroupsIsOverState: "1" });
          this.stopcountDownHandler();
          swan.showModal({
            title: '温馨提示',
            content: '该拼团已过期失效！',
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                // that.setData({ fightGroupsIsOverState: 1 });
                // that.setGroups();
              }
            }
          });
          return;
        }
        // console.log(addtimestamp +"/"+ timestamp);
        // this.setData({ countDownTime: time});
        this.setData({ countDownTimeTitle: time + "后结束" });
        // this.setData({ countDownTime: this.data.countDownTime - 1 });
        // this.setData({ time: this.data.time + 1 });
        // this.setData({ displayTime: this.parseTime(this.data.time) });

        //console.log('计时开始' + this.data.displayTime);
      }, 1000);
    }
  },
  stopcountDownHandler: function () {
    // console.log('stop')
    if (interval) {
      clearInterval(interval);
      interval = null;
    } else { }
  },
  /**
    * 字符串转换为时间
    * @param  {String} src 字符串
    */
  strToDate: function (dateObj) {
    dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/');
    dateObj = dateObj.slice(0, dateObj.indexOf("."));
    return new Date(dateObj);
  },
  parseTime: function (time) {
    var dd = parseInt(time / 60 / 60 / 24);

    var hh = parseInt(time / 60 / 60 % 24);
    if (hh < 10) hh = '0' + hh;

    var mm = parseInt(time / 60 % 60);
    if (mm < 10) mm = '0' + mm;
    var ss = parseInt(time % 60);
    if (ss < 10) ss = '0' + ss;
    // var ssss = parseInt(this.data.time % 100);
    // if(ssss<10) ssss = '0'+ssss;
    // return `${mm}:${ss}:${ssss}`

    if (dd > 0) {
      return `${dd}天${hh}:${mm}:${ss}`;
    }
    if (hh > 0) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
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
        console.log("openid=" + data.openid + "&session_key=" + data.session_key + "&unionid=" + data.unionid);
        swan.setStorageSync('wx_openid', data.openid);
        swan.setStorageSync('wx_session_key', data.session_key);
        if (data.unionid == undefined) {
          this.setData({ session_key: data.session_key });
          this.setData({ code: code });
        } else {
          swan.setStorageSync('wx_unionid', data.unionid);
          this.checkOpenPower();
        }
        //判断缓存里是否已经存在userinfo
        // var userinfo = wx.getStorageSync('userinfo');
        // if (userinfo != "") {
        //   that.setData({ userinfo: userinfo });
        //   that.setData({ headPortrait: userinfo.avatarUrl });
        //   // that.setData({ username: userinfo.nickName });
        // } else {
        //   this.showCustomModal(false);
        // }
      }
    });
  },
  checkOpenPower: function () {
    console.log(this.data.templateList.length);
    if (this.data.templateList.length < 1) {
      this.getTemplateByCategoryid();
    }
    var fightgroupsover = swan.getStorageSync('fightgroupsover');
    //当用户没授权时，授权后继续进入拼团
    if (groupid == undefined || templateid == undefined || fightgroupsover == 1) {
      console.log("xxxxxxxxxxxx");
      this.setGroups();
      if (fightgroupsover == 1) {
        swan.setStorageSync('fightgroupsover', 0);
      }
    } else {
      console.log("xxxxxxxxxxxx00000000");
      this.setData({ groupid: groupid });
      this.setData({ templateid: templateid });
      this.setGroupsDetails();
    }
  },
  leftBtnClick: function () {
    swan.navigateBack({});
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
        swan.hideToast();
        if (data.errcode == 0) {
          var userinfo = {
            nickname: data.nickname,
            avatarUrl: data.avatarUrl,
            gender: data.gender,
            province: data.province,
            city: data.city,
            country: data.country,
            language: data.language
            // this.setData({ userinfo: userinfo });
          }; swan.setStorageSync('userinfo', userinfo);
          swan.setStorageSync('wx_unionid', data.unionid);
          this.checkOpenPower();
          request.request_thirdauth(40004);
        }
      }
    });
  },
  // 触摸开始事件  
  touchStart: function (e) {
    this.setData({ touchStart: 1 });
  },
  // 触摸结束事件  
  touchEnd: function (e) {
    this.setData({ touchStart: 0 });
  },
  backHomeClick: function () {
    swan.setStorageSync("backhome", 1);
    var url = '../../redpacket/redPacket';
    swan.switchTab({
      url: url
    });
  },
  redpacketCloseClick: function () {
    this.setData({ giftBagHidden: true });
  },
  onGetPhonenumber: function (e) {
    var that = this;
    var res = e.detail;
    console.log(res);
  },
  onGetUserInfo: function (e) {
    var that = this;
    var res = e.detail;
    this.showCustomModal(true);
    if (res.userInfo == undefined) {
      var url = '../../redpacket/redPacket';
      swan.switchTab({
        url: url
      });
      return;
    }
    // wx.setStorageSync('userinfo', res.userInfo);
    // that.setData({ encryptedData: res.encryptedData });
    // that.setData({ iv: res.iv });
    // // console.log(res.userInfo);
    // that.setData({ headPortrait: res.userInfo.avatarUrl });
    // that.setData({ username: res.userInfo.nickName });
    // var userInfo = res.userInfo;
    // that.setData({
    //   userinfo: userInfo
    // })
    // var nickName = userInfo.nickName;
    // var avatarUrl = userInfo.avatarUrl;
    // var gender = userInfo.gender; //性别 0：未知、1：男、2：女
    // var province = userInfo.province;
    // var city = userInfo.city;
    // var country = userInfo.country;
    that.setData({ userinfo: res.userInfo });
    swan.setStorageSync('userinfo', res.userInfo);
    that.setData({ encryptedData: res.encryptedData });
    that.setData({ iv: res.iv });
    that.setData({ headPortrait: res.userInfo.avatarUrl });
    that.setData({ username: res.userInfo.nickName });

    request.request_thirdauth(40004);
  },
  modalSureClick: function () {
    this.showCustomModal(true);
    var url = '../../redpacket/redPacket';
    swan.switchTab({
      url: url
    });
  },
  showGiftBag: function () {
    this.setData({ giftBagHidden: false });
  },
  showCustomModal: function (authorizationHidden) {
    this.setData({
      modal: {
        modalType: 3,
        // modalTitle: '帮考网',
        // modalDes: '为了更好的为你提供考试服务\n将获得你的公开信息',
        modalBtnTitle: '确认授权',
        modalBtnType: 0,
        image: '../../../image/fightgroups/model.png',
        authorizationHidden: authorizationHidden
      }
    });
  }
});