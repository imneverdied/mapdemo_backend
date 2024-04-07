const js2xmlparser = require('js2xmlparser');

module.exports = function(pool,  res) {
                   
        const request = pool.request();
        let query = 'SELECT * FROM MAP WHERE status not in(\'處理完成\')'; 
    
        //安全查詢段處理
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



  


