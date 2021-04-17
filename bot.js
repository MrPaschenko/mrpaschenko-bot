'use strict';

const https = require('https');
const fetch = require('node-fetch');
const { Telegraf } = require('telegraf');
const WolframAlphaAPI = require('wolfram-alpha-api');

require('dotenv').config();

const bot = new Telegraf(process.env.token);
const waApi = new WolframAlphaAPI(process.env.wolfram);

bot.start(ctx => {
  ctx.reply('Привет!\n' +
    'Посмотри список команд либо отправь /help, чтобы узнать, что я умею');
});

bot.help(ctx => {
  ctx.reply('/wa - Wolfram Alpha запрос\n' +
    '/wa_full - То же самое, но с полным ответом картинкой\n' +
    '/ud - Urban Dictionary запрос\n' +
    '/od - Oxford Dictionary запрос\n' +
    '/od_audio - Озвучка слова оттуда же\n' +
    '/help - Список команд\n' +
    '/donate - Кинуть автору на хостинг)\n');
});

bot.command('wa', async ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  async function wa(request) {
    try {
      const result = await waApi.getShort(request);
      await ctx.reply(result);
    } catch (err) {
      if (err.message.includes('No short answer available')) {
        try {
          await ctx.reply('Короткий вариант недоступен, кидаю фотку');
          const result = await waApi.getSimple(request); // URI (with suffix)
          const base64 = result.toString().replace(/^.{22}/, '');
          await ctx.replyWithPhoto({ source: Buffer.from(base64, 'base64') });
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
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  async function waFull(request) {
    try {
      const result = await waApi.getSimple(request); // URI (with suffix)
      const base64 = result.toString().replace(/^.{22}/, '');
      await ctx.replyWithPhoto({ source: Buffer.from(base64, 'base64') });
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

bot.command('ud', async ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  async function ud(request) {
    try {
      const result = await fetch(request);
      const json = await result.json();
      await ctx.replyWithMarkdown('*Определение:*\n' +
        `${json.list[0].definition}\n` +
        '\n*Пример использования:*\n' +
        `${json.list[0].example}`);
    } catch (err) {
      await ctx.reply('Ничего не найдено');
      console.log(err.message);
    }
  }

  if (!input && ctx.message.reply_to_message) {
    const url = `http://api.urbandictionary.com/v0/define?term=${ctx.message.reply_to_message.text}`;
    await ud(url);
  } else if (!input) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else {
    const url = `http://api.urbandictionary.com/v0/define?term=${input}`;
    await ud(url);
  }
});

bot.command('od', async ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  function od(request) {
    const options = {
      host: 'od-api.oxforddictionaries.com',
      port: '443',
      path: `/api/v2/entries/en-us/${request}`,
      method: 'GET',
      headers: {
        'app_id': process.env.app_id,
        'app_key': process.env.app_key,
      }
    };

    https.get(options, resp => {
      let body = '';
      resp.on('data', d => {
        body += d;
      });
      resp.on('end', () => {
        const json = JSON.parse(body);

        if (json.results === undefined) {
          ctx.reply('Ничего не найдено');
        } else {
          const main = json.results[0].lexicalEntries[0].entries[0].senses[0];
          let examples = '';
          if (main.examples) {
            examples = `\n*Пример использования:*\n${main.examples[0].text}`;
          }
          ctx.replyWithMarkdown('*Определение:*\n' +
            `${main.definitions[0]}\n` + examples);
        }
      });
    });
  }

  if (!input && ctx.message.reply_to_message) {
    const input = ctx.message.reply_to_message.text;
    od(input);
  } else if (!input) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else {
    od(input);
  }
});

bot.command('od_audio', ctx => {
  const message = ctx.message.text.split(' ').slice(1).join(' ');

  function od(request) {
    if (/[a-z]/ig.test(request)) {
      const options = {
        host: 'od-api.oxforddictionaries.com',
        port: '443',
        path: `/api/v2/entries/en-us/${request}`,
        method: 'GET',
        headers: {
          'app_id': process.env.app_id,
          'app_key': process.env.app_key,
        }
      };

      https.get(options, resp => {
        let body = '';
        resp.on('data', d => {
          body += d;
        });
        resp.on('end', () => {
          const json = JSON.parse(body);

          if (json.results === undefined) {
            ctx.reply('Ничего не найдено');
          } else {
            const audio = json.results[0].lexicalEntries[0].entries[0]
              .pronunciations[1].audioFile;
            ctx.replyWithDocument(audio);
          }
        });
      });
    } else ctx.reply('Ничего не найдено');
  }

  if (message.toLowerCase() === 'aboba') {
    ctx.replyWithAudio('https://api.meowpad.me/v1/download/28034-aboba');
  } else if (!message && ctx.message.reply_to_message) {
    const reply = ctx.message.reply_to_message.text;
    if (reply.toLowerCase() === 'aboba') {
      ctx.replyWithAudio('https://api.meowpad.me/v1/download/28034-aboba');
    } else od(reply);
  } else if (!message) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else od(message);
});

// <- Мелкие, бесполезные команды начинаются здесь ->
bot.hears(/^[fф]$/i, ctx => {
  ctx.reply('F');
});

bot.hears(/^-?[0-9][0-9,.]+$/, ctx => {
  ctx.reply(`Нет, ${parseFloat(ctx.message.text) + 1}`,
    // eslint-disable-next-line camelcase
    { reply_to_message_id: ctx.message.message_id });
});

bot.on('location', ctx => {
  ctx.reply(`${ctx.message.location.latitude}\n` +
    `${ctx.message.location.longitude}`);
  console.log(ctx.message.location);
});

bot.command('send', ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  if (ctx.message.chat.id === parseInt(process.env.me)) {
    ctx.telegram.sendMessage(process.env.group, input)
      .catch(e => { ctx.reply(e.message); });
  }
});

bot.command('donate', ctx => {
  ctx.reply('Сервер бесплатный, лучше задонать деткам:\n' +
    'https://pomogaem.com.ua/help/healthy/');
});

bot.command('thispersondoesnotexist', ctx => {
  ctx.replyWithPhoto({ url: 'https://thispersondoesnotexist.com/image' });
});

bot.command('thiscatdoesnotexist', ctx => {
  ctx.replyWithPhoto({ url: 'https://thiscatdoesnotexist.com/' });
});

bot.command('thiswaifudoesnotexist', ctx => {
  const randomNumber = () => Math.floor(Math.random() * 10);
  ctx.replyWithPhoto({
    url:
      `https://www.thiswaifudoesnotexist.net/example-${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}.jpg`
  }).catch(e => { ctx.reply(e.message); });
});

bot.command('ping', ctx => {
  ctx.reply('i\'m here');
});
// <- Мелкие, бесполезные команды заканчиваются здесь ->

// Для пересылки сообщений с ссылками на пары
bot.on('channel_post', ctx => {
  const senderChatId = ctx.update.channel_post.sender_chat.id;
  if (senderChatId === parseInt(process.env.channel)) {
    ctx.forwardMessage(process.env.group);
  }
});

bot.launch().then(() => console.log('Bot has successfully started!'));
