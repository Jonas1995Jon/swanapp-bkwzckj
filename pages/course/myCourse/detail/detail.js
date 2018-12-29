// pages/course/myCourse/detail/detail.js
import request from '../../../../api/request.js';
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
    mycourseItem: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var mycourseItem = JSON.parse(decodeURI(options.mycourseItem));
    this.setData({ mycourseItem: mycourseItem });
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
  learnBtnClick: function (event) {

    var categoryid = event.currentTarget.dataset.categoryid;
    var courseid = event.currentTarget.dataset.courseid;
    var coursename = event.currentTarget.dataset.coursename;
    swan.setStorageSync('courseid', courseid);
    swan.setStorageSync('coursename', coursename);
    this.setData({ categoryid: categoryid });
    this.setData({ courseid: courseid });
    this.getCourseByCategory(categoryid);
    this.checkcourse(courseid);
    // this.getCourseByCategory();
    // var url = '../../../index/index';
    // wx.navigateTo({
    //   url: url
    // })
  },
  //先获取courseid再检查课程页面信息
  checkcourse: function (courseid) {
    var url = '../../../learn/brushNum/brushNum';
    request.request_checkcourse(url);
  },
  //获取考试类别
  getCourseByCategory: function () {
    var courselist = swan.getStorageSync('bk_courselist', courselist);;
    for (var i = 0; i < courselist.length; i++) {
      courselist[i].title = this.data.mycourseItem.coursename;
    }
    this.setData({ courselist: courselist });
    var courselist = JSON.stringify(courselist);
    swan.setStorageSync('bk_courselist', courselist);
    api.getCourseByCategory({
      methods: 'POST',
      data: {
        categoryid: this.data.mycourseItem.masterid //id不对暂未使用
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var courselist = data.courselist;
          var smallclass;
          for (var i = 0; i < courselist.length; i++) {
            courselist[i].title = decodeURI(courselist[i].title);
          }
          this.setData({ courselist: courselist });
          var courselist = JSON.stringify(courselist);
          swan.setStorageSync('bk_courselist', courselist);
          swan.setStorageSync('categoryname', coursename);
        }
        //  else {
        //   swan.showToast({
        //     title: data.errmsg
        //   });
        // }
      }
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  //获取考试类别
  getCourseByCategory: function (id) {
    api.getCourseByCategory({
      methods: 'POST',
      data: {
        categoryid: id
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var courselist = data.courselist;
          var smallclass;
          var navIndex = 0;
          var bigclass = swan.getStorageSync('bk_bigclass');
          if (bigclass.length > 0) {
            var smallclass;
            for (var i = 0; i < bigclass.length; i++) {
              smallclass = bigclass[i].smallclass;
              for (var j = 0; j < smallclass.length; j++) {
                // console.log(smallclass[j].id);
                if (smallclass[j].id == this.data.categoryid) {
                  swan.setStorageSync('categoryname', smallclass[j].title);
                }
              }
            }
          }
          for (var i = 0; i < courselist.length; i++) {
            courselist[i].title = decodeURI(courselist[i].title);
            courselist[i].shorttitle = decodeURI(courselist[i].shorttitle);
            // console.log(courselist[i].id + '/' + this.data.courseid);
            if (courselist[i].id == this.data.courseid) {
              swan.setStorageSync('centerBtnClickIndex', 0);
              swan.setStorageSync('courseid', data.courselist[0].id);
              swan.setStorageSync('coursename', data.courselist[0].title);
              navIndex = i;
            }
          }
          var courselist = JSON.stringify(courselist);
          swan.setStorageSync('bk_courselist', courselist);
          if (courselist != undefined && courselist.length > 0) {
            swan.setStorageSync('navIndex', navIndex);
          } else {
            var url = '../me/me';
            swan.switchTab({
              url: url
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
  }
});