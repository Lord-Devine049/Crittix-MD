/*
 * MOE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */

module.exports = {
  command: ['moe'],
  category: 'soultools',
  description: 'Random moe anime image',
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      await sock.sendMessage(chatId, {
        image: { url: 'https://prexzyapis.com/random/anhmoe' },
        caption: '🌸 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗼𝗲*'
      }, { quoted: msg });
    } catch (e) {
      reply('❌ image fetch failed — ' + e.message);
    }
  }
};