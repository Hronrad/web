/*
 * 时间戳转换为 日期
 * 2019-8-26 14:00:00
 * 
 */
function linux_to_date(data, type) {
  if (data <= 0) {
    return "--";
  }
  var time = new Date(parseInt(data) * 1000);
  var Year = time.getFullYear();
  var Month = push_num(time.getMonth() + 1);
  var Dates = push_num(time.getDate());
  var Hours = push_num(time.getHours());
  var Minutes = push_num(time.getMinutes());
  var Seconds = push_num(time.getSeconds());
  if (type == 1) {
    return Year + "-" + Month + "-" + Dates + " " + Hours + ":" + Minutes;
  } else if (type == 2) {
    return Year + "-" + Month + "-" + Dates + " " + Hours;
  } else if (type == 3) {
    return Year + "-" + Month + "-" + Dates;
  } else {
    return Year + "-" + Month + "-" + Dates + " " + Hours + ":" + Minutes + ":" + Seconds;
  }
}

/**
* 日期补全
* 2019-8-26 14:00:00
*/
function push_num(num) {
  if (num < 10) {
    return "0" + num;
  } else {
    return num;
  }
}

/**
 * 导出excel
 * 需引入JsonExportExcel.min.js
 */
function JsonToExcel(jsonData, fileName, sheetName, sheetHeader) {
  if (jsonData.length === 0) {
    alert('导出失败，待导出的数据为空');
  } else {
    var option = {};
    option.fileName = fileName;
    option.datas = [
      {
        sheetData: jsonData,
        sheetName: sheetName,
        sheetHeader: sheetHeader
      }
    ];
    var toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  }
}

/**
 * 获取url参数
 */
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}

/**
 * 防抖函数
 */
function debounce(fn,delay){
  let delays=delay||500;
  let timer;
  return function(){
    let th=this;
    let args=arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer=setTimeout(function () {
      timer=null;
      fn.apply(th,args);
    }, delays);
  };
}