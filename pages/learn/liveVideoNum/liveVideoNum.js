// pages/learn/liveVideoNum.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var app = getApp();

var bk_userinfo;
var sessionid;
var uid;
var courseid;
var recordArr = [{
  id: '36',
  icon: '../../image/learn/record/introductory_learn.png',
  title: '入门导学',
  show: true
}, {
  id: '',
  icon: '../../image/learn/record/textbook_refinement.png',
  title: '国家教材精讲',
  show: true
}, {
  id: '23',
  icon: '../../image/learn/record/fine_exercises.png',
  title: '习题精讲',
  show: true
}, {
  id: '18',
  icon: '../../image/learn/record/exam_crosstalk.png',
  title: '考前串讲',
  show: true
}];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videolist: [{
      img: '../../../image/home/rmdx.png',
      title: '入门导学',
      videonum: 1
    }, {
      img: '../../../image/home/gjjj.png',
      title: '国家教材精讲',
      videonum: 100
    }, {
      img: '../../../image/home/ykdp.png',
      title: '月考点评',
      videonum: 1
    }, {
      img: '../../../image/home/ztjj.png',
      title: '真题讲解',
      videonum: 100
    }, {
      img: '../../../image/home/zhibo.png',
      title: '2017年直播课程',
      videonum: 100
    }]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    swan.setNavigationBarTitle({
      title: "视频"
    });
    this.getvideomodulelistbycid();
    this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
    request.request_checkcourse();
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
      // console.log(courseid + "////" + courseidSNC);
      if (courseid != courseidSNC && courseid != undefined) {
        courseid = courseidSNC;
        if (courseid.length > 0) {
          var categoryid = swan.getStorageSync('categoryid');
          this.setSwitchClassCategory(swan.getStorageSync('navIndex') > 0 ? swan.getStorageSync('navIndex') : 0);
        }
      }
    }
    //修改考期后重新请求检查课程信息
    if (this.data.refresh == 1) {
      request.request_checkcourse();
    }
    if (this.data.videomodulelist != undefined) {
      // this.getformalcourseterm();
    }
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
  recordClick: function (event) {
    var index = event.currentTarget.dataset.index;
    var id = event.currentTarget.dataset.id;
    console.log(index, id);
    console.log(this.data.livevideo);
    for (var i = 0; i < this.data.livevideo.length; i++) {
      if (id == this.data.livevideo[i].id) {
        id = '26';
      }
    }
    // if (!(id == '36' || id == '23' || id == '14' || id == '18')) {
    //   id = '26'
    // }
    this.checkIsBindding(index, parseInt(id));
  },
  checkIsBindding: function (url, type) {
    //url也当作index在使用
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未登录帮考网，请先登录！',
        confirmText: "立即登录",
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
      if (type) {
        this.checkIsBuy(url, type);
      } else {
        swan.navigateTo({
          url: url
        });
      }
    }
  },
  checkIsBuy: function (index, type) {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    // console.log(checkcourseVO)
    var learnType;
    if (type) {
      if (type && checkcourseVO['m' + type] == 1) {
        if (type == 14) {
          //国家精讲
          var url = '../../video/video?back=1&cover=' + this.data.videomodulelist[index].cover;
          swan.navigateTo({
            url: url
          });
        } else if (type == 26) {
          swan.navigateTo({
            url: '../../video/videoList/videoList?learnType=' + type + '&name=' + this.data.videomodulelist[index].title + '&id=' + this.data.videomodulelist[index].module + '&cover=' + this.data.videomodulelist[index].cover
          });
        } else {
          if (this.data.videomodulelist[index].videocount > 0) {
            swan.navigateTo({
              url: '../../video/videoList/videoList?learnType=' + type + '&name=' + this.data.videomodulelist[index].title + '&id=' + this.data.videomodulelist[index].module + '&cover=' + this.data.videomodulelist[index].cover
            });
          } else {
            return;
          }
        }
      } else {
        swan.showModal({
          title: '温馨提示',
          content: '您尚未购买此课程，请先购买！',
          confirmText: "立即购买",
          cancelText: "残忍拒绝",
          success: function (res) {
            if (res.confirm) {
              var url = '../../course/buyCourse/buyCourseDetail/buyCourseDetail';
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
  },
  /**
   * 选择分类后相关设置
   */
  setSwitchClassCategory: function (index) {
    swan.setStorageSync('bk_courselist', app.globalData.bk_courselist);
    swan.setStorageSync('categoryid', app.globalData.categoryid); //已经选择
    swan.setStorageSync('categoryname', app.globalData.categoryname);
    swan.setStorageSync('courseid', app.globalData.courseid);
    swan.setStorageSync('coursename', app.globalData.coursename);

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
          backgroundColor: 1,
          scrollLeft: index >= 4 ? 78 * index : 0
        }
      });
      // this.getShuaticountLivecountVodcount();
      this.setformalcourseterm();
    }
  },
  getformalcourseterm: function () {
    var courseid = swan.getStorageSync('courseid');
    var categoryid = swan.getStorageSync('categoryid');
    if (categoryid == '' || categoryid == null) {
      swan.setStorageSync('bk_courselist', app.globalData.bk_courselist);
      if (courseid.length < 1) {
        swan.setStorageSync('categoryid', app.globalData.categoryid); //已经选择
        swan.setStorageSync('categoryname', app.globalData.categoryname);
        swan.setStorageSync('courseid', app.globalData.courseid);
        swan.setStorageSync('coursename', app.globalData.coursename);
      }
    }
    api.getformalcourseterm({
      methods: 'POST',
      data: {
        courseid: courseid,
        categoryid: categoryid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var formalCourseList = data.list;
          if (formalCourseList.length > 0) {
            this.setData({
              formalCourseList: formalCourseList
            });
            for (var i = 0; i < formalCourseList.length; i++) {
              this.getFormalCourse(formalCourseList[i].id);
            }
            var iconArrs = ['../../image/learn/record/introductory_learn.png', '../../image/learn/record/textbook_refinement.png', '../../image/learn/record/fine_exercises.png', '../../image/learn/record/exam_crosstalk.png'];

            var title = null;
            var icon = null;
            var id = null;
            var recordItem = {};
            var recordArrs = this.data.record;
            // for (var i = 0; i < formalCourseList.length; i++) {
            //   title = formalCourseList[i].title;
            //   id = formalCourseList[i].id;
            //   if (title.length < 1) {
            //     title = formalCourseList[i].subtitle;
            //   }
            //   if (i >= recordArrs.length - 4) {
            //     icon = iconArrs[i];
            //   } else {
            //     icon = iconArrs[3];
            //   }
            //   recordItem = {
            //     id: id,
            //     icon: icon,
            //     title: title,
            //     show: true,
            //   };
            //   recordArrs.push(recordItem);
            // }
            // if (recordArrs.length % 3 != 0) {
            //   var recordArrsLength = (recordArrs.length - 4) % 3 - 1;
            //   if (recordArrsLength < 1) {
            //     recordArrsLength = 1;
            //   }
            //   for (var i = 0; i < recordArrsLength; i++) {
            //     recordArrs.push({
            //       id: '',
            //       icon: '',
            //       title: '',
            //       show: true,
            //     });
            //   }
            // }
            // this.setData({ record: recordArrs });
            // console.log(this.data.record)
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
  setformalcourseterm: function () {
    var checkcourseVO = swan.getStorageSync('checkcourseVO');
    this.setData({ record: [] });
    if (checkcourseVO.m36 != 0) {
      this.data.record.push(recordArr[0]);
    }
    this.data.record.push(recordArr[1]);
    if (checkcourseVO.m23 != 0) {
      this.data.record.push(recordArr[2]);
    }
    if (checkcourseVO.m18 != 0) {
      this.data.record.push(recordArr[3]);
    }
    this.getformalcourseterm();
  },
  getvideomodulelistbycid: function () {
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid;
    var uid;
    var courseid = app.globalData.courseid;
    var that = this;
    if (bk_userinfo == '' || bk_userinfo == null) {
      swan.showModal({
        title: '温馨提示',
        content: '您尚未登录帮考网，请先登录！',
        confirmText: "立即登录",
        cancelText: "残忍拒绝",
        success: function (res) {
          if (res.confirm) {
            var url = '../../me/bind/bind';
            swan.navigateTo({
              url: url
            });
          } else {
            return;
          }
        }
      });
    } else {
      // sessionid = bk_userinfo.sessionid;
      // uid = bk_userinfo.uid;
      sessionid = app.globalData.default_sessionid;
      uid = app.globalData.default_uid;
    }
    api.getvideomodulelistbycid({
      method: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid
      },
      success: function (res) {
        if (res.data.videomodulelist != undefined) {
          var checkcourseVO = swan.getStorageSync('checkcourseVO');
          var videomodulelist = res.data.videomodulelist;
          for (var i = 0; i < videomodulelist.length; i++) {
            var module = videomodulelist[i].module;
            if (checkcourseVO['m' + module] == '0' || videomodulelist[i].videocount == 0) {
              videomodulelist[i].show = false;
            } else {
              videomodulelist[i].show = true;
            }
          }
          that.setData({
            videomodulelist: videomodulelist
          });
        }
      }
    });
  },
  getFormalCourse: function (id) {
    console.log(this.data.videomodulelist);
    var bk_userinfo = swan.getStorageSync('bk_userinfo');
    var sessionid = app.globalData.default_sessionid;
    var uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    var courseid = swan.getStorageSync('courseid');
    var that = this;
    api.getFormalCourse({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        videosource: app.globalData.videosource,
        ip: '',
        definition: app.globalData.definition,
        from: app.globalData.from,
        termid: id
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        var videoList = data.list;
        var videocount = 0;
        console.log(videoList);
        if (data.errcode == 0) {
          for (var i = 0; i < videoList.length; i++) {
            for (var j = 0; j < videoList[i].second.length; j++) {
              videocount++;
            }
          }
          if (videocount > 0) {
            for (var i = 0; i < that.data.formalCourseList.length; i++) {
              if (id == that.data.formalCourseList[i].id) {
                var cover = data.cover;
                var title = that.data.formalCourseList[i].title;
                var module = that.data.formalCourseList[i].id;
                var livevideo = { //拼装年度直播课程
                  cover: cover,
                  title: title,
                  module: module,
                  videocount: videocount,
                  show: true
                };
                that.data.videomodulelist.push(livevideo);
                that.setData({
                  videomodulelist: that.data.videomodulelist
                });
              }
            }
            that.setData({
              livevideo: that.data.formalCourseList
            });
          }
        } else {
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        }
      },
      fail: res => {
        console.log(res);
      }
    });
  },
  removeBaiFenHao: function (videoUrl) {
    //解决%问题
    var videocodeArr = common.splitToArray(videoUrl, "%");
    if (videocodeArr.length > 0) {
      var videocodeStr = "";
      for (var i = 0; i < videocodeArr.length; i++) {
        if (videocodeArr[i] != undefined) {
          if (i == videocodeArr.length - 1) {
            videocodeStr = videocodeStr + encodeURI(videocodeArr[i]);
          } else {
            videocodeStr = videocodeStr + encodeURI(videocodeArr[i]) + '%';
          }
        }
      }
      videoUrl = videocodeStr;
    } else {
      videoUrl = encodeURI(videoUrl);
    }
    videoUrl = videoUrl.replace("http://", "https://");
    return videoUrl;
  }
});