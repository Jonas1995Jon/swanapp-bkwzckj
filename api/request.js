/**
 * 公共请求类
 */
import api from './api.js';
import common from '../utils/common.js';
import app from '../app.js';
// var CusBase64 = require('../utils/base64.js');
//获取应用实例
var apps = getApp();
var paperTitle;
var learnType;

/**
 * 监测是否绑定过账户
 */
function request_thirdauth(code) {
  var userinfo = swan.getStorageSync('userinfo');
  var nickname = "";
  var headimage = "";
  if (userinfo != "") {
    // CusBase64.CusBASE64.encoder(userinfo.nickName)
    nickname = userinfo.nickName;
    headimage = userinfo.avatarUrl;
  }
  var openid = swan.getStorageSync('wx_openid');
  var wx_session_key = swan.getStorageSync('wx_session_key');
  var unionid = swan.getStorageSync('wx_unionid');
  if (openid == "" || wx_session_key == "") {
    swan.showToast({
      title: '未获取到授权信息',
      icon: 'success',
      duration: 1500
    });
    return;
  }
  var uuid,
    mobiletype,
    mobileos,
    resolution,
    networkmode,
    app_name,
    app_version,
    app_build,
    weixin_version = "";

  swan.getSystemInfo({
    success: function (res) {
      mobiletype = res.model;
      mobileos = res.system;
      resolution = res.screenWidth + "*" + res.screenHeight;
      app_name = getApp().globalData.appname;
      app_version = getApp().globalData.appversion;
      app_build = getApp().globalData.appbuild;
      weixin_version = res.version;
    }
  });
  swan.getNetworkType({
    success: function (res) {
      // 返回网络类型, 有效值：
      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
      networkmode = res.networkType;
      // console.log(uuid, mobiletype, mobileos, resolution, networkmode, app_name, app_version, app_build, weixin_version);
      api.thirdauth({
        methods: 'POST',
        data: {
          source: getApp().globalData.source,
          openid: openid,
          unionid: unionid,
          wx_nickname: nickname,
          wx_headimage: headimage,
          from: getApp().globalData.from,
          ip: '',
          uuid: '',
          mobiletype: mobiletype,
          mobileos: mobileos,
          resolution: resolution,
          networkmode: networkmode,
          app_name: app_name,
          app_version: app_version,
          app_build: app_build,
          weixin_version: weixin_version
        },
        success: res => {
          var data = res.data;
          if (data.errcode == 0) {
            //微信登录成功
            swan.setStorageSync('bk_userinfo', data);
            var isUpdateUserInfo = swan.getStorageSync('isUpdateUserInfo'); //已经选择
            if (code == "40003" || (isUpdateUserInfo == undefined || isUpdateUserInfo != 1) && code != "40004") {
              swan.setStorageSync('isUpdateUserInfo', 1); //已加载用户数据
              swan.setStorageSync('bk_userinfo_tell', data.username); //已加载用户数据
              var pages = getCurrentPages();
              var prevPage = pages[0]; //第一个页面

              //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
              prevPage.setData({
                refresh: 1,
                bk_userinfo_tell: data.username
              });
              swan.navigateBack({
                delta: pages.length - 1
              });
            }
          } else {//尚未绑定帮考网账号等错误
            // swan.showToast({
            //   title: data.errmsg
            // });
          }
        }
      });
    }
  });
}
/**
 * 监测是否绑定过账户
 */
function request_bindinguser_step1(mobile) {
  var random = common.random(6);
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  timestamp = timestamp.toString();
  var token = getApp().globalData.bkw_token;
  var singatureArr = [];
  singatureArr.push(token);
  singatureArr.push(timestamp.toString());
  singatureArr.push(random);
  singatureArr = singatureArr.sort();
  var singatureStr = '';
  for (var i = 0; i < singatureArr.length; i++) {
    singatureStr += singatureArr[i];
  }
  // console.log(singatureStr);
  singatureStr = common.sha1(singatureStr);
  var userinfo = swan.getStorageSync('userinfo');
  var nickname = "";
  var headimage = "";
  if (userinfo != "") {
    nickname = userinfo.nickName;
    // nickname = CusBase64.CusBASE64.encoder(userinfo.nickName);
    headimage = userinfo.avatarUrl;
  }
  var openid = swan.getStorageSync('wx_openid');
  var wx_session_key = swan.getStorageSync('wx_session_key');
  var unionid = swan.getStorageSync('wx_unionid');
  if (openid == "" || wx_session_key == "") {
    // swan.showToast({
    //   title: '未获取到授权信息'
    // });
    return;
  }
  api.bindinguser_step1({
    methods: 'POST',
    data: {
      source: '1',
      openid: openid,
      unionid: unionid,
      market: getApp().globalData.market,
      from: getApp().globalData.from,
      ip: '',
      appid: getApp().globalData.appid,
      timestamp: timestamp,
      nonce: random,
      signature: singatureStr,
      extend: '',
      mobile: mobile,
      wx_nickname: nickname,
      wx_headimage: headimage
    },
    success: res => {
      var data = res.data;
      if (data.errcode == 0) {
        //未绑定过账户
        if (data.isregister == 1) {
          //已经注册过的账户跳转密码登录页
          var url = '../inputPassword/inputPassword?token=' + data.token + '&mobile=' + mobile;
          swan.navigateTo({
            url: url
          });
        } else {
          //未注册过的账户跳转验证码页
          // var data = {
          //   token: data.token,
          //   mobile: mobile,
          // }
          var url = '../getCode/getCode?token=' + data.token + '&mobile=' + mobile + '&codeType=0';
          swan.navigateTo({
            url: url
          });
          // request_bindinguser_step2(data);
        }
      } else if (data.errcode == 40003) {
        //已经绑定过账户
        request_thirdauth(40003);
      } else {
        //签名失败等错误
        swan.showToast({
          title: data.errmsg,
          icon: 'success',
          duration: 1500
        });
      }
    }
  });
}
/**
 * 提交手机号并发送验证码
 */
function request_bindinguser_step2(data) {
  var random = common.random(6);
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  timestamp = timestamp.toString();
  var token = getApp().globalData.bkw_token;
  var singatureArr = [];
  singatureArr.push(token);
  singatureArr.push(timestamp.toString());
  singatureArr.push(random);
  singatureArr = singatureArr.sort();
  var singatureStr = '';
  for (var i = 0; i < singatureArr.length; i++) {
    singatureStr += singatureArr[i];
  }
  // console.log(singatureStr);
  singatureStr = common.sha1(singatureStr);
  api.bindinguser_step2({
    methods: 'POST',
    data: {
      mobile: data.mobile,
      token: data.token,
      timestamp: timestamp,
      nonce: random,
      signature: singatureStr
    },
    success: res => {
      var resData = res.data;
      if (resData.errcode == 0) {//验证码发送成功
        // var url = '../getCode/getCode?token=' + data.token + '&mobile=' + data.mobile;
        // wx.navigateTo({
        //   url: url,
        // })
      } else {
        //验证码发送失败等错误
        swan.showToast({
          title: resData.errmsg,
          icon: 'success',
          duration: 1500
        });
      }
    }
  });
}
/**
 * 这一步主要用于验证未注册账号的手机验证码是否正确或已注册账号登录密码是否正确，成功验证后自动登录账号
 */
function request_bindinguser_step3(data) {
  var random = common.random(6);
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  timestamp = timestamp.toString();
  var token = getApp().globalData.bkw_token;
  var singatureArr = [];
  singatureArr.push(token);
  singatureArr.push(timestamp.toString());
  singatureArr.push(random);
  singatureArr = singatureArr.sort();
  var singatureStr = '';
  for (var i = 0; i < singatureArr.length; i++) {
    singatureStr += singatureArr[i];
  }
  singatureStr = common.sha1(singatureStr);
  api.bindinguser_step3({
    methods: 'POST',
    data: {
      yzm: data.yzm,
      token: data.token,
      timestamp: timestamp,
      nonce: random,
      signature: singatureStr
    },
    success: res => {
      var data = res.data;
      if (data.errcode == 0) {
        //验证成功返回登录及用户信息
        swan.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 1500
        });
        swan.setStorageSync('bk_userinfo', data);
        swan.setStorageSync('bk_userinfo_tell', data.username);
        var pages = getCurrentPages();
        var prevPage = pages[0]; //第一个页面

        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
          refresh: 1
        });

        swan.navigateBack({
          delta: pages.length - 1
        });
        // var url = '../../me/me';
        // wx.switchTab({
        //   url: url
        // })
      } else {
        //验证码等错误
        common.showModal({
          title: '温馨提示',
          // content: data.errmsg,
          content: '输入有误',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              //console.log('用户点击确定')
            }
          }
        });
        return;
        // swan.showToast({
        //   title: '密码输入有误！'
        // });
      }
    }
  });
}
/**
 * 解除绑定
 */
function request_unBindingUser() {
  var bk_userinfo = swan.getStorageSync('bk_userinfo');
  var sessionid = apps.globalData.default_sessionid;
  var uid = apps.globalData.default_uid;
  if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
    sessionid = bk_userinfo.sessionid;
    uid = bk_userinfo.uid;
  }
  api.unBindingUser({
    methods: 'POST',
    data: {
      source: getApp().globalData.source,
      sessionid: sessionid,
      uid: uid
    },
    success: res => {
      var data = res.data;
      if (data.errcode == 0) {
        //解除绑定成功
        var url = '../../../pages/me/me';
        swan.switchTab({
          url: url
        });
        // swan.showToast({
        //   title: '解绑成功',
        //   duration : 3000
        // });
        swan.removeStorage({
          key: 'bk_userinfo'
        });
        swan.removeStorage({
          key: 'bk_account'
        });

        // wx.navigateBack();
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
}

/**
 * 【新版】下载试卷
 */
function request_loadnewpaper(data) {
  var bk_userinfo = swan.getStorageSync('bk_userinfo');
  var sessionid = apps.globalData.default_sessionid;
  var uid = apps.globalData.default_uid;
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
  learnType = data.learnType;
  var fromType = data.from; //0首页 1学习记录、unitExam
  paperTitle = data.title;
  api.loadnewpaper({
    methods: 'POST',
    data: {
      sessionid: sessionid,
      uid: uid,
      courseid: courseid,
      unitid: unitid,
      kpid: '',
      type: learnType,
      videosource: getApp().globalData.videosource,
      questionnumber: quecount,
      // market: getApp().globalData.market,
      isorder: getApp().globalData.isorder
    },
    success: res => {
      var data = res.data;
      if (data.errcode == 0) {
        //请求成功读取试题-v2.3
        var question = JSON.stringify(data);
        var url;
        if (fromType == 0) {
          url = '../course/paper/studyPage/studyPage?unitid=' + unitid + '&paperid=' + data.paperid + '&question=' + question + '&learnType=' + learnType + '&history=0' + '&paperTitle=' + paperTitle;
        } else if (fromType == 1) {
          url = '../../course/paper/studyPage/studyPage?unitid=' + unitid + '&paperid=' + data.paperid + '&question=' + question + '&learnType=' + learnType + '&history=0' + '&paperTitle=' + paperTitle;
        }
        
        url = url.replace(/%/g, '%25');

        swan.navigateTo({
          url: encodeURI(url)
        });
      } else if (data.errcode == 40002) {
        //您的免费学习资格已用完，快快购买正式课程吧！
        swan.showModal({
          title: '温馨提示',
          content: data.errmsg,
          confirmText: "立即购买",
          cancelText: "残忍拒绝",
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
}
/**
 * 检查课程信息
 */
function request_checkcourse(url) {
  var bk_userinfo = swan.getStorageSync('bk_userinfo');
  var sessionid = apps.globalData.default_sessionid;
  var uid = apps.globalData.default_uid;
  if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
    sessionid = bk_userinfo.sessionid;
    uid = bk_userinfo.uid;
  }
  var courseid = swan.getStorageSync('courseid');
  api.checkcourse({
    methods: 'POST',
    data: {
      sessionid: sessionid,
      uid: uid,
      courseid: courseid,
      ip: '',
      market: apps.globalData.market
    },
    success: res => {
      var data = res.data;
      if (data.errcode == 0) {
        //请求成功读取试题-v2.3
        swan.setStorageSync('checkcourseVO', data);
        if (url != undefined) {
          swan.switchTab({
            url: url
          });
        }
      } else if (data.errcode == 40036) {//请先购买课程

      } else if (data.errcode == 40052) {
        //未找到会话信息，请重新登录
        // swan.showToast({
        //   title: data.errmsg
        // });
        request_thirdauth(0);
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
}
/**
 * 读取试题-v2.3
 */
function request_loadquestion(data) {
  var bk_userinfo = swan.getStorageSync('bk_userinfo');
  var sessionid = apps.globalData.default_sessionid;
  var uid = apps.globalData.default_uid;
  if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
    sessionid = bk_userinfo.sessionid;
    uid = bk_userinfo.uid;
  }
  api.loadquestion({
    methods: 'POST',
    data: {
      sessionid: sessionid,
      uid: uid,
      courseid: swan.getStorageSync('courseid'),
      unitid: data.unitid,
      paperid: data.paperid,
      qid: data.qid,
      videosource: getApp().globalData.videosource
    },
    success: res => {
      var data = res.data;
      if (data.errcode == 0) {
        //请求成功读取试题-v2.3
        return data;
      } else if (data.errcode == 40036) {//请先购买课程

      } else if (data.errcode == 40052) {
        //未找到会话信息，请重新登录
        swan.showToast({
          title: data.errmsg,
          icon: 'success',
          duration: 1500
        });
        //request_thirdauth();
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
}

/**
 * 保存答题信息
 */
function request_saveAnswerInfo(data) {
  var bk_userinfo = swan.getStorageSync('bk_userinfo');
  var sessionid = apps.globalData.default_sessionid;
  var uid = apps.globalData.default_uid;
  if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
    sessionid = bk_userinfo.sessionid;
    uid = bk_userinfo.uid;
  }
  api.saveAnswerInfo({
    methods: 'POST',
    data: {
      sessionid: sessionid,
      uid: uid,
      courseid: swan.getStorageSync('courseid'),
      unitid: data.unitid,
      paperid: data.paperid,
      qid: data.qid,
      wastetime: data.wastetime,
      useranswer: data.useranswer,
      letter: data.letter,
      isright: data.isright,
      score: data.score,
      rightnum: data.rightnum,
      wrongnum: data.wrongnum,
      accuracy: data.accuracy,
      totalwastetime: data.totalwastetime,
      kaoqi: data.kaoqi,
      type: data.type,
      suff: data.suff,
      lastqid: data.lastqid
    },
    success: res => {
      var data = res.data;
      if (data.errcode == 0) {
        //保存试题成功
        return data;
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

/**
 * 保存答题信息
 */
function request_loadinit(data) {
  var bk_userinfo = swan.getStorageSync('bk_userinfo');
  var sessionid = apps.globalData.default_sessionid;
  var uid = apps.globalData.default_uid;
  if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
    sessionid = bk_userinfo.sessionid;
    uid = bk_userinfo.uid;
  }
  api.loadinit({
    methods: 'POST',
    data: {
      sessionid: sessionid,
      uid: uid,
      courseid: swan.getStorageSync('courseid'),
      unitid: data.unitid,
      paperid: data.paperid,
      qid: data.qid,
      wastetime: data.wastetime,
      useranswer: data.useranswer,
      letter: data.letter,
      isright: data.isright,
      score: data.score,
      rightnum: data.rightnum,
      wrongnum: data.wrongnum,
      accuracy: data.accuracy,
      totalwastetime: data.totalwastetime,
      kaoqi: data.kaoqi,
      type: data.type,
      suff: data.suff,
      lastqid: data.lastqid
    },
    success: res => {
      var data = res.data;
      if (data.errcode == 0) {
        //保存试题成功
        return data;
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

/** 
  * 记录日志
  */
function request_collectLog(data) {
  api.collectLog({
    methods: 'POST',
    data: {
      content: JSON.stringify(data)
    },
    // data: {
    //   courseid: courseid,
    //   sessionid: sessionid,
    //   userid: uid,
    //   pageid: data.pageid,
    //   appname: data.appname,
    //   channelnumber: data.channelnumber,
    //   addtime: data.addtime,
    //   // from: data.from,
    //   appversion: data.appversion,
    //   os: data.os,
    //   action: data.action,
    //   module: data.module,
    //   ip: data.ip,
    //   browser: data.browser,
    //   duration: data.duration,
    //   appbuild: data.appbuild,
    //   resolution: data.resolution,
    //   mobiletype: data.mobiletype,
    // },
    success: res => {
      var data = res.data;
      //不做任何处理
      if (data.errcode == 0) { } else {
        // swan.showToast({
        //   title: data.errmsg
        // });
      }
    }
  });
}

/** 
  * 补签协议-查询是否可以补签协议
  */
function request_checksupplement(data) {
  var bk_userinfo = swan.getStorageSync('bk_userinfo');
  var sessionid = apps.globalData.default_sessionid;
  var uid = apps.globalData.default_uid;
  if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
    sessionid = bk_userinfo.sessionid;
    uid = bk_userinfo.uid;
  }
  var courseid = swan.getStorageSync('courseid');
  if (data.courseid != (undefined || "")) {
    courseid = data.courseid;
  }

  api.checksupplement({
    methods: 'POST',
    data: {
      courseid: courseid,
      sessionid: sessionid,
      uid: uid,
      coursetype: data.coursetype
    },
    success: res => {
      var data = res.data;
      //不做任何处理
      if (data.errcode == 0) {
        var url = '../../agreement/agreement';
        swan.navigateTo({
          url: encodeURI(url)
        });
      } else {
        // swan.showToast({
        //   title: data.errmsg
        // });
      }
    }
  });
}

//获取考试类别
function request_getCourseByCategory(id) {
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
        } else {
          var url = '../pages/me/me';
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

/**
 * 【新版】下载试卷
 */
function request_getQuestionBuyQid(data) {
  var bk_userinfo = swan.getStorageSync('bk_userinfo');
  var sessionid = apps.globalData.default_sessionid;
  var uid = apps.globalData.default_uid;
  if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
    sessionid = bk_userinfo.sessionid;
    uid = bk_userinfo.uid;
  }
  var qid = data.qid;
  var unitid = data.unitid;
  learnType = data.learnType;
  var fromType = data.from; //0首页 1学习记录、unitExam
  var paperTitle = data.title;
  api.getQuestionBuyQid({
    methods: 'POST',
    data: {
      sessionid: sessionid,
      uid: uid,
      questionid: qid
    },
    success: res => {
      var data = res.data;
      if (data.errcode == 0) {
        //请求成功读取试题-v2.3
        var question = JSON.stringify(data);
        var url = '../course/paper/studyPage/studyPage?unitid=' + unitid + '&paperid=' + data.paperid + '&question=' + question + '&learnType=' + learnType + '&history=0' + '&paperTitle=' + paperTitle;

        swan.navigateTo({
          url: encodeURI(url)
        });
      } else if (data.errcode == 40002) {
        //您的免费学习资格已用完，快快购买正式课程吧！
        swan.showModal({
          title: '温馨提示',
          content: data.errmsg,
          confirmText: "立即购买",
          cancelText: "残忍拒绝",
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
}

module.exports = {
  request_bindinguser_step1: request_bindinguser_step1,
  request_bindinguser_step2: request_bindinguser_step2,
  request_bindinguser_step3: request_bindinguser_step3,
  request_thirdauth: request_thirdauth,
  request_unBindingUser: request_unBindingUser,
  request_loadnewpaper: request_loadnewpaper,
  request_checkcourse: request_checkcourse,
  request_loadquestion: request_loadquestion,
  request_saveAnswerInfo: request_saveAnswerInfo,
  request_loadinit: request_loadinit,
  request_collectLog: request_collectLog,
  request_checksupplement: request_checksupplement,
  request_getCourseByCategory: request_getCourseByCategory,
  request_getQuestionBuyQid: request_getQuestionBuyQid
};