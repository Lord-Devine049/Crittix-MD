/*
 * BOOK.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['book', 'books'],
  aliases: ['searchbook'],
  category: 'soultools',
  description: 'Search for books',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the book title after the command. example! .book atomic habits'));

    try {
      const res = await axios.get(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(text)}&limit=5`,
        { timeout: 10000 }
      );

      if (!res.data.docs || res.data.docs.length === 0)
        return reply(p.phrases.notFound(`no books found for "${text}".`));

      const books = res.data.docs
        .slice(0, 5)
        .map((b, i) =>
          `${i + 1}. *${b.title}*\n   👤 ${b.author_name?.[0] || 'Unknown'} • 📅 ${b.first_publish_year || 'N/A'}`
        )
        .join('\n\n');

      reply(`📚 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗕𝗼𝗼𝗸𝘀*\n\n${books}`);
    } catch {
      reply(p.phrases.error('Book search failed. Try again later.'));
    }
  }
};
