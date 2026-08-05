/* BLUR.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'blur',
  category: 'creativetools',
  description: 'Blur an image',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const blurLevel = Math.min(Math.max(parseInt(args[0]) || 5, 1), 20);
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg) return reply(`✘ ${h.toBoldItalic('Send or reply to an image')} ${h.demonEmoji()}\n\n${h.toBoldItalic('Usage')}: .blur [1-20]`);
    try {
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const image = await Jimp.read(imgBuffer);
      image.blur(blurLevel);
      const result = await image.getBufferAsync(Jimp.MIME_JPEG);
      await sock.sendMessage(chatId, { image: result, caption: `💨 ${h.toBoldItalic(`Blurred (level ${blurLevel})`)} ${h.demonEmoji()}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Blur failed')} ${h.demonEmoji()}`);
    }
  }
};
