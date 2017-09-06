/**
 * 该模块存放短小的工具方法,如方法代码量大或几个方法是同一类型,应封装成独立模块
 */
export default {
  /**
   * 页面触底通知回调
   */
  pageScrollToBottom(callback){
    window.addEventListener('scroll', function () {
      if (document.documentElement.clientHeight + document.body.scrollTop >= document.body.clientHeight * 0.95) {
        callback();
      }
    }, false);
  },
  getOffsetLeft(node){
    if (node.offsetParent) {
      return node.offsetLeft + this.getOffsetLeft(node.offsetParent);
    } else {
      return node.offsetLeft;
    }
  },
  getOffsetTop(node){
    if (node.offsetParent) {
      return node.offsetTop + this.getOffsetTop(node.offsetParent);
    } else {
      return node.offsetTop;
    }
  },
  /**
   * 获取页面基础域名
   */
  getBaseDomain(){
    return /(bravetime.net|vyohui.cn|davdian.com)/.exec(location.host)[0];
  }
}
