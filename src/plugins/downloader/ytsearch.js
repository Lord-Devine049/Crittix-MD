/*
 * YTSEARCH.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['ytsearch', 'yts'],
  category: 'darkweb',
  description: 'Search YouTube for videos',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const query = args.join(' ').trim();
    if (!query) return reply('usage: .yts <search query>\nexample: .yts fela kuti');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/search/youtube?q=${encodeURIComponent(query)}`,
        { timeout: 15000 }
      );

      if (!data?.status || !data?.data?.length) {
        return reply('❌ no results found');
      }

      const results = data.data.slice(0, 5);

      let txt = `📺 *YouTube Search* — _${query}_\n\n`;
      results.forEach((v, i) => {
        txt += `${i + 1}. *${v.title}*\n`;
        txt += `   📡 ${v.channel}\n`;
        txt += `   ⏱️ ${v.duration}\n`;
        txt += `   🔗 ${v.link}\n\n`;
      });
      txt += '_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_';

      await sock.sendMessage(chatId, {
        image: { url: results[0].imageUrl },
        caption: txt
      }, { quoted: msg });

    } catch (e) {
      reply('❌ search failed — ' + e.message);
    }
  }
};
