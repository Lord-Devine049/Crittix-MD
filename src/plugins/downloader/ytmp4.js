
const downloader = require('../../lib/downloader');
const p = require('../../lib/phrases');

module.exports = {
  command: 'ytmp4',
  category: 'darkweb',
  description: 'Download YouTube video',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.includes('youtu')) return reply(p.phrases.wrongUsage('provide the youtube video url. example! .ytmp4 https://youtu.be/xxx'));
    await reply('⬇️ downloading video...');
    try {
      const result = await downloader.ytPlay(url);
      if (!result?.videoUrl) return reply('download failed');
      await sock.sendMessage(chatId, {
        video: { url: result.videoUrl },
        caption: result.title || ''
      }, { quoted: msg });
    } catch (e) { reply('download failed — ' + e.message); }
  }
};