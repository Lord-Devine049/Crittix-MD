const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = {
  command: 'animesearch',
  aliases: ['animeinfo', 'findanime'],
  category: 'soultools',
  description: 'Search anime info. Usage: animesearch One Piece',
  execute: async ({ sock, msg, text, chatId, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the anime name after the command. example! .animesearch one piece'));

    const query = `
      query ($search: String) {
        Media (search: $search, type: ANIME) {
          title { romaji english }
          description(asHtml: false)
          episodes
          status
          averageScore
          genres
          coverImage { large }
          siteUrl
          startDate { year month day }
        }
      }`;

    try {
      const res = await axios.post('https://graphql.anilist.co', {
        query,
        variables: { search: text }
      });

      const anime = res.data?.data?.Media;
      if (!anime) return reply('❌ *Anime not found*');

      const title = anime.title.english || anime.title.romaji;
      const desc = (anime.description || 'No description').replace(/<[^>]+>/g, '').substring(0, 300);
      const date = anime.startDate
        ? `${anime.startDate.year}-${String(anime.startDate.month).padStart(2,'0')}-${String(anime.startDate.day).padStart(2,'0')}`
        : 'Unknown';

      const caption =
        `🎌 *${title}*\n\n` +
        `📺 Episodes: ${anime.episodes || '?'} | 📈 Status: ${anime.status}\n` +
        `⭐ Score: ${anime.averageScore || '?'}/100\n` +
        `🏷️ Genres: ${(anime.genres || []).join(', ')}\n` +
        `📅 Aired: ${date}\n\n` +
        `📝 ${desc}...\n\n` +
        `🔗 ${anime.siteUrl}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

      await sock.sendMessage(chatId, {
        image: { url: anime.coverImage.large },
        caption
      }, { quoted: msg });
    } catch (e) {
      reply('❌ *Anime search failed* • Try again later');
    }
  }
};
