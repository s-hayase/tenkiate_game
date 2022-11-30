'use strict';
const https = require('https');
const http = require('http');
const pug = require('pug');
const server = http
  .createServer((req, res) => {
    const now = new Date();
    console.info(`[${now}] Requested by ${req.socket.remoteAddress}`);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    switch (req.method) {
      case 'GET':
        let item = ["晴れ", "曇り", "雨"]
        res.write(pug.renderFile('./form.pug', {
          path: 'answer',
          firstItem: item[0],
          secondItem: item[1],
          thirdItem: item[2]
        }));
        res.end();
        break;
      case 'POST':
        let rawData = '';
        req
          .on('data', chunk => {
            rawData += chunk;
          })
          .on('end', () => {
            const decoded = decodeURIComponent(rawData);
            let params = new URLSearchParams(decoded);
            const userName = params.get("name");
            const ans_tenki = params.get("tenki");
            console.info(ans_tenki);
            if (ans_tenki === tenki.title) {
              res.write(pug.renderFile('./answer.pug', {
                answer: '正解！',
                user:userName,
                tokyo_tenki:tenki.title,
                choise_tenki: ans_tenki,
                imgsrc:tenki.url
              }));
            } else {
              res.write(pug.renderFile('./answer.pug', {
                answer: '残念！',
                user:userName,
                tokyo_tenki:tenki.title,
                choise_tenki: ans_tenki,
                imgsrc:tenki.url
              }));
            }
            res.end();
          });
        break;
      default:
        break;
    }
  })
  .on('error', e => {
    console.error(`[${new Date()}] Server Error`, e);
  })
  .on('clientError', e => {
    console.error(`[${new Date()}] Client Error`, e);
  });

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.info(`[${new Date()}] Listening on ${port}`);
});

let options = {
  headers: {
    'user-agent': 'Nyobi'
  }
};

let tenki = { title: null, url: null };

const client = https.get('https://weather.tsukumijima.net/api/forecast?city=130010', options, (res) => {
  console.info(res.statusCode);
  let text = ' ';
  res.on('data', (chunk) => {
    text += chunk;
  });
  res.on('end', () => {
    const data = JSON.parse(text);
    console.log(data.forecasts[1].image.title);
    console.log(data.forecasts[1].image.url);
    tenki.url = data.forecasts[1].image.url;
    const data_title = data.forecasts[1].image.title;
    if (data_title.indexOf("晴") != -1) {
      tenki.title = "晴れ";
    } else if (data_title.indexOf("曇") != -1) {
      tenki.title = "曇り";
    } else {
      tenki.title = "雨";
    }
    client.end();
  });
})

client.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  client.end();
});

