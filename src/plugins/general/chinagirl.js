const axios = require('axios');

module.exports = {
  command: ['chinagirl'],
  category: 'soultools',
  description: 'Get a random China girl image',
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      await sock.sendMessage(chatId, {
        image: { url: 'https://prexzyapis.com/random/chinagirl' },
        caption: '✨ *China Girl*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
      }, { quoted: msg });
    } catch (e) {
      reply('❌ failed to fetch image — ' + e.message);
    }
  }
};
