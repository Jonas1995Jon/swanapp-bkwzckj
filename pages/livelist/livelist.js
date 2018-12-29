// pages/livelist/livelist.js
import api from '../../api/api.js';
import common from '../../utils/common.js';
//获取应用实例
var app = getApp();
var interval = null;
var courseid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigation: {
      centerBtn: 0,
      centerBtnTitle: '直播'
    },
    monthCategory: '',
    todayList: '',
    recentList: '',
    todayshow: true,
    recentshow: false,
    time: '',
    countDownTime: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    courseid = swan.getStorageSync('courseid');
    if (courseid.length < 1) {
      //解决分享出去的直播页面无courseid问题
      courseid = options.courseid;
      swan.setStorageSync('courseid', courseid); //已经选择
    }
    this.getnewlivelist();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //解决中途注销
    var courseidSNC = swan.getStorageSync('courseid');
    var bk_userinfoSnc = swan.getStorageSync('bk_userinfo');
    if (courseid != courseidSNC) {
      courseid = courseidSNC;
      if (courseid.length < 1) {
        return;
      }
      this.getnewlivelist();
    }
    this.countDownHandler();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopcountDownHandler();
  },

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
  onShareAppMessage: function () {},
  getnewlivelist: function () {
    var categoryid = swan.getStorageSync('categoryid');
    var nowDate = new Date();
    api.getnewlivelist({
      methods: 'POST',
      data: {
        categoryid: categoryid,
        livedate: this.getNowTime(true),
        type: 'month'
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var todayData = {};
          var recentData = {};
          var todayList = [];
          var recentList = [];
          var nowTime = this.getNowTime(false);
          var starttime;
          var endtime;
          var startminutes;
          var endminutes;
          console.log(data);
          //有直播数据
          if (data.livelist.length > 0) {
            for (var i = 0; i < data.livelist.length; i++) {
              //晚上
              if (data.livelist[i].night.length > 0) {
                for (var j = 0; j < data.livelist[i].night.length; j++) {
                  if (data.livelist[i].night[j].courseid.length > 0) {
                    starttime = this.strToDate(data.livelist[i].night[j].starttime.replace(/-/g, '/'));
                    endtime = this.strToDate(data.livelist[i].night[j].endtime.replace(/-/g, '/'));
                    startminutes = starttime.getMinutes(); //定义个变量保存秒数
                    endminutes = endtime.getMinutes(); //定义个变量保存秒数
                    if (startminutes < 10) {
                      startminutes = "0" + startminutes;
                    } //秒数前加个0   
                    if (endminutes < 10) {
                      endminutes = "0" + endminutes;
                    } //秒数前加个0  
                    // data.livelist[i].night[j].starttime = starttime.getHours() + ":" + startminutes;
                    // data.livelist[i].night[j].endtime = endtime.getHours() + ":" + endminutes;

                    if (nowTime == data.livelist[i].livedate && courseid == data.livelist[i].night[j].courseid) {
                      console.log(nowTime + data.livelist[i].livedate);
                      var timestamp = Date.parse(new Date());
                      timestamp = timestamp / 1000;

                      var timestamp2 = Date.parse(starttime);
                      timestamp2 = timestamp2 / 1000;

                      console.log(timestamp2 - timestamp);
                      todayData = {
                        month: starttime.getMonth(),
                        day: starttime.getDate(),
                        starttime: starttime.getHours() + ":" + startminutes,
                        endtime: endtime.getHours() + ":" + endminutes,
                        countDownTime: this.parseTime(timestamp2 - timestamp),
                        todayList: data.livelist[i].night[j]
                      };
                      todayList.push(todayData);
                    } else {
                      var timestamp = Date.parse(new Date());
                      timestamp = timestamp / 1000;
                      var timestamp2 = Date.parse(new Date(starttime));
                      timestamp2 = timestamp2 / 1000;

                      if (timestamp2 > timestamp) {
                        console.log(this.parseTime(timestamp2 - timestamp));
                        recentData = {
                          month: starttime.getMonth(),
                          day: starttime.getDate(),
                          starttime: starttime.getHours() + ":" + startminutes,
                          endtime: endtime.getHours() + ":" + endminutes,
                          countDownTime: this.parseTime(timestamp2 - timestamp),
                          recentList: data.livelist[i].night[j]
                        };
                        recentList.push(recentData);
                      }
                    }
                  }
                }
              }
              //上午
              if (data.livelist[i].am.length > 0) {
                for (var k = 0; k < data.livelist[i].am.length; k++) {
                  if (data.livelist[i].am[k].courseid.length > 0) {
                    starttime = this.strToDate(data.livelist[i].am[k].starttime.replace(/-/g, '/'));
                    endtime = this.strToDate(data.livelist[i].am[k].endtime.replace(/-/g, '/'));
                    startminutes = starttime.getMinutes(); //定义个变量保存秒数
                    endminutes = endtime.getMinutes(); //定义个变量保存秒数
                    if (startminutes < 10) {
                      startminutes = "0" + startminutes;
                    } //秒数前加个0   
                    if (endminutes < 10) {
                      endminutes = "0" + endminutes;
                    } //秒数前加个0  
                    // data.livelist[i].night[k].starttime = starttime.getHours() + ":" + startminutes;
                    // data.livelist[i].night[k].endtime = endtime.getHours() + ":" + endminutes;
                    if (nowTime == data.livelist[i].livedate && courseid == data.livelist[i].am[j].courseid) {
                      var timestamp = Date.parse(new Date());
                      timestamp = timestamp / 1000;

                      var timestamp2 = Date.parse(starttime);
                      timestamp2 = timestamp2 / 1000;

                      console.log(timestamp2 - timestamp);
                      todayData = {
                        month: starttime.getMonth(),
                        day: starttime.getDate(),
                        starttime: starttime.getHours() + ":" + startminutes,
                        endtime: endtime.getHours() + ":" + endminutes,
                        countDownTime: this.parseTime(timestamp2 - timestamp),
                        todayList: data.livelist[i].am[k]
                      };
                      todayList.push(todayData);
                    } else {
                      var timestamp = Date.parse(new Date());
                      timestamp = timestamp / 1000;
                      var timestamp2 = Date.parse(this.strToDate(starttime));
                      timestamp2 = timestamp2 / 1000;

                      if (timestamp2 > timestamp) {
                        console.log(this.parseTime(timestamp2 - timestamp));
                        recentData = {
                          month: starttime.getMonth(),
                          day: starttime.getDate(),
                          starttime: starttime.getHours() + ":" + startminutes,
                          endtime: endtime.getHours() + ":" + endminutes,
                          countDownTime: this.parseTime(timestamp2 - timestamp),
                          recentList: data.livelist[i].am[k]
                        };
                        recentList.push(recentData);
                      }
                    }
                  }
                }
              }
              //下午
              if (data.livelist[i].pm.length > 0) {
                for (var l = 0; l < data.livelist[i].pm.length; l++) {
                  if (data.livelist[i].pm[l].courseid.length > 0) {
                    starttime = this.strToDate(data.livelist[i].pm[l].starttime.replace(/-/g, '/'));
                    endtime = this.strToDate(data.livelist[i].pm[l].endtime.replace(/-/g, '/'));
                    startminutes = starttime.getMinutes(); //定义个变量保存秒数
                    endminutes = endtime.getMinutes(); //定义个变量保存秒数
                    if (startminutes < 10) {
                      startminutes = "0" + startminutes;
                    } //秒数前加个0   
                    if (endminutes < 10) {
                      endminutes = "0" + endminutes;
                    } //秒数前加个0  
                    // data.livelist[i].night[l].starttime = starttime.getHours() + ":" + startminutes;
                    // data.livelist[i].night[l].endtime = endtime.getHours() + ":" + endminutes;
                    if (nowTime == data.livelist[i].livedate && courseid == data.livelist[i].pm[j].courseid) {
                      var timestamp = Date.parse(new Date());
                      timestamp = timestamp / 1000;

                      var timestamp2 = Date.parse(starttime);
                      timestamp2 = timestamp2 / 1000;

                      console.log(timestamp2 - timestamp);
                      todayData = {
                        month: starttime.getMonth(),
                        day: starttime.getDate(),
                        starttime: starttime.getHours() + ":" + startminutes,
                        endtime: endtime.getHours() + ":" + endminutes,
                        countDownTime: this.parseTime(timestamp2 - timestamp),
                        todayList: data.livelist[i].pm[l]
                      };
                      todayList.push(todayData);
                    } else {
                      var timestamp = Date.parse(new Date());
                      timestamp = timestamp / 1000;
                      var timestamp2 = Date.parse(this.strToDate(starttime));
                      timestamp2 = timestamp2 / 1000;

                      if (timestamp2 > timestamp) {
                        // console.log(this.parseTime(timestamp2 - timestamp));
                        recentData = {
                          month: starttime.getMonth(),
                          day: starttime.getDate(),
                          starttime: starttime.getHours() + ":" + startminutes,
                          endtime: endtime.getHours() + ":" + endminutes,
                          countDownTime: this.parseTime(timestamp2 - timestamp),
                          recentList: data.livelist[i].pm[l]
                        };
                        recentList.push(recentData);
                      }
                    }
                  }
                }
              }
              this.setData({ todayList: todayList });
              this.setData({ recentList: recentList });
              var monthCategory = [];
              for (var a = 0; a < recentList.length; a++) {
                if (monthCategory.length > 0) {
                  for (var b = 0; b < monthCategory.length; b++) {
                    if (recentList[a].month != monthCategory[b]) {
                      monthCategory.push(recentList[a].month);
                    }
                  }
                } else {
                  monthCategory.push(recentList[a].month);
                }
              }
              this.setData({ monthCategory: monthCategory });
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
  getNowTime: function (isHMS) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    if (month < 10) {
      month = '0' + month;
    };
    if (day < 10) {
      day = '0' + day;
    };
    var formatDate;
    if (isHMS == true) {
      //  如果需要时分秒，就放开
      var h = now.getHours();
      var m = now.getMinutes();
      var s = now.getSeconds();
      if (h < 10) {
        h = '0' + h;
      };
      if (m < 10) {
        m = '0' + m;
      };
      if (s < 10) {
        s = '0' + s;
      };
      formatDate = year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
    } else {
      formatDate = year + '-' + month + '-' + day;
    }

    return formatDate;
  },
  //直播倒计时
  countDownHandler: function () {
    if (!interval) {
      interval = setInterval(() => {
        //有今日直播数据
        if (this.data.todayList.length > 0) {
          for (var i = 0; i < this.data.todayList.length; i++) {
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;

            var timestamp2 = Date.parse(this.strToDate(this.data.todayList[i].todayList.starttime.replace(/-/g, '/')));
            timestamp2 = timestamp2 / 1000;

            var timestamp3 = Date.parse(this.data.todayList[i].todayList.endtime.replace(/-/g, '/'));

            timestamp3 = timestamp3 / 1000;
            // console.log(timestamp3 + "|" + timestamp2 + "|" + timestamp);
            if (timestamp2 >= timestamp) {
              this.data.todayList[i].countDownTime = this.parseTime(timestamp2 - timestamp);
            }
            if (timestamp2 - timestamp <= 0 && timestamp3 - timestamp >= 0) {
              this.data.todayList[i].state = '1';
            } else if (timestamp2 - timestamp <= 0 && timestamp3 - timestamp < 0) {
              this.data.todayList[i].state = '2';
            } else {
              this.data.todayList[i].state = '0';
            }
          }
          this.setData({ todayList: this.data.todayList });
        }
        //有近期直播数据
        if (this.data.recentList.length > 0) {
          for (var i = 0; i < this.data.recentList.length; i++) {
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;

            var timestamp2 = Date.parse(this.strToDate(this.data.recentList[i].recentList.starttime.replace(/-/g, '/')));
            timestamp2 = timestamp2 / 1000;

            var timestamp3 = Date.parse(this.data.recentList[i].recentList.endtime.replace(/-/g, '/'));
            timestamp3 = timestamp3 / 1000;

            if (timestamp2 >= timestamp) {
              this.data.recentList[i].countDownTime = this.parseTime(timestamp2 - timestamp);
            }

            if (timestamp2 - timestamp <= 0 && timestamp3 - timestamp >= 0) {
              this.data.recentList[i].state = '1';
            } else if (timestamp2 - timestamp <= 0 && timestamp3 - timestamp < 0) {
              this.data.recentList[i].state = '2';
            } else {
              this.data.recentList[i].state = '0';
            }
            //console.log(this.parseTime(timestamp2 - timestamp));
          }
          this.setData({ recentList: this.data.recentList });
        }

        //console.log('计时开始' + this.data.displayTime);
      }, 1000);
    }
  },
  stopcountDownHandler: function () {
    console.log('stop');
    if (interval) {
      clearInterval(interval);
      interval = null;
    } else {}
  },
  parseTime: function (time) {
    var dd = parseInt(time / 60 / 60 / 24);

    var hh = parseInt(time / 60 / 60 % 24);
    if (hh < 10) hh = '0' + hh;

    var mm = parseInt(time / 60 % 60);
    if (mm < 10) mm = '0' + mm;
    var ss = parseInt(time % 60);
    if (ss < 10) ss = '0' + ss;
    // var ssss = parseInt(this.data.time % 100);
    // if(ssss<10) ssss = '0'+ssss;
    // return `${mm}:${ss}:${ssss}`

    if (dd > 0) {
      return `${dd}天${hh}:${mm}:${ss}`;
    }
    if (hh > 0) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  },
  todayClick: function () {
    if (this.data.todayshow != true) {
      this.setData({ todayshow: true });
      this.setData({ recentshow: false });
    }
  },
  recentClick: function () {
    if (this.data.recentshow != true) {
      this.setData({ todayshow: false });
      this.setData({ recentshow: true });
    }
  },
  todayLiveClick: function (event) {
    var index = event.currentTarget.dataset.index;
    if (this.data.todayList[index].state == 0 || this.data.todayList[index].state == 2) {
      var msg;
      if (this.data.todayList[index].state == 0) {
        msg = '直播暂未开始';
      }
      if (this.data.todayList[index].state == 2) {
        msg = '直播已结束';
      }
      swan.showModal({
        title: '温馨提示',
        content: msg,
        confirmText: "确定",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // var url = '../live/live';
            // wx.navigateTo({
            //   url: url,
            // })
            return;
          } else {
            return;
          }
        }
      });
    } else {
      var url = '../live/live';
      swan.navigateTo({
        url: url
      });
    }
  },
  recentLiveClick: function (event) {
    var index = event.currentTarget.dataset.index;
    if (this.data.recentList[index].state == 0) {
      swan.showModal({
        title: '温馨提示',
        content: '直播暂未开始',
        confirmText: "确定",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // var url = '../live/live';
            // wx.navigateTo({
            //   url: url,
            // })
            return;
          } else {
            return;
          }
        }
      });
    } else {
      var url = '../live/live';
      swan.navigateTo({
        url: url
      });
    }
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
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});