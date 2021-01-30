'use strict';

const { Telegraf } = require('telegraf');
const fs = require('fs');
const config = require('config');
const bot = new Telegraf(config.get('token'));

bot.on('message', ctx => {
  const db = JSON.parse(fs.readFileSync('db.json').toString());
  db[ctx.message.from.id] = `@${ctx.message.from.username}`;
  db[ctx.message.chat.id] = ctx.message.chat.title;
  fs.writeFileSync('db.json', JSON.stringify(db));
});

bot.on('channel_post', ctx => {
  if (ctx.update.channel_post.sender_chat.id === -1001341697220) {
    ctx.forwardMessage(197415735);
  }
});

bot.launch();
console.log('Bot has successfully started!');
