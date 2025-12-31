import { Context } from 'grammy';

export async function pingCommand(ctx: Context) {
  const message = ctx.message;
  if (!message) return;

  await ctx.reply('🏓 Я тут', { reply_parameters: { message_id: message.message_id } });
}
