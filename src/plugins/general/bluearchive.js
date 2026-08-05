/*
 * BLUEARCHIVE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
module.exports = {
  command: ['bluearchive'],
  category: 'soultools',
  description: 'Random Blue Archive image',
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      await sock.sendMessage(chatId, {
        image: { url: 'https://prexzyapis.com/random/bluearchive' },
        caption: '💙 *Blue Archive*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
      }, { quoted: msg });
    } catch (e) {
      reply('❌ image fetch failed — ' + e.message);
    }
  }
};
