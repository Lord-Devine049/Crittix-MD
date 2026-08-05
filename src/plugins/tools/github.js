const axios = require('axios');

module.exports = {
  command: 'github',
  aliases: ['gh', 'githubstalk'],
  category: 'soultools',
  description: 'Look up a GitHub user profile',
  execute: async ({ sock, msg, text, chatId, reply }) => {
    if (!text) return reply('👨‍💻 *Usage:* .github username');

    try {
      const res = await axios.get(
        `https://apis.davidcyril.name.ng/githubStalk?user=${encodeURIComponent(text.trim())}`
      );
      const u = res.data;
      if (!u || !u.username) return reply('🔍 *User not found*');

      const bio = u.bio ? `\n📝 ${u.bio}` : '';
      const caption =
        `👨‍💻 *GitHub Profile*\n\n` +
        `📌 *${u.creator || u.username}* (@${u.username})${bio}\n` +
        `🏷️ ${u.nickname || ''}\n` +
        `📍 ${u.location || 'Location hidden'}\n` +
        `📦 Repos: *${u.public_repositories}* | 👥 Followers: *${u.followers}*\n` +
        `💚 Following: *${u.following}*\n` +
        `📅 Joined: ${new Date(u.created_at).toDateString()}\n` +
        `🔗 ${u.url}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

      await sock.sendMessage(chatId, {
        image: { url: u.profile_pic },
        caption
      }, { quoted: msg });

    } catch (e) {
      reply('⚠️ *GitHub fetch failed* • User may not exist or API is down');
    }
  }
};