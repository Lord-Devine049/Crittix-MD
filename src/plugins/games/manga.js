/*
 * MANGA.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['manga', 'searchmanga'],
  aliases: ['anime-manga'],
  category: 'arena',
  description: 'Search manga info from Jikan (MyAnimeList)',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the manga title. example! .manga one piece'));

    try {
      const res = await axios.get('https://api.jikan.moe/v4/manga', {
        params: { q: text, limit: 1 },
        timeout: 12000
      });

      const manga = res.data?.data?.[0];
      if (!manga) return reply(p.phrases.error(`No manga found for "${text}"`));

      const title = manga.title_english || manga.title || manga.titles?.[0]?.title || 'Unknown';
      const desc = (manga.synopsis || 'No description available.').substring(0, 300);
      const genres = (manga.genres || []).slice(0, 4).map(g => g.name).join(', ');
      const coverUrl = manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url;

      const caption =
        `📚 *${title}*\n\n` +
        `📊 Status: ${manga.status || 'N/A'}\n` +
        `📖 Chapters: ${manga.chapters || 'Ongoing'}\n` +
        `⭐ Score: ${manga.score || 'N/A'}/10\n` +
        `🏷️ ${genres || 'N/A'}\n\n` +
        `${desc}...\n\n` +
        `🔗 ${manga.url || 'https://myanimelist.net'}`;

      if (coverUrl) {
        await sock.sendMessage(chatId, {
          image: { url: coverUrl },
          caption
        }, { quoted: msg });
      } else {
        reply(caption);
      }
    } catch {
      reply(p.phrases.error('Manga search failed. Try again later.'));
    }
  }
};
