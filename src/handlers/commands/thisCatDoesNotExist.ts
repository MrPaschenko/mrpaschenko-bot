import { Context } from 'grammy';

export function thisCatDoesNotExistCommand(ctx: Context) {
  const message = ctx.message;
  if (!message) return;

  const url = 'https://thiscatdoesnotexist.com/';

  ctx.replyWithPhoto(url, { reply_parameters: { message_id: message.message_id } })
    .catch((e: Error) => { ctx.reply(e.message); });
}
