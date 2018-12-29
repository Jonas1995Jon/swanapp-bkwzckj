//index.js
import api from '../../api/api.js';
import request from '../../api/request.js';
import common from '../../utils/common.js';
//获取应用实例
var app = getApp();
var checkcourseVO = swan.getStorageSync('checkcourseVO');
var learnType;
if (checkcourseVO.m31 == 1) {
  learnType = getApp().globalData.learnType[13][0].type; //智能刷题
} else {
  learnType = getApp().globalData.learnType[13][0].type; //免费试用（9）
}
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
      leftBtn: 0,
      leftBtnImg: '../../image/navigation/back.png',
      leftBtnTitle: '分类',
      centerBtn: 1,
      centerBtnUpImg: '../../image/navigation/up.png',
      centerBtnDownImg: '../../image/navigation/down.png',
      centerBtnTitle: '智能刷题',
      centerBtnClick: 0
      // rightBtn: 0,
      // rightBtnImg: '../../image/navigation/back.png',
      // rightBtnTitle: '选择',
      // viewTitleList: ["证券", "基金"]
    },
    switchClassCategory: 0,
    unitlist: {},
    bananaList: {},
    bananaIcon: {},
    index: '', //以下三个都是继续学习传过来的参数
    unitid: '',
    isLearnContinue: '',
    paperTitle: '',
    refresh: 'false',
    isSignAgreement: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // wx.hideShareMenu();
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;

    this.getCourseByCategory(app.globalData.categoryid);
    var courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
    for (var i = 0; i < courselist.length; i++) {
      if (app.globalData.courseid == courselist[i].id) {
        swan.setNavigationBarTitle({
          title: courselist[i].title
        });
      }
    }

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
      courseid = swan.getStorageSync('courseid');
      this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
    }
    // this.getUnitList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //切换课程两种情况1、从我的课程进入2、从选择分类进入
    if (this.data.switchClassCategory == 1) {
      this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
    } else {
      //解决切换考试数据刷新问题
      var courseidSNC = swan.getStorageSync('courseid');
      console.log(courseid + "////" + courseidSNC);
      var courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
      for (var i = 0; i < courselist.length; i++) {
        if (courseid == courselist[i].id) {
          swan.setNavigationBarTitle({
            title: courselist[i].title
          });
        }
      }
      if (courseid != courseidSNC && courseid != undefined) {
        courseid = courseidSNC;
        if (courseid.length > 0) {
          // var categoryid = wx.getStorageSync('categoryid');
          this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
        }
      }
    }
    // var categoryid = wx.getStorageSync('categoryid');
    // this.getCourseByCategory(categoryid);

    //点击继续学习后续操作
    var isLearnContinue = this.data.isLearnContinue;
    if (isLearnContinue != '') {
      this.setData({ isLearnContinue: '' });
      var index = this.data.index;
      var unitid = this.data.unitid;
      var paperTitle = this.data.paperTitle;
      var data = {
        courseid: courseid,
        unitid: unitid,
        from: 0,
        learnType: learnType,
        title: paperTitle
      };
      request.request_loadnewpaper(data);
    }
    //是否签署协议或者跳过签署协议
    if (this.data.isSignAgreement == true) {}
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
  onShareAppMessage: function () {
    console.log('sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid'));
    var courseName = swan.getStorageSync('coursename');
    return {
      title: swan.getStorageSync('categoryname') + '-' + swan.getStorageSync('coursename'),
      desc: '帮考网刷题中心',
      path: '/pages/index/index?sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid') + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname')
    };
  },

  //获取opened 
  getUnitList: function () {
    if (courseid == '' || courseid == null) {
      swan.redirectTo({
        url: '../learn/classCategory/classCategory'
      });
      return;
    }
    var firstLoginTime = swan.getStorageSync('firstLoginTime');
    var newDate = new Date();
    if (firstLoginTime == '' || firstLoginTime == null) {
      firstLoginTime = common.formatTime(newDate);
    }
    api.getUnitList({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        ip: '',
        from: 'xiaochengxu',
        begintime: firstLoginTime,
        endtime: common.formatTime(newDate)
      },
      success: res => {
        var data = res.data;
        swan.hideToast();
        if (data.errcode == 0) {
          var data = res.data;
          this.setData({ unitlist: data.unitlist });
          var bananaList = [];
          var bananaIcon = [];
          var goldbanana = {
            icon: 1
          };
          var graybanana = {
            icon: 0
          };
          for (var i = 0; i < data.unitlist.length; i++) {
            bananaIcon = []; //清空数组
            var accuracy = parseInt(data.unitlist[i].accuracy / 20);
            switch (accuracy) {
              case 0:
                for (var j = 0; j < 5; j++) {
                  bananaIcon.push(graybanana);
                }
                break;
              case 1:
                bananaIcon.push(goldbanana);
                for (var j = 0; j < 4; j++) {
                  bananaIcon.push(graybanana);
                }
                break;
              case 2:
                bananaIcon.push(goldbanana);
                bananaIcon.push(goldbanana);
                for (var j = 0; j < 3; j++) {
                  bananaIcon.push(graybanana);
                }
                break;
              case 3:
                for (var j = 0; j < 3; j++) {
                  bananaIcon.push(goldbanana);
                }
                bananaIcon.push(graybanana);
                bananaIcon.push(graybanana);
                break;
              case 4:
                for (var j = 0; j < 4; j++) {
                  bananaIcon.push(goldbanana);
                }
                bananaIcon.push(graybanana);
                break;
              case 5:
                for (var j = 0; j < 5; j++) {
                  bananaIcon.push(goldbanana);
                }
                break;
              default:
                for (var j = 0; j < 5; j++) {
                  bananaIcon.push(graybanana);
                }
                break;
            }
            // this.setData({ bananaIcon: bananaIcon });
            // bananaList.push(bananaIcon);
            this.data.unitlist[i].bananaList = bananaIcon;
          }

          for (var i = 0; i < this.data.unitlist.length; i++) {
            var iconlength = 0;
            for (var j = 0; j < this.data.unitlist[i].bananaList.length; j++) {
              if (this.data.unitlist[i].bananaList[j].icon == 1) {
                iconlength++;
              }
            }
            this.data.unitlist[i].iconlength = iconlength;
          }
          this.setData({ unitlist: this.data.unitlist });
        } else if (data.errcode == 40052) {
          request.request_thirdauth(0);
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
  load_newpaper: function (event) {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    var index = event.currentTarget.dataset.hi;
    var unitid = this.data.unitlist[index].unitid;
    var title = this.data.unitlist[index].title;
    if (checkcourseVO.m31 == 1) {
      this.getLastPaper(unitid, title);
      // this.checksupplement(index, unitid, title);
    } else {
      this.getLastPaper(unitid, title);
    }
  },

  jump_paper: function () {
    var url = '../course/paper/studyPage/studyPage';
    //console.log('url=' + url);
    swan.navigateTo({
      url: url
    });
  },
  getLastPaper: function (unitid, title) {
    var learnType;
    var free;
    var paperTitle = title;
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    if (checkcourseVO.m31 == 1) {
      learnType = getApp().globalData.learnType[13][0].type; //智能刷题
      free = 0;
    } else {
      learnType = getApp().globalData.learnType[13][0].type; //免费试用（9）
      free = 1;
    }
    api.getLastPaper({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        unitid: unitid,
        type: learnType,
        free: free
      },
      success: res => {
        var data = res.data;
        swan.hideToast();
        if (data.errcode == 0) {
          var data = res.data;
          if (parseInt(data.paperid) == 0) {
            var data = {
              courseid: courseid,
              unitid: unitid,
              learnType: learnType,
              title: paperTitle,
              from: 0
            };
            request.request_loadnewpaper(data);
          } else {
            var paperid = data.paperid;
            var that = this;
            swan.showModal({
              title: '温馨提示',
              content: '是否导入最近一次的学习记录！',
              confirmText: "确定",
              cancelText: "取消",
              success: function (res) {
                if (res.confirm) {
                  // 确认导入历史学习记录
                  that.request_loadinitbylid(paperid, unitid, learnType, free);
                } else {
                  // 取消直接请求加载试卷
                  var data = {
                    courseid: courseid,
                    unitid: unitid,
                    learnType: learnType,
                    title: paperTitle,
                    from: 0
                  };
                  request.request_loadnewpaper(data);
                }
              }
            });
          }
        } else if (data.errcode == 40052) {
          request.request_thirdauth(0);
        } else {
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {}
            }
          });
          // swan.showToast({
          //   title: data.errmsg
          // });
        }
      }
    });
  },
  /**
  * 获取学习历史试卷_v2
  */
  request_loadinitbylid: function (paperid, unitid, learnType, free) {
    api.loadinitbylid({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        paperid: paperid,
        videosource: app.globalData.videosource,
        free: free
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          var question = JSON.stringify(data);
          // question = question.replace('%','');
          var url = '../course/paper/studyPage/studyPage?unitid=' + unitid + '&paperid=' + data.paperid + '&question=' + question + '&learnType=' + learnType + '&history=1' + '&paperTitle=' + data.unitname;
          url = url.replace(/%/g, '%25');
          swan.navigateTo({
            url: encodeURI(url)
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
  /** 
  * 补签协议-查询是否可以补签协议
  */
  checksupplement: function (index, unitid, title) {
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
          var url = '../agreement/agreement?agreementList=' + JSON.stringify(data);
          url = url.replace(/%/g, '%25');
          swan.navigateTo({
            url: encodeURI(url)
          });
        } else {
          this.getLastPaper(unitid, title);
        }
      },
      //这个接口请求iOS真机上会报错，待解决官网解释是服务器返回不是utf8编码问题
      fail: res => {
        var url = '../agreement/agreement?agreementList=' + JSON.stringify(data);
        url = url.replace(/%/g, '%25');
        swan.navigateTo({
          url: encodeURI(url)
        });
        console.log(res);
        this.getLastPaper(unitid, title);
      }
    });
  },
  leftBtnClick: function () {
    var url = '../learn/classCategory/classCategory';
    swan.navigateTo({
      url: url
    });
  },
  centerBtnClick: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == 0) {
      index = 1;
    } else {
      index = 0;
    }
    this.setData({ centerBtnIndex: index });
    var centerBtnClickIndex = swan.getStorageSync('centerBtnClickIndex');
    if (centerBtnClickIndex == undefined) {
      centerBtnClickIndex = 0;
    }
    this.setData({
      navigation: {
        leftBtn: 0,
        // leftBtnImg: '../../image/navigation/back.png',
        leftBtnTitle: '分类',
        centerBtn: 1,
        centerBtnUpImg: '../../image/navigation/up.png',
        centerBtnDownImg: '../../image/navigation/down.png',
        centerBtnTitle: this.data.navigation.viewTitleList[centerBtnClickIndex],
        centerBtnClick: index,
        viewTitleList: this.data.navigation.viewTitleList
        // rightBtn: 0,
        // rightBtnImg: '../../image/navigation/back.png',
        // rightBtnTitle: '',
      }
    });
  },
  downviewClick: function (event) {
    var centerBtnIndex = this.data.navigation.centerBtnIndex;
    if (centerBtnIndex == 0) {
      centerBtnIndex = 1;
    } else {
      centerBtnIndex = 0;
    }

    var index = event.currentTarget.dataset.index;

    this.setData({
      navigation: {
        leftBtn: 0,
        // leftBtnImg: '../../image/navigation/back.png',
        leftBtnTitle: '分类',
        centerBtn: 1,
        centerBtnUpImg: '../../image/navigation/up.png',
        centerBtnDownImg: '../../image/navigation/down.png',
        centerBtnTitle: this.data.navigation.viewTitleList[index],
        centerBtnClick: centerBtnIndex,
        viewTitleList: this.data.navigation.viewTitleList
        // rightBtn: 0,
        // rightBtnImg: '../../image/navigation/back.png',
        // rightBtnTitle: '',
      }
    });
    swan.setStorageSync('centerBtnClickIndex', index);
    swan.setStorageSync('courseid', this.data.courselist[index].id);
    console.log(courseid);
    this.getUnitList();
    this.setData({ refresh: false });
  },
  /**
  * 选择分类后相关设置
  */
  setSwitchClassCategory: function (index) {
    var courselist = JSON.parse(swan.getStorageSync('bk_courselist'));
    index = index > courselist.length ? 0 : index;
    this.setData({ courselist: courselist });
    if (courselist != undefined && courselist.length > 0) {
      var sectionArr = [];
      for (var i = 0; i < courselist.length; i++) {
        sectionArr.push({ name: courselist[i].shorttitle, id: courselist[i].id });
      }
      var courseid = courselist[index].id;
      this.setData({
        nav: {
          section: sectionArr,
          currentId: courseid.length > 0 ? courseid : courselist[0].id,
          backgroundColor: 0,
          scrollLeft: index >= 4 ? 78 * index : 0
        }
      });
      this.getUnitList();
      this.setData({ refresh: false });
    }
  },
  handleTap: function (event) {
    var index = event.currentTarget.dataset.index;
    if (index == swan.getStorageSync('navIndex')) {
      return;
    }
    var that = this;
    courseid = this.data.courselist[index].id;
    swan.setStorageSync('navIndex', index);
    swan.setStorageSync('courseid', this.data.courselist[index].id);
    swan.setStorageSync('coursename', this.data.courselist[index].title);
    request.request_checkcourse();
    that.setSwitchClassCategory(index);
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