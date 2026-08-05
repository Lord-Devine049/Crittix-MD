const axios = require('axios');

module.exports = {
  command: 'imdb',
  aliases: ['imbd', 'moviedb', 'movielookup'],
  category: 'soultools',
  description: 'Search IMDB for movie/show info. Usage: imdb The Dark Knight',
  execute: async ({ sock, msg, text, chatId, reply }) => {
    if (!text) return reply('🎬 *Usage:* imdb The Dark Knight');

    try {
      const apiKey = 'trilogy';
      const res = await axios.get(
        `https://www.omdbapi.com/?t=${encodeURIComponent(text)}&apikey=${apiKey}&plot=short`
      );

      const d = res.data;
      if (d.Response === 'False') return reply(`❌ *Not found:* "${text}"`);

      const caption =
        `🎬 *${d.Title}* (${d.Year})\n\n` +
        `🎭 Genre: ${d.Genre}\n` +
        `⭐ Rating: ${d.imdbRating}/10 (${d.imdbVotes} votes)\n` +
        `⏱️ Runtime: ${d.Runtime}\n` +
        `🎬 Director: ${d.Director}\n` +
        `🌍 Country: ${d.Country}\n` +
        `📅 Released: ${d.Released}\n\n` +
        `📝 ${d.Plot}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

      if (d.Poster && d.Poster !== 'N/A') {
        await sock.sendMessage(chatId, {
          image: { url: d.Poster },
          caption
        }, { quoted: msg });
      } else {
        reply(caption);
      }
    } catch {
      reply('❌ *IMDB lookup failed* • Try again later');
    }
  }
};
