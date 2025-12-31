import { Context } from 'grammy';
import https from 'https';

type Callback = (err: Error | null, response?: string) => void;

function ud(request: string, callback: Callback): void {
  let response = '';

  const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(request)}`;

  https.get(url, res => {
    if (res.statusCode !== 200) {
      const { statusCode, statusMessage } = res;
      response = 'Нічого не знайдено\n' +
          `_(Status Code: ${statusCode} ${statusMessage})_`;
      callback(new Error(response));
      return;
    }

    let body = '';
    res.on('data', chunk => {
      body += chunk.toString();
    });

    res.on('end', () => {
      const parsed = JSON.parse(body);
      if (!parsed.list[0]) {
        response = 'Нічого не знайдено';
        callback(new Error(response));
      } else {
        response = '*Визначення:*\n' +
          `${parsed.list[0].definition}\n` +
          '\n*Приклад використання:*\n' +
          `${parsed.list[0].example}`;
        callback(null, response);
      }
    });
  });
}

export function udCommand(ctx: Context) {
  const message = ctx.message;
  if (!message || !message.text) return;

  const input = message.text.split(' ').slice(1).join(' ');
  const messageId = message.message_id;

  function callback(err: Error | null, response?: string) {
    if (err) {
      ctx.reply(err.message, {
        reply_parameters: { message_id: messageId },
        parse_mode: 'Markdown'
      });
    } else {
      ctx.reply(response || '', {
        reply_parameters: { message_id: messageId },
        parse_mode: 'Markdown'
      });
    }
  }

  if (!input) {
    if (message.reply_to_message && 'text' in message.reply_to_message && message.reply_to_message.text) {
      ud(message.reply_to_message.text, callback);
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        { reply_parameters: { message_id: messageId } }
      );
    }
  } else {
    ud(input, callback);
  }
}
