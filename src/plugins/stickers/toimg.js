/*
 * TOIMG.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'toimg',
  category: 'shadowutilities',
  description: 'Convert sticker to image',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const stickMsg = quoted?.stickerMessage || msg.message?.stickerMessage;
    if (!stickMsg) return reply(p.phrases.wrongUsage('reply to a sticker to convert it to an image.'));
    try {
      const stream = await downloadContentFromMessage(stickMsg, 'sticker');
      let buf = Buffer.from([]);
      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
      await sock.sendMessage(chatId, { image: buf, caption: '🖼️ Here you go!' }, { quoted: msg });
    } catch(e) { reply(p.phrases.error('conversion failed. ' + e.message)); }
  }
};
