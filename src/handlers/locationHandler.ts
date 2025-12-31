import { Context } from 'grammy';

export function locationHandler(ctx: Context) {
  const message = ctx.message;
  if (!message || !message.location) return;

  ctx.reply(
    `${message.location.latitude}\n${message.location.longitude}`,
    { reply_parameters: { message_id: message.message_id } }
  );
}
