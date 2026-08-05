const axios = require('axios');

module.exports = {
  command: ['dl'],
  category: 'darkweb',
  description: 'Download videos from any supported platform',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url) return reply('usage: .dl <video url>\nsupports: tiktok, instagram, twitter, youtube & more');

    await reply('⬇️ fetching media...');

    try {
      const { data } = await axios.get(
        `https://apis.davidcyril.name.ng/download/aiov2?url=${encodeURIComponent(url)}`,
        { timeout: 30000 }
      );

      if (!data?.status || !data?.result?.length) {
        throw new Error('no media found');
      }

      const item = data.result[0];
      if (!item?.video_download) throw new Error('download link unavailable');

      await sock.sendMessage(chatId, {
        video: { url: item.video_download },
        caption: item.title || '🎬 Downloaded'
      }, { quoted: msg });

    } catch (e) {
      reply('❌ download failed — ' + e.message);
    }
  }
};
