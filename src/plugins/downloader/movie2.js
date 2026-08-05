const axios = require('axios');

if (!global.movieSessions) global.movieSessions = {};

module.exports = [
  {
    command: 'selectmovie',
    aliases: ['pickmovie', 'choosemovie'],
    category: 'darkweb',
    description: 'Select a movie from movie2 results. Usage: selectmovie 2',
    execute: async ({ sock, msg, args, sender, chatId, reply }) => {
      const session = global.movieSessions?.[sender];
      if (!session) return reply('❌ *No movie search found*\nUse movie2 first');

      const idx = parseInt(args[0]) - 1;
      if (isNaN(idx) || idx < 0 || idx >= session.movies.length) {
        return reply(`❌ *Invalid number* • Pick 1–${Math.min(8, session.movies.length)}`);
      }

      const movie = session.movies[idx];
      global.movieSessions[sender].selected = movie;

      try {
        const res = await axios.get(
          `https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${encodeURIComponent(movie.link || movie.url)}`
        );
        const data = res.data?.result;
        if (!data) return reply('❌ *Movie details not found*');

        global.movieSessions[sender].movieData = data;

        const out =
          `🎬 *${data.title || movie.title}*\n\n` +
          `📅 Year: ${data.year || '—'}\n` +
          `⭐ Rating: ${data.rating || '—'}\n` +
          `🎭 Genre: ${(data.genres || []).join(', ') || '—'}\n\n` +
          `📝 ${(data.description || '').substring(0, 250)}...\n\n` +
          `_Reply with:_ dlmovie [quality]\n` +
          `_Available:_ ${(data.downloads || []).map(d => d.quality || d.label).join(', ')}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

        if (data.image || movie.image) {
          await sock.sendMessage(chatId, {
            image: { url: data.image || movie.image },
            caption: out
          }, { quoted: msg });
        } else {
          reply(out);
        }
      } catch (e) {
        reply(`❌ *Failed to get movie info* • ${e.message}`);
      }
    }
  },
  {
    command: 'dlmovie',
    aliases: ['downloadmovie', 'getmovie'],
    category: 'darkweb',
    description: 'Download a selected movie. Usage: dlmovie 1080p',
    execute: async ({ args, sender, reply }) => {
      const session = global.movieSessions?.[sender];
      if (!session?.movieData) return reply('❌ *Select a movie first* using selectmovie');

      const quality = args[0] || '720p';
      const downloads = session.movieData.downloads || [];
      const target = downloads.find(d =>
        (d.quality || d.label || '').toLowerCase().includes(quality.toLowerCase())
      ) || downloads[0];

      if (!target) return reply('❌ *No download links found*');

      reply(
        `🎬 *${session.movieData.title}*\n\n` +
        `📦 Quality: ${target.quality || target.label || 'Unknown'}\n` +
        `🔗 *Download Link:*\n${target.url || target.link}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }
];
