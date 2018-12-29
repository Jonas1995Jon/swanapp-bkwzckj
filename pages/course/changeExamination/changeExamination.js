// changeExamination.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '切换考试'
    },
    titleMsg: '请选择你要切换的考试',
    smallclass: {},
    statusType: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var smallclass = JSON.parse(swan.getStorageSync('bk_smallclass'));
    // var smallclass = JSON.parse(options.smallclass);
    this.setData({ smallclass: smallclass });
    console.log(smallclass.length);
    var statusType = options.statusType;
    if (statusType != undefined) {
      swan.setNavigationBarTitle({
        title: '购买课程'
      });
      this.setData({ titleMsg: '请选择你要购买的课程' });
      this.setData({ statusType: 1 });
    }
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

  jump_choice_subject: function (event) {
    var index = event.currentTarget.dataset.hi;
    var smallclass = this.data.smallclass[index];
    swan.setStorageSync('categoryid', smallclass.id);
    var smallclassItem = JSON.stringify(smallclass);
    //选择考试跳转
    if (this.data.statusType == 0) {
      var url = '../changeSubject/changeSubject?smallclassItem=' + smallclassItem;
      console.log('url=' + url);
      swan.navigateTo({
        url: url
      });
    } else {
      var url = '../buyCourse/buyCourse?smallclassItem=' + smallclassItem;
      console.log('url=' + url);
      swan.navigateTo({
        url: url
      });
    }
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});