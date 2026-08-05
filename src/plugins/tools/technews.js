/*
 * TECHNEWS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['technews'],
  category: 'soultools',
  description: 'Get a random tech news article',
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      const { data } = await axios.get(
        'https://apis.davidcyril.name.ng/random/technews',
        { timeout: 15000 }
      );

      if (!data?.status || !data?.result) {
        return reply('❌ failed to fetch tech news');
      }

      const { title, description, link, image } = data.result;

      const caption =
        `📰 *Tech News*\n\n` +
        `*${title}*\n\n` +
        `${description || ''}\n\n` +
        `🔗 ${link}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

      if (image) {
        await sock.sendMessage(chatId, {
          image: { url: image },
          caption
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: msg });
      }

    } catch (e) {
      reply('❌ tech news fetch failed — ' + e.message);
    }
  }
};
