/*
 * SFW.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['sfw'],
  aliases: [],
  category: 'soultools',
  description: 'Random SFW anime image',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    try {
      await sock.sendMessage(chatId, {
        image: { url: 'https://prexzyapis.com/random/sfw' },
        caption: `✨ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗦𝗙𝗪*`
      }, { quoted: msg });
    } catch {
      reply(h.demonFail('Image fetch failed. Try again.'));
    }
  }
};
