import { Context } from 'grammy';

export async function startCommand(ctx: Context) {
  await ctx.reply(
    'Привіт!\n' +
    'Подивись список команд або відправ /help, щоб дізнатись, що я вмію'
  );
}
