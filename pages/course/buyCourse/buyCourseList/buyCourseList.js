// pages/course/buyCourse/buyCourseList/buyCourseList.js
import common from '../../../../utils/common.js';
import api from '../../../../api/api.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '购买课程'
    },
    courselist: {},
    titleMsg: '请选择你要购买的课程'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
    this.setData({ courselist: courselist });
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
  courseListClick: function (event) {
    var index = event.currentTarget.dataset.hi;
    var courselistItem = this.data.courselist[index];
    this.commoditylist(courselistItem);
  },
  //获取考试类别
  commoditylist: function (courselistItem) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = bk_userinfo.sessionid;
    var uid = bk_userinfo.uid;

    api.commoditylist({
      methods: 'POST',
      data: {
        courseid: courselistItem.id,
        categoryid: courselistItem.categoryid,
        searchmodule: '',
        pagesize: 10,
        pageindex: 1,
        bigclass: ''
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          if (data.list.length > 0) {
            var products = JSON.stringify(data);
            var url = '../productsList/productsList?products=' + products + '&courselistItem=' + JSON.stringify(courselistItem);
            swan.navigateTo({
              url: url
            });
          } else {
            swan.showModal({
              title: '提示',
              content: '此课程暂未开放购买',
              showCancel: false
            });
            return;
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
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});