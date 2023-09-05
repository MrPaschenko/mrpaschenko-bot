'use strict';

const { wa, waFull } = require('./wa');
const { ud } = require('./ud');
const { od, odAudio } = require('./od');
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
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  const callback = (err, response) => {
    if (err) {
      ctx.replyWithMarkdown(err.message, replyOptions);
    } else {
      ctx.replyWithVoice(response, replyOptions);
    }
  };

  if (!input) {
    if (ctx.message.reply_to_message) {
      odAudio(ctx.message.reply_to_message.text, callback);
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        replyOptions
      );
    }
  } else {
    odAudio(input, callback);
  }
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
    ctx.telegram.sendMessage(process.env.GROUP, input).then(r => {
      ctx.reply('Надіслано');
    });
  }
});

bot.command('donate', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  const url = 'https://send.monobank.ua/jar/A6zJ34EjH5';

  ctx.reply('Буду вдячний за копійку 🙃\n' + url, replyOptions);
});

bot.command('thispersondoesnotexist', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  const url = 'https://thispersondoesnotexist.com/';

  ctx.replyWithPhoto(url, replyOptions)
    .catch(e => { ctx.reply(e.message); });
});

bot.command('thiscatdoesnotexist', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  const url = 'https://thiscatdoesnotexist.com/';

  ctx.replyWithPhoto(url, replyOptions)
    .catch(e => { ctx.reply(e.message); });
});

bot.command('thiswaifudoesnotexist', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  const randomNumber = () => Math.floor(Math.random() * 10);
  const number = Array.from({ length: 5 }, () => randomNumber()).join('');
  const url = `https://www.thiswaifudoesnotexist.net/example-${number}.jpg`;

  ctx.replyWithPhoto(url, replyOptions)
    .catch(e => { ctx.reply(e.message); });
});

bot.command('ping', ctx => {
  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };

  ctx.reply('🏓 Я тут', replyOptions);
});

bot.command('latex', ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  // eslint-disable-next-line camelcase
  const replyOptions = { reply_to_message_id: ctx.message.message_id };


  if (!input) {
    if (ctx.message.reply_to_message) {
      ctx.replyWithPhoto('https://math.now.sh?from=' + ctx.message.reply_to_message.text);
    } else {
      ctx.reply(
          'Уведи запит після команди або ' +
          'відправ команду у відповідь на повідомлення',
          replyOptions
      );
    }
  } else {
    ctx.replyWithPhoto('https://math.now.sh?from=' + input);
  }

});

bot.launch().then(() => console.log('Bot has successfully started!'));
