import { Context } from 'grammy';

export function thisWaifuDoesNotExistCommand(ctx: Context) {
  const message = ctx.message;
  if (!message) return;

  const randomNumber = () => Math.floor(Math.random() * 10);
  const number = Array.from({ length: 5 }, () => randomNumber()).join('');
  const url = `https://www.thiswaifudoesnotexist.net/example-${number}.jpg`;

  ctx.replyWithPhoto(url, { reply_parameters: { message_id: message.message_id } })
    .catch((e: Error) => { ctx.reply(e.message); });
}
