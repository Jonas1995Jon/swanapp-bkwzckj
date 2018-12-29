// pages/nav/nav.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: {
      section: [{ name: '精选', id: '1001' }, { name: '黄金单身汉', id: '1032' }, { name: '综艺', id: '1003' }, { name: '电视剧', id: '1004' }, { name: '电影', id: '1005' }, { name: '少儿', id: '1021' }],
      currentIndx: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    /** 
     * 获取系统信息 
     */
    swan.getSystemInfo({

      success: function (res) {
        that.setData({
          nav: {
            winWidth: res.windowWidth,
            winHeight: res.windowHeight,
            currentTab: 0
          }
        });
      }

    });
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
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    that.setData({
      nav: {
        winWidth: res.windowWidth,
        winHeight: res.windowHeight,
        currentTab: e.detail.current
      }
    });
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.nav.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        nav: {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          currentTab: e.target.dataset.current
        }
      });
    }
  }
});