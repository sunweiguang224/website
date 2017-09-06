import number from './number.js'

export default {
  /**
   * 时间格式化
   * @param date 日期对象|时间戳数字|时间戳字符串
   * @param format 格式化字符串
   * @returns {String}
   * Demo: date.format(new Date(), 'yyyy-MM-dd HH:mm:ss SSS');
   */
  format(date, format) {
    date = Object.prototype.toString.call(date) == '[object String]' ? new Date(parseInt(date)) :
      Object.prototype.toString.call(date) == '[object Number]' ? new Date(date) :
        date || new Date();
    format = Object.prototype.toString.call(format) == '[object String]' ? format : 'yyyy-MM-dd hh:mm:ss SSS';
    var map = {
      'y': date.getFullYear(),
      'M': date.getMonth() + 1,
      'd': date.getDate(),
      'h': date.getHours(),
      'm': date.getMinutes(),
      's': date.getSeconds(),
      'S': date.getMilliseconds()
    };
    for (var key in map) {
      format = format.replace(new RegExp(key + '+'), function (matchValue, index, input) {
        return number.preZero(map[key], matchValue.length);
      });
    }
    return format;
  },
  /**
   * 根据年、月计算本月有多少天
   * @param year 年（默认取当前年）
   * @param month 月份1-12（默认取当前月）
   */
  getDayCount(year, month) {
    year = year || new Date().getFullYear();
    month = month || new Date().getMonth() + 1;

    let days = null;
    if (month == 4 || month == 6 || month == 9 || month == 11) {
      days = 30;
    } else if (month == 2) {
      days = 28;
      // 闰年
      if (year % 4 === 0) {
        days += 1;
      }
    } else {
      days = 31;
    }

    return days;
  }
}

