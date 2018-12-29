// pages/find/unitExam/unitExam.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var app = getApp();

var bk_userinfo;
var sessionid;
var uid;
var courseid;

Page({
  /** 
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '帮考直播课堂'
    },
    learnType: 0,
    unitList: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');

    var learnType = options.learnType;
    var name = options.name;
    this.setData({ learnType: learnType });
    this.setData({ coursename: swan.getStorageSync('coursename') });
    // wx.setNavigationBarTitle({
    //   title: name,
    // });
    this.setData({
      navigation: {
        leftBtn: 1,
        leftBtnImg: '../../../image/navigation/back.png',
        centerBtn: 0,
        centerBtnTitle: name
      } });
    swan.setNavigationBarTitle({
      title: name
    });
    this.getUnit(learnType);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');
  },

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
  getUnit: function (learnType) {
    api.getUnit({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: learnType,
        from: app.globalData.from,
        videosource: app.globalData.videosource,
        definition: app.globalData.definition
      },
      success: res => {
        var data = res.data;
        console.log(learnType);
        console.log(data);
        if (data.errcode == 0) {
          if (data.val.length > 0) {
            for (var j = 0; j < data.val.length; j++) {
              data.val[j].title = decodeURI(data.val[j].title.replace("+", " "));
            }
            this.setData({ unitList: data.val });
          } else {
            var str;
            console.log(learnType);
            if (learnType == 7) {
              str = '地球上没有找到您的错题！';
            } else if (learnType == 5) {
              str = '此课程暂无模拟测试！';
            } else if (learnType == 6) {
              str = '此课程暂无考前押题！';
            } else if (learnType == 12) {
              str = '此课程暂无收藏！';
            } else if (learnType == 13) {
              str = '此课程暂无笔记！';
            } else {
              str = '暂未获取到相关信息';
            }
            swan.showModal({
              title: '温馨提示',
              content: str,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  var pages = getCurrentPages();
                  var num = pages.length;
                  swan.navigateBack({
                    delta: num
                  });
                }
              }
            });
          }
        } else {
          common.showToast({
            title: data.errmsg
          });
        }
      }
    });
  },
  unitListClick: function (event) {
    var index = event.currentTarget.dataset.hi;
    var unitList = this.data.unitList;
    var unitid = unitList[index].unitid;
    var title = unitList[index].title;
    var quecount = unitList[index].quecount;
    var data = {
      courseid: swan.getStorageSync('courseid'),
      unitid: unitid,
      learnType: this.data.learnType,
      quecount: quecount, //数据量大了性能跟不上
      from: 1,
      title: title
    };
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    if (checkcourseVO.m31 == 1) {
      request.request_loadnewpaper(data);
      // this.checksupplement(data);
    } else {
      request.request_loadnewpaper(data);
    }
  },
  /** 
  * 补签协议-查询是否可以补签协议
  */
  checksupplement: function (paperdata) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var courseid = swan.getStorageSync('courseid');

    api.checksupplement({
      methods: 'POST',
      data: {
        courseid: courseid,
        sessionid: sessionid,
        uid: uid,
        coursetype: app.globalData.learnType[13][0].type
      },
      success: res => {
        var data = res.data;
        //不做任何处理
        if (data.errcode == 0) {
          var url = '../../agreement/agreement?agreementList=' + JSON.stringify(data);
          swan.navigateTo({
            url: url
          });
        } else {
          request.request_loadnewpaper(paperdata);
        }
      },
      //这个接口请求iOS真机上会报错，待解决官网解释是服务器返回不是utf8编码问题
      fail: res => {
        request.request_loadnewpaper(paperdata);
      }
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});