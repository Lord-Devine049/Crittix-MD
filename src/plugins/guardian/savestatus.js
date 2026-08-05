/* SAVESTATUS.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: ['savestatus', 'savest'],
  aliases: ['savest'],
  category: 'voidsystem',
  description: 'Save a status to your DM by replying to it',
  execute: async ({ sock, msg, sender, chatId, prefix, reply }) => {
    try {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg) {
        return reply(`${h.demonEmoji()} ${h.toBoldItalic('SAVE STATUS')}\n\n${h.toBoldItalic('Save someones status to your DM.')}\n\n🔥 ${h.toBoldItalic('Usage')}: Reply to a status with ${prefix}savestatus`);
      }
      let mediaType = null;
      if (quotedMsg.imageMessage) mediaType = 'image';
      else if (quotedMsg.videoMessage) mediaType = 'video';
      else return reply(`✘ ${h.toBoldItalic('Only image/video status can be saved')} ${h.demonEmoji()}`);
      const buffer = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {}, { logger: console, reuploadRequest: sock.updateMediaMessage });
      if (mediaType === 'image') {
        await sock.sendMessage(sender, { image: buffer, caption: 'saved' });
      } else {
        await sock.sendMessage(sender, { video: buffer, caption: 'saved' });
      }
      return reply(`✓ ${h.toBoldItalic('Sent')} ${h.demonEmoji()}`);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Failed miserably')} ${h.demonEmoji()}`);
    }
  }
};
