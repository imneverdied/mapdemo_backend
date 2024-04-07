const sql = require('mssql');
const xml2js = require('xml2js');
const http = require('http');
const js2xmlparser = require('js2xmlparser');

// 設定資料庫連接池
const config = {
  user: '',
  password: '',
  server: '',  // 例如：'localhost' 或 '127.0.0.1'
  database: '',
  port: 1433,
  pool: {
    max: 10, // 最大連線數
    min: 0, // 最小連線數
    idleTimeoutMillis: 30000 // 連線閒置超過30秒就釋放
  },
  options: {
    encrypt: false,
    enableArithAbort: true
  }
};

// 建立連接池
const pool = new sql.ConnectionPool(config);
pool.connect()
  .then(() => console.log('Connected to MSSQL database pool'))
  .catch(err => console.error('Error creating database pool', err));

// 創建HTTP服務器
const server = http.createServer(function(req, res) {
  if (req.method === 'POST') {
    let jsonString = '';

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

          const request = pool.request();
          const query = 'SELECT * FROM MAP WHERE region = @region AND event = @event AND status = @status';
          request.input('region', sql.VarChar, area);
          request.input('event', sql.VarChar, type);
          request.input('status', sql.VarChar, status);

          request.query(query)
            .then(result => {
              if (result.recordset.length === 0) {
                console.log('沒有找到匹配的記錄:<response>No records found</response>\n');
                res.end('<response>No records found</response>');
              } else {
                const records = result.recordset.map(record => ({
                  region: record.region,
                  event: record.event,
                  status: record.status,
                  lat: record.lat,
                  lng: record.lng
                }));
                const xml = js2xmlparser.parse('response', { records });
                res.end(xml);
                console.log('回傳成功\n', xml);
              }
            })
            .catch(err => {
              console.error('Error executing query:', err);
              res.end('<response>Error occurred</response>');
            });
        }
      });
    });
  }
});

server.listen(8081, '0.0.0.0');
console.log('server at port 8081 is running..');
