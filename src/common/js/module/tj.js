import Cookies from 'js-cookie';
import login from './login.js';
import ua from './ua.js';


// 前端点击数据采集格式，具体如下：
let defaultParam = {
  // ip
  ip: '',
  // ng时间，留空，数据由nginx生成
  nxtime: Date.now(),
  // 日志时间
  timestamp: Date.now(),
  // 业务线 默认为0，首页点击为1，
  production: 0,
  // 日志来源 默认为0，首页点击为1
  log_source: 0,
  // 浏览器UA
  user_agent: navigator.userAgent,
  // 来源市场，andriod是渠道号，ios为空
  market: '',
  // 用户id
  uid: login.getUserId(),
  // session id
  session: login.getSessionId(),
  // 卖家状态 (0：游客 1:买家 3:卖家)
  status: login.getUserStatusCode(),
  // 1：点击
  action: 1,
  // 1：模板
  action_type: 0,
  // 模板id
  object_id: '',
  // 设备号
  device_id: '',
  // 设备类型
  device: ua.isIos() ? 'ios' : ua.isAndroid() ? 'android' : '',
  // 设备版本号
  sys_version: '',
  // 分辨率
  resolution: window.screen.width + '*' + window.screen.height,
  // 当前位置
  location: location.href,
  // APP版本号
  app_version: '',
  // 详细信息
  production_data: {
    feed: {
      // 整个feed item的位置，透传服务端下发的position
      itemPosition: '',
      // 模板Id
      tplId: '',
      // title or body
      type: '',
      // 当前点击的内容在body中的位置，透传服务端下发的position，title无此字段
      dataPosition: '1',
      // 动作：点击，来自feed中的command->content
      cmdContent: '',
      // 当前点击imgUrl，可以为空
      imgUrl: '',
    }
  }
};

export default {
  /**
   * 功能：发送统计信息
   * 用法：
   * tj.send({
      production: 17,
      action: 1,
      action_type: action_type,
      production_data: {
        feed: {
          cmdContent: cmdContent || ''
        }
      }
    });
   */
  send(param){
    let newParam = $.extend(true, {}, defaultParam, param);
    $.ajax({
      cache: false,
      async: false,
      url: '//bravetime.davdian.com/appapi?_=' + Date.now(),    // 这个接口值在davdian.com下存在
      type: 'post',
      dataType: 'text',
      data: JSON.stringify(newParam),
      success(response) {
        console.log(response);
      },
      error(error) {
        console.error('ajax error:' + error.status + ' ' + error.statusText);
      }
    });
  }
}
