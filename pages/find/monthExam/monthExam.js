// pages/find/monthExam/monthExam.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var app = getApp();

var bk_userinfo;
var sessionid;
var uid;
var courseid;
var categoryid;

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
    //console.log(2222+bk_userinfo);
    if (bk_userinfo != null && bk_userinfo != '' && bk_userinfo.length > 0) {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }

    courseid = options.courseid;
    categoryid = options.categoryid;
    var sharecoursename = options.sharecoursename;
    var sharecategoryname = options.sharecategoryname;
    console.log(11111111 + courseid + "///" + categoryid + options.learnType);
    if (categoryid != undefined && courseid != undefined && sharecoursename != undefined && sharecategoryname != undefined) {
      swan.setStorageSync('categoryid', categoryid);
      swan.setStorageSync('courseid', courseid);
      swan.setStorageSync('coursename', sharecoursename);
      swan.setStorageSync('categoryname', sharecategoryname);
      this.getCourseByCategory(categoryid);
    } else {
      categoryid = swan.getStorageSync('categoryid');
      courseid = swan.getStorageSync('courseid');
    }

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
    // this.setData({
    //   navigation: {
    //     leftBtn: 1,
    //     leftBtnImg: '../../../image/navigation/back.png',
    //     centerBtn: 0,
    //     centerBtnTitle: name,
    //   }
    // });
    // wx.setNavigationBarTitle({
    //   title: name,
    // });
    this.getpaperlist(learnType);
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
  onShareAppMessage: function () {
    console.log('/pages/find/monthExam/monthExam?courseid=' + courseid + '&categoryid=' + swan.getStorageSync('categoryid') + '&learnType=' + this.data.learnType);
    var courseName = swan.getStorageSync('coursename');
    return {
      title: '月度考试',
      desc: this.data.unitList[0].title,
      path: '/pages/find/monthExam/monthExam?courseid=' + swan.getStorageSync('courseid') + '&categoryid=' + swan.getStorageSync('categoryid') + '&learnType=' + this.data.learnType + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname')
    };
  },
  getpaperlist: function (learnType) {
    api.getpaperlist({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: learnType,
        ip: '',
        from: app.globalData.from
      },
      success: res => {
        var data = res.data;
        console.log(courseid);
        console.log(learnType);
        console.log(res.data);
        if (data.errcode == 0) {
          if (data.list.length > 0) {
            for (var j = 0; j < data.list.length; j++) {
              data.list[j].title = decodeURI(data.list[j].title.replace("+", " "));
              data.list[j].starttime = this.formatTime(this.strToDate(data.list[j].starttime.replace(/-/g, '/')));
              data.list[j].endtime = this.formatTime(this.strToDate(data.list[j].endtime.replace(/-/g, '/')));
            }
            this.setData({ unitList: data.list });
          } else {
            bk_userinfo = swan.getStorageSync('bk_userinfo');
            if (bk_userinfo.length < 1) {
              var str = '你尚未绑定帮考网账号，请至个人中心绑定后再次尝试';
              swan.showModal({
                title: '温馨提示',
                content: str,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    var url = '../../me/me';
                    swan.switchTab({
                      url: url
                    });
                  }
                }
              });
            } else {
              var str = '此课程暂未开放月度考试';
              swan.showModal({
                title: '温馨提示',
                content: str,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    // var pages = getCurrentPages()
                    // var num = pages.length
                    // wx.navigateBack({
                    //   delta: num
                    // })
                  }
                }
              });
            }
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
  },
  unitListClick: function (event) {
    var index = event.currentTarget.dataset.hi;
    var unitList = this.data.unitList;
    var paperid = unitList[index].paperid;
    var title = '月度考试';
    var data = {
      courseid: swan.getStorageSync('courseid'),
      paperid: paperid,
      learnType: this.data.learnType,
      from: 1,
      title: title,
      unitid: 0
    };
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    if (unitList[index].state == 3) {
      var url = '../../course/paper/report/report?paperid=' + paperid + '&unitid=' + this.data.unitid + '&learnType=' + this.data.learnType;
      swan.redirectTo({
        url: url
      });
    } else {
      if (checkcourseVO.m31 == 1) {
        this.getpaperdetail(data);
        // this.checksupplement(data);
      } else {
        this.getpaperdetail(data);
      }
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

  /**
   * 时间格式化
   */
  formatTime: function (date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    return month + '月' + day + '日' + hour + ':' + minute;
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
  /**
  * 【新版】下载试卷
  */
  getpaperdetail: function (data) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var courseid = data.courseid;
    var unitid = data.unitid;
    var quecount = data.quecount;
    if (quecount == undefined) {
      quecount = getApp().globalData.questionnumber;
    }
    var learnType = data.learnType;
    var fromType = data.from; //0首页 1学习记录、unitExam
    var paperid = data.paperid; //0首页 1学习记录、unitExam
    var paperTitle = data.title;
    api.getpaperdetail({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: learnType,
        paperid: paperid
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          var question = JSON.stringify(data);
          var url;
          if (fromType == 0) {
            url = '../course/paper/studyPage/studyPage?unitid=' + unitid + '&paperid=' + paperid + '&question=' + question + '&learnType=' + learnType + '&history=0' + '&paperTitle=' + paperTitle;
          } else if (fromType == 1) {
            url = '../../course/paper/studyPage/studyPage?unitid=' + unitid + '&paperid=' + paperid + '&question=' + question + '&learnType=' + learnType + '&history=0' + '&paperTitle=' + paperTitle;
          }

          swan.navigateTo({
            url: encodeURI(url)
          });
        } else if (data.errcode == 40002) {
          //您的免费学习资格已用完，快快购买正式课程吧！
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            showCancel: false,
            cancelText: "确定",
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
        } else if (data.errcode == 40036) {
          //请先购买课程
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        } else {
          //尚未绑定帮考网账号等错误
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
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
            this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
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