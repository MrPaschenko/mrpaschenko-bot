import { Context } from 'grammy';

export function thisPersonDoesNotExistCommand(ctx: Context) {
  const message = ctx.message;
  if (!message) return;

  const url = 'https://thispersondoesnotexist.com/';

  ctx.replyWithPhoto(url, { reply_parameters: { message_id: message.message_id } })
    .catch((e: Error) => { ctx.reply(e.message); });
}
