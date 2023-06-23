'use strict';

const https = require('https');

function ud(request, callback) {
  let response = '';

  const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(request)}`;

  https.get(url, res => {
    if (res.statusCode !== 200) {
      const { statusCode, statusMessage } = res;
      response = 'Нічого не знайдено\n' +
          `_(Status Code: ${statusCode} ${statusMessage})_`;
      callback(new Error(response));
      return;
    }

    let body = '';
    res.on('data', chunk => {
      body += chunk.toString();
    });

    res.on('end', () => {
      const parsed = JSON.parse(body);
      if (!parsed.list[0]) {
        response = 'Нічого не знайдено';
        callback(new Error(response));
      } else {
        response = '*Визначення:*\n' +
          `${parsed.list[0].definition}\n` +
          '\n*Приклад використання:*\n' +
          `${parsed.list[0].example}`;
        callback(null, response);
      }
    });
  });
}

module.exports = { ud };
