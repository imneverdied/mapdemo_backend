const sql = require('mssql');
const js2xmlparser = require('js2xmlparser');
const xml2js = require('xml2js');

module.exports = function(pool, jsonString, res) {
    // 程式碼片段
    const cleanedXmlString = jsonString.replace(/[\r\n]/g, '');
    xml2js.parseString(cleanedXmlString, function(err, result) {
      if (err) {
        console.error(err);
        res.end('<response>Error parsing XML</response>');
      } else {
                  
        //安全查詢段處理
        if (result.root.area!==undefined) {  //處理ALL
          var area = result.root.area[0];
        }         
        if (result.root.type!==undefined) { //處理ALL
          var type = result.root.type[0];
        }
        if (result.root.status!==undefined) {//處理ALL
          var status = result.root.status[0];
        }        
    
        const request = pool.request();
        let query = 'SELECT * FROM MAP WHERE 1=1';  //有傳值進去查沒有就是ALL
    
        if (area) {   
          query += ' AND region = @region'; //有傳值進去查沒有就是ALL
          request.input('region', sql.VarChar, area);
        }
    
        if (type) {
          query += ' AND event = @event'; //有傳值進去查沒有就是ALL
          request.input('event', sql.VarChar, type);
        }
    
        if (status) {
          query += ' AND status = @status'; //有傳值進去查沒有就是ALL
          request.input('status', sql.VarChar, status);
        }
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
    });


  }



