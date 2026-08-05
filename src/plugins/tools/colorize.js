/* COLORIZE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'colorize',
  category: 'creativetools',
  description: 'Add a color tint to an image',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const colorArg = args[0]?.toLowerCase();
    const colorMap = { red:[0,-100,-100], green:[-100,0,-100], blue:[-100,-100,0], yellow:[0,0,-100], purple:[0,-100,0], pink:[0,-50,-50], orange:[0,-30,-100], cyan:[-100,0,0] };
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg || !colorArg || !colorMap[colorArg]) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}colorize <color> (reply to image)\n\n${h.toBoldItalic('Colors')}: red, green, blue, yellow, purple, pink, orange, cyan`);
    try {
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const image = await Jimp.read(imgBuffer);
      image.greyscale();
      const [r, g, b] = colorMap[colorArg];
      image.color([{ apply: 'red', params: [r] }, { apply: 'green', params: [g] }, { apply: 'blue', params: [b] }]);
      const result = await image.getBufferAsync(Jimp.MIME_JPEG);
      await sock.sendMessage(chatId, { image: result, caption: `🎨 ${h.toBoldItalic(`Colorized: ${colorArg}`)} ${h.demonEmoji()}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Colorize failed')} ${h.demonEmoji()}`);
    }
  }
};
