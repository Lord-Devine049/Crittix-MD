const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = {
  command: ['instagram', 'igdl'],
  category: 'darkweb',
  description: 'Download Instagram video/reel',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.includes('instagram')) {
      return reply(p.phrases.wrongUsage('provide the instagram reel or video url. example! .igdl https://www.instagram.com/reel/xxx'));
    }

    await reply('⬇️ downloading instagram...');

    try {
      const { data } = await axios.get(
        `https://apis.davidcyril.name.ng/instagram?url=${encodeURIComponent(url)}`,
        { timeout: 30000 }
      );

      if (!data?.success || !data?.result?.video) {
        throw new Error('no video found');
      }

      const { video, thumbnail } = data.result;

      await sock.sendMessage(chatId, {
        video: { url: video },
        caption: '📸 Instagram Reel'
      }, { quoted: msg });

    } catch (e) {
      reply('❌ download failed — ' + e.message);
    }
  }
};
