export default {
  /**
   * 数字不满足位数前置0
   * @param value 数字
   * @param digit 需要的位数，不满足补0
   */
  preZero(value, digit) {
    value = value ? value.toString() : '';
    digit = digit || value.length;
    var zeroNum = digit - value.length;
    for (var i = 0; i < zeroNum; i++) {
      value = '0' + value;
    }
    return value;
  }
}
