
const axios = require('axios');

module.exports = {
  command: ['spotify'],
  category: 'darkweb',
  description: 'Download a Spotify track by URL',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.includes('spotify.com')) {
      return reply('usage: .spt <spotify track url>');
    }

    await reply('⬇️ downloading spotify track...');

    try {
      const { data } = await axios.get(
        `https://apis.davidcyril.name.ng/spotifydl?url=${encodeURIComponent(url)}`,
        { timeout: 30000 }
      );

      if (!data?.success || !data?.DownloadLink) {
        throw new Error('track not found');
      }

      const caption =
        `🎵 *${data.title || 'Unknown'}*\n` +
        `👤 Artist: ${data.channel || 'Unknown'}\n` +
        `⏱️ Duration: ${data.duration || 'N/A'}`;

      await sock.sendMessage(chatId, {
        audio: { url: data.DownloadLink },
        mimetype: 'audio/mpeg',
        fileName: `${data.title || 'track'}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: data.title || 'Spotify Track',
            body: data.channel || '',
            thumbnailUrl: data.thumbnail || '',
            mediaType: 1
          }
        }
      }, { quoted: msg });

      // send caption as separate message so it's readable
      await reply(caption);

    } catch (e) {
      reply('❌ download failed — ' + e.message);
    }
  }
};
