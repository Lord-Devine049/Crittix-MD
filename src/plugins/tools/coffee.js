/*
 * COFFEE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['coffee', 'kopi'],
  aliases: ['cuppa'],
  category: 'soultools',
  description: 'Random coffee photo',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    try {
      await sock.sendMessage(chatId, {
        image: { url: 'https://coffee.alexflipnote.dev/random' },
        caption: `☕ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗖𝗼𝗳𝗳𝗲𝗲*\n\nFresh cup just for you.`
      }, { quoted: msg });
    } catch {
      reply(h.demonFail('Coffee machine broke. Try again.'));
    }
  }
};
