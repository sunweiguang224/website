/**
 * 模块功能: js与native交互模块
 * 模块目标: 本模块要封装app2.4.0之后为前端提供的所有native接口
 * 文档地址: http://wiki.bravetime.net/pages/viewpage.action?pageId=8192341
 */
import ua from './ua';
import config from '../config.js';

// 默认标题栏
const defaultInitHead = {
  showHead: 1,    // 是否展示头部
  backOnHead: 1,  // 头部返回按钮
  homeOnHead: 0,  // 头部首页按钮
  shareOnHead: 0, // 头部分享按钮
  btnOnHead: 0,   // 头部文字按钮
  btnText: '',    // 头部文字按钮文字
  btnLink: '',    // 头部文字按钮链接
  showFoot: 0     // 是否展示底部
};


// 默认标题栏
const defaultSetHead = {
  title: '',
  backBtn: '1',     // 0表示头部不展示返回按钮，1表示展示
  homeBtn: '0',     // 0表示头部不展示首页按钮，1表示展示
  shareBtn: '0',    //0表示头部不展示分享按钮，1表示展示
  shareMoney: '',    //0表示分享佣金为0不显示分享赚钱按钮，非0：展示分享赚钱按钮，在3.9.1之前用该字段
  shareMoneyStr: '',   //在3.9.1中会用该字段
  rightBtn: {
    text: '',
    textColor: '#ff4a7d',
    action: ''
  },
};

/**
 * 功能: 拼接调用native的通信协议(核心方法)
 * 用法:
 * call({
      v: '3.1.0',
      host: 'Browser',
      action: 'open',
      param: param,
    });
 */
function getProtocal(param = {}) {
  // 参数默认值
  param.param.success = param.param.success || function () {
    };
  param.param.error = param.param.error || function () {
    };
  // 回调名称
  let callbackName = `native_callback_${Math.random().toString().split('.')[1]}`;
  // 设置全局回调
  window[callbackName] = function (response) {
    // 多数native接口执行成功时response.code就会返回'1',执行失败时就会返回'0'。
    // 此处返回'1'时候正常回调success,但返回不等于'1'时一律执行error。
    // 如此一来,诸如Account.login这样的返回'0'|'1'|'2'的接口就可以处理'0'|'1'以外的情况了(在error中判断response === '0'|'2'|'3'|'4'|...)。
    if (response.code == '1') {
      param.param.success(response);
    } else {
      param.param.error(response);
    }
    // 执行完回收
    window[callbackName] = null;
  };

  // 拼接唤起native协议
  let protocal = `davdian:\/\/call.${param.host}.com?action=${param.action}&params=${encodeURIComponent(JSON.stringify(param.param))}&callback=${callbackName}&minv=${param.v}`;
  // alert(protocal)
  return protocal;
}

/**
 * 功能: 端内调用app
 * 用法:
 * call({
      v: '3.1.0',
      host: 'Browser',
      action: 'open',
      param: {},
    });
 */
function innerCall(param = {}) {
  // 不在app中,直接返回
  if (!ua.isDvdApp()) return;
  // 参数检查
  if (!param.host || !param.action || !param.v) {
    throw new Error('参数不全');
  }
  // 参数默认值
  param.invalid = param.invalid || function () {
    console.trace();
      alert("请升级您的APP");
    };

  // 当前版本高于指定版本,可以调用native,否则进行提示
  if (ua.compareVersion(ua.getDvdAppVersion(), param.v) >= 0) {
    // 客户端端内调用协议
    let protocal = getProtocal(param);

    // 打印协议
    console.log(protocal);

    // logger
    console.log(`location.href方式唤起native,协议为: ${protocal}`);

    // 调用native
    console.log(protocal)
    location.href = protocal;
  } else {
    // 版本错误提示
    param.invalid();
  }
}

/**
 * 功能: 端外调用app(唤起后再执行app接口)
 * 用法:
 * call({
      v: '3.1.0',
      host: 'Browser',
      action: 'open',
      param: {
        invoke: true,
        ...
      },
    });
 */
function outerCall(param = {}) {
  // 在app中,直接返回
  if (ua.isDvdApp()) return;

  // 端内调用协议
  let protocal = getProtocal(param);

  if (ua.isAndroid()) {
    // 端外唤起协议
    let outerProtocal = `davdian://invoke.davdian.com?cmd=${encodeURIComponent(protocal)}`;

    // 打印协议
    console.log(outerProtocal);

    // 唤起app
    location.href = outerProtocal;

    // 兜底跳转下载页
    setTimeout(function () {
      location.href = `//a.app.qq.com/o/simple.jsp?pkgname=com.davdian.seller`;
    }, 3000);
  } else if (ua.isIos()) {
    // let env = /(davdian\.com|vyohui\.cn|bravetime\.net)/.exec(location.href)[0];

    // 端外唤起协议
    let outerProtocal = `//invoke.davdian.com?cmd=${encodeURIComponent(protocal)}`;

    // 打印协议
    console.log(outerProtocal);

    // alert(protocal)
    // alert(outerProtocal);

    // 唤起app
    location.href = outerProtocal;
  }
}

/**
 * 功能: 调用native(核心方法)
 * 用法:
 * call({
      v: '3.1.0',
      host: 'Browser',
      action: 'open',
      param: {
        invoke: true,
        ...
      },
    });
 */
function call(param = {}) {
  // 如果param.param.invoke为真,需要先唤起native再执行cmd
  if (param.param.invoke) {
    delete param.param.invoke;
    outerCall(param);
  } else {
    innerCall(param);
  }
}

const native = {
  /****************************** 1、账户相关 ******************************/
  Account: {
    /**
     * 功能: 登录
     * 用法:
     * native.Account.login()
     */
    login(param = {}) {
      call({
        v: '2.4.0',
        host: 'Account',
        action: 'login',
        param: param
      });
    },
  },

  /****************************** 2、直播相关 ******************************/
  LiveVideo: {
    /**
     * 功能: 跳转直播只有当App未启动，或处于首页4个tab页面时（即首页上未盖住其他页面的情况）才进行跳转，否则不进行跳转，以防止出现无法预期的异常情况
     * 用法:
     * native.LiveVideo.goTab({
        userId: "用户Id",
      })
     */
    goTab(param = {}) {
      call({
        v: '2.4.0',
        host: 'LiveVideo',
        action: 'goTab',
        param: param
      });
    },

    /**
     * 功能: 进入某个直播间isPlaying决定客户端在获取到状态为回顾时，是否需要提示；fromPush用来决定如何提示用户（推送和普通流程不同）
     * 用法:
     * native.LiveVideo.enterRoom({
       "liveId" : "房间号",
       "isPlaying":"1/2/3" ,// 1表示直播中，2是回放，3是整理中
       "fromPush":"0/1" // 0表示不来自于推送，1表示来自推送
      })
     */
    enterRoom(param = {}) {
      call({
        v: '2.5.0',
        host: 'LiveVideo',
        action: 'enterRoom',
        param: param
      });
    },

    /**
     * 功能: 进入直播申请页，若已有进行中申请，则显示申请进度（审核中或审核被拒绝）
     * 用法:
     * native.LiveVideo.applyVideoLive()
     */
    applyVideoLive(param = {}) {
      call({
        v: '2.5.0',
        host: 'LiveVideo',
        action: 'applyVideoLive',
        param: param
      });
    },

    /**
     * 功能: 展示直播申请结果
     * 用法:
     * native.LiveVideo.showApplyResult({
        "result":"0/1" // 0表示未通过，1表示通过
      })
     */
    showApplyResult(param = {}) {
      call({
        v: '2.5.0',
        host: 'LiveVideo',
        action: 'showApplyResult',
        param: param
      });
    },

    /**
     * 功能: 进入某个话题列表
     * 用法:
     * native.LiveVideo.openTopicVideoList({
        "type":"video/voice",//video:视屏直播，voice:语音回顾
        "name":"话题标题" ,
        "ID":"话题ID"
      })
     */
    openTopicVideoList(param = {}) {
      call({
        v: '2.7.0',
        host: 'LiveVideo',
        action: 'openTopicVideoList',
        param: param
      });
    },

    /**
     * 功能: 进入全部话题列表
     * 用法:
     * native.LiveVideo.openTopicList()
     */
    openTopicList(param = {}) {
      call({
        v: '2.7.0',
        host: 'LiveVideo',
        action: 'openTopicList',
        param: param
      });
    },

    /**
     * 功能: 进入某个话题列表
     * 用法:
     * native.LiveVideo.openTopicVideoList({
        "type":"video/voice",//video:视屏直播，voice:语音回顾
        "name":"话题标题" ,
        "ID":"话题ID"
      })
     */
    openTopicVideoList(param = {}) {
      call({
        v: '2.7.0',
        host: 'LiveVideo',
        action: 'openTopicVideoList',
        param: param
      });
    },

    /**
     * 功能: 进入视频精选直播列表
     * 用法:
     * native.LiveVideo.openEssenceList({
        "banner":"是否显示banner",//0：不获取（默认）1：获取\\
        "getTopicList":"是否获取话题列表(1：获取)"\\
      })
     */
    openEssenceList(param = {}) {
      call({
        v: '3.4.0',
        host: 'LiveVideo',
        action: 'openEssenceList',
        param: param
      });
    },
  },

  /****************************** 3、用户信息 ******************************/
  PersonInfo: {
    /**
     * 功能: 查看(大V课讲师的)个人主页
     * 用法:
     * native.PersonInfo.showPersonHome({
        userId: "用户Id",
      })
     */
    showPersonHome(param = {}) {
      call({
        v: '2.5.0',
        host: 'PersonInfo',
        action: 'showHomePage',
        param: param
      });
    },
  },


  /****************************** 4、浏览 ******************************/
  Browser: {
    /**
     * 功能: 打开新的webview
     * 用法:
     * native.Browser.open({
        url: 'http://18514008282.vyohui.cn/',
      });
     */
    open(param = {}){
      call({
        v: '2.5.0',
        host: 'Browser',
        action: 'open',
        param: param
      });
    },

    /**
     * 功能: 关闭当前webview
     * 用法:
     * native.Browser.close();
     */
    close(param = {}){
      call({
        v: '2.5.0',
        host: 'Browser',
        action: 'close',
        param: param
      });
    },

    /**
     * 功能: 设置native头部标题栏
     * 用法:
     * native.Browser.setHead({
        'title' : '修改后的标题',
        'backBtn' : '0/1', // 0表示头部不展示返回按钮，1表示展示
        'homeBtn' : '0/1', // 0表示头部不展示首页按钮，1表示展示
        'shareBtn' : '0/1', //0表示头部不展示分享按钮，1表示展示
        'shareMoney' : '分享获得返现数', //0表示分享返现为0不显示分享赚钱按钮，非0：展示分享赚钱按钮，在3.9.1之前用该字段
        'shareMoneyStr':'分享获取返现数显示的字符串',//在3.9.1中会用该字段
        'rightBtn' : {
          'text' : '头部右部展示的文字按钮文字',        
          'textColor':'头部右部按钮文字颜色',
          'action' : '文字按钮需要执行的JS'
        }
      })
     */
    setHead(param = {}) {
      call({
        v: '2.6.0',
        host: 'Browser',
        action: 'setHead',
        param: param
      });
    },

    /**
     * 功能: 初始化native头部标题栏
     * 用法:
     * native.Browser.initHead({
          content: JSON.stringify({
            showHead: 1,
            showFoot: 0,
            backOnHead: 1,
            homeOnHead: 0,
            shareOnHead: 0,
            btnOnHead: 0,
            btnText: "",
            btnLink: ""
          })
        }
     })
     */
    initHead(param = {}) {
      call({
        v: '3.4.0',
        host: 'Browser',
        action: 'initHead',
        param: param
      });
    },

    /**
     * app支付
     * 用法:
     * native.Browser.pay({
        "url": "目标地址", "pay_type": "1", //payType的值为0则为默认1为组团参与者，2为组团发起者。
        "pay_id": "123456",//支付ID
        "sign": "abdsdfsdfasfda"
        "platform": "0",//直接调用支付平台，0：直接调用微信支付，1：直接调用支付宝支付。
      });
     */
    pay(param = {}) {
      call({
        v: '3.1.0',
        host: 'Browser',
        action: 'pay',
        param: param
      });
    },

    /**
     * 功能: 添加订单选择身份证
     * 用法:
     * native.Browser.selectIdentity({
        cardName: ''
      })
     */
    selectIdentity(param = {}) {
      call({
        v: '3.7.0',
        host: 'Browser',
        action: 'selectIdentity',
        param: param
      });
    },

    /**
     * 功能: APP中点击图片显示大图
     * 用法:
     * native.Browser.selectIdentity({
        cardName: ''
      })
     */
    showBigImage(param = {}) {
      call({
        v: '4.1.0',
        host: 'Browser',
        action: 'showBigImage',
        param: param
      });
    },
    showWebHeight(param = {}){
      call({
        v: '4.2.0',
        host: 'Browser',
        action: 'showWebHeight',
        param: param
      });
    },
    goNativeHomePage(param = {}){
      call({
        v: '4.2.0',
        host: 'Browser',
        action: 'goNativeHomePage',
        param: param
      });
    }
  },


  /****************************** 5、购物车 ******************************/
  ShopCart: {
    /**
     * 功能: 商品加入购物车
     * 用法:
     * native.ShopCart.open({
        "goodsID" : "商品ID",
        "cout" : "商品数量"
      });
     */
    addGoodsToShopCart(param = {}){
      call({
        v: '2.6.0',
        host: 'ShopCart',
        action: 'addGoodsToShopCart',
        param: param
      });
    },
  },


  /****************************** 6、发现社区 ******************************/
  Community: {
    /**
     * 功能: 打开发现社区
     * 用法:
     * native.Community.openCommunity(;
     */
    openCommunity(param = {}){
      call({
        v: '3.1.0',
        host: 'Community',
        action: 'openCommunity',
        param: param
      });
    },
  },

  /****************************** 7、share分享 ******************************/
  Share: {
    /**
     * 分享卡
     * 用法:
     * native.Share.shareInfo({
        "show":"是否显示下方shareView",//0：不显示，1：显示。
        "shareType":"是否只分享图片"，//0：分享图文链接方式，1：只分享图片 （支持图片分享的分享图片、不支持分享图文链接（需要传tilte、desc、link、imgUrl））。
        "sharePlatform":"分享方式",//0：微信朋友圈，1：微信好友，2：QQ好友，3：QQ空间，4：短信，5：复制功能。
        "shareTitle":"底部特殊分享标题",
        "shareDesc":"底部特殊分享描述",
        "title":"分享标题",
        "desc":"分享内容描述",
        "link":"分享链接',
        "imgUrl":"分享图片链接",
        "bigImageUrl":"只分享图片：大图片链接",
        "shareSource":"分享统计的shareSource", //h5分享为15或者没有这个字段，原生的一定要传根据分享列表传值http://wiki.bravetime.net/pages/viewpage.action?pageId=15106888
      })
     */
    shareInfo(param = {}) {
      call({
        v: param.v || '3.3.0',
        host: 'Share',
        action: 'shareInfo',
        param: param,
      });
    },

    /**
     * 分享卡
     * 用法:
     * native.Share.share({
        courseId: '直播ID',
      })
     */
    shareCard(param = {}) {
      call({
        v: '3.4.0',
        host: 'Share',
        action: 'cardShare',
        param: param,
      });
    },

    /**
     * 素材分享
     * 用法:
     * native.Share.materialShare({
        "pageId":"素材分享页id"
      })
     */
    materialShare(param = {}) {
      call({
        v: '3.6.0',
        host: 'Share',
        action: 'materialShare',
        param: param,
      });
    },
  },

  /****************************** 8、语音直播相关 ******************************/
  VoiceLive: {
    /**
     * 功能: 打开语音直播介绍页
     * 用法:
     * native.VoiceLive.openVoiceIntro({
        "courseId":"语音直播间id",//语音直播间id，根据courseId去请求得到加载网址。
        "fromPush":"判断是否未推送",//0:代表非推送打开，1：推送打开 。
        "messageType":"推送消息类型",//只有判断为推送消息才会解析该参数 1：语音直播即将开始消息，2:语音直播问题被回答消息；
      });
     */
    openVoiceIntro(param = {}) {
      call({
        v: '3.4.0',
        host: 'VoiceLive',
        action: 'openVoiceIntro',
        param: param
      });
    },

    /**
     * 功能: 打开老师信息页
     * 用法:
     * native.VoiceLive.openTeacherHome({
        "teacherId" : "老师ID"
      });
     */
    openTeacherHome(param = {}) {
      call({
        v: '3.4.0',
        host: 'VoiceLive',
        action: 'openTeacherHome',
        param: param
      });
    },

    /**
     * 功能: 进入直播间
     * 用法:
     * native.VoiceLive.enterVoiceRoom({
        "courseId": "语音直播间id"
      });
     */
    enterVoiceRoom(param = {}) {
      call({
        v: '3.4.0',
        host: 'VoiceLive',
        action: 'enterRoom',
        param: param
      });
    },

    /**
     * 功能: 进入全部课程列表
     * 用法:
     * native.VoiceLive.enterCourseList();
     */
    enterCourseList(param = {}) {
      call({
        v: '3.7.0',
        host: 'VoiceLive',
        action: 'enterCourseList',
        param: param
      });
    },

    /**
     * 功能: 进入语音直播
     * 用法:
     * native.VoiceLive.enterOldVoiceLiveRoom({
         "liveId": "149",//直播id
         "title": "著名亲子教育专家 卢洪波：孩子贪玩，我该怎么办？",//标题
         "status": "4",//状态（2：直播结束前 3：直播整理中 4：直播回顾）
         "intro": "分享时间:2016年07月18日（周一）14:00-15:00　　分享内容:　　很多父母一直处于困惑纠结中，孩子小的时候，父母想尽一切办法教TA玩，但是孩子从上幼儿园开始，父母开始限制TA玩，上小学后，几乎就不允许玩，然后就会发现孩子是想尽一切办法在找时间偷着玩：听课时，因为没有玩具，玩手指头；写作业时，趁着思考的间隙，玩转笔；走路时，没有足球，踢石头子......家长挂在嘴边上的话又多了一句“别玩，好好学习”“别玩，快写！”“别玩，好好走路”等等。　　　　作为父母，我们是怎么认识玩的呢？孩子的成长是否需要玩呢？到底应该让孩子玩什么，怎么玩呢？在玩中，应该培养哪些优秀好好学习”“别玩，快写！”“别玩，好好走路”等等。　　　　作为父母，我们是怎么认识玩的呢？孩子的成长是否需要玩呢？到底应该让孩子玩什么，怎么玩呢？在玩中，应该培养哪些优秀\345\223品质呢？如何实现在玩中学，学中玩的理想教育呢？PS:&nbsp;&nbsp;在大V店APP里预约听课，可以立即向分享老师提问哦！听课指南："(需要将/n、/r替换为//n、//r),//课程简介、分享描述内容
         "smallImageUrl": "http://pic.davdian.com/free/2016/07/01/320_320_d9c182776612fe1f3243b763dcf9a1b5.jpg",//分享显示图片
         "reviewUrl": "/index.php?m=default&c=live&a=liveinfo&id=149",//回顾网页
         "shareUrl": "/index.php?m=default&c=live&a=liveinfo&id=149"//分享的链接
       });
     */
    enterOldVoiceLiveRoom(param = {}) {
      call({
        v: '3.7.0',
        host: 'VoiceLive',
        action: 'enterOldVoiceLiveRoom',
        param: param
      });
    },
    /**
     * 功能: 进入全部笔记页面
     * 用法:
     * native.VoiceLive.callAppEnterAllNote()
     });
     */
    callAppEnterAllNote(param = {}) {
      call({
        v: '3.9.2',
        host: 'VoiceLive',
        action: 'openCourseCommentList',
        param: param
      });
    },
    /**
     * 功能: 进入写笔记页面
     * 用法:
     * native.VoiceLive.callAppEnterWriteNote()
     });
     */
    callAppEnterWriteNote(param = {}) {
      call({
        v: '4.1.0',
        host: 'VoiceLive',
        action: 'openCourseNoteEdit',
        param: param
      });
    },
  },


  /****************************** 9、社群 ******************************/
  CommunityChat: {
    /**
     * 功能: 打开社群
     * 用法:
     * native.CommunityChat.enterCommunityChat();
     */
    enterCommunityChat(param = {}) {
      call({
        v: '3.8.0',
        host: 'CommunityChat',
        action: 'enterCommunityChat',
        param: param
      });
    },

    /**
     * 功能: 打开社群成员列表
     * 用法:
     * native.CommunityChat.enterCommunityMemberList({
        "communityId" : "社群id"
      });
     */
    enterCommunityMemberList(param = {}) {
      call({
        v: '3.8.0',
        host: 'CommunityChat',
        action: 'enterCommunityMemberList',
        param: param
      });
    },
  },

  /****************************** 10、搜索相关 ******************************/
  Search: {
    /**
     * 功能: 进入商品搜索结果页
     * 用法:
     * native.Search.enterGoodsSearchResult({
        "name" : "书包"
      });
     */
    enterGoodsSearchResult(param = {}) {
      call({
        v: '3.9.0',
        host: 'Search',
        action: 'enterGoodsSearchResult',
        param: param
      });
    },
  },

  /****************************** 11、H5触发cmd命令 ******************************/
  BrowserTouch: {
    /**
     * 功能: H5触发cmd客户端实现回到上一级页面
     * 用法:
     * native.BrowserTouch.goBackToRootPage();
     */
    goBackToRootPage(param = {}) {
      call({
        v: '3.9.0',
        host: 'BrowserTouch',
        action: 'goBackToRootPage',
        param: param
      });
    },
    /**
     * 功能: H5触发cmd客户端复制文案到剪切板
     * 用法:
     * native.BrowserTouch.copyText();
     */
    copyText(param = {}){
      call({
        v: '4.2.0',
        host: 'BrowserTouch',
        action: 'copyText',
        param: param
      })
    }
  },
  /****************************** 12、H5触发cmd命令 ******************************/
  Common: {
    /**
     * 功能: H5触发cmd客户端实现回到上一级页面
     * 用法:
     * native.Common.log();
     */
    log(param = {}) {
      call({
        v: '4.1.0',
        host: 'Common',
        action: 'log',
        param: param
      });
    },
  },

  /****************************** 13、音频command命令 ****************************/
  Audio: {
    /**
     * 功能: H5触发cmd客户端实现回到上一级页面
     * 用法:
     * native.Audio.goAudioDetail();
     */
    goAudioDetail(param = {}) {
      call({
        v: '5.0.0',
        host: 'Audio',
        action: 'goAudioDetail',
        param: param
      });
    },
    /**
     * 功能: H5触发cmd客户端播放暂停音频
     * 用法:
     * native.Audio.audioPlay();
     */
    audioPlay(param = {}){
      param.sortNo=param.sortNo.toString();
      param.albumId=param.albumId.toString();
      call({
        v: '5.0.0',
        host: 'Audio',
        action: 'audioPlay',
        param: param
      })
    },
    /**
     * 功能: H5触发cmd客户端回调js告诉我们正在播放是哪一条
     * 用法:
     * native.Audio.audioLocation();
     */
    audioLocation(param = {}){
      call({
        v: '5.0.0',
        host: 'Audio',
        action: 'audioLocation',
        param: param
      })
    },
    /**
     * 功能: H5触发cmd客户端回调js告诉我们上次听到了那一条
     * 用法:
     * native.Audio.audioLocation();
     */
    audioPlayHistory(param = {}){
      call({
        v: '5.0.0',
        host: 'Audio',
        action: 'audioPlayHistory',
        param: param
      })
    },
    /**
     * 功能:H5触发cmd客户端订阅某个音频
     * 用法:
     * native.Audio.audioSubscription();
     */
    audioSubscription(param = {}){
      call({
        v: '5.0.0',
        host: 'Audio',
        action: 'audioSubscription',
        param: param
      })
    }
  },


  /****************************** 自定义便捷接口 ******************************/
  custom: {
    /**
     * 功能: 设置native分享信息
     * 用法:
     * native.custom.setShareInfo({
        title: '大V店组团包邮', // 分享标题
        desc: '一件包邮！每天上新！好货低价又包邮，抢到了就赚翻啦', // 分享描述
        link: location.href, // 分享链接
        imgUrl: 'http://pic.davdian.com/free/2016/04/09/320_320_0fc3e0dbbadd249b7f1b93a525f0adf0.jpg', // 分享图标
      });
     */
    setShareInfo(param = {}){
      // 参数合并
      param = $.extend({}, config.defaultShareInfo, param);

      // 参数处理
      param.imgUrl.replace("https", "http");

      // 注册全局方法供native调用
      window.iosInterface = window.iosInterface || {};
      window.iosInterface.getShareInfo = function () {
        return JSON.stringify(param);
      };
    },

    /**
     * 功能: 注册事件回调,webview返回当前页面时执行。
     * 背景: ios3.9.1之后采用WKWebView,返回当前页面时不会自动刷新页面,但ios会回调js全局方法。
     * 用法:
     * native.custom.onWebviewBack({
        callback: function () {
          location.reload();
        }
      });
     */
    onWebviewBack(param = {}){
      // 参数处理
      param.callback = param.callback || function () {
          location.reload();
        };

      // 注册全局方法供native调用
      window.iosInterface = window.iosInterface || {};
      let nativeWebviewBack = window.iosInterface.nativeWebviewBack;
      window.iosInterface.nativeWebviewBack = function () {
        nativeWebviewBack && nativeWebviewBack();
        param.callback();
      };
    },

    /**
     * 功能: 初始化native头部标题栏
     * 用法:
     * native.Browser.initHead({
        showHead: 1,
        showFoot: 0,
        backOnHead: 1,
        homeOnHead: 0,
        shareOnHead: 0,
        btnOnHead: 0,
        btnText: "",
        btnLink: ""
      })
     */
    initHead(param = {}) {
      // 参数合并
      param = $.extend({}, defaultInitHead, param);

      // 调用Browser.initHead接口
      native.Browser.initHead({
        content: param
      });
    },

    /**
     * 功能: 初始化native头部标题栏
     * 用法:
     * native.custom.initHead()
     */
    setHead(param = {}) {
      // 参数合并
      param = $.extend({}, defaultSetHead, param);

      // 调用Browser.setHead接口
      native.Browser.setHead(param);
    },

    /**
     * 功能: 分享
     * 用法:
     * native.custom.share({
        title: 'MAMA+|大V店',
        desc: 'MAMA+|大V店',
        link: 'MAMA+|大V店',
        imgUrl: 'http://pic.davdian.com/goods/1/20151017104524.png'
      })
     */
    share(param = {}) {
      // 分享信息(页面分享信息+默认分享信息)
      let shareInfo = $.extend({}, config.defaultShareInfo, window.iosInterface && window.iosInterface.getShareInfo && JSON.parse(window.iosInterface.getShareInfo()));

      // 默认参数(加入分享信息)
      let defaultParam = $.extend({
        show: '1',
        shareType: '0',
      }, shareInfo);

      // 覆盖默认参数
      param = $.extend({}, defaultParam, param);

      // 调用Share.shareInfo接口
      native.Share.shareInfo(param);
    },

    /**
     * 功能: 分享朋友圈
     * 用法:
     * native.custom.shareWeixinTimeline({
        title: 'MAMA+|大V店',
        desc: 'MAMA+|大V店',
        link: 'MAMA+|大V店',
        imgUrl: 'http://pic.davdian.com/goods/1/20151017104524.png'
      })
     */
    shareWeixinTimeline(param = {}) {
      // 默认参数
      param = $.extend({
        show: '0',
        sharePlatform: '0',
      }, param);
      this.share(param);
    },

    /**
     * 分享微信好友
     * 用法:
     * native.custom.shareWeixinFriend({
        title: 'MAMA+|大V店',
        desc: 'MAMA+|大V店',
        link: 'MAMA+|大V店',
        imgUrl: 'http://pic.davdian.com/goods/1/20151017104524.png'
      })
     */
    shareWeixinFriend(param = {}) {
      // 默认参数
      param = $.extend({
        show: '0',
        sharePlatform: '1',
      }, param);
      this.share(param);
    },

    /**
     * 分享QQ好友
     * 用法:
     * native.custom.shareQQFriend({
        title: 'MAMA+|大V店',
        desc: 'MAMA+|大V店',
        link: 'MAMA+|大V店',
        imgUrl: 'http://pic.davdian.com/goods/1/20151017104524.png'
      })
     */
    shareQQFriend(param = {}) {
      // 默认参数
      param = $.extend({
        show: '0',
        sharePlatform: '2',
      }, param);
      this.share(param);
    },

    /**
     * 分享QQ空间
     * 用法:
     * native.custom.shareQQZone({
        title: 'MAMA+|大V店',
        desc: 'MAMA+|大V店',
        link: 'MAMA+|大V店',
        imgUrl: 'http://pic.davdian.com/goods/1/20151017104524.png'
      })
     */
    shareQQZone(param = {}) {
      // 默认参数
      param = $.extend({
        show: '0',
        sharePlatform: '3',
      }, param);
      this.share(param);
    },

    /**
     * 分享到短信
     * 用法:
     * native.custom.shareSms({
        title: 'MAMA+|大V店',
        desc: 'MAMA+|大V店',
        link: 'MAMA+|大V店',
        imgUrl: 'http://pic.davdian.com/goods/1/20151017104524.png'
      })
     */
    shareSms(param = {}) {
      // 默认参数
      param = $.extend({
        show: '0',
        sharePlatform: '4',
      }, param);
      this.share(param);
    },

    /**
     * 复制分享链接
     * 用法:
     * native.custom.shareCopyUrl({
        link: 'MAMA+|大V店'
      })
     */
    shareCopyUrl(param = {}) {
      // 默认参数
      param = $.extend({
        show: '0',
        sharePlatform: '5',
      }, param);
      this.share(param);
    },

    /**
     * 分享图片
     * 用法:
     * native.custom.shareImg({
        show: '1',  // 1弹窗,0不弹窗
        shareType: '1',
        bigImageUrl: 'http://pic.davdian.com/free/back_top_icon_0803.png'  // imgUrl无效,必须用bigImageUrl
      })
     */
    shareImg(param = {}) {
      // 默认参数
      param = $.extend({
        show: '1',  // 1弹窗,0不弹窗
        shareType: '1',
        bigImageUrl: 'http://pic.davdian.com/free/back_top_icon_0803.png'  // imgUrl无效,必须用bigImageUrl
      }, param);
      this.share(param);
    },

    /**
     * 功能: 唤起app首页,不执行cmd
     * 用法:
     * native.custom.invoke()
     */
    invoke() {
      call({
        v: '0.0.0',
        host: '',
        action: '',
        param: {
          invoke: true
        }
      });
    }
  },
};

export default native;
