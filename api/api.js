import common from '../utils/common.js';
const host = 'https://api.cnbkw.com';
const host1 = 'https://api.bkw.cn/';
const host2 = 'https://api2.cnbkw.com';
const host3 = 'https://api3.cnbkw.com';
const host4 = 'https://studylog.cnbkw.com';
const host5 = 'http://picture.bkw.cn';
const hosts = 'https://apialy2.cnbkw.com';

const wxRequest = (params, url) => {
  getNetworkType(); //获取网络状态
  if (url != host + "/App/loadpaper/loadquestion_v2.3.ashx" && url != host + "/App/setremainder.ashx" && url != host + "/App/setonline.ashx" && url != host4 + "/CollectLog") {
    swan.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
  }
  var header = 'application/x-www-form-urlencoded; charset=UTF-8';
  if (url == host2 + '/Api/buycourse_v2.ashx' || url == host2 + '/Api/checkorder_v2.1.ashx') {
    header = 'application/json';
    // console.log(params.data);
  }
  // var paramsStr = JSON.stringify(params.data);
  // paramsStr = paramsStr.replace(/\+/g,"%2B");
  // var paramsData = JSON.parse(paramsStr);
  // console.log(paramsData);
  // params = JSON.parse(paramsStr);
  // console.log(params.data);
  // if (params.data != undefined){
  //   params.data['market'] = getApp().globalData.market;//所有接口加上market
  // }
  swan.request({
    url: url,
    method: params.methods || 'POST',
    data: params.data || {},
    header: {
      'Content-Type': header
    },
    success: res => {
      //console.log(params.data);
      swan.hideToast();
      params.success && params.success(res);
    },
    fail: res => {
      swan.hideToast();
      // swan.showToast({
      //   title: '请求超时',
      //   icon: 'succes',
      //   duration: 1000
      // })
      params.fail && params.fail(res);
    },
    complete: res => {
      params.complete && params.complete(res);
    }
  });
};
function getNetworkType() {
  swan.getNetworkType({
    complete: function (res) {
      //console.log(res);
      if (res.isConnected == false || res.networkType == "none") {
        swan.showModal({
          title: '温馨提示',
          content: '当前网络不可用，请检查网络设置！',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              //console.log('用户点击确定')
            }
          }
        });
        return;
      }
    }
  });
  swan.onNetworkStatusChange(function (res) {
    if (res.isConnected == false || res.networkType == "none") {
      swan.showModal({
        title: '温馨提示',
        content: '当前网络不可用，请检查网络设置！',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            //console.log('用户点击确定')
          }
        }
      });
      return;
    }
  });
}

// const wxCommonRequest = (params, url) => {
//   wx.showToast({
//     title: '加载中',
//     icon: 'loading'
//   })
//   //Console.log(params + "xxxx" + url); 
//   wx.request({
//     url: url,
//     method: 'get',
//     //data: params.data || {},
//     header: {
//       'Content-Type': 'text/plain;charset=UTF-8',
//       'url': params.data.url,
//       'method': params.data.method,
//       'parameter': params.data.parameter
//     },
//     success: (res) => {
//       console.log(params.data.parameter);
//       params.success && params.success(res)
//       wx.hideToast()
//     },
//     fail: (res) => {
//       params.fail && params.fail(res)
//     },
//     complete: (res) => {
//       params.complete && params.complete(res)
//     }
//   })
// }
//public 请求第三方中转接口
const getTransferRequest = params => wxRequest(params, host + '/App/forward.ashx');
// const getTransferRequest = (params) => wxRequest(params, hosts + '/course/selectioncenter')

//Index 首页接口
/**
 * 获取课程能力报告--章节能力值
 */
const getUnitList = params => wxRequest(params, host + '/App/report/getunitlist.ashx');

const getLastPaper = params => wxRequest(params, host + '/App/getlastpaper.ashx');

/******************************************Me 个人中心接口******************************************/
/**
 * 获取课程分类
 */
const getExamCategory = params => wxRequest(params, host + '/App/getcategory.ashx');

/**
 * 获取科目
 */
const getCourseByCategory = params => wxRequest(params, host + '/App/getcoursebycategory_v3.ashx');

/**
 * 第三方登录-绑定帮考账号-第一步
 */
const bindinguser_step1 = params => wxRequest(params, host2 + '/Api/binding/bindinguser_step1.ashx');

/**
 * 第三方登录-绑定帮考账号-第二步
 */
const bindinguser_step2 = params => wxRequest(params, host2 + '/Api/binding/bindinguser_step2.ashx');

/**
 * 第三方登录-绑定帮考账号-第三步
 */
const bindinguser_step3 = params => wxRequest(params, host2 + '/Api/binding/bindinguser_step3.ashx');

/**
 * 第三方登录-检查第三方账号绑定登录权限
 */
const thirdauth = params => wxRequest(params, host2 + '/Api/binding/thirdauth.ashx');

/**
 * 第三方登录-解除绑定第三方登录账号关系
 */
const unBindingUser = params => wxRequest(params, host2 + '/Api/binding/unbindinguser.ashx');

/**
 * 找回密码--步骤1 检查用户名是否存在，并返回infoid，用于下一步找回
 */
const finduser = params => wxRequest(params, host2 + '/Api/finduser.ashx');

/**
 * 找回密码--步骤2 如果是手机找回的话，这一步会发送短信验证码到客户注册的手机，还要步骤3来验证所填写的验证码是否一致。
 */
const sendinfo = params => wxRequest(params, host2 + '/Api/sendinfo.ashx');

/**
 * 找回密码--步骤3 这一步主要是比对用户输入验证码是否准确
 */
const checkcode = params => wxRequest(params, host2 + '/Api/checkcode.ashx');

/**
 * 找回密码--步骤4 这一步主要是比对用户输入验证码是否准确
 */
const resetpwd = params => wxRequest(params, host2 + '/Api/resetpwd.ashx');

/******************************************Index 刷题接口******************************************/
/**
 * 【新版】下载试卷
 */
const loadnewpaper = params => wxRequest(params, host + '/App/loadpaper/loadnewpaper.ashx');

/**
 * 检查课程页面信息_v7
 */
const checkcourse = params => wxRequest(params, host3 + '/course/checkcourse_v9.ashx');

/**
 * 【新版】下载试卷
 */
const loadquestion = params => wxRequest(params, host + '/App/loadpaper/loadquestion_v2.3.ashx');

/**
 * 【新版】下载试卷答题报告
 */
const loadrecordpaper = params => wxRequest(params, host + '/App/loadpaper/loadrecordpaper.ashx');

/**
 * 我的课程
 */
const mycourse = params => wxRequest(params, host2 + '/Api/mycourse_v3.1.ashx');

/**
 * 购买课程
 */
const buycourse = params => wxRequest(params, host2 + '/Api/buycourse_v2.ashx');

/**
 * 生成微信订单
 */
const createpayorder = params => wxRequest(params, host2 + '/Api/createpayorder.ashx');

/**
 * 统一下单
 */
const weixinpay = params => wxRequest(params, host2 + '/Api/weixinpay_unifiedorder_zhikao_weixinapp.aspx');

/**
 * 支付通知
 */
const weixinpaynotify = params => wxRequest(params, host2 + '/Api/weixinpay_zhikao_weixinapp_notify.aspx');

/**
 * 检测课程是否已经开通
 */
const checkstate = params => wxRequest(params, host2 + '/Api/checkstate.ashx');

/**
 * 保存答题信息
 */
const saveAnswerInfo = params => wxRequest(params, host + '/App/saveanswerinfo.ashx');

/**
 * 交卷
 */
const handinpaper = params => wxRequest(params, host + '/App/handinpaper.ashx');

/**
 * 获取学习历史试卷_v2
 */
const loadinitbylid = params => wxRequest(params, host + '/App/loadinitbylid_v2.ashx');

/**
 * 读取考点目录结构
 */
const knowpointGetList = params => wxRequest(params, host3 + '/knowpoint/getlist');

/**
 * 读取考点详情
 */
const knowpointGetDetail = params => wxRequest(params, host3 + '/knowpoint/getdetail');

/**
 * 读取公开课列表
 */
const getPublicCourseList = params => wxRequest(params, host + '/App/liveclass/getpubliccourselist.ashx');

/**
 * 读取正式课列表
 */
const getFormalCourse = params => wxRequest(params, host + '/App/liveclass/getformalcourse_v3.2.ashx');

/**
 * 读取公开课
 */
const getPublicCourse = params => wxRequest(params, host + '/App/liveclass/getpubliccourse_v2.2.ashx ');

/**
 * 读取直播课程列表
 */
const getLiveCourseList = params => wxRequest(params, host3 + '/course/getlivecourselist');

/**
 * 获取学习历史列表
 */
const studyhistory = params => wxRequest(params, host + '/App/studyhistory.ashx');

/**
 * 获取学习历史列表
 */
const studyhistory_v3 = params => wxRequest(params, host + '/App/studyhistory_v3.ashx');

/**
 * 模拟测试
 */
const getUnit = params => wxRequest(params, host + '/App/getunit_v2.ashx');

/**
 * 课程能力报告-概况
 */
const mystats = params => wxRequest(params, host + '/App/report/mystats_v2.ashx');

/**
 * 扣除用户学时
 */
const setremainder = params => wxRequest(params, host + '/App/setremainder.ashx');

/**
 * 同时在线学习判断
 */
const setonline = params => wxRequest(params, host + '/App/setonline.ashx');

/**
 * 视频日志记录
 */
const collectLog = params => wxRequest(params, host4 + '/CollectLog');

/**
 * 检测视频学习状态
 */
const checkfreelearningstate = params => wxRequest(params, host2 + '/Api/checkfreelearningstate.ashx ');

/**
 * 选课中心_读取商品列表
 */
const commoditylist = params => wxRequest(params, host3 + '/course/commoditylist.ashx');

/**
 * 选课中心_读取商品详情
 */
const commoditydetail = params => wxRequest(params, host3 + '/course/commoditydetail.ashx');

/**
 * 补签协议-查询是否可以补签协议
 */
const checksupplement = params => wxRequest(params, host2 + '/Api/checksupplement_v2.ashx ');

/**
 * 补签协议-读取协议模板内容
 */
const getagreement = params => wxRequest(params, host2 + '/Api/getagreement_v2.ashx');

/**
 * 补签协议---提交补签协议
 */
const supplement = params => wxRequest(params, host2 + '/Api/supplement_v2.ashx');

/**
 * 检查是否选择过关注的考试
 */
const checkproject = params => wxRequest(params, host2 + '/Api/project/checkproject.ashx');

/**
 * 选择关注的考试
 */
const setproject = params => wxRequest(params, host2 + '/Api/project/setproject.ashx');

/**
 * 直播月历(周历)
 */
const getnewlivelist = params => wxRequest(params, host3 + '/live/getnewlivelist.ashx');
/**
 * 收藏题目
 */
const collect = params => wxRequest(params, host + '/App/collect.ashx');

/**
 * 保存笔记
 */
const savenotes = params => wxRequest(params, host + '/App/savenotes.ashx');

/**
 * 按章节展现收藏试题列表
 */
const getcollectlist = params => wxRequest(params, host + '/App/showquestion/getcollectlist.ashx');

/**
 * 直播课程-获取往期列表
 */
const getformalcourseterm = params => wxRequest(params, host + '/App/liveclass/getformalcourseterm.ashx');

/**
 * 考前串讲18、习题精讲23、入门导学36--获取章节列表-V2
 */
const getvideolist = params => wxRequest(params, host + '/app/video/getvideolist.ashx');

/**
 * 考前串讲18、习题精讲23、入门导学36--通过节点读取视频ID
 */
const getvideocode = params => wxRequest(params, host + '/app/video/getvideocode.ashx');

/**
 * 创建拼团
 */
const setGroups = params => wxRequest(params, host3 + '/fightGroups/setGroups.ashx');

/**
 * 创建拼团详情
 */
const setGroupsDetails = params => wxRequest(params, host3 + '/fightGroups/setGroupsDetails.ashx');

/**
 * 根据Categoryid读取拼团模板
 */
const getTemplateByCategoryid = params => wxRequest(params, host3 + '/fightGroups/getTemplateByCategoryid.ashx');

/**
 * 拼团成功后查询课程名称及商品名称
 */
const getCourseCommodityByCommodityid = params => wxRequest(params, host3 + '/fightGroups/getCourseCommodityByCommodityid.ashx');

/**
 * 拼团完成获取用户信息列表
 */
const getGroupCompleteList = params => wxRequest(params, host3 + '/fightGroups/getGroupCompleteList.ashx');

/**
 * 检测拼团是否完成，完成则更改state状态
 */
const receiveCommodity = params => wxRequest(params, host3 + '/fightGroups/receiveCommodity.ashx');

/**
 * 领取课程
 */
const createpintuanorder = params => wxRequest(params, host2 + '/Api/order/createpintuanorder.ashx');

/**
 * 获取所有直播列表
 */
const getlivelistByCategoryid = params => wxRequest(params, host3 + '/live/getlivelistByCategoryid_v3');

/**
 * 获取所有直播模块
 */
const getlivemodulelist = params => wxRequest(params, host3 + '/live/getlivemodulelist');

/**
 * 有问必答_获取问题列表_考试分组
 */
const getQuestionListGroupbyCourse = params => wxRequest(params, host3 + '/answerQuestion/getQuestionListGroupbyCourse');

/**
 * 有问必答_获取提问列表
 */
const getQuestionList = params => wxRequest(params, host3 + '/answerQuestion/getQuestionList');
/**
 * 有问必答_获取对话详情
 */
const getConversation = params => wxRequest(params, host3 + '/answerQuestion/getConversation');
/**
 * 有问必答_回复对话
 */
const webaddConversation = params => wxRequest(params, host3 + '/answerQuestion/webaddConversation');
/**
 * 有问必答_新建工单
 */
const addQuestion = params => wxRequest(params, host3 + '/answerQuestion/addQuestion');
/**
 * 有问必答_评价工单
 */
const addquestionjudge = params => wxRequest(params, host3 + '/answerQuestion/addjudge');

/**
 * 有问必答_撤销工单
 */
const undoQuestion = params => wxRequest(params, host3 + '/answerQuestion/undoQuestion');
/**
 * 有问必答_删除工单
 */
const webdelQuestion = params => wxRequest(params, host3 + '/answerQuestion/webdelQuestion');
/**
 * 有问必答_修改工单状态
 */
const modifyConversationState = params => wxRequest(params, host3 + '/answerQuestion/modifyConversationState');

/**
//  * 有问必答_修改对话状态
//  */
// const modifyConversationState = (params) => wxRequest(params, host3 + '/answerQuestion/modifyConversationState')
/**
 * 有问必答_学习顾问回复
 */
const addConversation = params => wxRequest(params, host3 + '/answerQuestion/addConversation');
/**
 * 上传文件
 */
const uploadfiletooss = params => wxRequest(params, host3 + 'appad/uploadfiletooss');

/**
 * 签到打卡_返回可签到课程列表
 */
const getSigninCourselist = params => wxRequest(params, host3 + '/signin/get_signin_courselist');

/**
 * 签到打卡_根据序号读取课程ID
 */
const getSigninCoursenumber = params => wxRequest(params, host3 + '/signin/get_signin_courseidbynumber');

/**
 * 签到打卡_生成图片
 */
const createSigninImage = params => wxRequest(params, host3 + '/signin/createsigninimage');

/**
 *  读取课程刷题统计
 */
const getshuaticount = params => wxRequest(params, host3 + '/course/getshuaticount');

/**
 *  读取刷题量_直播观看数_视频观看数
 */
const getShuaticountLivecountVodcount = params => wxRequest(params, host3 + '/course/getshuaticount_livecount_vodcount');

/**
 *  读取直播或录播观看时长统计
 */
const getvideowatchcount = params => wxRequest(params, host3 + '/knowpoint/getvideowatchcount');

/**
 *  根据考试ID读取默认商品
 */
const getdefaultcommodity = params => wxRequest(params, host3 + '/course/getdefaultcommodity');

/**
 *  会员体系-我的会员类型
 */
const mymembertype = params => wxRequest(params, host2 + '/Api/member/mymembertype.ashx');

/**
 *  获取账户信息
 */
const myaccount = params => wxRequest(params, host2 + '/Api/myaccount_v3.ashx');

/**
 *  我的订单
 */
const myorder = params => wxRequest(params, host2 + '/Api/myorder.ashx');

/**
 *  取消订单
 */
const cancelorder = params => wxRequest(params, host2 + '/Api/cancelorder.ashx');
/**
 *  订单详情
 */
const getorderdetail = params => wxRequest(params, host2 + '/Api/getorderdetail_v2.ashx');

/**
 *  我的余额
 */
const mybalance = params => wxRequest(params, host2 + '/Api/mybalance.ashx');

/**
 *  我的优惠券_v2
 */
const mycoupon = params => wxRequest(params, host2 + '/Api/mycoupon_v2.ashx');

/**
 *  订单结算_v2.1
 */
const checkorder = params => wxRequest(params, host2 + '/Api/checkorder_v2.1.ashx');

/**
 *  账户充值
 */
const accountrecharge = params => wxRequest(params, host2 + '/Api/accountrecharge.ashx');

/**
 *  选课中心
 */
const selectioncenter = params => wxRequest(params, host3 + '/course/selectioncenter');

/**
 *  获取考试列表
 */
const getcourselistbycourseid = params => wxRequest(params, host + '/App/getcourselistbycourseid.ashx');

/**
 *  获取unionid
 */
const getweixin_unionid = params => wxRequest(params, host2 + '/Api/binding/getweixin_unionid.ashx');

/**
 *  编辑用户信息
 */
const editaccount = params => wxRequest(params, host2 + '/Api/editaccount.ashx');

/**
 *  编辑用户昵称
 */
const editnickname = params => wxRequest(params, host2 + '/Api/editnickname.ashx');

/**
 *  验证邮箱
 */
const checkemail = params => wxRequest(params, host2 + '/Api/emailvalid/checkemail.ashx');

/**
 *  邮箱验证码
 */
const checkyzm = params => wxRequest(params, host2 + '/Api/emailvalid/checkyzm.ashx');

/**
 *  根据channelnumber获取直播信息
 */
const getvideocodebychannelnumber = params => wxRequest(params, host + '/App/liveclass/getvideocodebychannelnumber.ashx');

/**
 *  获取考期列表
 */
const getkqlist = params => wxRequest(params, host + '/App/getkqlist.ashx');

/**
 *  发送修改考期验证码
 */
const sendyzm = params => wxRequest(params, host2 + '/Api/changekq/sendyzm.ashx');

/**
 *  修改考期
 */
const changekaoqi = params => wxRequest(params, host2 + '/Api/changekq/changekaoqi.ashx');

/**
 *  检查修改考期验证码
 */
const changekqCheckyzm = params => wxRequest(params, host2 + '/Api/changekq/checkyzm.ashx');

/**
 *  每月一测_读取月份列表
 */
const getpaperlist = params => wxRequest(params, host + '/App/monthexam/getpaperlist.ashx');

/**
 *  每月一测_读取试卷内容
 */
const getpaperdetail = params => wxRequest(params, host + '/App/monthexam/getpaperdetail.ashx');

/**
 *  根据考试ID读取直播公开课
 */
const getgongkaikelistByCategoryid = params => wxRequest(params, host3 + '/live/getgongkaikelistByCategoryid.ashx');

/**
 *  根据课程ID读取直播课表，（读取每个用户有权限的课表，未购买会显示全部）
 */
const getlivelistBycourseid = params => wxRequest(params, host3 + '/live/getlivelistBycourseid.ashx');

/**
 *  根据试题ID，扫二维码读取试题内容
 */
const getQuestionBuyQid = params => wxRequest(params, host + '/App/showquestion/getquestion_weixinappscan.ashx');

// 读取免费试听列表 
const getfreetryvideolist = params => wxRequest(params, host3 + '/course/getfreetryvideolist.ashx');

// 读取免费试听详情
const getfreetryvideodetail = params => wxRequest(params, host3 + '/course/getfreetryvideodetail.ashx');

// 读取课程已开放的视频模块列表
const getvideomodulelistbycid = params => wxRequest(params, host3 + '/course/getvideomodulelistbycid.ashx');

//读取帮考APP首页广告图
const bkwappindexadlist = params => wxRequest(params, host3 + '/appad/bkwappindexadlist.ashx');

//读取免费试听考试列表
const getfreetryvideocategory = params => wxRequest(params, host3 + '/course/getfreetryvideocategory.ashx');

module.exports = {
  getTransferRequest,
  getExamCategory,
  getCourseByCategory,
  getUnitList,
  getLastPaper,
  bindinguser_step1,
  bindinguser_step2,
  bindinguser_step3,
  thirdauth,
  unBindingUser,
  loadnewpaper,
  loadrecordpaper,
  checkcourse,
  loadquestion,
  mycourse,
  buycourse,
  createpayorder,
  weixinpay,
  weixinpaynotify,
  checkstate,
  saveAnswerInfo,
  handinpaper,
  loadinitbylid,
  knowpointGetList,
  knowpointGetDetail,
  getPublicCourseList,
  getPublicCourse,
  getLiveCourseList,
  getFormalCourse,
  finduser,
  sendinfo,
  checkcode,
  resetpwd,
  studyhistory,
  getUnit,
  mystats,
  setremainder,
  setonline,
  collectLog,
  checkfreelearningstate,
  commoditylist,
  checksupplement,
  getagreement,
  supplement,
  checkproject,
  setproject,
  getnewlivelist,
  collect,
  savenotes,
  getcollectlist,
  getformalcourseterm,
  getvideolist,
  getvideocode,
  setGroups,
  setGroupsDetails,
  getTemplateByCategoryid,
  getCourseCommodityByCommodityid,
  getGroupCompleteList,
  receiveCommodity,
  createpintuanorder,
  getlivelistByCategoryid,
  getQuestionListGroupbyCourse,
  getQuestionList,
  getConversation,
  webaddConversation,
  addQuestion,
  addquestionjudge,
  undoQuestion,
  webdelQuestion,
  modifyConversationState,
  modifyConversationState,
  addConversation,
  uploadfiletooss,
  getSigninCourselist,
  getSigninCoursenumber,
  createSigninImage,
  getShuaticountLivecountVodcount,
  commoditydetail,
  getshuaticount,
  studyhistory_v3,
  getvideowatchcount,
  getdefaultcommodity,
  mymembertype,
  myaccount,
  myorder,
  cancelorder,
  getorderdetail,
  mybalance,
  mycoupon,
  checkorder,
  accountrecharge,
  selectioncenter,
  getcourselistbycourseid,
  getweixin_unionid,
  editaccount,
  editnickname,
  checkemail,
  checkyzm,
  getvideocodebychannelnumber,
  getkqlist,
  sendyzm,
  changekaoqi,
  changekqCheckyzm,
  getpaperlist,
  getpaperdetail,
  getgongkaikelistByCategoryid,
  getlivelistBycourseid,
  getQuestionBuyQid,
  getfreetryvideolist,
  getfreetryvideodetail,
  getvideomodulelistbycid,
  bkwappindexadlist,
  getfreetryvideocategory,
  getlivemodulelist
};