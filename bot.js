'use strict';

const fs = require('fs');
const config = require('config');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(config.get('token'));
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI(config.get('wolfram'));

bot.start(ctx => {
  ctx.reply('Привет!\n' +
    'Посмотри список команд либо отправь /help, чтобы узнать, что я умею');
});

bot.help(ctx => {
  ctx.reply('/wolfram - Wolfram Alpha запрос\n' +
    '/gordon - Рандомная фотка Дмитрия Ильича\n' +
    '/help - Список команд');
});

bot.command('wolfram', ctx => {
  const inputArray = ctx.message.text.split(' ');
  inputArray.shift();
  const input = inputArray.join(' ');
  if (!input && ctx.message.reply_to_message) {
    waApi.getShort(ctx.message.reply_to_message.text).then(result => {
      ctx.reply(result);
    }).catch(error => {
      ctx.reply(error.message);
    });
  } else if (!input) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else {
    waApi.getShort(input).then(result => {
      ctx.reply(result);
    }).catch(error => {
      ctx.reply(error.message);
    });
  }
});

bot.command('gordon', ctx => {
  const min = 1;
  const max = fs.readdirSync('gordon').length;
  const number = Math.round(Math.random() * (max - min) + min);
  const path = `gordon/${number}.jpg`;
  ctx.replyWithPhoto({ source: path });
});

bot.on('channel_post', ctx => {
  const senderChatId = ctx.update.channel_post.sender_chat.id;
  // const text = ctx.update.channel_post.text;
  if (senderChatId === parseFloat(config.get('channel'))) {
    ctx.forwardMessage(config.get('group'));

    // ctx.forwardMessage(config.get('me'));
    // if (text.includes('Українська') || text.includes('Архітектура')) {
    //
    // }
  }
});

bot.launch();
console.log('Bot has successfully started!');
