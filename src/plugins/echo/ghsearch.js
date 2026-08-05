/*
 * GHSEARCH.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['ghsearch'],
  category: 'soultools',
  description: 'Search for code on GitHub',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const query = args.join(' ').trim();
    if (!query) return reply('usage: .ghsearch <query>\nexample: .ghsearch baileys whatsapp bot');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/search/code?query=${encodeURIComponent(query)}`,
        { timeout: 15000 }
      );

      if (!data?.status || !data?.results?.length) {
        return reply(`❌ no code results found for "${query}"`);
      }

      let txt = `💻 *GitHub Code Search*\n🔍 _${query}_\n📦 Total: ${data.total_count || data.results.length}\n\n`;
      data.results.slice(0, 5).forEach((r, i) => {
        txt += `${i + 1}. *${r.name || r.path}*\n`;
        if (r.repository) txt += `   📁 ${r.repository.full_name || r.repository}\n`;
        if (r.html_url || r.url) txt += `   🔗 ${r.html_url || r.url}\n`;
        txt += '\n';
      });
      txt += '_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_';

      await sock.sendMessage(chatId, { text: txt }, { quoted: msg });

    } catch (e) {
      reply('❌ search failed — ' + e.message);
    }
  }
};
