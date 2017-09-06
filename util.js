import moment from 'moment';		// 时间格式化
import path from 'path';

export default {
  /* 获取当前格式化时间 */
  getNow: function () {
    return moment().format(`YYYY-MM-DD HH:mm:ss ${moment().millisecond()}`);
  },
  /* 获取被格式化当前时间作为静态资源版本号 */
  getTimeFormatVersion: function () {
    return moment().format("YYYY-MM-DD_HH:mm:ss");
  },
	/* 获取工程名称 */
	getProjectName: function () {
		return path.basename(path.resolve(__dirname, '../'));
	},
  stringifyFormat: function(obj){
    return JSON.stringify(obj, ' ', 2);
  }
}
