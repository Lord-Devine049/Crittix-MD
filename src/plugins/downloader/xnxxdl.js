/*
 * XNXXDL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['xnxxdl', 'xvideodl'],
  aliases: [],
  category: 'darkweb',
  description: 'Download adult videos (owner only)',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = (command || 'xnxxdl').toLowerCase();
    if (!text) return reply(p.phrases.wrongUsage(`provide the video url. example! .${cmd} https://yourvideourl.com`));

    const isXnxx = cmd === 'xnxxdl';
    const domain = isXnxx ? 'xnxx.com' : 'xvideos.com';

    if (!text.includes(domain))
      return reply(p.phrases.error(`Link must be from ${domain}`));

    try {
      const apiUrl = isXnxx
        ? `https://prexzyapis.com/nsfw/xnxx-dl?url=${encodeURIComponent(text)}`
        : `https://api.agatz.xyz/api/xvideodown?url=${encodeURIComponent(text)}`;

      const res = await axios.get(apiUrl, { timeout: 30000 });
      const data = res.data?.data || res.data;

      if (!data?.url) return reply(p.phrases.error('Video not found or unavailable'));

      await sock.sendMessage(chatId, {
        video: { url: data.url },
        caption:
          `🎬 *${data.title || 'Video'}*\n` +
          `👁️ Views: ${data.views || 'N/A'}\n` +
          `👍 Likes: ${data.like_count || 'N/A'}`
      }, { quoted: msg });
    } catch {
      reply(p.phrases.error('Download failed. Link may be invalid or unavailable.'));
    }
  }
};
