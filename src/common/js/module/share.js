import ua from './ua.js';
import native from './native.js';
import weixin from './weixin.js';

let getEl = function () {
  return (document.querySelector('.app') || document.body).appendChild(document.createElement('div'));
};

/**
 * share模块
 * 与分享有关的模块
 */
export default {
  /**
   * 设置 微信&native 分享信息
   * 调用方法:
   share.setShareInfo({
      title: '大V店组团包邮', // 分享标题
      desc: '一件包邮！每天上新！好货低价又包邮，抢到了就赚翻啦', // 分享描述
      link: location.href, // 分享链接
      imgUrl: 'http://pic.davdian.com/free/2016/04/09/320_320_0fc3e0dbbadd249b7f1b93a525f0adf0.jpg', // 分享图标
    });
   */
  setShareInfo(param = {}, response) {

    if (ua.isWeiXin()) {
      weixin.setShareInfo(param, response);
    } else if (ua.isDvdApp()) {
      native.custom.setShareInfo(param);
    }
  },
  /**
   * 唤起浏览器分享(目前只支持弹出浮层引导分享)
   */
  callBrowserShare() {
    new Vue({
      components: {
        'com-share-pop-tip': require('../../../component/com-share-pop-tip.vue')
      },
      el: getEl(),
      data: {},
      template: '<com-share-pop-tip/>',
    });
  },
  /**
   * 唤起 浏览器|native 分享
   */
  callShare() {
    if (ua.isDvdApp()) {
      native.custom.share();
    } else {
      this.callBrowserShare();
    }
  }
}
