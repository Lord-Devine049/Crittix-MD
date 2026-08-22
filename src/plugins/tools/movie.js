/*
 * MOVIE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['movie'],
  aliases: ['film'],
  category: 'soultools',
  description: 'Search movie info from IMDB',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the movie title after the command. example! .movie inception'));

    try {
      const res = await axios.get(
        `http://www.omdbapi.com/?t=${encodeURIComponent(text)}&apikey=742b2d09&plot=full`,
        { timeout: 10000 }
      );

      if (res.data.Response === 'False')
        return reply(p.phrases.notFound(`movie "${text}" not found.`));

      const d = res.data;
      const caption =
        `🎬 *${d.Title}* (${d.Year})\n\n` +
        `⭐ *Rating:* ${d.imdbRating}/10\n` +
        `⏳ *Runtime:* ${d.Runtime}\n` +
        `🎭 *Genre:* ${d.Genre}\n` +
        `📅 *Released:* ${d.Released}\n` +
        `👤 *Director:* ${d.Director}\n` +
        `👥 *Cast:* ${d.Actors}\n\n` +
        `📝 ${d.Plot ? d.Plot.substring(0, 300) + '...' : 'No plot available'}`;

      const poster = d.Poster !== 'N/A' ? d.Poster : null;

      if (poster) {
        await sock.sendMessage(chatId, {
          image: { url: poster },
          caption
        }, { quoted: msg });
      } else {
        reply(caption);
      }
    } catch {
      reply(p.phrases.error('movie info unavailable. try again later.'));
    }
  }
};
