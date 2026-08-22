/*
 * PLAY2.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['play2'],
  aliases: ['p2'],
  category: 'darkweb',
  description: 'Download music (alternative source)',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the song name after the command. example! .play2 blinding lights'));

    try {
      reply(`🔍 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗣𝗹𝗮𝘆𝟮*\n\nSearching: _${text}_`);

      const res = await axios.get(
        `https://prexzyapis.com/download/ytmp3?url=${encodeURIComponent(text)}`,
        { timeout: 30000 }
      );

      if (!res.data?.success || !res.data?.result?.download_url)
        throw new Error('No download link');

      const { title, thumbnail, download_url } = res.data.result;

      if (thumbnail) {
        await sock.sendMessage(chatId, {
          image: { url: thumbnail },
          caption: `🎵 *${title || 'Track'}*`
        }, { quoted: msg });
      }

      const audioRes = await axios.get(download_url, {
        responseType: 'arraybuffer',
        timeout: 90000
      });

      await sock.sendMessage(chatId, {
        audio: Buffer.from(audioRes.data),
        mimetype: 'audio/mpeg',
        fileName: `${title || 'audio'}.mp3`
      }, { quoted: msg });

    } catch (err) {
      reply(p.phrases.error('Music fetch failed. Try again later.'));
    }
  }
};
