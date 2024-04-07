const sql = require('mssql');

//連接資料庫查詢
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

// 連接到資料庫
sql.connect(config)
    .then(pool => {
        console.log('Connected to MSSQL database');

        // 執行查詢
        return pool.request().query('SELECT * FROM MAP');
    })
    .then(result => {

        result.recordset.forEach(record => {
            console.log(record["region"], record["event"], record["status"], record["lat"], record["lng"]);
        });

    })
    .catch(err => {
        console.error('Error:', err);
    });
