/* BRIGHTNESS.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'brightness',
  category: 'creativetools',
  description: 'Adjust image brightness (-100 to 100)',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const brightnessVal = parseInt(args[0]);
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg || isNaN(brightnessVal)) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}brightness <-100 to 100> (reply to image)\n\n${h.toBoldItalic('Example')}: ${prefix}brightness 50`);
    try {
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const image = await Jimp.read(imgBuffer);
      // Jimp brightness: -1 to 1
      image.brightness(Math.max(-1, Math.min(1, brightnessVal / 100)));
      const result = await image.getBufferAsync(Jimp.MIME_JPEG);
      await sock.sendMessage(chatId, { image: result, caption: `☀️ ${h.toBoldItalic(`Brightness: ${brightnessVal > 0 ? '+' : ''}${brightnessVal}`)} ${h.demonEmoji()}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Brightness adjustment failed')} ${h.demonEmoji()}`);
    }
  }
};
