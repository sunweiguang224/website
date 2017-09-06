import popup from './popup.js';

export default {

  /**
   * 功能: 上传
   * 用法:
   * ajaxFileUpload.upload({
      url: '/upload.php',   // 全站默认url,可不传
      owner_id: '2927099'
      fileFieldName: 'shop_logo',    // 文件字段,可不传
      accept: 'image/*',    // 默认图片,可不传
      success: function (response) {

      },
      error: function (error) {
        debugger
        console.error('ajax error:' + error.status + ' ' + error.statusText);
      }
    });
   */
  upload(param = {}){
    // 创建表单
    let form = document.createElement('form');

    // 创建输入框
    let input = document.createElement('input');
    input.type = 'file';
    input.name = param.fileFieldName || 'shop_logo';
    input.accept = param.accept || 'image/*' || '*';
    input.style.display = 'none';
    input.addEventListener('change', function (event) {
      // 全站默认上传接口/upload.php
      let url = `${param.url || '/upload.php'}?owner_id=${param.owner_id}_=${Date.now()}`;
      popup.loading();
      $.ajax({
        cache: false,
        async: true,
        url: url,
        type: 'post',
        dataType: 'json',
        data: new FormData(form),
        contentType: false,
        processData: false,
        success: function (response) {
          popup.loading(false);
          param.success && param.success(response);
          form && form.parentNode && form.parentNode.removeChild(form);
        },
        error: function (error) {
          popup.loading(false);
          param.error && param.error(error);
          form && form.parentNode && form.parentNode.removeChild(form);
        }
      });
    }, false);

    // 插入dom
    form.appendChild(input);
    document.body.appendChild(form);

    // 10s后清除上传dom
    setTimeout(function () {
      form && form.parentNode && document.body.removeChild(form);
    }, 1000 * 10);

    // 触发文件选择框
    input.click();
  }
}
