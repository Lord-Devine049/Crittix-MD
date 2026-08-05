const axios = require('axios');

module.exports = {
  command: 'animewlp',
  aliases: ['animewallpaper', 'awlp'],
  category: 'creativetools',
  description: 'Get a random anime wallpaper',
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      const res = await axios.get('https://nekos.life/api/v2/img/wallpaper');
      const url = res.data?.url;
      if (!url) return reply('❌ *No wallpaper found*');

      await sock.sendMessage(chatId, {
        image: { url },
        caption: '🖼️ *Anime Wallpaper*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
      }, { quoted: msg });
    } catch {
      reply('❌ *Failed to fetch wallpaper*');
    }
  }
};
