import 'dotenv/config';
import { Bot } from 'grammy';
import {
  startCommand,
  helpCommand,
  waCommand,
  waFullCommand,
  udCommand,
  odCommand,
  odAudioCommand,
  sendCommand,
  thisPersonDoesNotExistCommand,
  thisCatDoesNotExistCommand,
  thisWaifuDoesNotExistCommand,
  pingCommand,
  latexCommand
} from './handlers/commands';
import { fHandler, locationHandler } from './handlers';

const bot = new Bot(process.env.TOKEN!);

// Command handlers
bot.command('start', startCommand);
bot.command('help', helpCommand);
bot.command('wa', waCommand);
bot.command('wa_full', waFullCommand);
bot.command('ud', udCommand);
bot.command('od', odCommand);
bot.command('od_audio', odAudioCommand);
bot.command('send', sendCommand);
bot.command('thispersondoesnotexist', thisPersonDoesNotExistCommand);
bot.command('thiscatdoesnotexist', thisCatDoesNotExistCommand);
bot.command('thiswaifudoesnotexist', thisWaifuDoesNotExistCommand);
bot.command('ping', pingCommand);
bot.command('latex', latexCommand);

// Other handlers
bot.hears(/^[fф]$/i, fHandler);
bot.on(':location', locationHandler);

bot.start();
