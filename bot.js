'use strict';

require('dotenv').config();
const Bot = require('./bot_api.js');
const { Telegraf } = require('telegraf');

const telebot = new Telegraf(process.env.token);
const bot = new Bot();

telebot.start(bot.start);

telebot.help(bot.help);

telebot.command('wa', bot.wolframApi);

telebot.command('wa_full', bot.wolframFull);

telebot.command('ud', bot.ud);

telebot.command('od', bot.od);

telebot.command('od_audio', bot.odAudio);

telebot.command('get_schedule', bot.getSchedule);

telebot.command('get_week', bot.getWeek);

telebot.command('donate', bot.donate);

telebot.hears(/^[fф]$/i, bot.respect);

telebot.command('ping', bot.ping);

telebot.command('thispersondoesnotexist', bot.thispersondoesnotexist);

telebot.command('send', bot.send);

// Для пересылки сообщений с ссылками на пары
telebot.on('channel_post', bot.channelPost);

telebot.launch().then(() => console.log('Bot has successfully started!'));
