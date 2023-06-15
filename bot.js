'use strict';

const { wa, waFull } = require('./wa');
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

  let response;

  if (!input) {
    if (ctx.message.reply_to_message) {
      response = await wa(ctx.message.reply_to_message.text);
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        // eslint-disable-next-line camelcase
        { reply_to_message_id: ctx.message.message_id }
      );

      return;
    }
  } else {
    response = await wa(input);
  }

  const { text, photo } = response;

  if (text) {
    await ctx.reply(text,
      // eslint-disable-next-line camelcase
      { reply_to_message_id: ctx.message.message_id });
  }

  if (photo) {
    await ctx.replyWithPhoto({ source: photo },
      // eslint-disable-next-line camelcase
      { reply_to_message_id: ctx.message.message_id });
  }
});

bot.command('wa_full', async ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  let response;

  if (!input) {
    if (ctx.message.reply_to_message) {
      response = await waFull(ctx.message.reply_to_message.text);
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        // eslint-disable-next-line camelcase
        { reply_to_message_id: ctx.message.message_id }
      );

      return;
    }
  } else {
    response = await waFull(input);
  }

  const { text, photo } = response;

  if (text) {
    await ctx.reply(text,
      // eslint-disable-next-line camelcase
      { reply_to_message_id: ctx.message.message_id });
  }

  if (photo) {
    await ctx.replyWithPhoto({ source: photo },
      // eslint-disable-next-line camelcase
      { reply_to_message_id: ctx.message.message_id });
  }
});

bot.command('ud', async ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  function ud(request) {
    try {
      https.get(`https://api.urbandictionary.com/v0/define?term=${request}`, res => {
        if (res.statusCode !== 200) {
          const { statusCode, statusMessage } = res;
          ctx.replyWithMarkdown('Нічого не знайдено\n' +
            `_(Status Code: ${statusCode} ${statusMessage})_`,
            // eslint-disable-next-line camelcase
            { reply_to_message_id: ctx.message.message_id });
          return;
        }

        let body = '';
        res.on('data', chunk => {
          body += chunk.toString();
        });

        res.on('end', () => {
          const parsed = JSON.parse(body);
          if (!parsed.list[0]) {
            ctx.reply('Нічого не знайдено',
              // eslint-disable-next-line camelcase
              { reply_to_message_id: ctx.message.message_id });
            return;
          }
          ctx.replyWithMarkdown('*Визначення:*\n' +
            `${parsed.list[0].definition}\n` +
            '\n*Приклад використання:*\n' +
            `${parsed.list[0].example}`,
            // eslint-disable-next-line camelcase
            { reply_to_message_id: ctx.message.message_id });
        });
      });
    } catch (e) {
      ctx.replyWithMarkdown('Нічого не знайдено\n' +
        `_(${e.message})_`,
        // eslint-disable-next-line camelcase
        { reply_to_message_id: ctx.message.message_id });
    }
  }

  if (!input && ctx.message.reply_to_message) {
    ud(ctx.message.reply_to_message.text);
  } else if (!input) {
    ctx.reply('Уведи запит після команди або ' +
      'відправ команду у відповідь на повідомлення',
      // eslint-disable-next-line camelcase
      { reply_to_message_id: ctx.message.message_id });
  } else {
    ud(input);
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
        'app_id': process.env.APP_ID,
        'app_key': process.env.APP_KEY,
      }
    };

    try {
      https.get(options, res => {
        if (res.statusCode !== 200) {
          const { statusCode, statusMessage } = res;
          ctx.replyWithMarkdown('Нічого не знайдено\n' +
            `_(Status Code: ${statusCode} ${statusMessage})_`);
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
          ctx.replyWithMarkdown('*Визначення:*\n' +
            `${main.definitions[0]}\n` + examples);
        });
      });
    } catch (e) {
      ctx.replyWithMarkdown('Нічого не знайдено\n' +
        `_(${e.message})_`);
    }
  }

  if (!input && ctx.message.reply_to_message) {
    const input = ctx.message.reply_to_message.text;
    od(input);
  } else if (!input) {
    ctx.reply('Уведи запит після команди або ' +
      'відправ команду у відповідь на повідомлення');
  } else {
    od(input);
  }
});

bot.command('od_audio', ctx => {
  const message = ctx.message.text.split(' ').slice(1).join(' ');

  function odAudio(request) {
    if (request === 'aboba') {
      ctx.replyWithAudio('https://api.meowpad.me/v1/download/28034-aboba');
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
            `_(Status Code: ${statusCode} ${statusMessage})_`);
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
          ctx.replyWithDocument(audio);
        });
      });
    } catch (e) {
      ctx.replyWithMarkdown('Нічого не знайдено\n' +
        `_(${e.message})_`);
    }
  }

  if (!message && ctx.message.reply_to_message) {
    const reply = ctx.message.reply_to_message.text;
    odAudio(reply);
  } else if (!message) {
    ctx.reply('Уведи запит після команди або ' +
      'відправ команду у відповідь на повідомлення');
  } else odAudio(message);
});

// <- Useless functions are here ->
bot.hears(/^[fф]$/i, ctx => {
  ctx.reply('F');
});

bot.on('location', ctx => {
  ctx.reply(`${ctx.message.location.latitude}\n` +
    `${ctx.message.location.longitude}`,
    // eslint-disable-next-line camelcase
    { reply_to_message_id: ctx.message.message_id });
  console.log(ctx.message.location);
});

bot.command('send', ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  if (ctx.message.chat.id === parseInt(process.env.ME)) {
    ctx.telegram.sendMessage(process.env.GROUP, input)
      .catch(e => { ctx.reply(e.message); });
  }
});

bot.command('donate', ctx => {
  ctx.reply('Буду вдячний за копійку 🙃\n' +
    'https://send.monobank.ua/jar/A6zJ34EjH5',
    // eslint-disable-next-line camelcase
    { reply_to_message_id: ctx.message.message_id });
});

bot.command('thispersondoesnotexist', ctx => {
  ctx.replyWithPhoto({ url: 'https://thispersondoesnotexist.com/' },
    // eslint-disable-next-line camelcase
    { reply_to_message_id: ctx.message.message_id })
    .catch(e => { ctx.reply(e.message); });
});

bot.command('thiscatdoesnotexist', ctx => {
  ctx.replyWithPhoto({ url: 'https://thiscatdoesnotexist.com/' },
    // eslint-disable-next-line camelcase
    { reply_to_message_id: ctx.message.message_id });
});

bot.command('thiswaifudoesnotexist', ctx => {
  const randomNumber = () => Math.floor(Math.random() * 10);
  ctx.replyWithPhoto({
    url:
      `https://www.thiswaifudoesnotexist.net/example-${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}.jpg`
    // eslint-disable-next-line camelcase
  }, { reply_to_message_id: ctx.message.message_id })
    .catch(e => { ctx.reply(e.message); });
});

bot.command('ping', ctx => {
  ctx.reply('🏓 Я тут',
    // eslint-disable-next-line camelcase
    { reply_to_message_id: ctx.message.message_id });
});

bot.launch().then(() => console.log('Bot has successfully started!'));
