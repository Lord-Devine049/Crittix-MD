/*
 * LYRICS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['lyrics', 'lyric'],
  aliases: ['songlyrics'],
  category: 'darkweb',
  description: 'Search song lyrics',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the song title after the command. example! .lyrics blinding lights'));

    try {
      const res = await axios.get(
        `https://prexzyapis.com/search/lyrics?title=${encodeURIComponent(text)}`,
        { timeout: 15000 }
      );

      if (!res.data?.status || !res.data?.data?.lyrics)
        return reply(p.phrases.error(`No lyrics found for "${text}"`));

      const { title, artist, album, lyrics } = res.data.data;
      const chunks = lyrics.match(/[\s\S]{1,3500}/g) || [lyrics];

      for (let i = 0; i < chunks.length; i++) {
        const header = i === 0
          ? `🎵 *${title}* – *${artist}*\n📀 ${album || 'Unknown'}\n\n`
          : '';
        await sock.sendMessage(chatId, { text: header + chunks[i] });
        await h.sleep(500);
      }
    } catch {
      reply(p.phrases.error('Lyrics fetch failed. Try again later.'));
    }
  }
};
