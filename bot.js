'use strict';

const { wa, waFull } = require('./wa');
const { ud } = require('./ud');
const { od, odAudio } = require('./od');
const https = require('https');
const { Telegraf } = require('telegraf');

require('dotenv').config();

const bot = new Telegraf(process.env.TOKEN);

bot.start(ctx => {
  ctx.reply('Привіт!\n' +
    'Подивись список команд або відправ /help, щоб дізнатись, що я вмію');
});

bot.help(ctx => {
  ctx.reply('/wa - Запит Wolfram Alpha\n' +
    '/wa_full - Те ж саме, але із повною відповіддю (картинкою)\n' +
    '/ud - Запит Urban Dictionary\n' +
    '/od - Запит Oxford Dictionary\n' +
    '/od_audio - Озвучка слова звідти ж\n' +
    '/help - Список команд\n' +
    '/donate - Підтримати автора\n');
});

bot.command('wa', async ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  let response;

  if (!input) {
    if (ctx.message.reply_to_message) {
      response = await wa(ctx.message.reply_to_message.text);
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        replyOptions
      );

      return;
    }
  } else {
    response = await wa(input);
  }

  const { text, photo } = response;

  if (text) {
    await ctx.reply(text, replyOptions);
  }

  if (photo) {
    await ctx.replyWithPhoto({ source: photo }, replyOptions);
  }
});

bot.command('wa_full', async ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  let response;

  if (!input) {
    if (ctx.message.reply_to_message) {
      response = await waFull(ctx.message.reply_to_message.text);
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        replyOptions
      );

      return;
    }
  } else {
    response = await waFull(input);
  }

  const { text, photo } = response;

  if (text) {
    await ctx.reply(text, replyOptions);
  }

  if (photo) {
    await ctx.replyWithPhoto({ source: photo }, replyOptions);
  }
});

bot.command('ud', async ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  function callback(err, response) {
    if (err) {
      ctx.replyWithMarkdown(err.message, replyOptions);
    } else {
      ctx.replyWithMarkdown(response, replyOptions);
    }
  }

  if (!input) {
    if (ctx.message.reply_to_message) {
      ud(ctx.message.reply_to_message.text, callback);
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        replyOptions
      );
    }
  } else {
    ud(input, callback);
  }
});

bot.command('od', async ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  function callback(err, response) {
    if (err) {
      ctx.replyWithMarkdown(err.message, replyOptions);
    } else {
      ctx.replyWithMarkdown(response, replyOptions);
    }
  }

  if (!input) {
    if (ctx.message.reply_to_message) {
      od(ctx.message.reply_to_message.text, callback);
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        replyOptions
      );
    }
  } else {
    od(input, callback);
  }
});

bot.command('od_audio', ctx => {
  const message = ctx.message.text.split(' ').slice(1).join(' ');

  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  function odAudio(request) {
    if (request === 'aboba') {
      ctx.replyWithAudio('https://api.meowpad.me/v1/download/28034-aboba', replyOptions);
      return;
    }

    const options = {
      host: 'od-api.oxforddictionaries.com',
      port: '443',
      path: `/api/v2/entries/en-us/${request}`,
      method: 'GET',
      headers: {
        'app_id': process.env.APP_ID,
        'app_key': process.env.APP_KEY,
      }
    };

    try {
      https.get(options, res => {
        if (res.statusCode !== 200) {
          const { statusCode, statusMessage } = res;
          ctx.replyWithMarkdown('Нічого не знайдено\n' +
            `_(Status Code: ${statusCode} ${statusMessage})_`, replyOptions);
          return;
        }

        let body = '';
        res.on('data', chunk => {
          body += chunk.toString();
        });

        res.on('end', () => {
          const parsed = JSON.parse(body);
          const audio = parsed.results[0].lexicalEntries[0].entries[0]
            .pronunciations[1].audioFile;
          ctx.replyWithDocument(audio, replyOptions);
        });
      });
    } catch (e) {
      ctx.replyWithMarkdown('Нічого не знайдено\n' +
        `_(${e.message})_`, replyOptions);
    }
  }

  if (!message && ctx.message.reply_to_message) {
    const reply = ctx.message.reply_to_message.text;
    odAudio(reply);
  } else if (!message) {
    ctx.reply('Уведи запит після команди або ' +
      'відправ команду у відповідь на повідомлення', replyOptions);
  } else odAudio(message);
});

// <- Useless functions are here ->
bot.hears(/^[fф]$/i, ctx => {
  ctx.reply('F');
});

bot.on('location', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  ctx.reply(`${ctx.message.location.latitude}\n` +
    `${ctx.message.location.longitude}`, replyOptions);
});

bot.command('send', ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  if (ctx.message.chat.id === parseInt(process.env.ME)) {
    ctx.telegram.sendMessage(process.env.GROUP, input)
      .catch(e => { ctx.reply(e.message); });
  }
});

bot.command('donate', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  ctx.reply('Буду вдячний за копійку 🙃\n' +
    'https://send.monobank.ua/jar/A6zJ34EjH5', replyOptions);
});

bot.command('thispersondoesnotexist', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  ctx.replyWithPhoto({ url: 'https://thispersondoesnotexist.com/' }, replyOptions)
    .catch(e => { ctx.reply(e.message); });
});

bot.command('thiscatdoesnotexist', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  ctx.replyWithPhoto({ url: 'https://thiscatdoesnotexist.com/' }, replyOptions);
});

bot.command('thiswaifudoesnotexist', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  const randomNumber = () => Math.floor(Math.random() * 10);
  ctx.replyWithPhoto({
    url:
      `https://www.thiswaifudoesnotexist.net/example-${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}.jpg`
  }, replyOptions
    .catch(e => { ctx.reply(e.message); }));
});

bot.command('ping', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  ctx.reply('🏓 Я тут', replyOptions);
});

bot.launch().then(() => console.log('Bot has successfully started!'));
