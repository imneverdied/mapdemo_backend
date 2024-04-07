const sql = require('mssql');
const http = require('http');
const callDB = require('./modules/callDB');
const getDefault = require('./modules/getDefault');

//模組化，主程式all4，呼叫'./modules/callDB'

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

     
      // // 呼叫callDB
      // callDB(pool, jsonString, res);

      getDefault(pool, res);

    });
  }
});

server.listen(8081, '0.0.0.0');
console.log('server at port 8081 is running..');
