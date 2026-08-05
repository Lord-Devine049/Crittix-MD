
const downloader = require('../../lib/downloader');
module.exports = {
  command: ['tiktok', 'ttdl'],
  category: 'darkweb',
  description: 'Download TikTok video (no watermark)',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.includes('tiktok')) return reply('usage: .tiktok <tiktok url>');
    await reply('⬇️ downloading tiktok...');
    try {
      const result = await downloader.tiktokDL(url);
      if (!result?.videoUrl && !result?.url) return reply('download failed');
      await sock.sendMessage(chatId, {
        video: { url: result.videoUrl || result.url },
        caption: result.title || ''
      }, { quoted: msg });
    } catch (e) { reply('download failed — ' + e.message); }
  }
};