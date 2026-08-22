/*
 * TIKTOKSEARCH.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['tiktoksearch'],
  aliases: [],
  category: 'darkweb',
  description: 'Search TikTok videos',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type what you want to search on tiktok. example! .tiktoksearch afrobeats dance'));

    try {
      const res = await axios.get(
        `https://prexzyapis.com/search/tiktoksearch?q=${encodeURIComponent(text)}`,
        { timeout: 15000 }
      );

      if (!res.data?.status || !res.data?.data?.length)
        return reply(p.phrases.error(`No TikTok results for "${text}"`));

      const videos = res.data.data.slice(0, 3);

      for (let i = 0; i < videos.length; i++) {
        const vid = videos[i];
        const date = new Date((vid.create_time || 0) * 1000).toDateString();
        const caption =
          `🎵 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗧𝗶𝗸𝗧𝗼𝗸 #${i + 1}*\n\n` +
          `👍 ${vid.digg_count?.toLocaleString() || 0} likes\n` +
          `👀 ${vid.play_count?.toLocaleString() || 0} views\n` +
          `📝 ${(vid.title || '').substring(0, 100)}\n` +
          `📅 ${date}`;

        if (vid.play) {
          await sock.sendMessage(chatId, {
            video: { url: vid.play },
            caption
          }, { quoted: msg });
          await h.sleep(2000);
        } else {
          reply(caption);
        }
      }
    } catch (err) {
      reply(p.phrases.error('TikTok search failed. Try again later.'));
    }
  }
};
