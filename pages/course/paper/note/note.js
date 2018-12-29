// pages/course/paper/note/note.js
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
      centerBtnTitle: '笔记'
    },
    params: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = decodeURI(options.data); //decodeURI模拟器报错，真机可以，去掉则相反
    data = JSON.parse(data);
    this.setData({ params: data });
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
  bindNoteFormSubmit: function (e) {
    var content = e.detail.value.textarea;
    var params = this.data.params;
    api.savenotes({
      methods: 'POST',
      data: {
        sessionid: params.sessionid,
        uid: params.uid,
        courseid: params.courseid,
        unitid: params.unitid,
        qid: params.qid,
        content: content,
        type: params.learnType
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          swan.showModal({
            title: '温馨提示',
            content: '笔记添加成功',
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var pages = getCurrentPages();
                var prevPage = pages[pages.length - 2]; //上一个页面

                //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
                prevPage.setData({
                  notecontent: content
                });
                swan.navigateBack(); //返回上一个页面
              }
            }
          });
        }
      }
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }

});