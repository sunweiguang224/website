import md5 from 'crypto-js/md5.js';
import param from './param.js';
import ua from './ua.js';

/**
 * 名称：加密模块
 * 功能：请求接口时对参数加密
 */
let strSign = (obj) => {
  let strObj = sortObj(obj)
  var str = ''
  for (let i in strObj) {
    str += i + '=' + encodeURIComponent(strObj[i]) + '&'
  }
  return str
}

let sortObj = (obj) => {
  obj = obj || {};
  for (var i = 0, d; d = ["rp", 'rl', 'logDp','dp'][i++];) {
    var tmp_value = param.get(d);
    if (tmp_value) {
      obj[d] = tmp_value.replace(/[ +]/g, "");
    }
  }

  let string = ''
  var strObj = {}
  let t = null
  let tValue = null
  let arrKey = ['shop_url', 'sess_key', 'device_token', 'format', 'ts', 'osv', 'wh', 'data_version']
  // 测试
  // let arrValue = ['http://haba.davdian.com/', 'b63b64c250150b505ab0e8219325ef80adb73835', "", 'json', new Date().getTime(), 'web_h5_*_*', '750_1334', (JSON.parse(sessionStorage.getItem('dataVersion')) && JSON.parse(sessionStorage.getItem('dataVersion'))[dataVersion])?JSON.parse(sessionStorage.getItem('dataVersion'))[dataVersion]:0]
  // 线上
  var osv = "web_h5_*_*";
  if (ua.isDvdApp() && ua.isIos()) {
    osv = "web_ios_*_*";
  }
  if (ua.isDvdApp() && ua.isAndroid()) {
    osv = "web_android_*_*";
  }
  // let arrValue = [location.host, document.cookie.split(';').filter(function(x){return x.indexOf("dvdsid")>-1})[0]?document.cookie.split(';').filter(function(x){return x.indexOf("dvdsid")>-1})[0].split("=")[1]:0, "", 'json', new Date().getTime(), osv, '750_1334', (JSON.parse(sessionStorage.getItem('dataVersion')) && JSON.parse(sessionStorage.getItem('dataVersion'))[dataVersion])?JSON.parse(sessionStorage.getItem('dataVersion'))[dataVersion]:0]
  let arrValue = [location.href.split("/").slice(0, 3).join("/"), document.cookie.split(';').filter(function (x) {
    return x.indexOf("dvdsid") > -1
  })[0] ? document.cookie.split(';').filter(function (x) {
    return x.indexOf("dvdsid") > -1
  })[0].split("=")[1] : 0, "", 'json', new Date().getTime(), osv, '750_1334', 0]
  if (obj) {
    for (let p in obj) {
      arrKey.push(p)
      arrValue.push(obj[p])
    }
  }
  for (let i = 0; i < arrKey.length; i++) {
    for (let j = 0; j < arrKey.length - i - 1; j++) {
      if (arrKey[j] > arrKey[j + 1]) {
        t = arrKey[j + 1]
        arrKey[j + 1] = arrKey[j]
        arrKey[j] = t

        tValue = arrValue[j + 1]
        arrValue[j + 1] = arrValue[j]
        arrValue[j] = tValue
      }
    }
  }
  for (let i = 0; i < arrKey.length; i++) {
    strObj[arrKey[i]] = arrValue[i]
  }
  for (let p in strObj) {
    string += p + '=' + strObj[p]
  }
  var sign = md5(string).toString().toUpperCase();
  strObj.sign = sign
  return strObj
}

export default strSign;
