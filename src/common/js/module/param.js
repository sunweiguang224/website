/**
 * param模块
 * url参数处理模块
 */
module.exports = {
  toObj: function(searchStr){
    var obj = {};
    searchStr = searchStr || location.search.split('?')[1];
    if(searchStr){
      var paramMapArr = searchStr.split("&");
      for(var i in paramMapArr){
        var paramMap = paramMapArr[i].split("=");
        obj[paramMap[0]] = paramMap[1] || '';
      }
    }
    return obj;
  },
  toStr: function(searchObj){
    var str = '';
    if(searchObj){
      for(var i in searchObj){
        str += '&'+i+'='+searchObj[i];
      }
    }
    return str.substr(1);
  },
  getAll: function(url){
    url = url || location.href;
    var searchStr = url.split("?")[1];
    searchStr = searchStr ? searchStr.split('#')[0] : searchStr;
    return this.toObj(searchStr);
  },
  get: function(name, url){
    if(name){
      return this.getAll(url)[name];
    }else{
      throw new Error('name参数不能为空');
    }
  },
  replace: function(map, url){
    url = url || location.href;
    if(map){
      let obj = this.getAll(url);
      for(let i in map){
        obj[i] = map[i];
      }
      return url.split("?")[0] + '?' + this.toStr(obj);
    }else{
      throw new Error('map参数不能为空');
    }
  }
};
