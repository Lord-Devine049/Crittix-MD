/* FLIP.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'flip',
  category: 'soultools',
  description: 'Flip an image horizontally, vertically, or both',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const flipDir = args[0]?.toLowerCase() || 'horizontal';
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg || !['horizontal','vertical','both','h','v'].includes(flipDir)) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}flip <horizontal/vertical/both> (reply to image)`);
    try {
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const image = await Jimp.read(imgBuffer);
      const isH = flipDir === 'horizontal' || flipDir === 'h';
      const isV = flipDir === 'vertical' || flipDir === 'v';
      const isBoth = flipDir === 'both';
      if (isH || isBoth) image.flip(true, false);
      if (isV || isBoth) image.flip(false, true);
      const result = await image.getBufferAsync(Jimp.MIME_JPEG);
      const label = isH ? 'Horizontal' : isV ? 'Vertical' : 'Both';
      await sock.sendMessage(chatId, { image: result, caption: `🔀 ${h.toBoldItalic(`Flipped: ${label}`)} ${h.demonEmoji()}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Flip failed')} ${h.demonEmoji()}`);
    }
  }
};
