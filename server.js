const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// 允许跨域（本地调试用，生产可按需调整）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 解析 POST 请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源托管
app.use(express.static(__dirname));

// 读取自媒体数据
// 通用读取函数，传入文件名
function getMediaDataByFile(filename) {
  const filePath = path.join(__dirname, filename);
  let dataObj = {
    code: 0,
    msg: '',
    count: 0,
    data: []
  };
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    dataObj = JSON.parse(raw);
    if (!Array.isArray(dataObj.data)) dataObj.data = [];
    if (typeof dataObj.count !== 'number') dataObj.count = dataObj.data.length;
    if (typeof dataObj.code !== 'number') dataObj.code = 0;
    if (typeof dataObj.msg !== 'string') dataObj.msg = '';
  } catch (e) {
    dataObj = {
      code: 0,
      msg: '',
      count: 0,
      data: []
    };
  }
  return dataObj;
}

// 通用接口处理函数
function handlePriceApi(filename, req, res) {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    console.log(`[${filename}] 收到请求参数:`, params);

    let dataObj = getMediaDataByFile(filename);
    let data = dataObj.data;
    console.log(`[${filename}] 原始数据总数:`, data.length);

    const fuzzyMatchFields = ['wemedia_name', 'media_name', 'search_name', 'remark'];

    Object.keys(params).forEach(key => {
      if (key === 'page' || key === 'limit' || key === 'type') return;
      if (params[key] === '' || params[key] === null || params[key] === undefined) return;

      if (fuzzyMatchFields.includes(key)) {
        data = data.filter(item => item[key] && item[key].toString().toLowerCase().includes(params[key].toString().toLowerCase()));
        console.log(`[${filename}] 模糊筛选[${key}=${params[key]}]后数量:`, data.length);
      } else if (key === 'price') {
        const [min, max] = params.price.split('@').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          data = data.filter(item => {
            const price = parseFloat(item.v0_cost);
            return !isNaN(price) && price >= min && price <= max;
          });
          console.log(`[${filename}] 价格筛选[${min}~${max}]后数量:`, data.length);
        } else {
          throw new Error('价格参数格式错误，应为 "min@max"');
        }
      } else {
        data = data.filter(item => item[key] == params[key] || (item[key] === null && params[key] === null));
        console.log(`[${filename}] 精确筛选[${key}=${params[key]}]后数量:`, data.length);
      }
    });

    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const result = data.slice(start, end);

    console.log(`[${filename}] 分页: page=${page}, limit=${limit}, 返回数量:`, result.length);

    res.json({
      code: dataObj.code,
      msg: dataObj.msg,
      count: data.length,
      data: result
    });
  } catch (error) {
    console.error(`[${filename}] 接口处理异常:`, error);
    res.status(400).json({
      code: 1,
      message: error.message || '请求处理失败',
      data: [],
      total: 0
    });
  }
}


// 路由注册
app.all('/price_zmt.html', (req, res) => handlePriceApi('price_zmt.html', req, res));
app.all('/price.html', (req, res) => handlePriceApi('price.html', req, res));


// 启动服务
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});