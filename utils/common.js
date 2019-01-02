/**
 * 公共方法类
 */

//公共showToast
const showToast = params => showToastMethod(params);
const showToastMethod = params => {
  //console.log('params' + params.title);
  if (params.title == null) {
    return;
  }
  swan.showToast({
    title: params.title == null ? '请求超时' : params.title,
    icon: params.icon == null ? 'succes' : params.icon,
    duration: params.duration == null ? 1000 : params.duration,
    mask: true
  });
};
const showModal = params => showModalMethod(params);
const showModalMethod = params => {
  swan.showModal({
    title: params.title == null ? '提示' : params.title,
    content: params.content == null ? '' : params.content,
    showCancel: params.showCancel == null ? true : params.showCancel,
    success: function (res) {
      if (res.confirm) {
        console.log('用户点击确定');
      } else if (res.cancel) {
        console.log('用户点击取消');
      }
    }
  });
};
// 未购买课程提示
function hintInfo(mobileOS) {
  if (mobileOS == 'ios') {
    swan.showModal({
      title: '温馨提示',
      content: '请先使用帮考网APP或前往官网购买该课程!',
      showCancel: false,
      success: function (res) {
        return;
      }
    });
  } else {
    swan.showModal({
      title: '温馨提示',
      content: '您尚未购买此课程，请先购买!',
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
  }
};
/**
 * 时间格式化
 */
function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

/**
 * 时间格式化
 */
function secondFormat(second) {
  second = parseInt(second);
  var hour = second / 3600;
  var minute = parseInt(second % 3600) / 60;
  var second = parseInt(second % 3600) % 60;
  return parseInt(hour) + '时' + parseInt(minute) + '分' + parseInt(second) + '秒';
}

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
*/
function numberFormatTime(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

/** 
  * 手机验证
  */
function validatemobile(mobile) {
  if (mobile.length == 0) {
    swan.showToast({
      title: '请输入手机号！',
      icon: 'success',
      duration: 1500
    });
    return false;
  }
  if (mobile.length != 11) {
    swan.showToast({
      title: '手机号长度有误！',
      icon: 'success',
      duration: 1500
    });
    return false;
  }
  var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
  if (!myreg.test(mobile)) {
    swan.showToast({
      title: '请输入正确的手机号！',
      icon: 'success',
      duration: 1500
    });
    return false;
  }
  return true;
}

// function singature(data) {
//   var random = common.random(6);
//   //console.log('random=' + random);
//   var timestamp = Date.parse(new Date());
//   timestamp = timestamp / 1000;
//   //console.log("当前时间戳为：" + timestamp); 
//   var token = getApp().globalData.bkw_token;
//   var singatureStr = token + timestamp.toString() + random;
//   console.log("当前签名为：" + singatureStr);
//   singatureStr = common.sha1(singatureStr);
//   console.log("加密后的签名为：" + singatureStr);
// }
/** 
  * 随机数
  */
function random(data) {
  var random = '';
  for (var i = 0; i < data; i++) {
    random += Math.round(Math.random() * 9);
  }
  //console.log('random=' + random);
  return random;
}
// 时间戳
function timeStamp() {
  return parseInt(new Date().getTime() / 1000) + '';
}
/* 随机字符串 */
function randomString(length) {
  var chars = 'ABCDEFGHIJKLMNPOQRSTUVWXYZabcdefghijklmnoprstuvwxyz1234567890'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var maxPos = chars.length;
  var pwd = '';
  for (var i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}
/** 
  * sha1加密
  */
function encodeUTF8(s) {
  var i,
      r = [],
      c,
      x;
  for (i = 0; i < s.length; i++) if ((c = s.charCodeAt(i)) < 0x80) r.push(c);else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));else {
    if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
      c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000, r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));else r.push(0xE0 + (c >> 12 & 0xF));
    r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
  };
  return r;
};

// 字符串加密成 hex 字符串
function sha1(s) {
  var data = new Uint8Array(encodeUTF8(s));
  var i, j, t;
  var l = (data.length + 8 >>> 6 << 4) + 16,
      s = new Uint8Array(l << 2);
  s.set(new Uint8Array(data.buffer)), s = new Uint32Array(s.buffer);
  for (t = new DataView(s.buffer), i = 0; i < l; i++) s[i] = t.getUint32(i << 2);
  s[data.length >> 2] |= 0x80 << 24 - (data.length & 3) * 8;
  s[l - 1] = data.length << 3;
  var w = [],
      f = [function () {
    return m[1] & m[2] | ~m[1] & m[3];
  }, function () {
    return m[1] ^ m[2] ^ m[3];
  }, function () {
    return m[1] & m[2] | m[1] & m[3] | m[2] & m[3];
  }, function () {
    return m[1] ^ m[2] ^ m[3];
  }],
      rol = function (n, c) {
    return n << c | n >>> 32 - c;
  },
      k = [1518500249, 1859775393, -1894007588, -899497514],
      m = [1732584193, -271733879, null, null, -1009589776];
  m[2] = ~m[0], m[3] = ~m[1];
  for (i = 0; i < s.length; i += 16) {
    var o = m.slice(0);
    for (j = 0; j < 80; j++) w[j] = j < 16 ? s[i + j] : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1), t = rol(m[0], 5) + f[j / 20 | 0]() + m[4] + w[j] + k[j / 20 | 0] | 0, m[1] = rol(m[1], 30), m.pop(), m.unshift(t);
    for (j = 0; j < 5; j++) m[j] = m[j] + o[j] | 0;
  };
  t = new DataView(new Uint32Array(m).buffer);
  for (var i = 0; i < 5; i++) m[i] = t.getUint32(i << 2);

  var hex = Array.prototype.map.call(new Uint8Array(new Uint32Array(m).buffer), function (e) {
    return (e < 16 ? "0" : "") + e.toString(16);
  }).join("");

  return hex;
};
//将字符串分割为数组
function splitToArray(nodeValue, nodeSymbol) {
  var array = new Array(); //定义一数组 
  array = nodeValue.split(nodeSymbol); //字符分割 
  // for (var i = 0; i < array.length; i++) {
  //   console.log(array[i]);
  // }
  return array;
}
//替换特殊字符
function convertHTMLToString(nodeValue) {
  var str = "" + nodeValue;
  str = str.replace(/&nbsp;/ig, " ");
  str = str.replace(/<p>/ig, "");
  str = str.replace(/<\/\p>/ig, "\r\n");
  str = str.replace(/<br>/ig, "\r\n");
  str = str.replace(/<br \/\>/ig, "\r\n");
  str = str.replace(/<BR>/ig, "\r\n");
  str = str.replace(/<br><br>/ig, "\r\n");
  str = str.replace(/<b>/ig, "");
  str = str.replace(/<\/\b>/ig, "");
  str = str.replace(/[b]/ig, "");
  str = str.replace(/[\/\b]/ig, "");
  str = str.replace(/<div style='text- align:justify;'>/ig, "");
  str = str.replace(/<span style=\"font-family:'Microsoft YaHei';font-size:16px;\">/ig, "");
  str = str.replace(/<span style=\"font-size:14px;\">/ig, "");
  str = str.replace(/<span style=\"font-family:NSimSun;\">/ig, "");
  str = str.replace(/<span style=\"font-family:Microsoft YaHei;\">/ig, "");
  str = str.replace(/<span style=\"font-family:'', 'Microsoft YaHei', '';line-height:1.5;\">/ig, "");
  str = str.replace(/<span style=\"font-family:'', 'Microsoft YaHei', '';font-size:14px;line-height:1.5;\">/ig, "");
  str = str.replace(/<span>/ig, "");
  str = str.replace(/<\/\span >/ig, "");
  str = str.replace(/<p class='MsoNormal'>/ig, "");
  str = str.replace(/ alt="/ig, "");
  str = str.replace(/ onclick=\"modimg(this)\"/i, "");
  str = str.replace(/src=\"/ig, "");
  str = str.replace(/<img alt=" src="/ig, "<img src='");
  str = str.replace(/"png\">/ig, "png'>");
  str = str.replace(/"png\" \/\>/ig, "png'>");
  return str;
}

/** 
  * json转字符串 
  */
function stringToJson(data) {
  return JSON.parse(data);
}
/** 
*字符串转json 
*/
function jsonToString(data) {
  return JSON.stringify(data);
}
/** 
*map转换为json 
*/
function mapToJson(map) {
  return JSON.stringify(strMapToObj(map));
}
/** 
*json转换为map 
*/
function jsonToMap(jsonStr) {
  return objToStrMap(JSON.parse(jsonStr));
}

/** 
*map转化为对象（map所有键都是字符串，可以将其转换为对象） 
*/
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

/** 
*对象转换为Map 
*/
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}
/**
 * 校验用户当前session_key是否有效。
 */
function checkSession() {
  swan.checkSession({
    success: function () {
      //session_key 未过期，并且在本生命周期一直有效
    },
    fail: function () {
      // session_key 已经失效，需要重新执行登录流程
      swan.login(); //重新登录
    }
  });
}

module.exports = {
  showToast,
  showModal,
  hintInfo: hintInfo,
  random: random,
  validatemobile: validatemobile,
  // singature: singature,
  sha1: sha1,
  formatTime: formatTime,
  stringToJson: stringToJson,
  jsonToString: jsonToString,
  mapToJson: mapToJson,
  jsonToMap: jsonToMap,
  strMapToObj: strMapToObj,
  objToStrMap: objToStrMap,
  secondFormat: secondFormat,
  timeStamp: timeStamp,
  randomString: randomString,
  convertHTMLToString: convertHTMLToString,
  splitToArray: splitToArray,
  numberFormatTime: numberFormatTime,
  checkSession: checkSession
};