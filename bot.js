'use strict';

const https = require('https');
const { Telegraf } = require('telegraf');
const WolframAlphaAPI = require('wolfram-alpha-api');

require('dotenv').config();

const bot = new Telegraf(process.env.TOKEN);
const waApi = new WolframAlphaAPI(process.env.WOLFRAM);

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

  function ud(request) {
    try {
      https.get(`https://api.urbandictionary.com/v0/define?term=${request}`, res => {
        if (res.statusCode !== 200) {
          const { statusCode, statusMessage } = res;
          ctx.replyWithMarkdown('Ничего не найдено\n' +
            `_(Status Code: ${statusCode} ${statusMessage})_`);
          return;
        }

        let body = '';
        res.on('data', chunk => {
          body += chunk.toString();
        });

        res.on('end', () => {
          const parsed = JSON.parse(body);
          if (!parsed.list[0]) {
            ctx.reply('Ничего не найдено');
            return;
          }
          ctx.replyWithMarkdown('*Определение:*\n' +
            `${parsed.list[0].definition}\n` +
            '\n*Пример использования:*\n' +
            `${parsed.list[0].example}`);
        });
      });
    } catch (e) {
      ctx.replyWithMarkdown('Ничего не найдено\n' +
        `_(${e.message})_`);
    }
  }

  if (!input && ctx.message.reply_to_message) {
    ud(ctx.message.reply_to_message.text);
  } else if (!input) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else {
    await ud(input);
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
          ctx.replyWithMarkdown('Ничего не найдено\n' +
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
            examples = `\n*Пример использования:*\n${main.examples[0].text}`;
          }
          ctx.replyWithMarkdown('*Определение:*\n' +
            `${main.definitions[0]}\n` + examples);
        });
      });
    } catch (e) {
      ctx.replyWithMarkdown('Ничего не найдено\n' +
        `_(${e.message})_`);
    }
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
          ctx.replyWithMarkdown('Ничего не найдено\n' +
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
      ctx.replyWithMarkdown('Ничего не найдено\n' +
        `_(${e.message})_`);
    }
  }

  if (!message && ctx.message.reply_to_message) {
    const reply = ctx.message.reply_to_message.text;
    odAudio(reply);
  } else if (!message) {
    ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
  } else odAudio(message);
});

bot.command('broot', ctx => {
  function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  function isLuhn(value) {
    if (value.length !== 16) return false;

    let nCheck = 0, nDigit = 0, bEven = false;
    value = value.replace(/\D/g, '');

    for (let n = value.length - 1; n >= 0; n--) {
      const cDigit = value.charAt(n);
      nDigit = parseInt(cDigit, 10);

      if (bEven) {
        if ((nDigit *= 2) > 9) nDigit -= 9;
      }

      nCheck += nDigit;
      bEven = !bEven;
    }

    return (nCheck % 10) === 0;
  }

  function broot(number) {
    const nums = [];
    if (number.includes('x')) {
      for (let a = 0; a <= 9; a++) {
        const newNumber = setCharAt(number, number.indexOf('x'), a);
        if (isLuhn(newNumber) && !newNumber.includes('x')) {
          nums.push(newNumber);
        }
        broot(newNumber);
      }
    }
    bot.reply(nums.join('\n'));
  }

  const input = ctx.message.text.split(' ').slice(1).join(' ');
  broot(input);
});

// <- Мелкие, бесполезные команды начинаются здесь ->
bot.hears(/^[fф]$/i, ctx => {
  ctx.reply('F');
});

bot.on('location', ctx => {
  ctx.reply(`${ctx.message.location.latitude}\n` +
    `${ctx.message.location.longitude}`);
  console.log(ctx.message.location);
});

bot.command('send', ctx => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');

  if (ctx.message.chat.id === parseInt(process.env.ME)) {
    ctx.telegram.sendMessage(process.env.GROUP, input)
      .catch(e => { ctx.reply(e.message); });
  }
});

bot.command('document', ctx => {
  if (ctx.message.reply_to_message.text) {
    ctx.replyWithDocument({ url: ctx.message.reply_to_message.text })
      .catch(e => {
        ctx.replyWithMarkdown(`_${e.message}_`);
      });
  }
});

bot.command('donate', ctx => {
  ctx.reply('Можешь кинуть разработчику на сервер, но это необязательно :)' +
    'https://send.monobank.ua/jar/A6zJ34EjH5');
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
  if (senderChatId === parseInt(process.env.CHANNEL)) {
    ctx.forwardMessage(process.env.GROUP);
  }
});

bot.launch().then(() => console.log('Bot has successfully started!'));
