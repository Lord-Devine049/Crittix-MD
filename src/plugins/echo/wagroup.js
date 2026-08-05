/*
 * WAGROUP.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['wagroup', 'groupsearch'],
  category: 'soultools',
  description: 'Search for WhatsApp groups by keyword',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const query = args.join(' ').trim();
    if (!query) return reply('usage: .wagroup <keyword>\nexample: .wagroup gaming nigeria');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/search/wagroup?query=${encodeURIComponent(query)}&limit=5`,
        { timeout: 20000 }
      );

      if (!data?.status || !data?.results?.length) {
        return reply(`❌ no WhatsApp groups found for "${query}"`);
      }

      let txt = `💬 *WhatsApp Group Search*\n🔍 _${query}_\n📦 Found: ${data.total}\n\n`;
      data.results.forEach((g, i) => {
        txt += `${i + 1}. *${g.title}*\n🔗 ${g.join_link || g.invite_link}\n\n`;
      });
      txt += '_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_';

      await sock.sendMessage(chatId, { text: txt }, { quoted: msg });

    } catch (e) {
      reply('❌ search failed — ' + e.message);
    }
  }
};
