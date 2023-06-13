'use strict';

require('dotenv').config();

const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = new WolframAlphaAPI(process.env.WOLFRAM);
async function wa(input) {
  const response = {
    text: '',
    photo: ''
  };

  try {
    response.text = await waApi.getShort(input);
  } catch (err) {
    if (err.message.includes('No short answer available')) {
      try {
        const result = await waApi.getSimple(input); // URI (with suffix)
        const base64 = result.toString().replace(/^.{22}/, '');
        response.photo = Buffer.from(base64, 'base64');
      } catch (err) {
        response.text = err.message;
      }
    } else response.text = err.message;
  }

  return response;
}

async function waFull(input) {
  const response = {
    text: '',
    photo: ''
  };

  try {
    const result = await waApi.getSimple(input); // URI (with suffix)
    const base64 = result.toString().replace(/^.{22}/, '');
    response.photo = Buffer.from(base64, 'base64');
  } catch (err) {
    response.text = err.message;
  }

  return response;
}

module.exports = { wa, waFull };
