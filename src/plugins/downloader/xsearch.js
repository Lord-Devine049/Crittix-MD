/*
 * XSEARCH.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['xvideosearch', 'xnxxsearch'],
  aliases: ['xvideos', 'xnxx'],
  category: 'darkweb',
  description: 'Search adult video sites (owner only)',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = (command || 'xvideosearch').toLowerCase();

    if (!text) return reply(p.phrases.wrongUsage(`type what you want to search for. example! .${cmd} dark anime`));

    try {
      let results = [];

      if (cmd === 'xvideosearch') {
        const res = await axios.get(
          `https://prexzyapis.com/nsfw/xvideos-search?query=${encodeURIComponent(text)}`,
          { timeout: 15000 }
        );
        if (!res.data?.status || !res.data?.data?.length)
          return reply(p.phrases.error(`No xvideos results for "${text}"`));
        results = res.data.data.slice(0, 5);

      } else if (cmd === 'xnxxsearch') {
        const res = await axios.get(
          `https://prexzyapis.com/nsfw/xnxx-search?query=${encodeURIComponent(text)}`,
          { timeout: 15000 }
        );
        if (!res.data?.status || !res.data?.data?.length)
          return reply(p.phrases.error(`No xnxx results for "${text}"`));
        results = res.data.data.slice(0, 5);
      }

      const msg_body = results.map((v, i) =>
        `${i + 1}. *${v.title || 'No title'}*\n` +
        `   ⏱ ${v.duration || 'N/A'}\n` +
        `   🔗 ${v.url || v.link || 'N/A'}`
      ).join('\n\n');

      reply(`🔞 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗦𝗲𝗮𝗿𝗰𝗵*\n\n${msg_body}`);
    } catch {
      reply(p.phrases.error('Search failed. Try again later.'));
    }
  }
};
