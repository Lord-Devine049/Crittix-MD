/*
 * STALK.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['stalk', 'igstalk'],
  category: 'soultools',
  description: 'View public Instagram profile info',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const username = args[0]?.replace('@', '').trim();
    if (!username) return reply('usage: .stalk <username>\nexample: .stalk mrbeast');

    try {
      const { data } = await axios.get(
        `https://apis.davidcyril.name.ng/igstalk?username=${encodeURIComponent(username)}`,
        { timeout: 15000 }
      );

      if (!data?.usrname) return reply('❌ profile not found or username incorrect');

      const s = data.status || {};

      const caption =
        `👁️ *Instagram Stalk*\n\n` +
        `👤 *@${data.usrname}*\n\n` +
        `📸 Posts: ${s.post || 'N/A'}\n` +
        `👥 Followers: ${s.follower || 'N/A'}\n` +
        `➡️ Following: ${s.following || 'N/A'}\n\n` +
        `📝 ${data.desk || 'No bio'}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

      if (data.pp) {
        await sock.sendMessage(chatId, {
          image: { url: data.pp },
          caption
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: msg });
      }

    } catch (e) {
      reply('❌ could not fetch profile — ' + e.message);
    }
  }
};