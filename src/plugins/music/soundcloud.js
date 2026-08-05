/* SOUNDCLOUD.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
module.exports = {
  command: 'soundcloud',
  aliases: ['sc'],
  category: 'soultools',
  description: 'Get info about a SoundCloud track from URL',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const scUrl = args[0];
    if (!scUrl || !scUrl.includes('soundcloud.com')) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}soundcloud <soundcloud url>\n\n${h.toBoldItalic('Example')}: ${prefix}soundcloud https://soundcloud.com/artist/track`);
    try {
      await reply(`🎵 ${h.toBoldItalic('Fetching SoundCloud track...')} ${h.demonEmoji()}`);
      const res = await axios.get(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(scUrl)}`, { timeout: 15000 });
      const data = res.data;
      let txt = `╔═══════════════════════════════╗\n║ 🎵 𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃\n╚═══════════════════════════════╝\n\n`;
      txt += `🎵 ${h.toBoldItalic('Title')}: ${data.title || 'N/A'}\n`;
      txt += `🎤 ${h.toBoldItalic('Artist')}: ${data.author_name || 'N/A'}\n`;
      txt += `\n🔗 ${h.toBoldItalic('Link')}: ${scUrl}\n\n💀 ${h.toBoldItalic('Open in SoundCloud to listen')} ${h.demonEmoji()}`;
      if (data.thumbnail_url) {
        await sock.sendMessage(chatId, { image: { url: data.thumbnail_url }, caption: txt }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, { text: txt }, { quoted: msg });
      }
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Could not fetch track info')} ${h.demonEmoji()}\n\nMake sure the URL is valid and public`);
    }
  }
};
