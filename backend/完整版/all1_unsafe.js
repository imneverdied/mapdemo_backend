const sql = require('mssql');
const xml2js = require('xml2js');
const http = require('http');
const js2xmlparser = require('js2xmlparser');


//接收POST(XML)，查資料庫，回傳XML資料
// 配置資料庫連接

const config = {
    user: '',
    password: '',
    server: '',  // 例如：'localhost' 或 '127.0.0.1'
    database: '',
    port: 1433,
    options: {
        encrypt: false,  // 如果使用SSL加密，設置為true
        enableArithAbort: true  // 可能需要設置這個選項以避免某些錯誤
    }
};

// 創建HTTP服務器
var server = http.createServer(function(req, res) {
  if (req.method == 'POST') {
    var jsonString = '';

    req.on('data', function(data) {
      jsonString += data;
    });

    req.on('end', function() {
      res.writeHead(200, {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*'
      });

      const cleanedXmlString = jsonString.replace(/[\r\n]/g, '');
      xml2js.parseString(cleanedXmlString, function(err, result) {
        if (err) {
          console.error(err);
          res.end('<response>Error parsing XML</response>');
        } else {
          const area = result.root.area[0];
          const type = result.root.type[0];
          const status = result.root.status[0];
          const time1 = result.root.time1[0];
          const time2 = result.root.time2[0];
          // console.log('解析出的XML數據:');
          // console.log('區域:', area);
          // console.log('類型:', type);
          // console.log('狀態:', status);
          // console.log('時間1:', time1);
          // console.log('時間2:', time2);

          sql.connect(config)
            .then(pool => {
              console.log('連接 MSSQL DB');
              const query = `SELECT * FROM MAP WHERE region = '${area}' AND event = '${type}' AND status = '${status}'`;
              //console.log('執行的SQL查詢:', query);
              return pool.request().query(query);
            })
            .then(result => {
              if (result.recordset.length === 0) {
                console.log('沒有找到匹配的記錄');
                res.end('<response>No records found</response>');
              } else {
                // console.log('查詢結果:');
                const records = result.recordset.map(record => ({
                  region: record.region,
                  event: record.event,
                  status: record.status,
                  lat: record.lat,
                  lng: record.lng
                }));
                const xml = js2xmlparser.parse('response', { records });
                res.end(xml);
                console.log('回傳成功');
              }
            })
            .catch(err => {
              console.error('Error:', err);
              res.end('<response>Error occurred</response>');
            });
        }
      });
    });
  }
});

server.listen(8081, '0.0.0.0');
console.log('Node.js web server at port 8081 is running..');