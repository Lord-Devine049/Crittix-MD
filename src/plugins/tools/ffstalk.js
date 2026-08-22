
const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = {
  command: 'ffstalk',
  aliases: ['ffinfo', 'freefire'],
  category: 'soultools',
  description: 'Look up a Free Fire player by ID. Usage: ffstalk <player_id>',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    if (!args[0]) return reply(p.phrases.wrongUsage('provide the free fire player id. example! .ffstalk 8533270051'));

    const ffId = args[0].trim();
    try {
      const res = await axios.get(`https://prexzyapis.com/stalk/ffstalk?id=${ffId}`);
      const data = res.data;

      if (!data.status || !data.data) return reply('❌ *Player not found* • Check the ID and try again');

      const { nickname, region, open_id, img_url } = data.data;

      await sock.sendMessage(chatId, {
        image: { url: img_url || 'https://i.imgur.com/uBDOvCH.png' },
        caption:
          `🎮 *Free Fire Player*\n\n` +
          `👤 *${nickname}*\n` +
          `🆔 ID: ${open_id}\n` +
          `🌏 Region: ${region}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    } catch (e) {
      reply('❌ *Free Fire stalk failed* • Try again later');
    }
  }
};
