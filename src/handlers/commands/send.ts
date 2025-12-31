import { Context } from 'grammy';

export function sendCommand(ctx: Context) {
  const message = ctx.message;
  if (!message || !message.text) return;

  const input = message.text.split(' ').slice(1).join(' ');

  if (message.chat.id === parseInt(process.env.ME!)) {
    ctx.api.sendMessage(process.env.GROUP!, input).then(() => {
      ctx.reply('Надіслано');
    });
  }
}
