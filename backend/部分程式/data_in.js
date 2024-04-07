var http = require('http');
const xml2js = require('xml2js');

//接收POST，印出個別資料
var server = http.createServer(function(Q, S) {
  if (Q.method == 'POST') {
    var jsonString = '';

    Q.on('data', function(data) {
      jsonString += data;
    });

    Q.on('end', function() {
      S.writeHead(200, {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*'
      });

      const cleanedXmlString = jsonString.replace(/[\r\n]/g, '');
      xml2js.parseString(cleanedXmlString, function(err, result) {
        if (err) {
          console.error(err);
        } else {
          const area = result.root.area[0];
          const type = result.root.type[0];
          const status = result.root.status[0];
          const time1 = result.root.time1[0];
          const time2 = result.root.time2[0];
          
          console.log('區域:', area);
          console.log('類型:', type);
          console.log('狀態:', status);
          console.log('時間1:', time1);
          console.log('時間2:', time2);
        }
      });

      S.end();
    });
  }
});

//接收POST，印出XML

server.listen(8082, '0.0.0.0');
console.log('Node.js web server at port 8082 is running..');
