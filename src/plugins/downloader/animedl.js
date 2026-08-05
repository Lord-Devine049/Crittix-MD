const axios = require('axios');

module.exports = {
  command: 'animedl',
  aliases: ['animedownload', 'getanime'],
  category: 'darkweb',
  description: 'Download an anime episode. Usage: animedl Anime Name | Episode',
  execute: async ({ sock, msg, text, chatId, reply }) => {
    if (!text || !text.includes('|')) {
      return reply('📌 *Format:* animedl Anime Name | Episode\n_Example:_ animedl One Piece | 1050');
    }

    const [animeName, episode] = text.split('|').map(x => x.trim());
    if (!animeName || !episode) return reply('❌ *Both anime name and episode number required*');

    try {
      await reply(`⏳ *Searching for ${animeName} Ep ${episode}...*`);

      const { data } = await axios.get(
        `https://draculazxy-xyzdrac.hf.space/api/Animedl?q=${encodeURIComponent(animeName)}&ep=${encodeURIComponent(episode)}`,
        { timeout: 30000 }
      );

      if (data.STATUS !== 200 || !data.download_link) {
        return reply(`❌ *Episode not found*\nCheck the anime name and episode number`);
      }

      const { anime, episode: epNum, download_link } = data;

      await reply(`🎥 *${anime}* Ep ${epNum}\n⏳ Sending file...`);

      await sock.sendMessage(chatId, {
        document: { url: download_link },
        mimetype: 'video/mp4',
        fileName: `${anime} - Episode ${epNum}.mp4`,
        caption: `🎌 *${anime}* — Episode ${epNum}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    } catch (e) {
      reply(`⚠️ *Anime download failed* • ${e.message || 'Try again later'}`);
    }
  }
};
