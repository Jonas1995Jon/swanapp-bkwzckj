// changeSubject.js
import api from '../../../api/api.js';
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
      centerBtnTitle: '切换科目'
    },
    smallclassItem: {},
    courselist: {},
    flag: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.smallclassItem);
    var flag = options.flag;
    if (flag == "addquestion") {
      this.setData({ flag: flag });
    }
    var smallclassItem = JSON.parse(options.smallclassItem);
    this.setData({ smallclassItem: smallclassItem });
    this.getCourseByCategory();
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
  jump_choice_examination: function (event) {
    swan.navigateBack(); //返回上一个页面
  },
  jump_choice_subject: function (event) {
    var index = event.currentTarget.dataset.hi;
    var courselistItem = this.data.courselist[index];
    // console.log('courselistItem=' + courselistItem);
    swan.setStorageSync('courseid', courselistItem.id);
    swan.setStorageSync('coursename', courselistItem.title);
    if (this.data.flag == "addquestion") {
      swan.navigateBack();
    } else {
      var url = '../../me/me';
      swan.switchTab({
        url: url
      });
    }
  },
  //获取考试类别
  getCourseByCategory: function (event) {
    var that = this;
    api.getCourseByCategory({
      methods: 'POST',
      data: {
        categoryid: that.data.smallclassItem.id
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var courselist = data.courselist;
          console.log(courselist);
          var smallclass;
          for (var i = 0; i < courselist.length; i++) {
            courselist[i].title = decodeURI(courselist[i].title);
          }
          this.setData({ courselist: courselist });
          var courselist = JSON.stringify(courselist);
          swan.setStorageSync('bk_courselist', courselist);
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