// changeCategory.js
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
      centerBtnTitle: '切换类别'
    },
    bigclass: {},
    bigsubclass: [{ title: '证券从业、银行从业、期货从业' }, { title: '经济师、会计从业' }, { title: '建造师、造价工程师' }, { title: '人力资源、心理咨询师' }, { title: '临床医师、护士、护师' }]
  },
  jump_choice_examination: function (event) {
    var index = event.currentTarget.dataset.hi;
    var smallclass = JSON.stringify(this.data.bigclass[index].smallclass);
    swan.setStorageSync('bk_smallclass', smallclass);
    var url = '../changeExamination/changeExamination?smallclass=' + smallclass;
    swan.navigateTo({
      url: url
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getExamCategory();
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

  //获取考试类别
  getExamCategory: function (event) {
    api.getExamCategory({
      methods: 'GET',
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var bigclass = data.bigclass;
          var smallclass;
          for (var i = 0; i < bigclass.length; i++) {
            bigclass[i].title = decodeURI(bigclass[i].title);
            smallclass = bigclass[i].smallclass;
            for (var j = 0; j < smallclass.length; j++) {
              smallclass[j].title = decodeURI(smallclass[j].title);
            }
          }
          this.setData({ bigclass: bigclass });
          //console.log("bigclass: " + decodeURI(data.bigclass[0].title));
          //wx.setStorageSync('wx_openid', data.openid)
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