'use strict';

const fs = require('fs');
const config = require('config');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(config.get('token'));
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI(config.get('wolfram'));

bot.command('gordon', ctx => {
  const min = 1;
  const max = fs.readdirSync('gordon').length;
  const number = Math.round(Math.random() * (max - min) + min);
  const path = `gordon/${number}.jpg`;
  ctx.replyWithPhoto({ source: path });
});

bot.command('wolfram', ctx => {
  const inputArray = ctx.message.text.split(' ');
  inputArray.shift();
  const input = inputArray.join(' ');

  if (!input) {
    ctx.reply('Введи запрос после команды');
  } else {
    waApi.getShort(input).then(input => {
      ctx.reply(input);
    }).catch(error => {
      ctx.reply(error.message);
    });
  }
});

bot.on('message', ctx => {
  const db = JSON.parse(fs.readFileSync('db.json').toString());
  db[ctx.message.from.id] = `@${ctx.message.from.username}`;
  db[ctx.message.chat.id] = ctx.message.chat.title;
  fs.writeFileSync('db.json', JSON.stringify(db));
});

bot.on('channel_post', ctx => {
  const senderChatId = ctx.update.channel_post.sender_chat.id;
  if (senderChatId === parseFloat(config.get('channel'))) {
    ctx.forwardMessage(config.get('group'));
  }
});

bot.launch();
console.log('Bot has successfully started!');
