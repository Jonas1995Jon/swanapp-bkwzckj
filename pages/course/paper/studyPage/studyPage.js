// pages/course/paper/studyPage.js
import api from '../../../../api/api.js';
import request from '../../../../api/request.js';
import common from '../../../../utils/common.js';
var DOMParser = require('../../../../utils/xmldom/dom-parser').DOMParser;
var XMLSerializer = require('../../../../utils/xmldom/dom-parser').XMLSerializer;
var WxParse = require('../../../../utils/wxParse/wxParse.js');
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
      leftBtnImg: '../../../../image/navigation/back.png',
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
    timeshow: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.titlename);
    if (options.titlename == 0) {
      swan.setNavigationBarTitle({
        title: '错题解析'
      });
      this.setData({
        timeshow: true
      });
    }

    var pages = getCurrentPages();
    var page = pages[pages.length - 2];
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    page.setData({
      refresh: true
    });

    bk_userinfo = swan.getStorageSync('bk_userinfo');
    sessionid = app.globalData.default_sessionid;
    uid = app.globalData.default_uid;
    if (bk_userinfo.sessionid != null && bk_userinfo.sessionid != '') {
      sessionid = bk_userinfo.sessionid;
      uid = bk_userinfo.uid;
    }
    courseid = swan.getStorageSync('courseid');
    if (bk_userinfo == undefined || bk_userinfo == null || bk_userinfo == '') {
      this.setData({ showPerfectAccount: 1 });
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
    var paperTitle = decodeURI(options.paperTitle);
    if (paperTitle != undefined) {
      this.setData({ paperTitleStr: paperTitle });
    }
    var paperid = options.paperid;
    var history = options.history;
    // var question = options.question;//decodeURI模拟器可以，真机报错，去掉则相反
    var question = decodeURI(options.question); //decodeURI模拟器报错，真机可以，去掉则相反
    question = JSON.parse(question);
    var learnType = options.learnType;
    // if (history != 1 && history != 2){
    var parentqid;
    var qid;
    // var sublistArr = [];
    // for (var i = 0; i < question.list.length - 1; i++) {
    //   question.list[i]['sublist'] = [];
    //   parentqid = question.list[i].parentqid;
    //   if (parentqid != '' && parentqid != null) {
    //     for (var j = 0; j < question.list.length - 1; j++) {
    //       qid = question.list[j].qid;
    //       if (parentqid == qid) {
    //         sublistArr.push(question.list[i]);
    //         question.list[j].sublist = sublistArr;
    //         // question.list.splice(i);
    //       }
    //     }
    //   }
    // }
    if (question.list != undefined) {
      swan.setNavigationBarTitle({
        title: question.unitname
      });
      for (var i = question.list.length - 1; i >= 0; i--) {
        parentqid = question.list[i].parentqid;
        if (parentqid != undefined && parentqid.length > 0) {
          question.list.splice(i, 1);
        }
      }
    }

    // }

    this.setData({ paperid: paperid });
    this.setData({ learnType: learnType });
    this.setData({ history: history });
    this.setData({ question: question });
    var unitid = options.unitid;
    if (unitid == undefined) {
      unitid = this.data.question.unitid;
    }
    this.setData({ unitid: unitid });
    if (question.list.length > 0) {
      this.setData({ quetypename: question.list[0].quetypename });
      this.setData({ papercount: question.list.length });
      for (var i = 0; i < question.list.length; i++) {
        var data = {
          useranswer: '', //单选选项
          useranswerId: '', //单选选项id
          useranswerIndex: '', //单选index
          useranswerArr: [], //多选选项
          useranswerIdArr: [], //多选选项id
          useranswerIndexArr: [], //多选index
          answer: '', //正确答案选项
          answerId: question.list[i].answer, //正确答案选项id
          extent: '', //难易程度
          stem: '', //题干
          score: question.list[i].score, //分值
          enginnemode: question.list[i].enginnemode, //提醒类型
          isright: question.list[i].isright, //正确与否
          qid: question.list[i].qid, //qid
          answered: 0, //是否已经作答0否1是
          showExplanation: 0, //是否显示解析
          optionArr: [], //当前选项集合
          knowledgepoint: '', //知识点集合
          checkboxBtnShow: false //多选题提交后隐藏按钮
        };
        this.data.answerArr.push(data);
      }
    }

    //history 1历史记录 2解析
    var paperindex = this.data.paperindex;
    var isChildren = 0;
    // if (this.data.mainqueArr[paperindex].branchqueArr != undefined && this.data.mainqueArr[paperindex].branchqueArr.length > 0) {
    //   isChildren = 1;
    // }
    if (history == 1) {
      //是否是历史记录进入
      var lastqid = parseInt(this.data.question.lastqid);
      // console.log('lastqid' + lastqid);
      this.loadquestion(lastqid, 1, isChildren);
      this.setData({ paperindex: lastqid });
    } else {
      //默认加载试卷
      this.loadquestion(paperindex, 1, isChildren);
    }

    if (options.parsingType == 1 || options.parsingType == 2) {
      this.setData({ parsingType: options.parsingType });
      this.onStopHandler(); //停止计时
      this.onlineTimerStopHandler();
      this.logsTimerStopHandler();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

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

    //交卷后不在扣学时
    if (this.data.isAnswer == 1 && this.data.parsingType != 1 && this.data.parsingType != 2) {
      this.onStartHandler(); //计时开始
      this.onlineTimerHandler(); //扣除学时，检查是否同时在线登录
      this.logsTimerHandler(); //刷题日志记录
    }
    var paperindex = this.data.paperindex;
    if (this.data.notecontent.length > 0) {
      this.data.mainqueArr[paperindex].notecontent = this.data.notecontent;
      this.setData({ mainqueArr: this.data.mainqueArr });
    }

    // var paperindex = this.data.paperindex;
    // console.log(this.data.parsingType);
    // //全部解析
    // if (this.data.parsingType == 1) {
    //   for (var i = 0; i < this.data.answerArr.length; i++) {
    //     this.data.answerArr[i].showExplanation = 1;
    //   }
    //   this.data.answerArr[paperindex].showExplanation = 1;
    //   this.setData({ answerArr: this.data.answerArr });
    //   this.setData({ isAnswer: 0 });
    //   return;
    // }
    // // 错题解析
    // if (this.data.parsingType == 2) {
    //   for (var i = this.data.answerArr.length - 1; i >= 0; i--) {
    //     this.data.answerArr[i].showExplanation = 1;
    //     if (this.data.answerArr[i].isright == 1) {
    //       var qid = this.data.answerArr[i].qid;
    //       this.data.answerArr.splice(i, 1);
    //       for (var j = this.data.question.list.length - 1; j >= 0; j--) {
    //         if (qid == this.data.question.list[j].qid) {
    //           this.data.question.list.splice(j, 1);
    //         }
    //       }
    //     }
    //   }
    //   this.data.answerArr[paperindex].showExplanation = 1;
    //   this.setData({ question: this.data.question });
    //   this.setData({ papercount: this.data.question.list.length });
    //   this.setData({ answerArr: this.data.answerArr });
    //   this.setData({ isAnswer: 0 });
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.onStopHandler(); //停止计时
    this.onlineTimerStopHandler();
    this.logsTimerStopHandler();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.onStopHandler(); //停止计时
    this.onlineTimerStopHandler();
    this.logsTimerStopHandler();
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
  parsecontent: function (paperindex) {
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

    //滑动快了，有请求获取失败的情况，继续请求解析，比较暴力
    if (mainque == undefined || mainque.qid == undefined) {
      var question = this.data.question;
      this.loadquestion(paperindex, 1, isChildren);
      return;
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
      this.data.answerArr[paperindex].extent = element;
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
      this.data.answerArr[paperindex].knowledgepoint = mainque.zhishidian[0];
    }
    // 收藏
    var collectstate = mainque.collectstate;
    this.setData({ collectstate: collectstate });

    // 笔记
    var notecontent = mainque.notecontent;
    this.setData({ notecontent: notecontent });

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
  //做题计时器
  onStartHandler: function () {
    if (!interval) {
      interval = setInterval(() => {

        this.setData({ time: this.data.time + 1 });
        this.setData({ displayTime: this.parseTime(this.data.time) });
        //console.log('计时开始' + this.data.displayTime);
      }, 1000);
    }
  },
  //刷题记录日志定时器
  logsTimerHandler: function () {
    var nowDate = new Date();
    var addtime = common.formatTime(nowDate);
    var model;
    var os;
    var resolution;
    swan.getSystemInfo({
      success: function (res) {
        model = res.model;
        os = res.system;
        resolution = res.windowWidth + '*' + res.windowHeight;
      }
    });
    var pageid = common.randomString(32);
    if (!logsTimer) {
      logsTimer = setInterval(() => {
        var data = {
          action: 'shuati',
          module: this.data.learnType,
          courseid: courseid,
          unitid: this.data.unitid,
          paperid: this.data.paperid,
          questionid: this.data.QId,
          addtime: addtime,
          sessionid: sessionid,
          userid: uid,
          from: getApp().globalData.from,
          duration: 10,
          pageid: pageid,
          ip: '',
          os: os,
          browser: '',
          resolution: resolution,
          appname: getApp().globalData.appname,
          appversion: getApp().globalData.appversion,
          appbuild: getApp().globalData.appbuild,
          mobiletype: model
          //防止错误上传日志
        };if (this.data.learnType == undefined || this.data.unitid == undefined || this.data.paperid == undefined || this.data.QId == undefined) {
          return;
        }
        request.request_collectLog(data);
      }, 10000);
    }
  },
  //扣除学时、判断是否同时在线学习定时器
  onlineTimerHandler: function () {
    if (!onlineTimer) {
      onlineTimer = setInterval(() => {
        this.setremainder();
        this.setonline();
      }, 60000);
    }
  },
  //扣除学时
  setremainder: function () {
    api.setremainder({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.learnType,
        times: 60,
        market: app.globalData.market
      },
      success: res => {
        var data = res.data;

        if (data.errcode == 0) {
          //不处理
        } else if (data.errcode == -1) {
          //60分钟免费试用时间已经用完,无法继续观看！
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            confirmText: "立即购买",
            cancelText: "残忍拒绝",
            success: function (res) {
              if (res.confirm) {
                swan.navigateTo({
                  url: '../../buyCourseNew'
                });
              } else {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        } else if (data.errcode == -2) {
          //您的学时已经用完，无法继续学习，请联系学习顾问加时！
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        }
      }
    });
  },
  //判断是否同时在线学习
  setonline: function () {
    api.setonline({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        type: this.data.learnType
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          //
        } else if (data.errcode == 40057) {
          //您的账号在其他地方登录学习，您将被迫退出
          this.onlineTimerStopHandler(); //停止扣学时
          swan.showModal({
            title: '温馨提示',
            content: data.errmsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                var pages = getCurrentPages();
                var num = pages.length;
                swan.navigateBack({
                  delta: num
                });
              }
            }
          });
        }
      }
    });
  },
  parseTime: function () {
    var hh = parseInt(this.data.time / 60 / 60);
    if (hh < 10) hh = '0' + hh;

    var mm = parseInt(this.data.time / 60 % 60);
    if (mm < 10) mm = '0' + mm;
    var ss = parseInt(this.data.time % 60);
    if (ss < 10) ss = '0' + ss;
    // var ssss = parseInt(this.data.time % 100);
    // if(ssss<10) ssss = '0'+ssss;
    // return `${mm}:${ss}:${ssss}`
    if (hh > 0) {
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  },

  onStopHandler: function () {
    console.log('stop');
    if (interval) {
      clearInterval(interval);
      interval = null;
    } else {
      this.setData({
        time: 0,
        displayTime: '00:00'
      });
    }
  },
  logsTimerStopHandler: function () {
    console.log('logsTimer stop');
    if (logsTimer) {
      clearInterval(logsTimer);
      logsTimer = null;
    }
  },
  onlineTimerStopHandler: function () {
    console.log('onlineTimer stop');
    if (onlineTimer) {
      clearInterval(onlineTimer);
      onlineTimer = null;
    }
  },
  //swiper滑动
  handleChange: function (e) {
    var current = e.detail.current;
    // if (current != 0 && current != this.data.papercount){
    // console.log(this.data.question.list[current].quetypename);
    this.setData({ branchqueIndex: -1 });
    this.setData({ quetypename: this.data.question.list[current].quetypename });
    var clientWidth = this.data.clientWidth;
    // console.log('current' + current + '' + this.data.paperindex);
    //试题数组中获取为空逻辑操作
    this.parsecontent(current);
    var isChildren = 0;
    var question = this.data.question;
    if (this.data.branchqueIndex != -1 && this.data.mainqueArr[current].branchqueArr != undefined && this.data.mainqueArr[current].branchqueArr.length > 0) {
      isChildren = 1;
    }
    if (current < this.data.mainqueArr.length - 1) {
      if (this.data.mainqueArr[current + 1].qid == undefined) {
        this.loadquestion(current + 1, 0, isChildren);
      }
      if (current - 1 >= 0 && this.data.mainqueArr[current - 1].qid == undefined) {
        this.loadquestion(current - 1, 0, isChildren);
      }
    }
    this.setData({ paperindex: current });
    checkboxIsSubmit = false;
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
    this.saveAnswerInfo(1);
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

    if (checkboxIsSubmit == true) {
      this.saveAnswerInfo(2);
    }
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
    this.saveAnswerInfo(2);
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
  // handlerMove: function (e) {
  //   console.log(e);
  // },
  // handlerCancel: function (e) {
  //   console.log(e);
  // },
  handlerEnd: function (e) {
    //解析不在响应事件跳转
    if (this.data.history == 2) {
      return;
    }
    var pageX = e.changedTouches[0].pageX;
    //滑动到最后页显示答题卡
    if (this.data.paperindex == this.data.papercount - 1 && beginPagex - pageX > 70) {
      var state = 1; //是否已做完试题
      var scoreTotal = 0;
      var rightScoreTotal = 0;
      for (var i = 0; i < this.data.mainqueArr.length; i++) {
        scoreTotal = scoreTotal + parseInt(this.data.mainqueArr[i].fenzhi);
      }
      for (var i = 0; i < this.data.answerArr.length; i++) {
        rightScoreTotal = rightScoreTotal + parseInt(this.data.answerArr[i].score);
        if (this.data.answerArr[i].answered == 0) {
          state = 0;
        }
      }
      var accuracy = rightScoreTotal / scoreTotal * 100; //提交正确率（当前得分 / 试卷总分
      var submitPaperBtnHidden = this.data.submitPaperBtnHidden;
      var url;
      //交卷后直接显示答题报告
      if (submitPaperBtnHidden == false || submitPaperBtnHidden == "false") {
        url = '../answerCard/answerCard?answerArr=' + JSON.stringify(this.data.answerArr) + '&paperid=' + this.data.question.paperid + '&state=' + state + '&accuracy=' + accuracy + '&submitPaperBtnHidden=' + this.data.submitPaperBtnHidden + '&unitid=' + this.data.unitid + '&learnType=' + this.data.learnType + '&paperTitle=' + this.data.paperTitleStr;
      } else {
        //显示答题卡
        url = '../report/report?paperid=' + this.data.question.paperid + '&unitid=' + this.data.unitid + '&learnType=' + this.data.learnType + '&prevPage=2';
      }
      // console.log('url=' + url);
      url = url.replace(/%/g, '%25');
      swan.navigateTo({
        url: encodeURI(url)
      });
    }
  },
  //保存试题答案
  saveAnswerInfo: function (enginemode) {
    //提交答案组装数据 区分单选多选
    var paperindex = this.data.paperindex;
    var question = this.data.question;
    var answer;
    // if (enginemode == 4){

    // }else{
    //   answer = this.data.answerArr[paperindex];
    // }
    answer = this.data.answerArr[paperindex];
    var accuracy = 0;
    if (answer.isright == 1) {
      accuracy = 1 / question.list.length * 100;
    }
    var rightnum = 0;
    var wrongnum = 0;
    for (var i = 0; i < this.data.answerArr.length; i++) {
      if (this.data.answerArr[i].answered == 1 && this.data.answerArr[i].isright == 1) {
        rightnum++;
      } else if (this.data.answerArr[i].answered == 1 && this.data.answerArr[i].isright == 2) {
        wrongnum++;
      }
    }
    var time = this.data.time;
    var wastetime = time - this.data.wastetime;
    this.setData({ wastetime: wastetime });
    var useranswer;
    var letter;
    if (enginemode == 1) {
      useranswer = answer.useranswerId;
      letter = answer.answer;
    } else if (enginemode == 2) {
      useranswer = answer.useranswerIdArr.toString();
      letter = answer.answer;
    } else if (enginemode == 4) {
      var branchqueIndex = parseInt(this.data.branchqueIndex) + 1;
      useranswer = this.data.answerArr[paperindex].branchAnswerArr[branchqueIndex].textarea.toString();
      letter = '';
    }

    var data = {
      unitid: this.data.unitid,
      paperid: this.data.paperid,
      qid: this.data.QId,
      wastetime: wastetime,
      useranswer: useranswer,
      letter: letter,
      isright: answer.isright,
      score: answer.score,
      rightnum: rightnum,
      wrongnum: wrongnum,
      accuracy: accuracy + '%',
      totalwastetime: time,
      kaoqi: question.kaoqi,
      type: this.data.learnType,
      suff: question.suff,
      lastqid: paperindex
    };
    request.request_saveAnswerInfo(data);
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
  paperVideoPlay: function (event) {
    var index = event.currentTarget.dataset.index;
    var videocode = this.data.answerArr[index].knowledgepoint.videocode;
    var videoUrl = encodeURI(videocode);
    var knowpointcode;
    if (this.data.mainqueArr[index].zhishidian != undefined) {
      knowpointcode = this.data.mainqueArr[index].zhishidian[0].knowpointcode;
    }
    videoUrl = videoUrl.replace("http://", "https://");
    var url = '../videoPlayer/videoPlayer?videoUrl=' + encodeURIComponent(videoUrl) + '&channelnumber=' + knowpointcode;
    swan.navigateTo({
      url: url
    });
  },
  bindAccount: function () {
    var url = '../../../me/bind/bind';
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
    if (branchqueIndex == -1) {
      this.saveAnswerInfo(4);
    } else {
      this.saveAnswerInfo(4);
    }
  },
  answerCardClick: function () {
    var state = 1; //是否已做完试题
    var scoreTotal = 0;
    var rightScoreTotal = 0;
    for (var i = 0; i < this.data.mainqueArr.length; i++) {
      scoreTotal = scoreTotal + parseInt(this.data.mainqueArr[i].fenzhi);
    }
    for (var i = 0; i < this.data.answerArr.length; i++) {
      rightScoreTotal = rightScoreTotal + parseInt(this.data.answerArr[i].score);
      if (this.data.answerArr[i].answered == 0) {
        state = 0;
      }
    }
    var accuracy = rightScoreTotal / scoreTotal * 100; //提交正确率（当前得分 / 试卷总分
    var submitPaperBtnHidden = this.data.submitPaperBtnHidden;
    var url;
    var answerArrTemp = this.data.answerArr;

    for (var a = 0; a < answerArrTemp.length; a++) {
      for (var b = 0; b < answerArrTemp[a].optionArr.length; b++) {
        var optionTitle = answerArrTemp[a].optionArr[b].optionTitle;
        answerArrTemp[a].optionArr[b].optionTitle = this.delHtmlTag(optionTitle);
      }
    }
    url = '../answerCard/answerCard?answerArr=' + JSON.stringify(answerArrTemp) + '&paperid=' + this.data.question.paperid + '&state=' + state + '&accuracy=' + accuracy + '&submitPaperBtnHidden=' + this.data.submitPaperBtnHidden + '&unitid=' + this.data.unitid + '&learnType=' + this.data.learnType + '&paperTitle=' + this.data.paperTitleStr;
    swan.navigateTo({
      url: encodeURI(url)
    });
  },
  starClick: function () {
    var paperindex = this.data.paperindex;
    var state = 0;
    var msg = '';
    if (this.data.mainqueArr[paperindex].collectstate == 1) {
      state = 0;
      msg = "取消收藏成功";
    } else {
      state = 1;
      msg = "收藏成功";
    }

    api.collect({
      methods: 'POST',
      data: {
        sessionid: sessionid,
        uid: uid,
        courseid: courseid,
        unitid: this.data.unitid == 'undefined' ? 0 : this.data.unitid,
        qid: this.data.QId,
        state: state,
        type: this.data.learnType
      },
      success: res => {
        var data = res.data;
        if (data.errcode == 0) {
          this.data.mainqueArr[paperindex].collectstate = state;
          this.setData({ mainqueArr: this.data.mainqueArr });
          swan.showModal({
            title: '温馨提示',
            content: msg,
            confirmText: "确定",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {}
            }
          });
        }
      }
    });
  },
  noteClick: function () {
    var data = {
      sessionid: sessionid,
      uid: uid,
      courseid: courseid,
      unitid: this.data.unitid == 'undefined' ? 0 : this.data.unitid,
      qid: this.data.QId,
      notecontent: this.data.notecontent,
      learnType: this.data.learnType
    };
    swan.navigateTo({
      url: '../note/note?data=' + JSON.stringify(data)
    });
  },
  actioncnt: function () {
    swan.showActionSheet({
      itemList: ['中途退出', '已经完成'],
      success: function (res) {
        console.log(res.tapIndex);
      },
      fail: function (res) {
        console.log(res.errMsg);
      }
    });
    return;
  },
  delHtmlTag: function (str) {
    return str.replace(/<[^>]+>/g, ""); //去掉所有的html标记
  },
  leftBtnClick: function () {
    swan.navigateBack({});
  }
});