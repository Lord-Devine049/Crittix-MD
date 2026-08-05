const axios = require('axios');
const h = require('../../lib/helpers');

module.exports = {
  command: ['shorturl'],
  aliases: ['tinyurl'],
  category: 'soultools',
  description: 'Shorten a URL',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(h.demonError('.shorturl', '.shorturl <url>'));

    const url = args[0];
    if (!url.startsWith('http://') && !url.startsWith('https://'))
      return reply(h.demonFail('Provide a valid URL starting with http:// or https://'));

    try {
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {
        timeout: 10000,
        responseType: 'text'
      });

      const short = typeof res.data === 'string' ? res.data.trim() : null;
      if (!short) throw new Error('Empty response');

      reply(`🔗 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗦𝗵𝗼𝗿𝘁𝗨𝗿𝗹*\n\n${short}`);
    } catch {
      reply(h.demonFail('URL shortener unavailable. Try again later.'));
    }
  }
};
