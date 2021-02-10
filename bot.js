'use strict';
const base64ToImage = require('base64-to-image');
const fetch = require('node-fetch');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(config.get('token'));
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = new WolframAlphaAPI(config.get('wolfram'));

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

  async function wa(request) {
	try{
		const result = await waApi.getShort(request);
		await ctx.reply(result);
	}
	catch(err){
		await ctx.reply(err.message);
	}
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

bot.command('wa_simple', ctx => {
  const inputArray = ctx.message.text.split(' ');
  inputArray.shift();
  const input = inputArray.join(' ');

  async function wa(request) {
	try{
		const result = await waApi.getSimple(request);
		await base64ToImage(result, './', {'fileName': 'out', 'type':'gif'});
		setTimeout(async ()=>{
			await ctx.replyWithAnimation({ source: './out.gif' })
		}, 3000)
	}
	catch(err){
		await ctx.reply(err.message);
	}
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
  if (senderChatId === parseFloat(config.get('channel'))) {
    ctx.forwardMessage(config.get('group'));
  }
});

bot.launch();
console.log('Bot has successfully started!');
