/**
 * Created by weiguangsun on 2016/6/17.
 * 判断当前平台类型
 */
function Ua(){
	this.ua = navigator.userAgent;
	this.cache = {};
}

Ua.prototype = {
	match: function(regex){
		if(Object.prototype.toString.call(regex) === '[object String]'){
			regex = new RegExp(regex, 'g');
		}
		return regex.test(this.ua);
	},
	getFromCache: function(cacheName, regexArray){
		// 如果未缓存过cache[cacheName]，则缓存对正则数组regStrArray匹配的结果
		if(this.cache[cacheName] === undefined){
			// 正则数组regStrArray匹配的结果
			var cacheValue;
			for(var i in regexArray){
				cacheValue = this.match(regexArray[i]);
				if(cacheValue){
					break;
				}
			}
			// 缓存
			this.cache[cacheName] = cacheValue;
		}
		// 返回缓存中的值
		return this.cache[cacheName];
	},
	/**
	 * chrome浏览器
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; Android 6.0; MI 5 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.108 Mobile Safari/537.36
	 * ios		Mozilla/5.0 (iPod; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/51.0.2704.64 Mobile/13F69 Safari/601.1.46
	 */
	isChrome: function(){
		return this.getFromCache('isChrome', ['Chrome', 'CriOS']);
	},
	/**
	 * uc浏览器
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; U; Android 6.0; zh-CN; MI 5 Build/MRA58K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/10.10.3.810 U3/0.8.0 Mobile Safari/534.30
	 * ios		Mozilla/5.0 (iPod touch; CPU iPhone OS 9_3_2 like Mac OS X; zh-CN) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/13F69 UCBrowser/10.9.16.802 Mobile
	 */
	isUc: function(){
		return this.getFromCache('isUc', ['UCBrowser']);
	},
	/**
	 * QQ浏览器
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; U; Android 6.0; zh-cn; MI 5 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 Chrome/37.0.0.0 MQQBrowser/6.7 Mobile Safari/537.36
	 * ios		Mozilla/5.0 (iPod touch; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/6.0 MQQBrowser/6.7.2 Mobile/13F69 Safari/8536.25 MttCustomUA/2
	 */
	isQqBrowser: function(){
		return this.getFromCache('isQqBrowser', ['MQQBrowser']);
	},
	/**
	 * 小米系统浏览器
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; U; Android 6.0; zh-cn; MI 5 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.85 Mobile Safari/537.36 XiaoMi/MiuiBrowser/2.1.1
	 */
	isXiaoMiBrowser: function(){
		return this.getFromCache('isXiaoMiBrowser', ['XiaoMi/MiuiBrowser']);
	},
	/**
	 * safari浏览器
	 * @returns {true | false}
	 * ios		Mozilla/5.0 (iPod touch; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13F69 Safari/601.1
	 */
	isSafari: function(){
		return this.getFromCache('isSafari', ['Version/\\d?[.]\\d Mobile/.* Safari/.*']);
	},
	/**
	 * 百度浏览器
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; Android 6.0; MI 5 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/48.0.2564.116 Mobile Safari/537.36 baidubrowser/7.8.12.0 (Baidu; P1 6.0)
	 * ios
	 */
	isBaiduBrowser: function(){
		return this.getFromCache('isBaiduBrowser', ['baidubrowser']);
	},
	/**
	 * 搜狗浏览器
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; Android 6.0; MI 5; Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.92 SDK/1.2.2.675 Mobile Safari/537.36 SogouMSE,SogouMobileBrowser/5.5.0
	 * ios
	 */
	isSougouBrowser: function(){
		return this.getFromCache('isSougouBrowser', ['SogouMobileBrowser']);
	},
	/**
	 * 新浪微博
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; Android 6.0; MI 5 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.76 Mobile Safari/537.36 Weibo (Xiaomi-MI 5__weibo__6.6.0__android__android6.0)
	 * ios		Mozilla/5.0 (iPod touch; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13F69 Weibo (iPod5,1__weibo__5.4.0__iphone__os9.3.2)
	 */
	isSinaWeiBo: function(){
		return this.getFromCache('isSinaWeiBo', ['Weibo']);
	},
	/**
	 * QQ+QQ空间（QQ和QQ空间ua相同）
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; Android 6.0; MI 5 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/37.0.0.0 Mobile MQQBrowser/6.2 TBS/036522 Safari/537.36 V1_AND_SQ_6.3.7_374_YYB_D QQ/6.3.7.2795 NetType/WIFI WebP/0.3.0 Pixel/1080
	 * ios		Mozilla/5.0 (iPod touch; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13F69 QQ/6.3.5.437 V1_IPH_SQ_6.3.5_1_APP_A Pixel/640 Core/UIWebView NetType/WIFI Mem/12
	 */
	isQq: function(){
		return this.getFromCache('isQq', [/QQ\/[0-9]?/]);
	},
	/**
	 * 微信+朋友圈（微信和朋友圈ua相同）
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; Android 6.0; MI 5 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/37.0.0.0 Mobile MQQBrowser/6.2 TBS/036523 Safari/537.36 MicroMessenger/6.3.18.800 NetType/WIFI Language/zh_CN
	 * ios		Mozilla/5.0 (iPod touch; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13F69 MicroMessenger/6.3.19 NetType/WIFI Language/zh_CN
	 */
	isWeiXin: function(){
		return this.getFromCache('isWeiXin', ['MicroMessenger']);
	},
	/**
	 * 支付宝
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; U; Android 6.0; zh-cn; MI 5 Build/MRA58K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/1.0.0.100 U3/0.8.0 Mobile Safari/534.30 AlipayDefined(nt:WIFI,ws:360|640|3.0) AliApp(AP/9.6.8.053103) AlipayClient/9.6.8.053103 Language/zh-Hans
	 * ios		Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13E233 ChannelId(12) Nebula PSDType(1) AlipayDefined(nt:WIFI,ws:320|504|2.0) AliApp(AP/9.6.6.05070802) AlipayClient/9.6.6.05070802 Language/zh-Hans
	 */
	isAlipay: function(){
		return this.getFromCache('isAlipay', ['AlipayClient']);
	},
	/**
	 * 搜狐新闻客户端
	 * @returns {true | false}
	 * android	Mozilla/5.0 (Linux; Android 6.0; MI 5 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.76 Mobile Safari/537.36 SohuNews/5.6.0 BuildCode/106 JsKit/1.0 (Android)
	 * ios		Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13E233 JsKit/1.0 (iOS)
	 */
	isSohuNewsClient: function(){
		return this.getFromCache('isSohuNewsClient', ['SohuNews', 'JsKit']);
	},
	/**
	 * android
	 * @returns {true | false}
	 */
	isAndroid: function(){
		return this.getFromCache('isAndroid', ['Android']);
	},
	/**
	 * ios
	 * @returns {true | false}
	 */
	isIos: function(){
		return this.getFromCache('isIos', ['iPhone']);
	},
  /**
   * 手机端
   * @returns {true | false}
   */
  isMobile: function(){
    return this.getFromCache('isMobile', ['Mobile']);
  },
  /**
   * 大V店客户端
   * @returns {true | false}
   * android(正式环境):	Mozilla/5.0 (Linux; Android 7.0; MI 5 Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.91 Mobile Safari/537.36 android.davdian.com/3.6.2
   * android(beta环境):	Mozilla/5.0 (Linux; Android 7.0; MI 5 Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.91 Mobile Safari/537.36 android.vyohui.cn/3.7.0/dvddomain=1
   * ios
   */
  isDvdApp: function(){
    return this.getFromCache('isDvdApp', ['davdian', 'vyohui', 'bravetime']);
  },
  /**
   * 获取大V店客户端版本号
   */
  getDvdAppVersion() {
    let result = /(ios|android)\.(davdian\.com|vyohui\.cn|bravetime\.net)\/([\d\.]+)/.exec(navigator.userAgent);
    if (result) {
      return result[3];
    }
  },
  /**
   * 比较版本号
   */
  compareVersion(v1, v2) {
    // 用.分割版本号
    let subV1Arr = v1.split('.');
    let subV2Arr = v2.split('.');

    // 取.最多的数组长度
    let length = subV1Arr.length >= subV2Arr.length ? subV1Arr.length : subV2Arr.length;

    // 比较每个相对应的子版本号
    for (let i = 0; i < length; i++) {
      let subV1 = (subV1Arr[i] || 0) * 1;
      let subV2 = (subV2Arr[i] || 0) * 1;
      if(subV1 > subV2){
        return 1;
      }else if(subV1 < subV2){
        return -1;
      }
    }
    return 0;
  },
};
Ua.prototype.constructor = Ua;

export default new Ua();
