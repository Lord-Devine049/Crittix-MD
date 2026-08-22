/*
 * WIKI.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['wiki', 'wikipedia'],
  aliases: ['wp'],
  category: 'soultools',
  description: 'Search Wikipedia',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type what you want to search on wikipedia. example! .wiki albert einstein'));

    try {
      const res = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`,
        { timeout: 10000 }
      );
      const data = res.data;

      if (data.type === 'disambiguation')
        return reply(p.phrases.error(`"${text}" is too broad. Be more specific.`));

      if (!data.extract)
        return reply(p.phrases.error(`No results found for "${text}"`));

      const extract = data.extract.length > 600
        ? data.extract.substring(0, 600) + '...'
        : data.extract;

      const info = `📚 *${data.title}*\n\n${extract}\n\n🔗 ${data.content_urls?.desktop?.page || ''}`;

      if (data.thumbnail) {
        await sock.sendMessage(chatId, {
          image: { url: data.thumbnail.source },
          caption: info
        }, { quoted: msg });
      } else {
        reply(info);
      }
    } catch (err) {
      if (err.response?.status === 404)
        return reply(p.phrases.error(`Page "${text}" not found. Try another term.`));
      reply(p.phrases.error('Wikipedia is down. Try again later.'));
    }
  }
};
