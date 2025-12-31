import { Context } from 'grammy';

export async function helpCommand(ctx: Context) {
  await ctx.reply(
    '/wa - Запит Wolfram Alpha\n' +
    '/wa_full - Те ж саме, але із повною відповіддю (картинкою)\n' +
    '/ud - Запит Urban Dictionary\n' +
    '/help - Список команд\n'
  );
}
