
const downloader = require('../../lib/downloader');
module.exports = {
  command: 'ytmp4',
  category: 'darkweb',
  description: 'Download YouTube video',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.includes('youtu')) return reply('usage: .ytmp4 <youtube url>');
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