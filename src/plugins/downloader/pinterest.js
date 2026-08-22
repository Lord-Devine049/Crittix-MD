const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['pinterest'],
  aliases: ['pinimg'],
  category: 'darkweb',
  description: 'Search Pinterest images',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type your search and optionally the amount. example! .pinterest dark anime wallpapers "10"'));

    let query, amount;

    if (text.includes('|')) {
      [query, amount] = text.split('|').map(t => t.trim());
    } else {
      query = text.trim();
      amount = '1';
    }

    amount = Math.min(parseInt(amount) || 1, 10);

    try {
      const res = await axios.get(
        `https://api-rebix.vercel.app/api/pinterest?q=${encodeURIComponent(query)}`,
        { timeout: 15000 }
      );

      const images = res.data?.result;
      if (!Array.isArray(images) || images.length === 0)
        return reply(p.phrases.error(`No Pinterest images found for "${query}"`));

      const shuffled = images.filter(Boolean).sort(() => Math.random() - 0.5);
      let sent = 0;

      for (const imgUrl of shuffled) {
        if (sent >= amount) break;
        try {
          await sock.sendMessage(chatId, {
            image: { url: imgUrl },
            caption: `📌 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁*\n${query}`
          });
          sent++;
          await h.sleep(2000);
        } catch {
          continue;
        }
      }

      if (sent === 0) reply(p.phrases.error('No accessible images found'));
    } catch {
      reply(p.phrases.error('Pinterest search failed. Try again.'));
    }
  }
};
