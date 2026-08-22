
const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = {
  command: ['twitter', 'twdl', 'xdl'],
  category: 'darkweb',
  description: 'Download Twitter/X videos',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || (!url.includes('x.com') && !url.includes('twitter.com'))) {
      return reply(p.phrases.wrongUsage('provide the twitter or x video url. example! .xdl https://x.com/user/status/xxx'));
    }

    await reply('⬇️ downloading twitter/x video...');

    try {
      const { data } = await axios.get(
        `https://apis.davidcyril.name.ng/twitter?url=${encodeURIComponent(url)}`,
        { timeout: 30000 }
      );

      if (!data?.success || (!data?.video_hd && !data?.video_sd)) {
        throw new Error('no video found');
      }

      const videoUrl = data.video_hd || data.video_sd;
      const quality  = data.video_hd ? '🎥 HD' : '📹 SD';

      await sock.sendMessage(chatId, {
        video: { url: videoUrl },
        caption: `${data.description || 'Twitter/X Video'}\n${quality}`
      }, { quoted: msg });

    } catch (e) {
      reply('❌ download failed — ' + e.message);
    }
  }
};
