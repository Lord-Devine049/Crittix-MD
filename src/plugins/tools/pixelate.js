/* PIXELATE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const p = require('../../lib/phrases');

module.exports = {
  command: 'pixelate',
  category: 'creativetools',
  description: 'Pixelate an image',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const pixelSize = Math.min(Math.max(parseInt(args[0]) || 15, 5), 50);
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg) return reply(p.phrases.wrongUsage('send or reply to an image. you can add a pixelate level from 5 to 50. example! .pixelate 20'));
    try {
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const image = await Jimp.read(imgBuffer);
      image.pixelate(pixelSize);
      const result = await image.getBufferAsync(Jimp.MIME_JPEG);
      await sock.sendMessage(chatId, { image: result, caption: `🟦 ${h.toBoldItalic(`Pixelated (size ${pixelSize})`)} ${h.demonEmoji()}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Pixelate failed')} ${h.demonEmoji()}`);
    }
  }
};
