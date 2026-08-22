const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['waifu', 'rwaifu'],
  aliases: [],
  category: 'soultools',
  description: 'Random waifu image',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    try {
      const res = await axios.get('https://waifu.pics/api/sfw/waifu', { timeout: 8000 });
      const imgUrl = res.data?.url;
      if (!imgUrl) return reply(p.phrases.error('Waifu is hiding. Try again.'));

      await sock.sendMessage(chatId, {
        image: { url: imgUrl },
        caption: `✨ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗪𝗮𝗶𝗳𝘂*`
      }, { quoted: msg });
    } catch {
      reply(p.phrases.error('Waifu fetch failed. Try again.'));
    }
  }
};
