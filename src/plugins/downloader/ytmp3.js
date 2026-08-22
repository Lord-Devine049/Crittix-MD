
const downloader = require('../../lib/downloader');
const p = require('../../lib/phrases');

module.exports = {
  command: 'ytmp3',
  category: 'darkweb',
  description: 'Download YouTube audio',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.includes('youtu')) return reply(p.phrases.wrongUsage('provide the youtube video url. example! .ytmp3 https://youtu.be/xxx'));
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