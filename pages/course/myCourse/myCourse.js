// pages/course/myCourse/myCourse.js
import api from '../../../api/api.js';
import common from '../../../utils/common.js';
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
      centerBtnTitle: '我的课程'
    },
    mycourseList: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.request_mycourse();
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
   * 我的课程
   */
  request_mycourse: function (data) {
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo.sessionid != '' && bk_userinfo.sessionid != null) {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.mycourse({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        pagecurrent: 1,
        pagesize: 1000
      },
      success: res => {
        var data = res.data;
        var mycourseList = data.val[0].data;
        console.log(mycourseList);
        var endtime;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          for (var i = 0; i < mycourseList.length; i++) {
            mycourseList[i].coursename = decodeURI(mycourseList[i].coursename);
            mycourseList[i].curstate = decodeURI(mycourseList[i].curstate);
            endtime = decodeURIComponent(mycourseList[i].endtime);
            // console.log(decodeURIComponent(mycourseList[i].endtime));
            endtime = endtime.replace('+', ' ');
            // endtime = endtime.replace('/', 'bkw1');
            // endtime = endtime.replace(':', 'bkw2');
            mycourseList[i].endtime = endtime;

            mycourseList[i].shuati_timelength = common.secondFormat(mycourseList[i].shuati_timelength);
            mycourseList[i].remaindertime = common.secondFormat(mycourseList[i].remaindertime);
          }
          this.setData({ mycourseList: mycourseList });
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
  mycourseClick: function (event) {
    var index = event.currentTarget.dataset.hi;
    var mycourseItem = this.data.mycourseList[index];
    console.log(mycourseItem);
    // wx.setStorageSync('categoryid', mycourseItem.masterid);
    swan.setStorageSync('courseid', mycourseItem.courseid);
    var url = 'detail/detail?mycourseItem=' + JSON.stringify(mycourseItem);
    swan.navigateTo({
      url: encodeURI(url)
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});