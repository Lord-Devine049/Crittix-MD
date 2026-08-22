/* CONTRAST.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const p = require('../../lib/phrases');

module.exports = {
  command: 'contrast',
  category: 'creativetools',
  description: 'Adjust image contrast (-100 to 100)',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const contrastVal = parseInt(args[0]);
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg || isNaN(contrastVal)) return reply(p.phrases.wrongUsage('reply to an image and provide a contrast value from -100 to 100. example! .contrast 40'));
    try {
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const image = await Jimp.read(imgBuffer);
      // Jimp contrast: -1 to 1
      image.contrast(Math.max(-1, Math.min(1, contrastVal / 100)));
      const result = await image.getBufferAsync(Jimp.MIME_JPEG);
      await sock.sendMessage(chatId, { image: result, caption: `🌓 ${h.toBoldItalic(`Contrast: ${contrastVal > 0 ? '+' : ''}${contrastVal}`)} ${h.demonEmoji()}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Contrast adjustment failed')} ${h.demonEmoji()}`);
    }
  }
};
