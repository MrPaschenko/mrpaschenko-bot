import { Context, InputFile } from 'grammy';
import https from 'https';

interface WaResponse {
  text: string;
  photo: Buffer | '';
}

async function makeWolframRequest(input: string, timeout: number = 30): Promise<string> {
  return new Promise((resolve, reject) => {
    const appid = process.env.WOLFRAM;
    const encodedInput = encodeURIComponent(input);
    const url = `https://api.wolframalpha.com/v1/result?appid=${appid}&i=${encodedInput}&timeout=${timeout}`;

    const req = https.get(url, { timeout: timeout * 1000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', reject);
  });
}

async function wa(input: string): Promise<WaResponse> {
  const response: WaResponse = {
    text: '',
    photo: ''
  };

  try {
    response.text = await makeWolframRequest(input, 30);
    // Decode Unicode escape sequences like \:20b4 to actual characters
    response.text = response.text.replace(/\\:([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });
  } catch (err: unknown) {
    const error = err as Error;
    response.text = error.message;
  }

  return response;
}

export async function waCommand(ctx: Context) {
  const message = ctx.message;
  if (!message || !message.text) return;

  const input = message.text.split(' ').slice(1).join(' ');

  let response;

  if (!input) {
    if (message.reply_to_message && 'text' in message.reply_to_message && message.reply_to_message.text) {
      response = await wa(message.reply_to_message.text);
    } else {
      await ctx.reply(
        'Уведи запит після команди або ' +
        'відправ команду у відповідь на повідомлення',
        { reply_parameters: { message_id: message.message_id } }
      );
      return;
    }
  } else {
    response = await wa(input);
  }

  const { text, photo } = response;

  if (text) {
    await ctx.reply(text, { reply_parameters: { message_id: message.message_id } });
  }

  if (photo) {
    await ctx.replyWithPhoto(new InputFile(photo), { reply_parameters: { message_id: message.message_id } });
  }
}
