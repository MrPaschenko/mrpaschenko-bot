import { Context } from 'grammy';

export function latexCommand(ctx: Context) {
  const message = ctx.message;
  if (!message || !message.text) return;

  const input = message.text.split(' ').slice(1).join(' ');

  if (!input) {
    if (message.reply_to_message && 'text' in message.reply_to_message) {
      ctx.replyWithPhoto(`http://latex.codecogs.com/png.latex?%5Cdpi%7B300%7D%20%5Cbg_white%20${input}`, { reply_parameters: { message_id: message.message_id } });
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        { reply_parameters: { message_id: message.message_id } }
      );
    }
  } else {
    ctx.replyWithPhoto(`http://latex.codecogs.com/png.latex?%5Cdpi%7B300%7D%20%5Cbg_white%20${input}`, { reply_parameters: { message_id: message.message_id } });
  }
}
