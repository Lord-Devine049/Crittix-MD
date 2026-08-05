/* INVERT.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'invert',
  category: 'creativetools',
  description: 'Invert colors of an image',
  execute: async ({ sock, msg, chatId, reply }) => {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg) return reply(`✘ ${h.toBoldItalic('Send or reply to an image')} ${h.demonEmoji()}`);
    try {
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const image = await Jimp.read(imgBuffer);
      image.invert();
      const result = await image.getBufferAsync(Jimp.MIME_JPEG);
      await sock.sendMessage(chatId, { image: result, caption: `🔄 ${h.toBoldItalic('Colors Inverted')} ${h.demonEmoji()}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Invert failed')} ${h.demonEmoji()}`);
    }
  }
};
