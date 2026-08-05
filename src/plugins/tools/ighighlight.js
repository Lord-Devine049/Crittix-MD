/* IGHIGHLIGHT.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const IG_HEADERS = { 'User-Agent': 'Instagram 76.0.0.15.395 Android', 'x-ig-app-id': '936619743392459', 'Accept': 'application/json' };
module.exports = {
  command: 'ighighlight',
  category: 'soultools',
  description: 'Get highlight covers and titles from an Instagram profile',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const igUsername = args[0]?.replace('@','').trim();
    if (!igUsername) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}ighighlight <username>\n\n${h.toBoldItalic('Example')}: ${prefix}ighighlight natgeo`);
    try {
      await reply(`🔍 ${h.toBoldItalic('Fetching highlights...')} ${h.demonEmoji()}`);
      const profileRes = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${igUsername}`, { headers: IG_HEADERS, timeout: 15000 });
      const userId = profileRes.data?.data?.user?.id;
      if (!userId) throw new Error('User not found');
      const highlightRes = await axios.get(`https://www.instagram.com/api/v1/highlights/${userId}/highlights_tray/`, { headers: IG_HEADERS, timeout: 15000 });
      const highlights = highlightRes.data?.tray || [];
      if (highlights.length === 0) return reply(`✘ ${h.toBoldItalic('No highlights found')} ${h.demonEmoji()}\n\n@${igUsername} has no highlights (or account is private)`);
      let txt = `╔═══════════════════════════════╗\n║ ⭕ 𝐈𝐆 𝐇𝐈𝐆𝐇𝐋𝐈𝐆𝐇𝐓𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `👤 ${h.toBoldItalic('@' + igUsername)}\n📌 ${h.toBoldItalic(`${highlights.length} highlight${highlights.length > 1 ? 's' : ''} found`)}\n\n`;
      highlights.slice(0, 12).forEach((hlt, i) => { txt += `${i+1}. ${hlt.title || 'Highlight'} (${hlt.media_count || '?'} items)\n`; });
      if (highlights.length > 12) txt += `\n... +${highlights.length - 12} more`;
      txt += `\n\n💀 ${h.toBoldItalic('View at')}: https://instagram.com/${igUsername}`;
      const coverUrl = highlights[0]?.cover_media?.cropped_image_version?.url;
      if (coverUrl) {
        try {
          const coverBuffer = await axios.get(coverUrl, { responseType: 'arraybuffer', timeout: 10000 });
          await sock.sendMessage(chatId, { image: Buffer.from(coverBuffer.data), caption: txt, mimetype: 'image/jpeg' }, { quoted: msg });
        } catch { await sock.sendMessage(chatId, { text: txt }, { quoted: msg }); }
      } else {
        await sock.sendMessage(chatId, { text: txt }, { quoted: msg });
      }
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Could not fetch highlights')} ${h.demonEmoji()}\n\nAccount may be private`);
    }
  }
};
