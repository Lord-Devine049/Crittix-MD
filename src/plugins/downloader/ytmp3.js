
const downloader = require('../../lib/downloader');
module.exports = {
  command: 'ytmp3',
  category: 'darkweb',
  description: 'Download YouTube audio',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.includes('youtu')) return reply('usage: .ytmp3 <youtube url>');
    await reply('⬇️ downloading audio...');
    try {
      const result = await downloader.ytPlay(url);
      if (!result?.audioUrl) return reply('download failed');
      await sock.sendMessage(chatId, {
        audio: { url: result.audioUrl },
        mimetype: 'audio/mpeg',
        fileName: (result.title || 'audio') + '.mp3'
      }, { quoted: msg });
    } catch (e) { reply('download failed — ' + e.message); }
  }
};