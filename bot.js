'use strict';

const config = require('config');
const fetch = require('node-fetch');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(config.get('token'));
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI(config.get('wolfram'));

bot.start(ctx => {
  ctx.reply('Привет!\n' +
    'Посмотри список команд либо отправь /help, чтобы узнать, что я умею');
});

bot.help(ctx => {
  ctx.reply('/wa - Wolfram Alpha запрос\n' +
    '/help - Список команд');
});

bot.command('wa', ctx => {
  const inputArray = ctx.message.text.split(' ');
  inputArray.shift();
  const input = inputArray.join(' ');

  function wa(request) {
    waApi.getShort(request).then(result => {
      ctx.reply(result);
    }).catch(error => {
      ctx.reply(error.message);
    });
  }

  if (!input && ctx.message.reply_to_message) {
    const request = ctx.message.reply_to_message.text;
    wa(request);
  } else if (!input) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else {
    wa(input);
  }
});

bot.command('ud', ctx => {
  const inputArray = ctx.message.text.split(' ');
  inputArray.shift();
  const input = inputArray.join(' ');

  function ud(url) {
    fetch(url)
      .then(res => res.json())
      .then(json => {
        ctx.replyWithMarkdown('*Определение:*\n' +
          `${json.list[0].definition}\n` +
          '\n*Пример использования:*\n' +
          `${json.list[0].example}`);
      }).catch(() => {
        ctx.reply('Ничего не найдено');
      });
  }

  if (!input && ctx.message.reply_to_message) {
    const url = `http://api.urbandictionary.com/v0/define?term=${ctx.message.reply_to_message.text}`;
    ud(url);
  } else if (!input) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else {
    const url = `http://api.urbandictionary.com/v0/define?term=${input}`;
    ud(url);
  }
});

bot.command('f', ctx => {
  ctx.reply('F');
});

bot.command('ping', ctx => {
  ctx.reply('i\'m here');
});

bot.on('channel_post', ctx => {
  const senderChatId = ctx.update.channel_post.sender_chat.id;
  // const text = ctx.update.channel_post.text;
  if (senderChatId === parseFloat(config.get('channel'))) {
    ctx.forwardMessage(config.get('group'));
  }
});

bot.launch();
console.log('Bot has successfully started!');
