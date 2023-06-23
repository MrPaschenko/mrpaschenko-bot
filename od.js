'use strict';

const https = require('https');

require('dotenv').config();

function od(request, callback) {
  const options = {
    host: 'od-api.oxforddictionaries.com',
    port: '443',
    path: `/api/v2/entries/en-us/${encodeURIComponent(request)}`,
    method: 'GET',
    headers: {
      'app_id': process.env.APP_ID,
      'app_key': process.env.APP_KEY,
    }
  };

  https.get(options, res => {
    if (res.statusCode !== 200) {
      const { statusCode, statusMessage } = res;
      const response = 'Нічого не знайдено\n' +
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
      const main = parsed.results[0].lexicalEntries[0].entries[0].senses[0];
      let examples = '';
      if (main.examples) {
        examples = `\n*Приклад використання:*\n${main.examples[0].text}`;
      }

      const response = `*Визначення:*\n${main.definitions[0]}\n${examples}`;
      callback(null, response);
    });
  });
}

module.exports = { od };
