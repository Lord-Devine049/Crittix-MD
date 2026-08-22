const downloader = require('../../lib/downloader');
const p = require('../../lib/phrases');


module.exports = {
  command: ['fb'],
  category: 'darkweb',
  description: 'Download Facebook videos (SD or HD)',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.includes('facebook.com')) {
      return reply(p.phrases.wrongUsage('provide the facebook video url. example! .fb https://facebook.com/watch/?v=xxx'));
    }

    await reply('⬇️ downloading facebook video...');

    try {
      const result = await downloader.facebookDL(url);

      if (!result?.hd && !result?.sd) return reply('❌ no video found for that link.');

      const videoUrl = result.hd || result.sd;
      const quality  = result.hd ? '🎥 HD' : '📹 SD';

      await sock.sendMessage(chatId, {
        video: { url: videoUrl },
        caption: `${result.title || 'Facebook Video'}\n${quality}`
      }, { quoted: msg });

    } catch (e) {
      reply('❌ download failed — ' + e.message);
    }
  }
};
