/*
 * YTCHANNEL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['ytchannel'],
  category: 'darkweb',
  description: 'Get YouTube channel info by @username',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const user = args[0]?.replace('@', '').trim();
    if (!user) return reply('usage: .ytchannel <@username>\nexample: .ytchannel powerangers');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/stalk/ytstalk?user=${encodeURIComponent(user)}`,
        { timeout: 15000 }
      );

      if (!data?.status || !data?.data) {
        return reply('❌ channel not found');
      }

      const d = data.data;

      const caption =
        `📺 *YouTube Channel*\n\n` +
        `👤 *${d.name || 'Unknown'}*\n` +
        `🔖 @${d.username || user}\n` +
        `👥 Subscribers: ${d.subscribers || 'N/A'}\n\n` +
        `📝 ${d.description || 'No description'}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

      if (d.image) {
        await sock.sendMessage(chatId, {
          image: { url: d.image },
          caption
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: msg });
      }

    } catch (e) {
      reply('❌ failed to fetch channel — ' + e.message);
    }
  }
};