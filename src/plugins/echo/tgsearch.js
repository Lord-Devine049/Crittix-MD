/*
 * TGSEARCH.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['tgsearch', 'tgchannel'],
  category: 'soultools',
  description: 'Search for Telegram channels by keyword',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const query = args.join(' ').trim();
    if (!query) return reply('usage: .tgsearch <keyword>\nexample: .tgsearch anime');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/search/telegram?query=${encodeURIComponent(query)}`,
        { timeout: 15000 }
      );

      if (!data?.status || !data?.results?.length) {
        return reply(`❌ no Telegram channels found for "${query}"`);
      }

      let txt = `📢 *Telegram Channel Search*\n🔍 _${query}_\n\n`;
      data.results.slice(0, 5).forEach((c, i) => {
        txt += `${i + 1}. *${c.title || c.name}*\n`;
        if (c.username) txt += `   👤 @${c.username}\n`;
        if (c.members) txt += `   👥 ${c.members} members\n`;
        txt += '\n';
      });
      txt += '_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_';

      await sock.sendMessage(chatId, { text: txt }, { quoted: msg });

    } catch (e) {
      reply('❌ search failed — ' + e.message);
    }
  }
};
