// find.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      centerBtn: 0,
      centerBtnTitle: '学习'
    },
    common: [{
      icon: '../../image/find/find_error.png',
      title: '错题回顾'
    }, {
      icon: '../../image/find/find_analysis.png',
      title: '学情分析'
    }, {
      icon: '../../image/find/find_record.png',
      title: '学习记录'
    }, {
      icon: '../../image/find/find_brush.png',
      title: '模拟测试'
    }, {
      icon: '../../image/find/find_predict.png',
      title: '考前押题'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

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
  //通用cell点击事件
  commonClick: function (event) {
    console.log(event);
    var index = event.currentTarget.dataset.hi;
    console.log(index);
    switch (index) {
      case 0:
        //错题回顾
        var url = 'unitExam/unitExam?learnType=' + getApp().globalData.learnType[4][0].type + '&name=' + getApp().globalData.learnType[4][1].name;
        this.checkIsBindding(url);
        break;
      case 1:
        var url = 'learningAnalysis/learningAnalysis';
        this.checkIsBindding(url);
        break;
      case 2:
        var url = 'learningRecord/learningRecord';
        this.checkIsBindding(url);
        break;
      case 3:
        this.checkIsBuy(5);
        break;
      case 4:
        this.checkIsBuy(6);
        break;
      default:
        break;

    }
  },
  checkIsBindding: function (url) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未绑定帮考网账号，请先绑定！',
        confirmText: "立即绑定",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../me/bind/bind';
            swan.navigateTo({
              url: url
            });
          } else {
            return;
          }
        }
      });
    } else {
      swan.navigateTo({
        url: url
      });
    }
  },
  checkIsBuy: function (type) {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    var learnType;
    if (checkcourseVO.m5 == 1 || checkcourseVO.m6 == 1) {
      if (type == 5) {
        //模拟测试
        swan.navigateTo({
          url: 'unitExam/unitExam?learnType=' + getApp().globalData.learnType[2][0].type + '&name=' + getApp().globalData.learnType[2][1].name
        });
      }

      if (type == 6) {
        //考前押题
        swan.navigateTo({
          url: 'unitExam/unitExam?learnType=' + getApp().globalData.learnType[3][0].type + '&name=' + getApp().globalData.learnType[3][1].name
        });
      }
    } else {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未购买此课程，请先购买！',
        confirmText: "立即购买",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../course/buyCourse/buyCourseDetail/buyCourseDetail';
            swan.navigateTo({
              url: url
            });
          } else {
            return;
          }
        }
      });
    }
  }
});