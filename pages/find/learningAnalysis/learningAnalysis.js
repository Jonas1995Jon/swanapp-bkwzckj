import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var Charts = require('../../../utils/wxcharts-min.js');
var app = getApp();
var lineChart = null;
var lineChart2 = null;

var bk_userinfo;
var sessionid;
var uid;
var courseid;
var coursename;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '学习分析'
    },
    arc_lData: {},
    arc_rData: {},
    correct_rate: 0, //正确率
    cicleStr: '',
    cicleSymbol: '',
    avgscore: '',
    paiming: '',
    stats: '',
    tabindex: 0,
    clientHeight: 0,
    // switchTabArr: ['能力值', '掌握情况', '答题量', '正确率'],
    switchTabArr: ['视频学习时间', '掌握情况', '答题量', '正确率'],
    lineCanvasArr: [],
    leftTipHidden: true,
    rightTipHidden: true,
    leftTipStr: '',
    rightTipStr: '',
    coursename: ''
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
    coursename = swan.getStorageSync('coursename');
    this.setData({ coursename: coursename });
    this.mystats();
    /*获取屏幕宽度赋给cavas*/
    let windowWidth = '';
    let windowHeight = '';
    try {
      let res = swan.getSystemInfoSync();
      windowWidth = res.windowWidth;
      windowHeight = res.windowHeight;
      this.setData({ clientWidth: windowWidth });
      this.setData({ clientHeight: windowHeight });
    } catch (e) {
      // do something when get system info failed
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
  // //swiper滑动
  // handleChange: function (e) {
  //   var current = e.detail.current;
  //   this.setData({ tabindex: current });
  // },
  leftTipClick: function (event) {
    this.setData({ rightTipHidden: true });
    var str;
    var tabindex = this.data.tabindex;
    str = '全站平均' + this.data.switchTabArr[tabindex];
    this.setData({ leftTipStr: str });
    this.setData({ leftTipHidden: false });
    setTimeout(() => {
      this.setData({ leftTipHidden: true });
    }, 1000);
  },
  rightTipClick: function (event) {
    this.setData({ leftTipHidden: true });
    var str;
    var tabindex = this.data.tabindex;
    str = '全站' + this.data.switchTabArr[tabindex] + '排行';
    this.setData({ rightTipStr: str });
    this.setData({ rightTipHidden: false });
    setTimeout(() => {
      this.setData({ rightTipHidden: true });
    }, 1000);
  },
  // tab点击事件
  switchTabClick: function (event) {
    var index = event.currentTarget.dataset.index;

    switch (index) {
      case 0:
        var score = parseInt(this.data.analysis.stats.score / this.data.analysis.stats.avgscore);
        if (score > 100) {
          score = 100;
        }
        this.setData({ correct_rate: score }); //默认能力值，tab切换后变化
        this.setData({ cicleStr: this.data.analysis.stats.score }); //默认能力值，tab切换后变化
        this.setData({ cicleSymbol: '分' }); //默认能力值，tab切换后变化
        this.setData({ avgscore: this.data.analysis.stats.avgscore + '分' });
        this.setData({ paiming: this.data.analysis.stats.paiming });
        break;
      case 1:
        // var answertimes = answertimes / avgtimes;
        this.setData({ correct_rate: this.data.analysis.master.score }); //默认能力值，tab切换后变化
        this.setData({ cicleStr: this.data.analysis.master.score }); //默认能力值，tab切换后变化
        this.setData({ cicleSymbol: '%' }); //默认能力值，tab切换后变化
        this.setData({ avgscore: this.data.analysis.master.avgscore + '%' });
        this.setData({ paiming: this.data.analysis.master.paiming });
        break;
      case 2:
        var answertimes = parseInt(this.data.analysis.answer.answertimes / this.data.analysis.answer.avgtimes);
        if (answertimes > 100) {
          answertimes = 100;
        }
        this.setData({ correct_rate: answertimes }); //默认能力值，tab切换后变化
        this.setData({ cicleStr: this.data.analysis.answer.answertimes }); //默认能力值，tab切换后变化
        this.setData({ cicleSymbol: '道' }); //默认能力值，tab切换后变化
        this.setData({ avgscore: this.data.analysis.answer.avgtimes + '道' });
        this.setData({ paiming: this.data.analysis.answer.paiming });
        break;
      case 3:
        this.setData({ correct_rate: this.data.analysis.accuracy.accuracy }); //默认能力值，tab切换后变化
        this.setData({ cicleStr: this.data.analysis.accuracy.accuracy }); //默认能力值，tab切换后变化
        this.setData({ cicleSymbol: '%' }); //默认能力值，tab切换后变化
        this.setData({ avgscore: this.data.analysis.accuracy.avgaccuracy + '%' });
        this.setData({ paiming: this.data.analysis.accuracy.paiming });
        break;
      default:
        break;
    }

    for (var i = 0; i < this.data.lineCanvasArr.length; i++) {
      if (index == i) {
        this.data.lineCanvasArr[i].canvasHidden = false;
      } else {
        this.data.lineCanvasArr[i].canvasHidden = true;
      }
    }
    this.setData({ lineCanvasArr: this.data.lineCanvasArr });
    this.setData({ tabindex: index });
    this.drawCicle();
  },
  mystats: function (paperid, unitid, learnType, free) {
    var endtimeStamp = Date.parse(new Date());
    endtimeStamp = endtimeStamp / 1000;

    var begintimeStamp = endtimeStamp - 24 * 30 * 60 * 60;
    var begintime = common.numberFormatTime(begintimeStamp, 'Y-M-D h:m:s');
    var begintimeArr = begintime.split(" ");
    begintime = begintimeArr[0] + ' 00:00:01';

    var endtime = common.numberFormatTime(endtimeStamp, 'Y-M-D h:m:s');

    api.mystats({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        from: app.globalData.from,
        begintime: begintime,
        endtime: endtime
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ analysis: data });
          this.setData({ stats: data.stats });
          this.setData({ correct_rate: data.stats.score }); //默认能力值，tab切换后变化
          this.setData({ cicleStr: data.stats.score }); //默认能力值，tab切换后变化
          this.setData({ cicleSymbol: '分' }); //默认能力值，tab切换后变化
          this.setData({ avgscore: data.stats.avgscore + '分' });
          this.setData({ paiming: data.stats.paiming });
          this.drawCicle();

          // 组装图表数据
          this.makeChartsData(data.stats.trend, 'lineCanvas', 0);
          this.makeChartsData(data.answer.trend, 'lineCanvas1', 1);
          this.makeChartsData(data.accuracy.trend, 'lineCanvas2', 2);
          this.makeChartsData(data.master.trend, 'lineCanvas3', 3);

          var data;
          for (var i = 0; i < 4; i++) {
            if (i == 0) {
              data = {
                id: 'lineCanvas',
                canvasHidden: false
              };
            } else {
              data = {
                id: 'lineCanvas' + i,
                canvasHidden: true
              };
            }
            this.data.lineCanvasArr.push(data);
          }

          // this.data.lineCanvasIdArr.push('lineCanvas', 'lineCanvas1', 'lineCanvas2', 'lineCanvas3');
          this.setData({ lineCanvasArr: this.data.lineCanvasArr });
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
  makeChartsData: function (trend, chartsId, switchTabIndex) {
    var trendCategories = [];
    var trendsData = [];
    var ptArr = [];
    var time;
    var trendCopy = [];
    if (trend.length > 8) {
      trendCopy.push(trend[0]);
      trendCopy.push(trend[parseInt(trend.length / 2 / 2 / 2)]);
      trendCopy.push(trend[parseInt(trend.length / 2 / 2)]);
      trendCopy.push(trend[parseInt(trend.length / 2)]);
      trendCopy.push(trend[parseInt(trend.length / 2 + trend.length / 2 / 2)]);
      trendCopy.push(trend[parseInt(trend.length / 2 + trend.length / 2 / 2 + trend.length / 2 / 2 / 2)]);
      trendCopy.push(trend[parseInt(trend.length - 1)]);
    } else {
      trendCopy = trend;
    }
    for (var i = 0; i < trendCopy.length; i++) {
      ptArr = trendCopy[i].pt.split("-");
      time = ptArr[1] + "/" + ptArr[2];
      trendCategories.push(time);
      if (switchTabIndex == 0 || switchTabIndex == 3) {
        trendsData.push(trendCopy[i].score);
      } else if (switchTabIndex == 1) {
        trendsData.push(trendCopy[i].times);
      } else if (switchTabIndex == 2) {
        trendsData.push(trendCopy[i].accuracy);
      }
      this.drawCharts(chartsId, trendCategories, this.data.switchTabArr[switchTabIndex], trendsData, this.data.clientWidth, this.data.clientHeight / 3 - 10);
    }
  },
  drawCharts: function (canvasId, categories, name, data, windowWidth, windowHeight) {
    var lineChart = new Charts({
      canvasId: canvasId,
      type: 'line',
      animation: false,
      categories: categories,
      series: [{
        name: name,
        data: data,
        format: function (val) {
          return val;
        },
        color: '#008cfb'
      }],
      yAxis: {
        title: '',
        format: function (val) {
          return val;
        },
        min: 0
      },
      width: windowWidth,
      height: windowHeight,
      dataLabel: false
    });
  },
  drawCicle: function () {
    var correct_rate = this.data.correct_rate;
    var arc_l_rotate = -135 + 3.6 * correct_rate;
    var arc_r_rotate = -135 + 3.6 * (correct_rate - 50);
    var animation1 = swan.createAnimation({
      transformOrigin: "50% 50%",
      duration: 600,
      timingFunction: "linear",
      delay: 0
    });
    if (correct_rate <= 50) {
      setTimeout(function () {
        animation1.rotate(arc_l_rotate).step();
        this.setData({
          arc_lData: animation1.export()
        });
      }.bind(this), 500);
    } else {
      setTimeout(function () {
        animation1.rotate(45).step();
        this.setData({
          arc_lData: animation1.export()
        });
      }.bind(this), 500);
      var animation2 = swan.createAnimation({
        transformOrigin: "50% 50%",
        duration: 600,
        timingFunction: "linear",
        delay: 600
      });
      setTimeout(function () {
        animation2.rotate(arc_r_rotate).step();
        this.setData({
          arc_rData: animation2.export()
        });
      }.bind(this), 500);
    }
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});