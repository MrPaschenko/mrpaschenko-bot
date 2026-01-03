import { Context } from 'grammy';

export function locationHandler(ctx: Context) {
  const message = ctx.message;
  if (!message || !message.location) return;

  const { latitude, longitude } = message.location;

  const decimalCoords = `${String(latitude).replace(/\./g, '\\.')}, ${String(longitude).replace(/\./g, '\\.')}`;

  const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${latitude},${longitude}`;

  const text = `${decimalCoords}\n` +
    `[Google Maps](${googleMapsUrl})\n` +
    `[Apple Maps](${appleMapsUrl})`;

  ctx.reply(text, {
    parse_mode: 'MarkdownV2',
    link_preview_options: { is_disabled: true },
    reply_parameters: { message_id: message.message_id }
  });
}
