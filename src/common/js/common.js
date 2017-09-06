// import scriptjs from 'scriptjs';
require('./module/autoRootSize.js');
import native from './module/native.js';
import ua from './module/ua.js';
import login from './module/login.js';
import Cookies from 'js-cookie';
import util from './module/util.js';
import weixin from './module/weixin.js';

// ios wkwebview返回上一页执行回调刷新页面
native.custom.onWebviewBack();

/**
 * 功能：检测是否需要去微信授权
 */
(function () {
  // Cookies.remove('is_auto_login', {
  //   domain: util.getBaseDomain()
  // });
  // alert(Cookies.get('is_auto_login'));

  // Cookies.remove('weixin_auth_try_times', {
  //   domain: util.getBaseDomain()
  // });
  // alert(Cookies.get('weixin_auth_try_times'));
  // return;

  // 微信授权短时间内尝试次数
  let weixin_auth_try_times = Cookies.get('weixin_auth_try_times');

  // 完成微信授权之后会在cookie设置is_auto_login=1,有这个标识了不需要再走授权逻辑
  if (ua.isWeiXin()
    && !login.isLogined()
    && Cookies.get('is_auto_login') === undefined
    && (weixin_auth_try_times === undefined || weixin_auth_try_times < 1)) {
  // if (ua.isWeiXin()) {

    // 设置尝试授权次数，每次失败1天以后重新尝试
    Cookies.set('weixin_auth_try_times', weixin_auth_try_times ? parseInt(weixin_auth_try_times) + 1 : 1, {
      domain: util.getBaseDomain(),
      path: '/',
      expires: 1,   // 有效时间1天
      // expires: 1 / 24 / 60    // 有效时间1分钟
    });

    weixin.goAuthPage();
  }
})();

/**
 * 功能：检测是否需要domain跳转
 */
function checkRedirect(domain) {
  // 当前域名与强制域名和小写强制域名都不符时，跳转到强制域名

  if (domain && domain !== location.host && ''.toLowerCase && new String(domain).toLowerCase() !== location.host) {
    // nemo逻辑，设置临时跳转路径
    // sessionStorage.setItem('temp_domain', location.hostname);

    // 跳转强制domain
    location.href = location.href.replace(location.host, domain);
    // 中断程序执行
    throw new Error(`即将跳转强制域名(${location.href})，已主动抛出异常中断当前页面js执行，请忽略此异常信息~`);
  }
}

/**
 * 功能：检测cookie是否需要强制跳转
 */
(function () {
  var script = document.querySelector('script');
  if (script && script.src && script.src.indexOf('common/js/autoRootSize.js') !== -1) {
    checkRedirect(Cookies.get('force_domain'));
  }
})();

// fastclick
// iPhone; CPU iPhone OS 10_3_2 like Mac OS X
// ios10以下才需要加fastclick
// window.addEventListener('load', function () {
//   // 延迟加载,提高页面显示速度
//   setTimeout(function () {
//     scriptjs('//cdn.davdian.com/fastclick/1.0.6/fastclick.min.js', function () {
//       FastClick.attach(document.body);
//     });
//   }, 3000);
// }, false);

export default {
  /**
   * 功能：检测接口是否需要domain跳转
   * 说明：每个接口公参会返回强制跳转字段，如果这个字段有值并且与当前域名不同则跳转
   */
  checkRedirect(response) {
    // nemo逻辑 //
    // 百度脑图：http://naotu.baidu.com/file/845581a94947715ba1c8cf832d46eb37?token=bb2bd462d2f5f75f
    // if (response.code === 0 || response.code === '11012' || response.code === '11013') {
    //   checkRedirect(Cookies.get('forceDomain'));
    // } else if (response.code === '11014') {
    //   let temp_domain = sessionStorage.setItem('temp_domain', location.hostname);
    //   if (temp_domain) {
    //     // 跳转临时domain
    //     location.href = location.href.replace(location.host, temp_domain);
    //   } else {
    //     // 跳转默认domain
    //     location.href = location.href.replace(location.host, 'bravetime.davdian.com');
    //   }
    // }

    // 建生逻辑：11012、11013、11015(访问的手机号域名有自定义域名)时根据返的cookie跳；10010时跳bravetime；
    // 百度脑图：http://naotu.baidu.com/file/653525bad80d30f32561e78afacaae39?token=35f3626016726857
    // if (response.code === '11012' || response.code === '11013' || response.code === '11015') {
    //   checkRedirect(Cookies.get('force_domain'));
    // } else if (response.code === '10010') {
    //   // 跳转强制domain
    //   location.href = location.href.replace(location.host, `bravetime.${util.getBaseDomain()}`);
    //   // 中断程序执行
    //   throw new Error(`即将跳转强制域名(${location.href})，已主动抛出异常中断当前页面js执行，请忽略此异常信息~`);
    // }
    if (response.code === '10010') {
      // 跳转强制domain
      location.href = location.href.replace(location.host, `bravetime.${util.getBaseDomain()}`);
      // 中断程序执行
      throw new Error(`即将跳转强制域名(${location.href})，已主动抛出异常中断当前页面js执行，请忽略此异常信息~`);
    } else {
      checkRedirect(Cookies.get('force_domain'));
      // 接口response设置的cookie在部分手机上并不会立即生效
      setTimeout(function(){
        checkRedirect(Cookies.get('force_domain'));
      }, 100);
    }
  },
}
