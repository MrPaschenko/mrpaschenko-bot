'use strict';

const config = require('config');
const fetch = require('node-fetch');
const { Telegraf } = require('telegraf');
const { syllabify } = require('syllables-ru');
const base64ToImage = require('base64-to-image');
const WolframAlphaAPI = require('wolfram-alpha-api');

const bot = new Telegraf(config.get('token'));
const waApi = new WolframAlphaAPI(config.get('wolfram'));

bot.start(ctx => {
  ctx.reply('Привет!\n' +
    'Посмотри список команд либо отправь /help, чтобы узнать, что я умею');
});

bot.help(ctx => {
  ctx.reply('/wa - Wolfram Alpha запрос\n' +
    '/wa_full - То же самое, но с полным ответом картинкой\n' +
    '/ud - Urban Dictionary запрос\n' +
    '/help - Список команд\n' +
    '/donate - Кинуть автору на хостинг)');
});

bot.command('wa', async ctx => {
  const inputArray = ctx.message.text.split(' ');
  inputArray.shift();
  const input = inputArray.join(' ');

  async function wa(request) {
    try {
      const result = await waApi.getShort(request);
      await ctx.reply(result);
    } catch (err) {
      if (err.message.includes('No short answer available')) {
        try {
          await ctx.reply('Короткий вариант недоступен, кидаю фотку');
          try {
            await ctx.replyWithDocument({ source: `./pics/${request}.jpg` });
          } catch {
            const result = await waApi.getSimple(request); // base64
            const picProperties = { 'fileName': `${request}`, 'type': 'jpg' };
            await base64ToImage(result, './pics/', picProperties);
            await ctx.replyWithDocument({ source: `./pics/${request}.jpg` });
          }
        } catch (err) {
          await ctx.reply(err.message);
        }
      } else await ctx.reply(err.message);
    }
  }

  if (!input && ctx.message.reply_to_message) {
    await wa(ctx.message.reply_to_message.text);
  } else if (!input) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else {
    await wa(input);
  }
});

bot.command('wa_full', async ctx => {
  const inputArray = ctx.message.text.split(' ');
  inputArray.shift();
  const input = inputArray.join(' ');

  async function waFull(request) {
    try {
      try {
        await ctx.replyWithDocument({ source: `./pics/${request}.jpg` });
      } catch {
        const result = await waApi.getSimple(request); // base64
        const picProperties = { 'fileName': `${request}`, 'type': 'jpg' };
        await base64ToImage(result, './pics/', picProperties);
        await ctx.replyWithDocument({ source: `./pics/${request}.jpg` });
      }
    } catch (err) {
      await ctx.reply(err.message);
    }
  }

  if (!input && ctx.message.reply_to_message) {
    const request = ctx.message.reply_to_message.text;
    await waFull(request);
  } else if (!input) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else {
    await waFull(input);
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

bot.hears(/^[fф]$/i, ctx => {
  ctx.reply('F');
});

bot.command('ping', ctx => {
  ctx.reply('i\'m here');
});

bot.command('donate', ctx => {
  ctx.reply('4149497110283761\n' +
    'https://send.monobank.ua/4Ab8h73dNs');
});

const vowelsRegex = /[аеёиоуыэюяії]/ig;

const syllableCount = text => syllabify(text)
  .replace(/\s+/g, ' ')
  .split(' ')
  .reduce((acc, v) => acc + (
    v.split('·').length === 1 ?
    // Пропускаем предлоги и т.п. без гласных
      (v.match(vowelsRegex) ? 1 : 0) :
      v.split('·').length
  ), 0);

const getHaiku = text => {
  if (syllableCount(text) !== 17) return false;
  if (/\d/.test(text)) return false;

  const words = text.replace(/\s+/g, ' ').split(' ');
  const haiku = [[], [], []];
  let paragraph = 0;

  for (const word of words) {
    haiku[paragraph].push(word);

    const paragraphSyllableCount = syllableCount(haiku[paragraph].join(' '));
    const maxSyllables = [5, 7, 5];

    if (paragraphSyllableCount === maxSyllables[paragraph]) {
      paragraph++;
      continue;
    }

    if (paragraphSyllableCount > maxSyllables[paragraph]) {
      return false;
    }
  }

  return haiku.map(line => line.join(' ')).join('\n');
};

bot.on('text', ctx => {
  const haiku = getHaiku(ctx.message.text);
  const firstName = ctx.message.from.first_name || '';
  const lastName = ctx.message.from.last_name || '';
  const suffix = `— ${firstName} ${lastName}`;
  if (haiku) ctx.reply(`${haiku}\n\n${suffix}`);
});

// Для пересылки сообщений с ссылками на пары
bot.on('channel_post', ctx => {
  const senderChatId = ctx.update.channel_post.sender_chat.id;
  if (senderChatId === parseFloat(config.get('channel'))) {
    ctx.forwardMessage(config.get('group'));
  }
});

bot.launch().then(() => console.log('Bot has successfully started!'));
