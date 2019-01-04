// pages/live/liveNew.js
import api from '../../api/api.js';
import request from '../../api/request.js';
import common from '../../utils/common.js';
//获取应用实例
var app = getApp();
var bk_userinfo;
var sessionid;
var uid;
var courseid;
var categoryid;
var interval = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    liveindex: 0,
    currentindex: 0,
    readyBeginIndex: 0,
    countDownTime: '00:00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    swan.setNavigationBarTitle({
      title: options.title
    });
    this.checkSystemOS();
    var liveindex = options.liveindex;
    this.setData({ liveindex: liveindex });
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }

    var sharecourseid = options.sharecourseid;
    var sharecategoryid = options.sharecategoryid;
    var sharecoursename = options.sharecoursename;
    var sharecategoryname = options.sharecategoryname;
    console.log(sharecourseid + sharecategoryid + sharecoursename + sharecategoryname);
    if (sharecourseid != undefined && sharecategoryid != undefined && sharecoursename != undefined && sharecategoryname != undefined) {
      swan.setStorageSync('courseid', sharecourseid);
      swan.setStorageSync('categoryid', sharecategoryid);
      swan.setStorageSync('coursename', sharecoursename);
      swan.setStorageSync('categoryname', sharecategoryname);
      this.getCourseByCategory(sharecategoryid);
    } else {
      this.getFormalCourse();
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
  onUnload: function () {
    this.stopcountDownHandler();
  },

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
  onShareAppMessage: function () {
    var courseName = swan.getStorageSync('coursename');
    return {
      title: this.data.formalCourse.list[this.data.liveindex].second[this.data.readyBeginIndex].title,
      desc: '帮考网直播课堂',
      path: '/pages/live/liveNew?sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid') + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname') + '&liveindex=' + this.data.liveindex
    };
  },
  swiperChange: function (e) {
    var currnet = e.detail.current;
    if (currnet == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (currnet == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  navBtnClick: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      //已完成
      this.setData({ currentindex: 0 });
    } else if (index == 1) {
      //未完成
      this.setData({ currentindex: 1 });
    }
  },
  getFormalCourse: function () {
    api.getlivelistBycourseid({
      methods: 'POST',
      data: {
        termid: '',
        uid: '',
        courseid: swan.getStorageSync('courseid')
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          if (data.list.length > 0) {
            var strDate;
            var sTime;
            var eTime;
            var readyBeginIndex = -1;
            for (var i = 0; i < data.list[this.data.liveindex].second.length; i++) {
              strDate = data.list[this.data.liveindex].second[i].date;
              strDate = new Date(strDate.replace(/-/g, '/'));
              sTime = data.list[this.data.liveindex].second[i].date + " " + data.list[this.data.liveindex].second[i].starttime;
              sTime = new Date(sTime.replace(/-/g, '/'));
              eTime = data.list[this.data.liveindex].second[i].date + " " + data.list[this.data.liveindex].second[i].endtime;
              eTime = new Date(eTime.replace(/-/g, '/'));
              // console.log(sTime);
              var myDate = new Date();
              var timestamp = Date.parse(new Date()) / 1000;
              var timestamp1 = Date.parse(sTime) / 1000;
              var timestamp2 = Date.parse(eTime) / 1000;
              data.list[this.data.liveindex].second[i].year = strDate.getFullYear();
              data.list[this.data.liveindex].second[i].month = parseInt(strDate.getMonth()) + 1 < 10 ? '0' + (parseInt(strDate.getMonth()) + 1) : parseInt(strDate.getMonth()) + 1;
              data.list[this.data.liveindex].second[i].day = parseInt(strDate.getDate()) < 10 ? '0' + strDate.getDate() : strDate.getDate();
            }
            this.setData({ formalCourse: data });
            if (readyBeginIndex == '-1') {
              for (var i = 0; i < data.list[this.data.liveindex].second.length; i++) {
                if (data.list[this.data.liveindex].second[i].state == '未开始' && readyBeginIndex == '-1') {
                  readyBeginIndex = i;
                  data.list[this.data.liveindex].second[i].state = '即将开始';
                  this.setData({ formalCourse: data });
                }
              }
            }
            readyBeginIndex = readyBeginIndex == '-1' ? '0' : readyBeginIndex;
            this.setData({ readyBeginIndex: readyBeginIndex });
            var livestate = data.list[this.data.liveindex].second[readyBeginIndex].state;
            this.setData({ livestate: livestate });
            if (livestate == '未开始' || livestate == '即将开始') {
              this.countDownHandler();
            }
          } else {
            common.hintInfo();
          }
        } else {
          if (data.errcode == 40002) {
            swan.showModal({
              title: '温馨提示',
              content: '暂无直播课程，敬请期待！',
              confirmText: "确定",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  swan.navigateBack({});
                }
              }
            });
          } else {
            swan.showToast({
              title: data.errmsg,
            icon: 'success',
            duration: 1500
            });
          }
        }
      }
    });
  },
  joinLiveNowRoom: function () {
    var channelnumber = this.data.formalCourse.list[this.data.liveindex].second[this.data.readyBeginIndex].channelnumber;
    var chatroomid = this.data.formalCourse.list[this.data.liveindex].second[this.data.readyBeginIndex].chatroomid;
    this.getvideocodebychannelnumber(26, channelnumber, chatroomid, '-1');
    // var url = 'liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid="
    //   + chatroomid;
    // wx.navigateTo({
    //   url
    // });
  },
  joinClassRoom: function (e) {
    var index = e.currentTarget.dataset.index;
    var channelnumber = this.data.formalCourse.list[this.data.liveindex].second[index].channelnumber;
    var chatroomid = this.data.formalCourse.list[this.data.liveindex].second[index].chatroomid;
    this.getvideocodebychannelnumber(26, channelnumber, chatroomid, index);
  },
  /**
  * 检查课程信息
  */
  getvideocodebychannelnumber: function (videotype, channelnumber, chatroomid, index) {
    var checkBind = this.checkUserInfo();
    if (checkBind == false) {
      return;
    }
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    api.getvideocodebychannelnumber({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        channelnumber: channelnumber,
        videosource: app.globalData.videosource,
        definition: app.globalData.definition
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          this.checkIsBuy(videotype, channelnumber, chatroomid, index);
        } else if (data.errcode == 40003) {
          //请先购买课程
          common.hintInfo();
        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          request_thirdauth(0);
        } else {
          //尚未绑定帮考网账号等错误
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "确定",
            showCancel: false,
            success: function (res) {}
          });
        }
      }
    });
  },
  checkUserInfo: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未登录帮考网，请先登录！',
        confirmText: "立即登录",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var bindurl = '../me/bind/bind';
            // var bindurl = '../me/me';
            swan.navigateTo({
              url: bindurl
            });
          } else {
            return;
          }
        }
      });
      return false;
    } else {
      return true;
    }
  },
  checkIsBuy: function (videotype, channelnumber, chatroomid, index) {
    // var checkcourseVO = wx.getStorageSync('checkcourseVO');
    var checkcourseVO = this.data.liveCheckcourseVO;
    //已经购买直接进入，未购买检测免费时长

    if (videotype == 26) {
      console.log(this.data.formalCourse.list[this.data.liveindex].second[index].state == '剪辑中');
      if (this.data.formalCourse.list[this.data.liveindex].second[index].state == '剪辑中') {
        swan.showModal({
          title: '温馨提示',
          content: '今日直播回放正在火速剪切上传中，敬请期待。',
          confirmText: "确定",
          showCancel: false,
          success: function (res) {}
        });
      } else {
        var url = 'liveRoom/liveRoom?channelnumber=' + channelnumber + "&chatroomid=" + chatroomid;
        console.log(url);
        swan.navigateTo({
          url: url
        });
      }
    }
  },
  //直播倒计时
  countDownHandler: function () {
    if (!interval) {
      interval = setInterval(() => {
        var timestamp4 = Date.parse(new Date()) / 1000;
        var time1 = this.data.formalCourse.list[this.data.liveindex].second[this.data.readyBeginIndex].date + " " + this.data.formalCourse.list[this.data.liveindex].second[this.data.readyBeginIndex].starttime;
        var timestamp5 = Date.parse(new Date(time1.replace(/-/g, '/'))) / 1000;
        var time2 = this.data.formalCourse.list[this.data.liveindex].second[this.data.readyBeginIndex].date + " " + this.data.formalCourse.list[this.data.liveindex].second[this.data.readyBeginIndex].endtime;
        var timestamp6 = Date.parse(new Date(time2.replace(/-/g, '/'))) / 1000;
        if (timestamp5 - timestamp4 <= 0) {
          this.setData({ livestate: '直播中' });
          // this.parseTime(timestamp5 - timestamp4);
          this.getFormalCourse();
        } else if (timestamp6 - timestamp4 <= 0) {
          this.setData({ livestate: '已结束' });
          this.stopcountDownHandler();
          this.getFormalCourse();
        } else {
          this.parseTime(timestamp5 - timestamp4);
        }
      }, 1000);
    }
  },
  stopcountDownHandler: function () {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  },
  parseTime: function (time) {
    var dd = parseInt(time / 60 / 60 / 24);
    var hh = parseInt(time / 60 / 60 % 24);
    var mm = parseInt(time / 60 % 60);
    var ss = parseInt(time % 60);

    this.setData({
      'liveDay': `${dd}`
    });
    this.setData({
      'liveHover': `${hh}`
    });
    this.setData({
      'liveMinute': `${mm}`
    });
    this.setData({
      'liveSecond': `${ss}`
    });
  },
  /**
    * 字符串转换为时间
    * @param  {String} src 字符串
    */
  strToDate: function (dateObj) {
    dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/');
    dateObj = dateObj.slice(0, dateObj.indexOf("."));
    return new Date(dateObj);
  },
  checkSystemOS: function () {
    var that = this;
    swan.getSystemInfo({
      success: function (res) {
        that.setData({ "mobileOS": res.platform });
      }
    });
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
          for (var i = 0; i < courselist.length; i++) {
            courselist[i].title = decodeURI(courselist[i].title);
            courselist[i].shorttitle = decodeURI(courselist[i].shorttitle);
          }
          var courselist = JSON.stringify(courselist);
          swan.setStorageSync('bk_courselist', courselist);
          if (courselist != undefined && courselist.length > 0) {
            swan.setStorageSync('centerBtnClickIndex', 0);
            swan.setStorageSync('courseid', data.courselist[0].id);
            swan.setStorageSync('coursename', data.courselist[0].title);
            this.getFormalCourse();
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