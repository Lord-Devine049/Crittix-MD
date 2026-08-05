/* IGSTORY.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const IG_HEADERS = { 'User-Agent': 'Instagram 76.0.0.15.395 Android', 'x-ig-app-id': '936619743392459', 'Accept': 'application/json' };
module.exports = {
  command: 'igstory',
  category: 'soultools',
  description: 'Download Instagram stories from a public account',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const igUsername = args[0]?.replace('@','').trim();
    if (!igUsername) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}igstory <username>\n\n💀 ${h.toBoldItalic('Only works on public accounts')}`);
    try {
      await reply(`📖 ${h.toBoldItalic('Fetching stories...')} ${h.demonEmoji()}`);
      const profileRes = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${igUsername}`, { headers: IG_HEADERS, timeout: 15000 });
      const userId = profileRes.data?.data?.user?.id;
      if (!userId) throw new Error('User not found');
      const storiesRes = await axios.get(`https://www.instagram.com/api/v1/feed/user/${userId}/story/`, { headers: IG_HEADERS, timeout: 15000 });
      const items = storiesRes.data?.reel?.items || storiesRes.data?.items || [];
      if (items.length === 0) return reply(`✘ ${h.toBoldItalic('No active stories')} ${h.demonEmoji()}\n\n@${igUsername} has no stories right now (or account is private)`);
      await reply(`📖 ${h.toBoldItalic(`Found ${items.length} story${items.length > 1 ? 'ies' : ''} from @${igUsername}`)} ${h.demonEmoji()}`);
      let sent = 0;
      for (const item of items.slice(0, 5)) {
        try {
          const isVideo = item.media_type === 2;
          if (isVideo) {
            const videoUrl = item.video_versions?.[0]?.url;
            if (!videoUrl) continue;
            const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 20000 });
            await sock.sendMessage(chatId, { video: Buffer.from(videoBuffer.data), caption: `📹 Story ${sent+1}/${Math.min(items.length,5)} — @${igUsername}`, mimetype: 'video/mp4' });
          } else {
            const imageUrl = item.image_versions2?.candidates?.[0]?.url;
            if (!imageUrl) continue;
            const imgBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
            await sock.sendMessage(chatId, { image: Buffer.from(imgBuffer.data), caption: `📸 Story ${sent+1}/${Math.min(items.length,5)} — @${igUsername}`, mimetype: 'image/jpeg' });
          }
          sent++;
          await new Promise(r => setTimeout(r, 500));
        } catch {}
      }
      if (items.length > 5) await sock.sendMessage(chatId, { text: `💀 ${h.toBoldItalic(`Sent 5/${items.length} stories`)} ${h.demonEmoji()}` });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Could not fetch stories')} ${h.demonEmoji()}\n\nAccount may be private or no active stories`);
    }
  }
};
