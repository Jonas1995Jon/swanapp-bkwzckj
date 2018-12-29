// pages/course/buyCourse/buyCourseDetail/buyCourseDetail.js
import api from '../../../../api/api.js';
import common from '../../../../utils/common.js';
import md5 from '../../../../utils/md5.js';
var WxParse = require('../../../../utils/wxParse/wxParse.js');
var interval;
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '购买课程'
    },
    hiddenMasking: true,
    choiceCourseHidden: true,
    choiceBanxingHidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.hideShareMenu();
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
      this.getdefaultcommodity(sharecategoryid);
    } else {
      var categoryid = swan.getStorageSync('categoryid');
      // var commodityid = options.commodityid;
      // this.commoditydetail(commodityid);
      this.getdefaultcommodity(categoryid);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

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
  onShareAppMessage: function () {
    // console.log('sharecourseid=' + wx.getStorageSync('courseid') + '&sharecategoryid=' + wx.getStorageSync('categoryid'));
    var courseName = swan.getStorageSync('coursename');
    return {
      title: swan.getStorageSync('categoryname') + '-' + swan.getStorageSync('coursename'),
      desc: '课程详情',
      path: '/pages/course/buyCourse/buyCourseDetail/buyCourseDetail?sharecourseid=' + swan.getStorageSync('courseid') + '&sharecategoryid=' + swan.getStorageSync('categoryid') + '&sharecoursename=' + swan.getStorageSync('coursename') + '&sharecategoryname=' + swan.getStorageSync('categoryname')
    };
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  },
  //获取默认商品ID
  getdefaultcommodity: function (categoryid) {
    api.getdefaultcommodity({
      methods: 'POST',
      data: {
        categoryid: categoryid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.commoditydetail(data.commodityid);
        } else {
          if (data.errcode == "40002") {
            swan.showModal({
              title: '温馨提示',
              content: data.errmsg,
              showCancel: false,
              success: function (res) {
                swan.navigateBack({});
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
  //商品详情列表
  commoditydetail: function (commodityid) {
    api.commoditydetail({
      methods: 'POST',
      data: {
        id: commodityid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        // console.log(data)
        if (data.errcode == 0) {
          var title;
          var classTypeTitle;
          var coursecontentArr = [];
          coursecontentArr = data.coursecontent.split("&lt;/br&gt;");
          data.coursecontentArr = coursecontentArr;
          for (var i = 0; i < data.courselist.length; i++) {
            title = data.courselist[i].title;
            for (var j = 0; j < data.courselist[i].banxinglist.length; j++) {
              data.courselist[i].banxinglist[j].price = parseFloat(data.courselist[i].banxinglist[j].price).toFixed(2);
              // if (data.courselist[i].banxinglist[j].title == "基础班") {
              //   data.courselist[i].banxinglist[j].price = 198;
              // } else if (data.courselist[i].banxinglist[j].title == "取证班") {
              //   data.courselist[i].banxinglist[j].price = 588;
              // } else if (data.courselist[i].banxinglist[j].title == "取证无忧班") {
              //   data.courselist[i].banxinglist[j].price = 998;
              // } else if (data.courselist[i].banxinglist[j].title == "私教班") {
              //   data.courselist[i].banxinglist[j].price = 1998;
              // }
              if (commodityid == data.courselist[i].banxinglist[j].id) {
                classTypeTitle = title + data.courselist[i].banxinglist[j].title;
                data.classTitle = title;
                data.typeTitle = data.courselist[i].banxinglist[j].title;
                data.classTypeTitle = classTypeTitle;
              }
            }
          }
          WxParse.wxParse('wap_coursedetail', 'html', data.wap_coursedetail, this, 5);
          WxParse.wxParse('faq', 'html', data.faq, this, 5);
          WxParse.wxParse('coursedetail', 'html', data.coursedetail, this, 5);
          WxParse.wxParse('agreement', 'html', data.agreement, this, 5);
          var courselistTemp = data.courselist;
          if (courselistTemp[0].selected == 1 && courselistTemp[0].courseid == -1) {
            for (var i = 0; i < courselistTemp.length; i++) {
              courselistTemp[i].selected = 1;
              if (i == 0) {
                for (var j = 0; j < courselistTemp[0].banxinglist.length; j++) {
                  if (data.title == courselistTemp[0].banxinglist[j].title) {
                    data.banxing = j;
                  }
                }
              }
              courselistTemp[i].banxinglist[data.banxing].selected = 1;
            }
            this.setData({ courselist: courselistTemp });
          } else {
            this.setData({ courselist: data.courselist });
          }
          this.setData({ selectedCourseid: data.courseid });
          this.setData({ commoditydetail: data });
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
  buyImmediatelyTap: function () {
    this.checkIsBindding();
  },
  //拨打电话
  calling: function () {
    swan.makePhoneCall({
      phoneNumber: '4006601360', //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！");
      },
      fail: function () {
        console.log("拨打电话失败！");
      }
    });
  },
  hideMasking() {
    this.setData({
      hiddenMasking: true,
      choiceCourseHidden: true,
      choiceBanxingHidden: true
    });
  },
  courseActionSheetTap: function () {
    this.setData({
      choiceCourseHidden: !this.data.choiceCourseHidden,
      hiddenMasking: false
    });
  },
  banxingActionSheetTap: function () {
    this.setData({
      choiceBanxingHidden: !this.data.choiceBanxingHidden,
      hiddenMasking: false
    });
  },
  actionSheetbindchange1: function () {
    this.setData({ courselist: this.data.commoditydetail.courselist });
    this.setData({
      choiceCourseHidden: !this.data.choiceCourseHidden
    });
  },
  actionSheetbindchange2: function () {
    this.setData({ courselist: this.data.commoditydetail.courselist });
    this.setData({
      choiceBanxingHidden: !this.data.choiceBanxingHidden
    });
  },
  courseChoiceTap: function (event) {
    var index = event.currentTarget.dataset.index;
    var courseid = event.currentTarget.dataset.courseid;
    for (var i = 0; i < this.data.courselist.length; i++) {
      for (var j = 0; j < this.data.courselist[i].banxinglist.length; j++) {
        if (this.data.courselist[i].banxinglist[j].selected == 1) {
          this.data.commoditydetail.banxing = j;
        }
      }
    }
    if (courseid == -1) {
      if (this.data.courselist[0].selected == 0) {
        this.data.courselist[0].selected = 1;
        for (var i = this.data.courselist.length - 1; i > 0; i--) {
          this.data.courselist[i].selected = 1;
          this.data.courselist[i].banxinglist[this.data.commoditydetail.banxing].selected = 1;
        }
      } else {
        this.data.courselist[0].selected = 0;
        for (var i = this.data.courselist.length - 1; i > 0; i--) {
          this.data.courselist[i].selected = 0;
          this.data.courselist[i].banxinglist[this.data.commoditydetail.banxing].selected = 0;
        }
      }
    } else {
      if (this.data.courselist[index].selected == 0) {
        this.data.courselist[index].selected = 1;
        this.data.courselist[index].banxinglist[this.data.commoditydetail.banxing].selected = 1;
      } else {
        this.data.courselist[index].selected = 0;
        this.data.courselist[index].banxinglist[this.data.commoditydetail.banxing].selected = 0;
      }
      var selectedCount = 0;
      var courselistlength = this.data.courselist.length;
      for (var i = this.data.courselist.length - 1; i > 0; i--) {
        if (this.data.courselist[0].courseid == -1) {
          courselistlength = this.data.courselist.length - 1;
          if (this.data.courselist[i].selected == 0) {
            this.data.courselist[0].selected = 0;
            this.data.courselist[0].banxinglist[this.data.commoditydetail.banxing].selected = 0;
          } else {
            selectedCount++;
          }
        }
      }
      if (selectedCount == courselistlength) {
        this.data.courselist[0].selected = 1;
        this.data.courselist[0].banxinglist[this.data.commoditydetail.banxing].selected = 1;
      }
    }
    this.setData({ courselist: this.data.courselist });
  },
  sureChoiceTap: function (event) {
    this.data.commoditydetail.courselist = this.data.courselist;
    console.log(this.data.courselist);
    this.setData({ commoditydetail: this.data.commoditydetail });
    this.setData({
      choiceCourseHidden: !this.data.choiceCourseHidden,
      hiddenMasking: true
    });
    var commodityid = "";
    var totalprice = 0;
    var courselistSelected = [];
    for (var i = 0; i < this.data.courselist.length; i++) {
      if (this.data.courselist[i].selected == 1) {
        courselistSelected.push(this.data.courselist[i]);
      }
    }
    if (courselistSelected.length > 0) {
      if (courselistSelected.length == 1 || courselistSelected[0].courseid == -1 && courselistSelected[0].selected == 1) {
        commodityid = courselistSelected[0].banxinglist[this.data.commoditydetail.banxing].id;
        // console.log(commodityid);
        this.commoditydetail(commodityid);
        this.setData({ selectedCourseid: courselistSelected[0].courseid });
      } else {
        for (var i = 0; i < courselistSelected.length; i++) {
          for (var j = 0; j < courselistSelected[i].banxinglist.length; j++) {
            if (courselistSelected[i].banxinglist[j].selected == 1 && courselistSelected[i].selected == 1) {
              this.setData({ selectedCourseid: courselistSelected[i].courseid });
              totalprice = parseFloat(totalprice) + parseFloat(courselistSelected[i].banxinglist[j].price);
              if (i == 0 || i == courselistSelected.length) {
                commodityid = commodityid + courselistSelected[i].banxinglist[j].id;
              } else {
                commodityid = commodityid + "|" + courselistSelected[i].banxinglist[j].id;
              }
            }
          }
        }
        // console.log(totalprice);
        this.data.commoditydetail.price = totalprice;
        this.data.commoditydetail.costprice = totalprice;
        // console.log(commodityid);
        this.data.commoditydetail.id = commodityid;
        this.setData({ commoditydetail: this.data.commoditydetail });
      }
    } else {
      courselistSelected.push(this.data.courselist[0]);
      commodityid = courselistSelected[0].banxinglist[this.data.commoditydetail.banxing].id;
      this.commoditydetail(commodityid);
      this.setData({ selectedCourseid: courselistSelected[0].courseid });
    }
  },
  banxingChoiceTap: function (event) {
    var courseIndex = event.currentTarget.dataset.courseindex;
    var banxingIndex = event.currentTarget.dataset.banxingindex;
    var id = event.currentTarget.dataset.id;

    for (var i = 0; i < this.data.courselist.length; i++) {
      if (this.data.courselist[0].courseid == -1) {
        for (var j = 0; j < this.data.courselist[i].banxinglist.length; j++) {
          if (j == banxingIndex) {
            this.data.courselist[i].banxinglist[j].selected = 1;
          } else {
            this.data.courselist[i].banxinglist[j].selected = 0;
          }
        }
      } else {
        for (var j = 0; j < this.data.courselist[i].banxinglist.length; j++) {
          this.data.courselist[i].banxinglist[j].selected = 0;
        }
      }
      // if (this.data.courselist[i].id == this.data.selectedCourseid) {
      //   courselistSelected.push(this.data.courselist[i]);
      //   this.data.courselist[courseIndex].banxinglist[banxingIndex].selected = 1;
      // }else{


      // }
    }
    this.data.courselist[courseIndex].banxinglist[banxingIndex].selected = 1;
    this.setData({ courseIndex: courseIndex });
    this.setData({ banxingIndex: banxingIndex });
    this.setData({ courselist: this.data.courselist });
  },
  sureChoiceBanxingTap: function () {
    this.setData({
      choiceBanxingHidden: !this.data.choiceBanxingHidden,
      hiddenMasking: true
    });
    if (this.data.banxingIndex == undefined || this.data.banxingIndex == '') {
      this.setData({
        banxingIndex: 0
      });
    }
    if (this.data.courselist[0].selected == 1) {
      console.log(this.data.courselist[0].banxinglist);
      var commodityid = this.data.courselist[0].banxinglist[this.data.banxingIndex].id;
      // console.log(commodityid);
      this.commoditydetail(commodityid);
      return;
    }
    this.data.commoditydetail.courselist = this.data.courselist;
    this.setData({ commoditydetail: this.data.commoditydetail });

    var commodityid = "";
    var totalprice = 0;
    var courselistSelected = [];
    for (var i = 0; i < this.data.courselist.length; i++) {
      if (this.data.courselist[i].selected == 1) {
        courselistSelected.push(this.data.courselist[i]);
      }
    }

    for (var i = 0; i < courselistSelected.length; i++) {
      for (var j = 0; j < courselistSelected[i].banxinglist.length; j++) {
        if (courselistSelected[i].banxinglist[j].selected == 1 && courselistSelected[i].selected == 1 && courselistSelected[i].courseid != -1) {
          this.setData({ selectedCourseid: courselistSelected[i].courseid });
          totalprice = parseFloat(totalprice) + parseFloat(courselistSelected[i].banxinglist[j].price);
          if (courselistSelected[0].courseid == -1) {
            if (i == 1 || i == courselistSelected.length) {
              commodityid = commodityid + courselistSelected[i].banxinglist[j].id;
            } else {
              commodityid = commodityid + "|" + courselistSelected[i].banxinglist[j].id;
            }
          } else {
            if (i == 0 || i == courselistSelected.length) {
              commodityid = commodityid + courselistSelected[i].banxinglist[j].id;
            } else {
              commodityid = commodityid + "|" + courselistSelected[i].banxinglist[j].id;
            }
          }
        }
      }
    }
    // console.log(totalprice);
    if (this.data.courseIndex != undefined) {
      this.data.commoditydetail.typeTitle = this.data.courselist[this.data.courseIndex].banxinglist[this.data.banxingIndex].title;
    }
    this.data.commoditydetail.price = totalprice;
    this.data.commoditydetail.costprice = totalprice;
    console.log(commodityid);
    this.data.commoditydetail.id = commodityid;
    this.setData({ commoditydetail: this.data.commoditydetail });
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
  },
  checkIsBindding: function (url) {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未登录帮考网，请先登录！',
        confirmText: "立即登录",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../../../me/bind/bind';
            swan.navigateTo({
              url: url
            });
          } else {
            return;
          }
        }
      });
    } else {
      var commodityid = this.data.commoditydetail.id;
      var categoryid = this.data.commoditydetail.categoryid;
      var banxin = this.data.commoditydetail.banxin;
      var price = this.data.commoditydetail.price;
      var classTitle = this.data.commoditydetail.classTitle;
      var courseid = this.data.commoditydetail.courseid;
      var xueshi = this.data.commoditydetail.xueshi;

      var courselistItem = this.data.courselistItem;
      var productsList = this.data.productsList;
      var coursePackage = {
        coursename: classTitle,
        courseid: courseid,
        categoryid: categoryid,
        coursetype: banxin,
        price: price,
        studytime: xueshi
      };
      console.log(this.data);
      //'&coursePackage=' + JSON.stringify(coursePackage)
      var url = '../buyCourse?commodityid=' + commodityid + '&classType=' + classTitle + '&price=' + price + '&courselist=' + JSON.stringify(this.data.courselist);
      swan.navigateTo({
        url: url
      });
    }
  }
});