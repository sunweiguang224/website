/*
 * 统计页面
 */

"use strict";
// function statistics (obj, callback) {
//   var host = '/appapi'
//   var feedList = JSON.parse(localStorage.getItem('feedList'))
//   var listData = {
//     "ip": "",                             //ip
//     "nxtime": "",                               //ng时间
//     "timestamp": new Date().getTime(),                      //日志时间
//     "production": '8',                         //业务线 数据字典稍后定
//     "log_source": '1',                         //日志来源 数据字典稍后定
//     "user_agent": navigator.userAgent,                     //浏览器UA
//     "market": "",                         //来源市场
//     "uid": parseInt(feedList.sess_key.substring(feedList.sess_key.length-8,feedList.sess_key.length-1), 10).toString(),      //用户id
//     "session": feedList.sess_key.substring(0,feedList.sess_key.length-8),                        //session id
//     "status": feedList.visitor_status,                             //卖家状态 (0：游客 1:买家 3:卖家)
//     "device": "",                         //设备类型
//     "device_id": "",                      //设备号
//     "sys_version": "",                    //设备版本号
//     "resolution": window.screen.width + '*' + window.screen.height,      //分辨率
//     "location": "",                       //当前位置
//     "app_version": feedList.data_version || "",                    //APP版本号
//     "action": '2',                             //操作action 数据字典稍后定，click，view，
//     "action_type": "2",                    //操作类型（元素）
//     "object_id": obj.objectId || "",                      //操作对象id（url）
//     "production_data": {                     //详细信息
//       "action": '2',                              //1：点击
//       "action_type": "2",                       //1：模板
//       "object_id": window.tj_id+"" || "",
//       "share_type": obj.shareType
//     }
//   }
//   try{
//     $.ajax({
//       url:host,
//         type:"post",
//         data:JSON.stringify(listData),
//         success:function (result) {
//         if(result=="success_1"){
//             callback&&callback()
//         }
//         },error:function () {

//         }
//     });
//   }catch (e){
//       console.error(e);
//   }
// }
// window.tlShareCallback = function(){
//     statistics({shareType:1})
//     $.post('/index.php?c=class&a=ajax_share&id=' + window.page_id,{},function(){
//        var share_num = parseInt($(".share-num").html());
//        share_num = share_num + 1;
//        $(".share-num").html(share_num);
//    });
// }
// window.sendShareCallback = function () {
//     statistics({shareType:2})
//     $.post('/index.php?c=class&a=ajax_share&id=' + window.page_id,{},function(){
//        var share_num = parseInt($(".share-num").html());
//        share_num = share_num + 1;
//        $(".share-num").html(share_num);
//     });
// }
// window.QQShareCallback = function () {
//     statistics({shareType:4})
//     $.post('/index.php?c=class&a=ajax_share&id=' + window.page_id,{},function(){
//        var share_num = parseInt($(".share-num").html());
//        share_num = share_num + 1;
//        $(".share-num").html(share_num);
//     });
// }
// window.weiboShareCallback = function () {
//     statistics({shareType:7})
// }
var _slicedToArray = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
})();

export default (function () {

  // if (window["dav-tj"]) {
  //   return false;
  // }

  window["dav-tj"] = true;

  var delayTime = 150; // 延迟等待时间
  var cnzz = window.cnzz && false; // 是否使用cnzz
  var baidu = window.baidu && true; // 是否使用百度统计
  var google = window.google && true; // 是否使用google统计
  var dvd_tj = window.dvd_tj && true; // 是否使用dvd统计

  init();

  /**
   * 初始化统计
   */
  function init() {
    initCode();

    if (cnzz || baidu || google || dvd_tj) {
      getEvent();
      pvSend();
      jqSend();
      wxShare();
    }
  }

  /**
   * 统计代码
   */
  function initCode() {
  }

  /**
   * 获取埋点事件
   */
  function getEvent() {
    window.jQuery && $(document).on("click", "[data-dav-tj]", clickAnalysis);
  }

  /**
   * 微信分享统计
   */
  function wxShare() {
    var path = window["tj_path"] || "other_path";

    var list = ['tl', 'send', 'QQ', 'qZone'];

    for (var i = 0; i < list.length; i++) {
      (function () {
        var name = list[i];
        if (window[name + 'ShareCallback']) {
          window['s_' + name + 'ShareCallback'] = window[name + 'ShareCallback'];
        }
        window[name + 'ShareCallback'] = function () {
          eventSend({
            category: path,
            action: 'share_to_' + name,
            label: "share_to_" + name + "_success",
            value: 1
          });
          window['s_' + name + 'ShareCallback'] && window['s_' + name + 'ShareCallback']();
        };

        if (window[name + 'ShareCallbackCancel']) {
          window['s_' + name + 'ShareCallbackCancel'] = window[name + 'ShareCallbackCancel'];
        }
        window[name + 'ShareCallbackCancel'] = function () {
          eventSend({
            category: path,
            action: 'share_to_' + name,
            label: "share_to_" + name + "_cancel",
            value: 1
          });
          window['s_' + name + 'ShareCallbackCancel'] && window['s_' + name + 'ShareCallbackCancel']();
        };
      })();


    }
  }

  /**
   * 点击统计
   */
  function clickAnalysis(event) {
    var me = this,
      $el = $(me);

    // a标签单独处理，先阻止跳转，过段时间再跳转
    if (me["tagName"] === "A") {
      var href = $el.attr("href");
      if (href) {
        setTimeout(function () {
          if (href.indexOf("javascript:") == 0) {
            eval(href.replace("javascript:", ""));
          } else {
            bravetime.goto(href);
          }
        }, delayTime);
      }
      event.preventDefault();
    }

    var tjData = $el.attr("data-dav-tj") || "";
    var data = tjData.split("|");

    var _data = _slicedToArray(data, 5);

    var _data$0 = _data[0];
    var category = _data$0 === undefined ? "默认分类" : _data$0;
    var _data$1 = _data[1];
    var action = _data$1 === undefined ? "默认行为" : _data$1;
    var label = _data[2];
    var value = _data[3];
    var nodeid = _data[4];

    eventSend({category: category, action: action, label: label, value: value, nodeid: nodeid});
  }

  /**
   * 事件发送
   * @param event
   */
  function eventSend(event) {
    var category = event.category;
    var action = event.action;
    var label = event.label;
    var value = event.value;
    var nodeid = event.nodeid;

    if (dvd_tj) {
      setHttp(1, category, action + "@" + category, label + "@" + category);
    }

    if (cnzz && window["_czc"]) {
      _czc.push(["_trackEvent", category, action, label, value, nodeid]);
    }
    if (baidu && window["_hmt"]) {
      _hmt.push(["_trackEvent", category, action + "@" + category, label + "@" + category, value]);
    }
    if (google && window.ga) {
      ga('send', 'event', category, action, label);
    }

  }

  /**
   * pv统计
   */
  function pvSend() {
    var path = arguments[0] === undefined ? window["tj_path"] || "other_path" : arguments[0];
    var path_detail = arguments[1] === undefined ? window["tj_path_detail"] || path : arguments[1];
    var shop_name = location.href.split("//")[1].split("/")[0].split(".")[0];

    // if (dvd_tj) {
      setHttp(2, path, path_detail, shop_name);
    // }

    if (baidu && window["_hmt"]) {
      _hmt.push(["_trackPageview", "/" + path]);
    }

    if (google) {
      ga('set', 'page', '/' + path);
      ga('send', 'pageview', '/' + path);
    }

  }

  /**
   * jquery 统计
   */
  function jqSend() {
    eventSend({
      category: window.tj_path || "other_path",
      action: "jquery_tj",
      label: "jquery_" + (window.jQuery ? "ok" : "error"),
      value: 1
    });
  }

  /**
   * 发送请求
   * @param type
   * @param a
   * @param b
   * @param c
   */
  function setHttp(type, a, b, c) {
    var httpUrl = "//tj.davdian.com/tj.gif?t=" + type + "&a=" + a + "&b=" + b + "&c=" + c + "&tt=" + (Date.now() + Math.random());
    var img = document.createElement('img');
    document.body.appendChild(img);
    img.style.display = "none";
    img.src = httpUrl;
  }

  // window.bravetime = window.bravetime || {};
  // window.bravetime.tj = {pvSend: pvSend, evSend: eventSend};
  return {pvSend: pvSend, evSend: eventSend};
})();
