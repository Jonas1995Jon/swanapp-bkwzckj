// pages/course/myorder/myorder.js
import api from '../../../api/api.js';
import common from '../../../utils/common.js';
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentindex: 0,
    isHideLoadMore: true,
    pageindex: 1,
    pagesize: 10,
    loadMoreMsg: '加载更多',
    orderlist: [],
    orderlist1: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.myorder(1);
    this.myorder(0);
  },
  orderlist: function () { },
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
  swiperChange: function (e) {
    var currnet = e.detail.current;
    if (currnet == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (currnet == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  myOrderBtnClick: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (index == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  myorder: function (state) {
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo.sessionid != '' && bk_userinfo.sessionid != null) {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.myorder({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        state: state,
        pagecurrent: 1
      },
      success: res => {
        this.setData({
          orderlist: [],
          orderlist1: []
        });
        var data = res.data;
        // console.log(data)
        if (data.errcode == 0) {
          for (var i = 0; i < data.data.length; i++) {
            this.getorderdetail(data.data[i].orderguid, state);
          }
        } else {
          this.setData({
            myorderYes: '',
            myorderNo: ''
          });
        }
        // if (state == 1) {
        //   if (data.errmsg != '尚未有订单数据') {
        //     this.setData({ myorderYes1: data });
        //     if (this.data.myorderYes1 != undefined) {
        //       var orderdata = this.data.myorderYes1.data;
        //       this.setData({
        //         orderlist: []
        //       })
        //       for (var i = 0; i < orderdata.length; i++) {
        //         this.getorderdetail(orderdata[i].orderguid);
        //       }
        //       console.log(this.data.orderlist)
        //     }
        //   } else {
        //     this.setData({ myorderYes: '' });
        //   }
        // } else {
        //   if (data.errmsg != '尚未有订单数据') {
        //     this.setData({ myorderNo1: data });
        //     if (this.data.myorderNo1 != undefined) {
        //       var orderdata = this.data.myorderNo1.data;
        //       this.setData({
        //         orderlist: []
        //       })
        //       for (var i = 0; i < orderdata.length; i++) {
        //         this.getorderdetail(orderdata[i].orderguid);
        //       }
        //     }
        //   } else {
        //     this.setData({ myorderNo: '' });
        //   }
        // }
      }
    });
  },
  payBtnClick: function (event) {
    var orderguid = event.currentTarget.dataset.orderguid;
    var url = 'myorderDetail?orderguid=' + orderguid + '&state=0';
    swan.navigateTo({
      url: url
    });
    // this.getorderdetail(orderguid);
  },
  cancelBtnClick: function (event) {
    var orderguid = event.currentTarget.dataset.orderguid;
    var that = this;
    swan.showModal({
      title: '温馨提示',
      content: '是否取消订单',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          that.cancelorder(orderguid);
        } else {
          return;
        }
      }
    });
  },
  cancelorder: function (orderguid) {
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo.sessionid != '' && bk_userinfo.sessionid != null) {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.cancelorder({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        orderguid: orderguid
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          swan.showToast({
            title: "取消订单成功！",
            icon: 'success',
            duration: 1500
          });
          this.myorder(0);
          this.myorder(1);
        }
      }
    });
  },
  orderYesClick: function (event) {
    var orderguid = event.currentTarget.dataset.orderguid;
    var url = 'myorderDetail?orderguid=' + orderguid + '&state=1';
    swan.navigateTo({
      url: url
    });
  },
  getorderdetail: function (orderguid, state) {
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
          if (state == 1) {
            this.data.orderlist.push(data);
          } else {
            this.data.orderlist1.push(data);
          }
          this.setData({
            myorderYes: this.data.orderlist,
            myorderNo: this.data.orderlist1
          });
        }
      }
    });
  },
  //加载更多
  scrolltolower: function (e) {
    // if (this.data.currentindex == 0) {
    //   if (this.data.myorderYes.data.length % 10 != 0) {
    //     this.setData({ isHideLoadMore: false });
    //     this.setData({ loadMoreMsg: '暂无更多数据' })
    //     setTimeout(() => {
    //       this.setData({ isHideLoadMore: true });
    //     }, 1000)
    //   } else {
    //     wx.showNavigationBarLoading(); //在标题栏中显示加载
    //     this.setData({ pageindex: this.data.pageindex + 1 });
    //     this.myorder(1);
    //   }
    // } else if (this.data.currentindex == 1) {
    //   if (this.data.myorderNo.data.length % 10 != 0) {
    //     this.setData({ isHideLoadMore: false });
    //     this.setData({ loadMoreMsg: '暂无更多数据' })
    //     setTimeout(() => {
    //       this.setData({ isHideLoadMore: true });
    //     }, 1000)
    //   } else {
    //     this.setData({ pageindex: this.data.pageindex + 1 });
    //     this.myorder(0);
    //   }
    // }
  }
});