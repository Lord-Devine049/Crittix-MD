/* CIRCLE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'circle',
  category: 'creativetools',
  description: 'Crop an image into a circle sticker',
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.imageMessage && !msg.message?.imageMessage) return reply(`✘ ${h.toBoldItalic('Reply to image')} ${h.demonEmoji()}`);
      let buffer;
      if (quoted?.imageMessage) buffer = await downloadMediaMessage({ message: { imageMessage: quoted.imageMessage } }, 'buffer', {});
      else buffer = await downloadMediaMessage(msg, 'buffer', {});
      const size = 512;
      const image = await Jimp.read(buffer);
      image.resize(size, size, Jimp.RESIZE_COVER);
      // Create circular mask using Jimp scan
      image.scan(0, 0, size, size, function(x, y, idx) {
        const cx = size / 2, cy = size / 2;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist > size / 2) this.bitmap.data[idx + 3] = 0;
      });
      const result = await image.getBufferAsync(Jimp.MIME_PNG);
      await sock.sendMessage(chatId, { sticker: result }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Failed miserably')} ${h.demonEmoji()}`);
    }
  }
};
