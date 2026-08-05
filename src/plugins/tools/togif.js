/* TOGIF.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'togif',
  category: 'creativetools',
  description: 'Convert a video to GIF playback',
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.videoMessage && !msg.message?.videoMessage) return reply(`✘ ${h.toBoldItalic('Reply to video')} ${h.demonEmoji()}`);
      let buffer;
      if (quoted?.videoMessage) {
        buffer = await downloadMediaMessage({ message: { videoMessage: quoted.videoMessage } }, 'buffer', {});
      } else {
        buffer = await downloadMediaMessage(msg, 'buffer', {});
      }
      await sock.sendMessage(chatId, { video: buffer, gifPlayback: true }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Failed miserably')} ${h.demonEmoji()}`);
    }
  }
};
