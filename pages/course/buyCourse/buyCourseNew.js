// pages/course/buyCourse/buyCourseNew.js
import api from '../../../api/api.js';
import common from '../../../utils/common.js';
import md5 from '../../../utils/md5.js';
var interval;
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
      centerBtnTitle: '购买课程'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var categoryid = swan.getStorageSync("categoryid");
    this.commoditylist(categoryid);
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
  //商品列表
  commoditylist: function (categoryid) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;

    api.commoditylist({
      methods: 'POST',
      data: {
        categoryid: categoryid,
        searchmodule: '',
        pagesize: 100,
        pageindex: 1,
        bigclass: ''
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          for (var i = 0; i < data.list.length; i++) {
            data.list[i].priceStr = "¥" + parseInt(data.list[i].price);
          }
          this.setData({ commoditylist: data.list });
          if (data.list.length > 0) {
            var listItem;
            var courseNameArr = [];
            for (var i = 0; i < data.list.length; i++) {
              if (courseNameArr.length < 1) {
                courseNameArr.push(data.list[i].coursename);
              } else {
                var courseNameIsExistence = 0;
                for (var j = 0; j < courseNameArr.length; j++) {
                  if (courseNameArr[j] == data.list[i].coursename) {
                    courseNameIsExistence = 1;
                  }
                }
                if (courseNameIsExistence == 0) {
                  courseNameArr.push(data.list[i].coursename);
                }
              }
            }
            this.setData({ courseNameArr: courseNameArr });
          } else {
            common.showToast({
              title: '此课程暂未开放购买'
            });
            return;
          }
        } else {
          common.showToast({
            title: data.errmsg
          });
        }
      }
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  buycourseTap: function (event) {
    var id = event.currentTarget.dataset.id;
    swan.navigateTo({
      url: 'buyCourseDetail/buyCourseDetail?commodityid=' + id
    });
  }
});