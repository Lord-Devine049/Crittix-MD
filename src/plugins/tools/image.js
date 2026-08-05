/* IMAGE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');

module.exports = {
  command: ['image', 'img'],
  aliases: ['img'],
  category: 'creativetools',
  description: 'Search and fetch a real image by query',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    if (!args || args.length === 0)
      return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}image <search term> ${h.demonEmoji()}`);

    const query = args.join(' ');
    await reply(`🔍 Fetching image for "${query}"...`);

    try {
      // DuckDuckGo image search — no API key needed
      const vqd = await axios.get(
        `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }
      ).then(r => { const m = r.data.match(/vqd=['"]([^'"]+)['"]/); return m ? m[1] : null; });

      if (!vqd) return reply(`✘ ${h.toBoldItalic('Search failed, try again')} ${h.demonEmoji()}`);

      const res = await axios.get(
        `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${vqd}&p=1`,
        { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://duckduckgo.com/' }, timeout: 10000 }
      );

      const results = res.data?.results || [];
      if (!results.length) return reply(`✘ ${h.toBoldItalic('No results found for:')} ${query} ${h.demonEmoji()}`);

      let sent = false;
      for (const result of results.slice(0, 5)) {
        try {
          await sock.sendMessage(chatId, {
            image: { url: result.image },
            caption: `🖼️ *${query.toUpperCase()}*\n\n${h.demonEmoji()}`
          }, { quoted: msg });
          sent = true;
          break;
        } catch (_) { continue; }
      }

      if (!sent) return reply(`✘ ${h.toBoldItalic('All image links failed, try again')} ${h.demonEmoji()}`);

    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Image search error')} ${h.demonEmoji()}`);
    }
  }
};