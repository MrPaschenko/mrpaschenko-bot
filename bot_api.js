'use strict';

require('dotenv').config();
const https = require('https');
const fetch = require('node-fetch');
const timeTable = require('./timetable.json');
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = new WolframAlphaAPI(process.env.wolfram);

Date.prototype.getWeek = function() {
  const day = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - day) / 86400000) + day.getDay() + 1) / 7);
};

module.exports = class Bot {
  constructor() {
  }

  static normalizeInput(input) {
    return input.split(' ').slice(1).join(' ');
  }

  static async wa(ctx, request) {
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

  static async waFull(ctx, request) {
    try {
      const result = await waApi.getSimple(request); // URI (with suffix)
      const base64 = result.toString().replace(/^.{22}/, '');
      await ctx.replyWithPhoto({ source: Buffer.from(base64, 'base64') });
    } catch (err) {
      await ctx.reply(err.message);
    }
  }

  static async ud(ctx, request) {
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

  static async odRequest(ctx, request) {
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

  static async odAudioRequest(ctx, request) {
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
  }

  async start(ctx) {
    await ctx.reply('Привет!\n' +
		'Посмотри список команд либо отправь /help, чтобы узнать, что я умею');
  }

  async help(ctx) {
    ctx.reply('/wa - Wolfram Alpha запрос\n' +
			'/wa_full - То же самое, но с полным ответом картинкой\n' +
			'/ud - Urban Dictionary запрос\n' +
			'/od - Oxford Dictionary запрос\n' +
			'/od_audio - Озвучка слова оттуда же\n' +
			'/help - Список команд\n' +
			'/donate - Кинуть автору на хостинг)\n');
  }

  async wolframApi(ctx) {

    const input = Bot.normalizeInput(ctx.message.text);

    if (!input && ctx.message.reply_to_message) {
      await Bot.wa(ctx, ctx.message.reply_to_message.text);
    } else if (!input) {
      ctx.reply('Введи запрос после команды или ' +
				'отправь команду в ответ на сообщение');
    } else {
      await Bot.wa(ctx, input);
    }
  }

  async wolframFull(ctx) {

    const input = Bot.normalizeInput(ctx.message.text);

    if (!input && ctx.message.reply_to_message) {
      const request = ctx.message.reply_to_message.text;
      await Bot.waFull(ctx, request);
    } else if (!input) {
      ctx.reply('Введи запрос после команды или ' +
      'отправь команду в ответ на сообщение');
    } else {
      await Bot.waFull(ctx, input);
    }
  }

  async ud(ctx) {
    const input = Bot.normalizeInput(ctx.message.text);
    if (!input && ctx.message.reply_to_message) {
      const url = `http://api.urbandictionary.com/v0/define?term=${ctx.message.reply_to_message.text}`;
      await Bot.ud(ctx, url);
    } else if (!input) {
      ctx.reply('Введи запрос после команды или ' +
			'отправь команду в ответ на сообщение');
    } else {
      const url = `http://api.urbandictionary.com/v0/define?term=${input}`;
      await Bot.ud(ctx, url);
    }
  }

  async od(ctx) {
    const input = Bot.normalizeInput(ctx.message.text);
    if (!input && ctx.message.reply_to_message) {
      const input = ctx.message.reply_to_message.text;
      await Bot.odRequest(ctx, input);
    } else if (!input) {
      ctx.reply('Введи запрос после команды или ' +
			'отправь команду в ответ на сообщение');
    } else {
      Bot.odRequest(ctx, input);
    }
  }

  async odAudio(ctx) {
    const input = Bot.normalizeInput(ctx.message.text);

    if (!input && ctx.message.reply_to_message) {
      const input = ctx.message.reply_to_message.text;
      Bot.odAudioRequest(ctx, input);
    } else if (!input) {
      ctx.reply('Введи запрос после команды или ' +
			'отправь команду в ответ на сообщение');
    } else {
      await Bot.odAudioRequest(ctx, input);
    }
  }

  async getSchedule(ctx, timetable) {
    const weekNumber = (new Date()).getWeek();

    const lessons = (weekNumber % 2) ? timeTable['second_week'] : timeTable['first_week'];
    const dayOfWeek = (new Date()).getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      await ctx.reply('Сегодня выходной!');
    }

    const schedule = Object.keys(lessons);
    const day = lessons[schedule[dayOfWeek - 1]];


    let message = '';
    let counter = 1;
    for (const pair of day) {
      message += `*${counter} пара:*\n`;
      const lessonKeys = Object.keys(pair);
      for (const key of lessonKeys) {
        message += `${pair[key]}\n`;
      }
      counter++;
    }
    await ctx.replyWithMarkdown(message).catch(async e => {
      await ctx.reply(e.message);
    });
  }

  async getWeek(ctx) {
    const weekNumber = (new Date()).getWeek();
    if (weekNumber % 2) ctx.reply('Щас вторая неделя');
    ctx.reply('Щас первая неделя');
  }

  async donate(ctx) {
    await ctx.reply('5375414126741049');
  }

  async respect(ctx) {
    await ctx.reply('F');
  }

  async ping(ctx) {
    await ctx.reply('i\'m here');
  }

  async thispersondoesnotexist(ctx) {
    await ctx.replyWithPhoto({ url: 'https://thispersondoesnotexist.com/image' });
  }

  async send(ctx) {
    const input = Bot.normalizeInput(ctx.message.text);
    if (ctx.message.chat.id === parseInt(process.env.me)) {
      await ctx.telegram.sendMessage(process.env.group, input)
        .catch(e => { ctx.reply(e.message); });
    }
  }

  async channelPost(ctx) {
    const senderChatId = ctx.update.channel_post.sender_chat.id;
    if (senderChatId === parseInt(process.env.channel)) {
      ctx.forwardMessage(process.env.group);
    }
  }
};
