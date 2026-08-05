const downloader = require('../../lib/downloader');

module.exports = {
  command: 'play',
  category: 'darkweb',
  description: 'Search and download a song from YouTube',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const query = args.join(' ');
    if (!query) return reply('usage: .play <song name>');

    await reply('🔍 searching: ' + query);

    try {
      const result = await downloader.ytPlay(query);

      if (!result?.audioUrl) return reply('❌ nothing found or audio unavailable');

      const caption =
        `╭─────── ⛧ PLAY ⛧ ───────╮\n` +
        `│ ➜ ${result.title}\n` +
        `│ ➜ by: ${result.author}\n` +
        `│ ➜ duration: ${result.duration}\n` +
        `╰─────────────────────────────╯`;

      await sock.sendMessage(chatId, {
        audio: { url: result.audioUrl },
        mimetype: 'audio/mpeg',
        fileName: (result.title || 'audio') + '.mp3',
        caption
      }, { quoted: msg });

    } catch (e) {
      console.error('[PLAY] Error:', e.message);
      reply('❌ download failed — ' + e.message);
    }
  }
};
