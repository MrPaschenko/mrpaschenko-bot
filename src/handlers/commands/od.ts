import { Context } from 'grammy';
import https from 'https';

type Callback = (err: Error | null, response?: string) => void;

function od(request: string, callback: Callback): void {
  const options = {
    host: 'od-api.oxforddictionaries.com',
    port: '443',
    path: `/api/v2/entries/en-us/${encodeURIComponent(request)}`,
    method: 'GET',
    headers: {
      'app_id': process.env.APP_ID,
      'app_key': process.env.APP_KEY,
    }
  };

  https.get(options, res => {
    if (res.statusCode !== 200) {
      const { statusCode, statusMessage } = res;
      const response = 'Нічого не знайдено\n' +
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
      const main = parsed.results[0].lexicalEntries[0].entries[0].senses[0];
      let examples = '';
      if (main.examples) {
        examples = `\n*Приклад використання:*\n${main.examples[0].text}`;
      }

      const response = `*Визначення:*\n${main.definitions[0]}\n${examples}`;
      callback(null, response);
    });
  });
}

export function odCommand(ctx: Context) {
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
      od(message.reply_to_message.text, callback);
    } else {
      ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        { reply_parameters: { message_id: messageId } }
      );
    }
  } else {
    od(input, callback);
  }
}
