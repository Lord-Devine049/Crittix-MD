/* ROTATE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const p = require('../../lib/phrases');

module.exports = {
  command: 'rotate',
  category: 'creativetools',
  description: 'Rotate an image by degrees',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const degrees = parseInt(args[0]);
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg || isNaN(degrees)) return reply(p.phrases.wrongUsage('reply to an image and provide the degrees to rotate. example! .rotate 90'));
    try {
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const image = await Jimp.read(imgBuffer);
      image.rotate(degrees);
      const result = await image.getBufferAsync(Jimp.MIME_JPEG);
      await sock.sendMessage(chatId, { image: result, caption: `🔃 ${h.toBoldItalic(`Rotated ${degrees}°`)} ${h.demonEmoji()}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Rotate failed')} ${h.demonEmoji()}`);
    }
  }
};
