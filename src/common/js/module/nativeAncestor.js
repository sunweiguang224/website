/**
 * h5与native交互模块
 * http://wiki.bravetime.net/pages/viewpage.action?pageId=3145764
 */
import ua from './ua';

/**
 * native模块
 * 包含所有调用native的接口
 */
export default {
  /**
   * 功能: 第一代与native交互方法
   */
  callNative(param = {}) {
    // 不在app中,直接返回
    if (!ua.isDvdApp()) return;

    // 参数检查
    if (!param.className || !param.methodName) {
      throw new Error('')
    }
    param.param = param.param || [];
    param.success = param.success || function () {
      };
    param.error = param.error || function () {
      };

    // 当前时间戳
    let now = Date.now();

    // 回调名称
    let successCallbackName = `native_${param.className}_${param.methodName}_success_${now}`;
    let errorCallbackName = `native_${param.className}_${param.methodName}_error_${now}`;

    // 设置全局回调,用完回收
    window[successCallbackName] = function () {
      param.success();
      window[successCallbackName] = null;
    };
    window[errorCallbackName] = function () {
      param.error();
      window[errorCallbackName] = null;
    };

    // 拼接唤起native协议
    let v = [
      successCallbackName,
      errorCallbackName,
      param.className,
      param.methodName,
      JSON.stringify(param.param)
    ].join('|||').replace(/"/g, '\'');
    let prototal = 'neng:\/\/call.app.com?v=' + v;

    // 调用native
    location.href = prototal;
  },

  /**
   * 功能: 唤起native分享弹窗
   */
  share() {
    this.callNative({
      className: 'base',
      methodName: 'share',
      param: [],
      success: function () {
        var code = JSON.parse(r)["code"];
        if (code == 0) {
          // 分享成功
          alert("分享成功");
        } else if (code == 1) {
          alert("分享失败");
        } else {
          alert("系统异常，请重试");
        }
      },
      error: function () {
        alert("系统异常，请退出app重试")
      }
    });
  },

  /**
   * 功能: 分享(微信朋友圈)
   */
  shareWeixinTimeline () {
    this.callNative({
      className: 'base',
      methodName: 'share_to_wechat_timeline',
      param: [],
      success: function () {
        var code = JSON.parse(r)["code"];
        if (code == 0) {
          // 分享成功
          alert("分享成功");
        } else if (code == 1) {
          alert("分享失败");
        } else {
          alert("系统异常，请重试");
        }
      },
      error: function () {
        alert("系统异常，请退出app重试")
      }
    });
  },

  /**
   * 功能: 分享(微信好友)
   */
  shareWeixinFriend () {
    this.callNative({
      className: 'base',
      methodName: 'share_to_wechat_friend',
      param: [],
      success: function () {
        var code = JSON.parse(r)["code"];
        if (code == 0) {
          // 分享成功
          alert("分享成功");
        } else if (code == 1) {
          alert("分享失败");
        } else {
          alert("系统异常，请重试");
        }
      },
      error: function () {
        alert("系统异常，请退出app重试")
      }
    });
  },

  /**
   * 功能: 保存图片
   */
  savePic(src) {
    // 此处src没有值时native会崩溃,大V店图标做为默认
    this.callNative({
      className: 'base',
      methodName: 'savePic',
      param: [src || 'http://pic.davdian.com/shop_logo/2016/06/13/80_80_f81f91d7ef5e31fa354fa935124dab20.png'],
    });
  },

  /**
   * 功能: 回到app首页
   * 测试: 失效
   * 原名: goAppHome
   * "neng://call.app.com?v=callback_1494408706101|||error_1494408706101|||base|||home|||[]"
   */
  goHome() {
    this.callNative({
      className: 'base',
      methodName: 'home',
      param: [],
      success: function () {
      },
      error: function () {
        alert("系统异常，请退出app重试")
      }
    });
  },

  /**
   * 功能: 等待native准备好
   * 测试: 失效
   * 原名: callNativeReady
   */
  ready () {
    // 如果是订单确认页, 而且是等待刷新的, 就不发这个了
    if (window.tj_id == 21 && $.cookie && $.cookie("no_refresh")) {
      $.removeCookie("no_refresh");
      return false;
    }
    this.callNative({
      className: 'base',
      methodName: 'ready',
      param: [],
      success: function () {
      },
      error: function () {
        alert("系统异常，请退出app重试")
      }
    });
  },

  /**
   * 功能: 调用原生确认框
   * 测试: 失效
   * 原名: callNativeConfirm
   * 调用:
   * native.confirm({
      title: '',
      success: function () {
      },
      error: function () {
      }
    })
   */
  confirm (param) {
    this.callNative(opt.okLink, opt.cancelLink, "base", "confirm", [msg, JSON.stringify(opt)]);
    this.callNative({
      className: 'base',
      methodName: 'confirm',
      param: [param.title, JSON.stringify({
        okLink: param.success,
        cancelLink: param.error,
      })],
      success: function () {
      },
      error: function () {
        alert("系统异常，请退出app重试")
      }
    });
  },

}
