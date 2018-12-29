// pages/me/answerQuestions/addQuestion.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';

//获取应用实例
var app = getApp();
var bk_userinfo;
var sessionid;
var uid;
var categoryid;
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
      centerBtnTitle: '提问'
    },
    tempFilePaths: '',
    courseid: '',
    coursename: '',
    textareaStr: '',
    imgUrlArr: [],
    hiddenSubmit: 1
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
    this.setData({ sessionid, sessionid });
    this.setData({ uid, uid });
    var orderid = options.orderid;
    this.setData({ orderid, orderid });
    categoryid = swan.getStorageSync('categoryid');
    courseid = swan.getStorageSync('courseid');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var courseid = swan.getStorageSync('courseid');
    var coursename = swan.getStorageSync('coursename');
    this.setData({ courseid: courseid });
    this.setData({ coursename: coursename });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
  bindFormSubmit: function (e) {
    var textarea = e.detail.value.textarea;
    if (textarea.length < 1 || textarea == undefined) {
      swan.showModal({
        title: '提示',
        content: '请输入您的问题描述',
        showCancel: false
      });
    } else {
      swan.showToast({
        title: '问题提交中',
        icon: 'success',
        duration: 1500
      });
      this.setData({ hiddenSubmit: 1 });
      this.setData({ textareaStr: textarea });
      if (this.data.orderid == undefined || this.data.orderid == "") {
        if (this.data.tempFilePaths.length > 0) {
          for (var i = 0; i < this.data.tempFilePaths.length; i++) {
            this.uploadfiletooss(i);
          }
        } else {
          this.addQuestion();
        }
      } else {
        if (this.data.tempFilePaths.length > 0) {
          for (var i = 0; i < this.data.tempFilePaths.length; i++) {
            this.uploadfiletooss(i);
          }
        } else {
          this.webaddConversation();
        }
      }
    }
  },
  mycourseTap: function () {
    var categoryid = swan.getStorageSync('categoryid');
    var smallclass = JSON.parse(swan.getStorageSync('bk_smallclass'));
    var smallclassItem = {};
    for (var i = 0; i < smallclass.length; i++) {
      if (categoryid == smallclass[i].id) {
        smallclassItem = smallclass[i];
      }
    }
    smallclassItem = JSON.stringify(smallclassItem);
    //选择考试跳转
    var url = '../../course/changeSubject/changeSubject?smallclassItem=' + smallclassItem + '&flag=addquestion';
    swan.navigateTo({
      url: url
    });
  },
  //有问必答_新建工单
  addQuestion: function () {
    var categoryid = swan.getStorageSync('categoryid');
    var courseid = swan.getStorageSync('courseid');
    var textareaStr = this.data.textareaStr;
    var title = textareaStr.substring(0, 20);
    var problem_attachment = '';
    for (var i = 0; i < this.data.imgUrlArr.length; i++) {
      if (i == this.data.imgUrlArr.length - 1) {
        problem_attachment += this.data.imgUrlArr[i];
      } else {
        problem_attachment += this.data.imgUrlArr[i] + "|";
      }
    }
    api.addQuestion({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        categoryid: categoryid,
        courseid: courseid,
        content: this.data.textareaStr,
        title: title,
        problem_attachment: '',
        iswechat: 0
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          // var delta = (this.data.prevPage == 2 ? 2 : 1);
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            questionSuccess: 1
          });
          swan.navigateBack({
            delta: 1
          });
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
  //有问必答_回复对话
  webaddConversation: function () {
    var reply_attachment = '';
    for (var i = 0; i < this.data.imgUrlArr.length; i++) {
      if (i == this.data.imgUrlArr.length - 1) {
        reply_attachment += this.data.imgUrlArr[i];
      } else {
        reply_attachment += this.data.imgUrlArr[i] + "|";
      }
    }
    api.addConversation({
      methods: 'POST',
      data: {
        sessionid: this.data.sessionid,
        uid: this.data.uid,
        orderid: this.data.orderid,
        content: this.data.textareaStr,
        reply_attachment: reply_attachment
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          // var delta = (this.data.prevPage == 2 ? 2 : 1);
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            questionContinue: 1
          });
          swan.navigateBack({
            delta: 1
          });
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
  //上传文件
  uploadfiletooss: function (tempFileIndex) {
    var that = this;
    swan.uploadFile({
      url: 'https://api3.cnbkw.com/appad/uploadfiletooss',
      filePath: that.data.tempFilePaths[tempFileIndex], //图片路径，如tempFilePaths[0]
      name: 'image',
      header: {
        "Content-Type": "multipart/form-data"
      },
      formData: {
        // userId: 12345678 //附加信息为用户ID
      },
      success: function (res) {
        var data = res.data;
        if (data) {
          console.log(1111 + res.data);
          that.data.imgUrlArr.push(res.data);
          that.setData({ imgUrlArr: that.data.imgUrlArr });
          if (tempFileIndex == that.data.tempFilePaths.length - 1) {
            if (that.data.orderid == undefined || that.data.orderid == "") {
              that.addQuestion();
            } else {
              that.webaddConversation();
            }
          }
        }
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) { }
    });
  },
  chooseImageTap: function () {
    var that = this;
    var imgArr = this.data.tempFilePaths;
    if (imgArr.length >= 7) {
      swan.showModal({
        title: '温馨提示',
        content: '上传图片数量最多支持7张',
        confirmText: "确定",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            return;
          } else {
            return;
          }
        }
      });
    } else {
      swan.showActionSheet({
        itemList: ['从相册中选择', '拍照'],
        itemColor: "#f7982a",
        success: function (res) {
          if (!res.cancel) {
            if (res.tapIndex == 0) {
              that.chooseWxImage('album');
            } else if (res.tapIndex == 1) {
              that.chooseWxImage('camera');
            }
          }
        }
      });
    }
  },
  chooseWxImage: function (type) {
    var that = this;
    swan.chooseImage({
      count: 7, // 默认7
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function (res) {
        var imgArr = that.data.tempFilePaths;
        if (imgArr.length > 0) {
          if (res.tempFilePaths.length > 0) {
            for (var i = 0; i < res.tempFilePaths.length; i++) {
              imgArr.push(res.tempFilePaths[i]);
            }
          } else {
            imgArr.push(res.tempFilePaths);
          }
          that.setData({
            tempFilePaths: imgArr
          });
        } else {
          that.setData({
            tempFilePaths: res.tempFilePaths
          });
          // var base64url = that.getBase64Image(res.tempFilePaths);
          // console.log(base64url);
        }
      }
    });
  },
  delImageTap: function (event) {
    var index = event.currentTarget.dataset.index;
    var imgArr = this.data.tempFilePaths;
    imgArr.splice(index, 1);
    this.setData({
      tempFilePaths: imgArr
    });
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});