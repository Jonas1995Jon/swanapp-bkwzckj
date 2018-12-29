// pages/course/paper/studyPage.js
import api from '../../../api/api.js';
import request from '../../../api/request.js';
import common from '../../../utils/common.js';
var DOMParser = require('../../../utils/xmldom/dom-parser').DOMParser;
var XMLSerializer = require('../../../utils/xmldom/dom-parser').XMLSerializer;
var WxParse = require('../../../utils/wxParse/wxParse.js');
//获取应用实例
var app = getApp();
var interval = null;
var onlineTimer = null;
var logsTimer = null;
var beginPagex = 0;
var checkboxIsSubmit = false;
var loadquestionIndex = 0;
var isSubmitAnswer = false;

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
      leftBtn: 1,
      leftBtnImg: '../../../image/navigation/back.png',
      centerBtn: 0,
      centerBtnTitle: '智能刷题'
    },
    time: 0, //计时
    wastetime: 0, //当前试题用时
    displayTime: '00:00', //计时器时间
    paperindex: 0, //当前页码
    branchqueIndex: -1, //子类页码
    papercount: '', //总共页码
    quetypename: '', //题型类型名称
    quetitle: '', //标题
    textareaStr: '', //主观题textarea默认值
    // optionArr: '',             //选项
    explanationStr: '', //解析
    OptionList: '', //正确选项
    quetype: '', //题型类型
    QGuid: '', //
    QId: '', //
    unitid: '', //章节ID
    paperid: '', //试卷ID
    learnType: '', //学习类型
    question: '', //题型列表
    collectstate: 0, //收藏
    notecontent: '', //笔记
    enginemode: 0,
    questionlistItem: {},

    mainqueArr: [], //题型详情集合
    dispalyExplanation: 0, //是否显示解析
    clientHeight: 0,
    clientWidth: 0,
    answerArr: [],
    showPerfectAccount: 0, //是否显示完善账户
    submitPaperBtnHidden: false,
    parsingType: '', //0错题解析、1全部解析
    isAnswer: 1, //是否支持作答
    history: 0,
    paperTitleStr: '',
    paperTitleZero: '',
    paperTitleOne: '',
    paperTitleTwo: '',
    paperTitleThree: '',
    paperTitleFour: '',
    paperTitleFive: '',
    refresh: "0",
    modal: {
      authorizationHidden: true
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var refresh = options.refresh;
    if (refresh == 1) {
      this.setData({ showPerfectAccount: 0 });
      this.loadquestionByQid(paperindex, 1);
    }
    var wx_openid = swan.getStorageSync('wx_openid');
    var wx_session_key = swan.getStorageSync('wx_session_key');
    var wx_unionid = swan.getStorageSync('wx_unionid');
    if (wx_openid == "" || wx_session_key == "") {
      this.wxLogin();
    } else {
      //判断缓存里是否已经存在userinfo
      var userinfo = swan.getStorageSync('userinfo');
      if (userinfo != "") {
        this.setData({ headPortrait: userinfo.avatarUrl });
        this.setData({ username: userinfo.nickName });
      } else {
        this.setData({ showPerfectAccount: 1 });
        this.setData({
          modal: {
            authorizationHidden: false
          }
        });
      }
    }

    var that = this;
    // 高度自适应
    swan.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight;
        var clientWidth = res.windowWidth;
        that.setData({
          clientWidth: clientWidth,
          clientHeight: clientHeight
        });
      }
    });

    // var shareqid = "8B9D0FD619D178BF";
    // var shareqid = "FBEF9461E2FECEDD";
    // var sharecourseid = "1579";
    var shareqid = options.shareqid;
    var sharecourseid = options.sharecourseid;
    //是否通过扫描刷题二维码进入
    if (sharecourseid != undefined && shareqid != undefined) {
      this.setData({ shareqid: shareqid });
      this.setData({ sharecourseid: sharecourseid });
      // var paperindex = this.data.paperindex;
      // this.loadquestionByQid(paperindex, 1);
      this.getcourselistbycourseid(sharecourseid);
    }

    // //history 1历史记录 2解析
    // var paperindex = this.data.paperindex;
    // //默认加载试卷
    // this.loadquestion(paperindex, 1, isChildren);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');

    var paperindex = this.data.paperindex;
    if (this.data.notecontent.length > 0) {
      this.data.mainqueArr[paperindex].notecontent = this.data.notecontent;
      this.setData({ mainqueArr: this.data.mainqueArr });
    }

    if (this.data.refresh == 1) {
      this.setData({ refresh: 0 });
      this.setData({ showPerfectAccount: 0 });
      this.loadquestionByQid(paperindex, 1);
    }
  },

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
  onShareAppMessage: function () { },

  loadquestion: function (paperindex, isparsecontent, isChildren) {
    var unitid = this.data.unitid;
    var paperid = this.data.paperid;
    // console.log(this.data.question.list.length + 'xxxx' + paperindex);
    if (this.data.branchqueIndex != -1 && this.data.question.list.length < 1 || paperindex >= this.data.question.list.length) {
      return;
    }
    var qid;
    if (isChildren == 0) {
      qid = this.data.question.list[paperindex].qid;
    } else {
      qid = this.data.mainqueArr[paperindex].branchqueArr[this.data.branchqueIndex].qid;
    }
    api.loadquestion({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        unitid: unitid,
        paperid: paperid,
        qid: qid,
        videosource: getApp().globalData.videosource,
        type: this.data.learnType
      },
      success: res => {
        var data = res.data;
        //解析content xml 默认解析第0个
        var mainqueArr = this.data.mainqueArr;
        if (data.errcode == 0) {
          //请求成功读取试题-v2.3
          //防止重复添加
          if (mainqueArr.length > 0) {
            var isExist = false;
            for (var i = mainqueArr.length - 1; i >= 0; i--) {
              if (data.mainque[0].qid == mainqueArr[i].qid) {
                isExist = true;
              }
            }
            if (!isExist) {
              this.data.mainqueArr[paperindex] = data.mainque[0];
              //判断是否存在有支题的情况
              var branchqueArr = [];
              var branchque = [];
              if (data.branchque != undefined && data.branchque.length > 0) {
                // var mainque = data.mainque[0];
                // branchqueArr.push(mainque);
                for (var i = 0; i < data.branchque.length; i++) {
                  branchque = data.branchque[i];
                  branchqueArr.push(branchque);
                }
                this.data.mainqueArr[paperindex]['branchqueArr'] = branchqueArr;
              }
              this.setData({ mainqueArr: this.data.mainqueArr });
              // this.paserRightAnswer();
            }
          } else {
            // 初次直接生成对应的数组个数
            if (this.data.mainqueArr.length < 1) {
              var subMainqueArr = [];
              for (var i = 0; i < this.data.question.list.length; i++) {
                this.data.mainqueArr.push('');
                // if (this.data.question.list[i].sublist.length > 0){
                //   this.data.mainqueArr[i]['subMainqueArr'] = '';
                //   // for (var j = 0; j < this.data.question.list[i].sublist.length; j++){
                //   //   this.data.mainqueArr['subMainqueArr'] = '';
                //   //   subMainqueArr.push('');
                //   //   this.data.mainqueArr[i] = subMainqueArr;
                //   // }
                // }
              }
            }
            this.data.mainqueArr[paperindex] = data.mainque[0];
            this.setData({ mainqueArr: this.data.mainqueArr });
            // this.paserRightAnswer();
          }

          //isparsecontent==1解析congtent
          if (isparsecontent == 1) {
            this.parsecontent(this.data.paperindex);
          }
        } else if (data.errcode == 40036) {
          //请先购买课程
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
        } else if (data.errcode == 40052) {
          //未找到会话信息，请重新登录
          swan.showToast({
            title: data.errmsg,
            icon: 'success',
            duration: 1500
          });
          //request_thirdauth();
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
  //解析content内容
  parsecontent: function (mainque) {
    var paperindex = this.data.paperindex;
    this.data.mainqueArr.push(mainque);
    this.setData({ enginemode: mainque.enginemode });
    this.setData({ quetypename: mainque.quetypename });
    this.setData({ questionindex: 0 });

    swan.showLoading({
      title: ''
    });
    var isChildren = 0;
    var mainque;
    if (this.data.branchqueIndex != -1 && this.data.mainqueArr[paperindex].branchqueArr != undefined && this.data.mainqueArr[paperindex].branchqueArr.length > 0) {
      isChildren = 1;
      mainque = this.data.mainqueArr[paperindex].branchqueArr[this.data.branchqueIndex];
    } else {
      mainque = this.data.mainqueArr[paperindex];
    }

    var doc = new DOMParser().parseFromString(mainque.content);
    var Title = doc.getElementsByTagName("Title")[0];
    var QId = doc.getElementsByTagName("QId")[0];
    var QGuid = doc.getElementsByTagName("QGuid")[0];
    var Type = doc.getElementsByTagName("Type")[0];
    var Stem = doc.getElementsByTagName("Stem")[0];
    var OptionList = doc.getElementsByTagName("OptionList")[0];
    var Extent = doc.getElementsByTagName("Extent")[0];
    var ThisType = doc.getElementsByTagName("ThisType")[0];
    var PageCode = doc.getElementsByTagName("PageCode")[0];
    var Explanation = doc.getElementsByTagName("Explanation")[0];
    var Option = doc.getElementsByTagName("Option")[0];

    var element;
    //必须判断不判断为空会崩溃
    //QId
    if (QId.childNodes.length > 0) {
      element = QId.firstChild.nodeValue;
      this.setData({ QId: element });
    }
    //QGuid
    if (QGuid.childNodes.length > 0) {
      element = QGuid.firstChild.nodeValue;
      this.setData({ QGuid: element });
    }
    //Type
    if (Type.childNodes.length > 0) {
      element = Type.firstChild.nodeValue;
      this.setData({ quetype: element });
    }
    //标题
    if (Title.childNodes.length > 0) {

      element = Title.firstChild.nodeValue;
      if (element.indexOf(">") > 0 || element.indexOf("nbsp")) {
        WxParse.wxParse('paperTitle', 'html', element, this, 5);
        this.setData({ quetitle: '' });
      } else {
        this.setData({ quetitle: element });
      }
    }
    //正确选项
    if (OptionList.childNodes.length > 0) {
      element = OptionList.firstChild.nodeValue;
      this.setData({ OptionList: element });
    }
    //解析
    if (Explanation.childNodes.length > 0) {
      element = Explanation.firstChild.nodeValue;
      if (element.indexOf(">") > 0) {
        WxParse.wxParse('Explanation', 'html', element, this, 5);
        this.setData({ explanationStr: '' });
      } else {
        this.setData({ explanationStr: element });
      }
    }
    //难易程度
    if (Extent.childNodes.length > 0) {
      element = Extent.firstChild.nodeValue;
      this.setData({ extent: element });
      // this.data.answerArr[paperindex].extent = element;
    }

    //题干
    if (Stem.childNodes.length > 0) {
      element = Stem.firstChild.nodeValue;
      if (element.indexOf(">") > 0) {
        WxParse.wxParse('paperStem', 'html', element, this, 5);
        this.data.answerArr[paperindex].stem = '';
      } else {
        this.data.answerArr[paperindex].stem = element;
      }
    }

    var data = {
      useranswer: '', //单选选项
      useranswerId: '', //单选选项id
      useranswerIndex: '', //单选index
      useranswerArr: [], //多选选项
      useranswerIdArr: [], //多选选项id
      useranswerIndexArr: [], //多选index
      answer: '', //正确答案选项
      answerId: this.data.OptionList, //正确答案选项id
      extent: '', //难易程度
      stem: '', //题干
      score: '', //分值
      enginnemode: mainque.enginnemode, //提醒类型
      isright: '', //正确与否
      qid: this.data.QId, //qid
      answered: 0, //是否已经作答0否1是
      showExplanation: 0, //是否显示解析
      optionArr: [], //当前选项集合
      knowledgepoint: '', //知识点集合
      checkboxBtnShow: false //多选题提交后隐藏按钮
    };
    this.data.answerArr.push(data);

    //组装选项
    if (Option.childNodes.length > 0) {
      var optionArr = common.splitToArray(Option.firstChild.nodeValue, "|b#k*w|");
      var optionIdArr = common.splitToArray(Option.attributes.getNamedItem("ID").nodeValue, "|");
      var tempArr = [];
      var data;
      var optionChecked = 0;
      for (var i = 0; i < optionArr.length; i++) {
        // 选中状态
        if (this.data.answerArr[paperindex].optionArr.length > 0) {
          optionChecked = this.data.answerArr[paperindex].optionArr[i].optionChecked;
        }
        switch (i) {
          case 0:
            data = {
              option: 'A',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            if (optionArr[i].indexOf(">") > 0) {
              WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
              this.setData({ paperTitleZero: '' });
            } else {
              this.setData({ paperTitleZero: optionArr[i] });
            }

            break;
          case 1:
            data = {
              option: 'B',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            if (optionArr[i].indexOf(">") > 0) {
              WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
              this.setData({ paperTitleOne: '' });
            } else {
              this.setData({ paperTitleOne: optionArr[i] });
            }
            break;
          case 2:
            data = {
              option: 'C',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            if (optionArr[i].indexOf(">") > 0) {
              WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
              this.setData({ paperTitleTwo: '' });
            } else {
              this.setData({ paperTitleTwo: optionArr[i] });
            }
            break;
          case 3:
            data = {
              option: 'D',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            if (optionArr[i].indexOf(">") > 0) {
              WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
              this.setData({ paperTitleThree: '' });
            } else {
              this.setData({ paperTitleThree: optionArr[i] });
            }
            break;
          case 4:
            data = {
              option: 'E',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            if (optionArr[i].indexOf(">") > 0) {
              WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
              this.setData({ paperTitleFour: '' });
            } else {
              this.setData({ paperTitleFour: optionArr[i] });
            }
            break;
          case 5:
            data = {
              option: 'F',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            if (optionArr[i].indexOf(">") > 0) {
              WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
              this.setData({ paperTitleFive: '' });
            } else {
              this.setData({ paperTitleFive: optionArr[i] });
            }
            break;
          case 6:
            data = {
              option: 'G',
              optionId: optionIdArr[i],
              optionTitle: optionArr[i],
              optionChecked: optionChecked
            };
            if (optionArr[i].indexOf(">") > 0) {
              WxParse.wxParse('paperTitle' + [i], 'html', optionArr[i], this, 5);
              this.setData({ paperTitleFive: '' });
            } else {
              this.setData({ paperTitleFive: optionArr[i] });
            }
            break;
          default:
            break;
        }
        tempArr.push(data);
      }
      this.data.answerArr[paperindex].optionArr = tempArr;
      this.data.answerArr[paperindex].knowledgepoint = mainque.knowpoint;

      this.data.questionlistItem = mainque;
    }
    // // 收藏
    // var collectstate = mainque.collectstate;
    // this.setData({ collectstate: collectstate });

    // // 笔记
    // var notecontent = mainque.notecontent;
    // this.setData({ notecontent: notecontent });


    if (this.data.history == 1 || this.data.history == 2) {
      var question = this.data.question.list[paperindex];
      if (question.useranswer.length > 0) {
        this.data.answerArr[paperindex].answered = 1; //已作答
        this.data.answerArr[paperindex].showExplanation = 1; //显示解析
        this.data.answerArr[paperindex].isright = question.isright; //回答正确
        this.data.answerArr[paperindex].score = question.score;
        this.setData({ isAnswer: 1 });
        //单选
        if (question.enginemode == 1 || question.enginemode == 3) {
          this.data.answerArr[paperindex].useranswerId = question.useranswer; //选项ID
          for (var i = 0; i < this.data.answerArr[paperindex].optionArr.length; i++) {
            if (question.useranswer == this.data.answerArr[paperindex].optionArr[i].optionId) {
              this.data.answerArr[paperindex].optionArr[i].optionChecked = 1;
              this.data.answerArr[paperindex].useranswer = this.data.answerArr[paperindex].optionArr[i].option; //选项
            }
          }
        }
        if (question.enginemode == 2) {
          this.data.answerArr[paperindex].useranswerIdArr = question.useranswer.replace("%2c"); //选项ID
          var answerTitleArr = [];
          var answerIdArr = common.splitToArray(question.useranswer, ",");
          // var answerIdArr = common.splitToArray(question.useranswer, "%2c");
          var optionid;
          var optiontitle;
          //组装用户作答答案
          for (var i = 0; i < this.data.answerArr[paperindex].optionArr.length; i++) {
            optionid = this.data.answerArr[paperindex].optionArr[i].optionId;
            optiontitle = this.data.answerArr[paperindex].optionArr[i].option;
            for (var j = 0; j < answerIdArr.length; j++) {
              var answerid = answerIdArr[j];
              if (optionid == answerid) {
                this.data.answerArr[paperindex].optionArr[i].optionChecked = 1;
                // this.data.answerArr[paperindex].useranswerArr = this.data.answerArr[paperindex].optionArr[i].option;//选项
                answerTitleArr.push(optiontitle);
              }
            }
          }
          this.data.answerArr[paperindex].useranswerArr = answerTitleArr.toString();
        }
      }
      if (this.data.history == 2) {
        for (var i = 0; i < this.data.answerArr.length; i++) {
          this.data.answerArr[i].showExplanation = 1;
        }
        this.data.answerArr[paperindex].showExplanation = 1;
        this.setData({ isAnswer: 0 });
      }
    }
    // 解析历史记录都需单独组装一次正确答案
    this.paserRightAnswer(paperindex);
  },

  //单选选中事件，已选中再次点击无效
  radioChange: function (e) {
    if (this.data.isAnswer == 0) {
      return; //不支持作答
    }
    //单选默认先清空已经选中的情况
    var paperindex = this.data.paperindex;
    for (var i = 0; i < this.data.answerArr[paperindex].optionArr.length; i++) {
      if (this.data.answerArr[paperindex].optionArr[i].optionChecked = 1) {
        this.data.answerArr[paperindex].optionArr[i].optionChecked = 0;
      }
    }
    var answerIndex = e.currentTarget.dataset.hi;
    var optionArr = common.splitToArray(e.detail.value, "|");
    this.data.answerArr[answerIndex].useranswerIndex = optionArr[0]; //answerIndex
    this.data.answerArr[answerIndex].useranswer = optionArr[1]; //选项
    this.data.answerArr[answerIndex].useranswerId = optionArr[2]; //选项ID
    this.data.answerArr[answerIndex].answered = 1; //已作答
    var isSubmitAnswer = false;
    if (this.data.learnType == 5 || this.data.learnType == 6 || this.data.learnType == 46) {
      isSubmitAnswer = false;
    } else {
      isSubmitAnswer = true;
      this.data.answerArr[answerIndex].showExplanation = 1; //显示解析
    }

    if (this.data.answerArr[answerIndex].useranswerId == this.data.answerArr[answerIndex].answerId) {
      this.data.answerArr[answerIndex].isright = 1; //回答正确
      this.data.answerArr[answerIndex].score = this.data.mainqueArr[paperindex].fenzhi;
    } else {
      this.data.answerArr[answerIndex].isright = 2; //回答错误
      this.data.answerArr[answerIndex].score = 0;
    }
    var optionIndex = optionArr[0];
    this.data.answerArr[answerIndex].optionArr[optionIndex].optionChecked = 1;
    this.setData({ answerArr: this.data.answerArr });

    // if (isSubmitAnswer == true){
    // this.saveAnswerInfo(1);
    // }
  },
  //多选选中事件
  checkboxChange: function (e) {
    if (this.data.isAnswer == 0) {
      return; //不支持作答
    }
    //多选默认先清空已经选中的情况
    var paperindex = this.data.paperindex;
    for (var i = 0; i < this.data.answerArr[paperindex].optionArr.length; i++) {
      this.data.answerArr[paperindex].optionArr[i].optionChecked = 0;
    }
    var answerIndex = e.currentTarget.dataset.hi;
    var option = e.detail.value;
    var optionArr = [];
    var useranswerIndexArr = [];
    var useranswerArr = [];
    var useranswerIdArr = [];
    for (var i = 0; i < option.length; i++) {
      optionArr.push(common.splitToArray(option[i], "|"));
      useranswerIndexArr.push(optionArr[i][0]);
      useranswerArr.push(optionArr[i][1]);
      useranswerIdArr.push(optionArr[i][2]);
      var optionIndex = optionArr[i][0];
      this.data.answerArr[answerIndex].optionArr[optionIndex].optionChecked = 1;
    }
    this.data.answerArr[answerIndex].useranswerIndexArr = useranswerIndexArr;
    this.data.answerArr[answerIndex].useranswerArr = useranswerArr.sort();
    this.data.answerArr[answerIndex].useranswerIdArr = useranswerIdArr.sort();
    if (option.length > 0) {
      this.data.answerArr[answerIndex].answered = 1; //已作答
    } else {
      this.data.answerArr[answerIndex].answered = 0; //未作答
    }
    if (this.data.answerArr[answerIndex].useranswerIdArr.toString() == this.data.answerArr[answerIndex].answerId) {
      this.data.answerArr[answerIndex].isright = 1; //回答正确
    } else {
      this.data.answerArr[answerIndex].isright = 2; //回答错误
    }

    this.setData({ answerArr: this.data.answerArr });

    // if (checkboxIsSubmit == true) {
    //   this.saveAnswerInfo(2);
    // }
  },
  //多选提交按钮
  checkboxSubmit: function (e) {
    if (this.data.isAnswer == 0) {
      return; //不支持作答
    }
    var paperindex = this.data.paperindex;
    if (this.data.learnType == 5 || this.data.learnType == 6 || this.data.learnType == 46) {
      isSubmitAnswer = false;
    } else {
      isSubmitAnswer = true;
      this.data.answerArr[paperindex].showExplanation = 1;
    }

    this.data.answerArr[paperindex].checkboxBtnShow = true;
    this.setData({ answerArr: this.data.answerArr });
    // this.saveAnswerInfo(2);
    checkboxIsSubmit = true;
  },
  //点击答案解析
  answerExplanation: function () {
    var paperindex = this.data.paperindex;
    // console.log(paperindex);
    this.data.answerArr[paperindex].showExplanation = 1;
    this.setData({ answerArr: this.data.answerArr });
  },
  handlerStart: function (e) {
    var pageX = e.changedTouches[0].pageX;
    if (this.data.paperindex == this.data.papercount - 1) {
      beginPagex = pageX;
    }
  },

  //组装正确答案
  paserRightAnswer: function (paperindex) {
    var paperindex = paperindex;
    if (this.data.mainqueArr[paperindex].enginemode == 1 || this.data.mainqueArr[paperindex].enginemode == 3) {
      //遍历单选、判断正确答案
      var answerTitle;
      var answerId = this.data.answerArr[paperindex].answerId;
      var optionid;
      var optiontitle;
      for (var i = 0; i < this.data.answerArr[paperindex].optionArr.length; i++) {
        optionid = this.data.answerArr[paperindex].optionArr[i].optionId;
        optiontitle = this.data.answerArr[paperindex].optionArr[i].option;
        if (optionid == answerId) {
          answerTitle = optiontitle;
        }
      }
      this.data.answerArr[paperindex].answer = answerTitle;
    }
    if (this.data.mainqueArr[paperindex].enginemode == 2) {
      //多选
      //遍历多选正确答案
      var answerTitleArr = [];
      var answerIdArr = common.splitToArray(this.data.answerArr[paperindex].answerId, ",");
      var optionid;
      var optiontitle;
      for (var i = 0; i < this.data.answerArr[paperindex].optionArr.length; i++) {
        optionid = this.data.answerArr[paperindex].optionArr[i].optionId;
        optiontitle = this.data.answerArr[paperindex].optionArr[i].option;
        for (var j = 0; j < answerIdArr.length; j++) {
          if (optionid == answerIdArr[j]) {
            answerTitleArr.push(optiontitle);
          }
        }
      }
      this.data.answerArr[paperindex].answer = answerTitleArr.toString();
    }
    this.setData({ answerArr: this.data.answerArr });
    swan.hideLoading();
  },
  bindAccount: function () {
    var url = '../../me/bind/bind';
    swan.navigateTo({
      url: encodeURI(url)
    });
  },
  branchqueClick: function (e) {
    var branchqueIndex = e.currentTarget.dataset.index;
    var paperindex = e.currentTarget.dataset.paperindex;
    this.setData({ branchqueIndex: branchqueIndex });
    this.parsecontent(paperindex);
    var branchqueIndex = parseInt(branchqueIndex) + 1;
    if (branchqueIndex >= this.data.answerArr[paperindex].branchAnswerArr.length) {
      this.setData({ textareaStr: '' });
    } else {
      this.setData({ textareaStr: this.data.answerArr[paperindex].branchAnswerArr[branchqueIndex].textarea });
    }
  },
  // bindblur="bindTextAreaBlur"
  // bindTextAreaBlur: function (e) {
  //   console.log(e.detail.value)
  // },
  bindFormSubmit: function (e) {
    // if (this.data.answerArr[]){

    // }
    var paperindex = this.data.paperindex;
    var branchqueIndex = e.detail.value.subjectiveText;
    var textarea = e.detail.value.textarea;
    var data = {
      branchqueIndex: parseInt(branchqueIndex) + 1,
      textarea: textarea
    };

    if (this.data.answerArr[paperindex].branchAnswerArr != undefined && this.data.answerArr[paperindex].branchAnswerArr.length > 0) {
      for (var i = 0; i < this.data.answerArr[paperindex].branchAnswerArr.length; i++) {
        if (this.data.answerArr[paperindex].branchAnswerArr[i].branchqueIndex == parseInt(branchqueIndex) + 1) {
          this.data.answerArr[paperindex].branchAnswerArr[i].textarea = textarea;
        } else {
          this.data.answerArr[paperindex].branchAnswerArr.push(data);
        }
      }
    } else {
      this.data.answerArr[paperindex]['branchAnswerArr'] = [];
      this.data.answerArr[paperindex].branchAnswerArr.push(data);
    }

    this.setData({ answerArr: this.data.answerArr });
    this.setData({ textareaStr: this.data.answerArr[paperindex].branchAnswerArr[parseInt(branchqueIndex) + 1].textarea });
  },
  paperVideoPlay: function (event) {
    var index = event.currentTarget.dataset.index;
    var kpid = this.data.answerArr[index].knowledgepoint[0].kpid;
    this.knowpointGetDetail(kpid);
  },
  knowpointGetDetail: function (kpid) {
    api.knowpointGetDetail({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: this.data.sharecourseid,
        kpid: kpid,
        videosource: app.globalData.videosource,
        screenwidth: '640',
        screenheight: '1136',
        definition: app.globalData.definition,
        version: '1.0'
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          this.setData({ knowpointDetail: data });
          var videoUrl = this.removeBaiFenHao(data.videocode);
          videoUrl = videoUrl.replace("http://", "https://");
          var url = 'videoPlayer/videoPlayer?videoUrl=' + videoUrl;
          swan.navigateTo({
            url: encodeURI(url)
          });
        } else if (data.errcode == 40002) {
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "立即购买",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                swan.navigateTo({
                  url: '../buyCourse/buyCourseDetail/buyCourseDetail'
                });
                return;
              } else {
                return;
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
  },
  loadquestionByQid: function (paperindex, isparsecontent) {
    api.getQuestionBuyQid({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        questionid: this.data.shareqid
      },
      success: res => {
        var data = res.data;
        //解析content xml 默认解析第0个
        this.parsecontent(data);
      }
    });
  },
  backHomeClick: function () {
    var url = '../../me/me';
    swan.switchTab({
      url: url
    });
  },
  //根据课程ID获取考试信息
  getcourselistbycourseid: function (courseid) {
    api.getcourselistbycourseid({
      methods: 'POST',
      data: {
        courseid: courseid
      },
      success: res => {
        swan.hideToast();
        var data = res.data;
        if (data.errcode == 0) {
          var courselist = data.courselist;
          var smallclass;
          var bigclass = swan.getStorageSync('bk_bigclass');
          var smallclassTemp;
          var categoryidTemp;
          var courseidTemp;
          var courselistItem;
          swan.setStorageSync('bk_courselist', JSON.stringify(courselist));
          swan.setStorageSync('categoryname', data.categorytitle);
          for (var i = 0; i < courselist.length; i++) {
            courselistItem = courselist[i];
            if (this.data.sharecourseid == courselistItem.id) {
              swan.setStorageSync('courseid', courselist[i].id);
              swan.setStorageSync('coursename', courselist[i].title);
              swan.setStorageSync('categoryid', data.categoryid);
              var paperindex = this.data.paperindex;
              this.loadquestionByQid(paperindex, 1);
              swan.setStorageSync('navIndex', i);
              swan.setNavigationBarTitle({
                title: data.categorytitle
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
  onGetUserInfo: function (e) {
    this.setData({
      modal: {
        authorizationHidden: true
      }
    });
    swan.setStorageSync('userinfo', e.detail.userInfo);
    var that = this;
    that.setData({ encryptedData: e.detail.encryptedData });
    that.setData({ iv: e.detail.iv });
    that.setData({ headPortrait: e.detail.userInfo.avatarUrl });
    that.setData({ username: e.detail.userInfo.nickName });
    var userInfo = e.detail.userInfo;
    var nickName = userInfo.nickName;
    var avatarUrl = userInfo.avatarUrl;
    var gender = userInfo.gender; //性别 0：未知、1：男、2：女
    var province = userInfo.province;
    var city = userInfo.city;
    var country = userInfo.country;
    swan.navigateTo({
      url: 'account/account'
    });
    request.request_thirdauth(0);
  },
  getAccessToken: function (event) {
    var parameter = 'grant_type=client_credential&appid=' + getApp().globalData.appid + '&secret=' + getApp().globalData.appsecret;
    api.getTransferRequest({
      methods: 'POST',
      data: {
        url: 'https://api.weixin.qq.com/cgi-bin/token',
        method: 'GET',
        parameter: parameter
      },
      success: res => {
        var data = res.data;
        console.log(data);
      }
    });
  },
  //获取opened 
  getOpenIdAndSessionKey: function (code) {
    var that = this;
    swan.request({
      url: 'https://openapi.baidu.com/nalogin/getSessionKeyByCode?code=' + code + '&client_id=' + getApp().globalData.sh_key + '&sk=' + getApp().globalData.appsecret,
      success: res => {
        var data = res.data;
        console.log(data);
        console.log("openid=" + data.openid + "&session_key=" + data.session_key + "&unionid=" + data.unionid);
        swan.setStorageSync('wx_openid', data.openid);
        swan.setStorageSync('wx_session_key', data.session_key);
        if (data.unionid == undefined) {
          this.setData({ session_key: data.session_key });
          this.setData({ code: code });
        } else {
          swan.setStorageSync('wx_unionid', data.unionid);
        }
        //判断缓存里是否已经存在userinfo
        var userinfo = swan.getStorageSync('userinfo');
        if (userinfo != "") {
          that.setData({ userinfo: userinfo });
          that.setData({ headPortrait: userinfo.avatarUrl });
          that.setData({ username: userinfo.nickName });
        } else {
          this.setData({
            modal: {
              authorizationHidden: false
            }
          });
        }
      }
    });
  },
  //获取unionid
  getweixin_unionid: function () {
    api.getweixin_unionid({
      methods: 'POST',
      data: {
        encryptedData: this.data.encryptedData,
        iv: this.data.iv,
        session_key: this.data.session_key,
        code: this.data.code
      },
      success: res => {
        var data = res.data;
        swan.hideToast();
        if (data.errcode == 0) {
          this.setData({ headPortrait: data.avatarUrl });
          this.setData({ username: data.nickname });
          var userinfo = {
            nickName: data.nickname,
            avatarUrl: data.avatarUrl,
            gender: data.gender,
            province: data.province,
            city: data.city,
            country: data.country,
            language: data.language
          };
          this.setData({ userinfo: userinfo });
          swan.setStorageSync('userinfo', userinfo);
          swan.setStorageSync('wx_unionid', data.unionid);
          request.request_thirdauth(0);
        }
      }
    });
  },
  /**
  * 百度登录
  */
  wxLogin: function () {
    var that = this;
    swan.login({
      success: function (res) {
        if (res.code) {
          that.getOpenIdAndSessionKey(res.code);
        } else {
          console.log('获取用户登录态失败！' + res.errMsg);
        }
      }
    });
  },
  modalSureClick: function () {
    this.setData({
      modal: {
        authorizationHidden: true
      }
    });
  }
});