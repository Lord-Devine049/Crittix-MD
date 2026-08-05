/*
 * HEAT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const crittixAura = require('../../lib/crittix-aura');

const ROASTS = [
  'you does like to talk too much for no reason',
  "don't you have a job? stupid mf",
  'your fingers never rest huh',
  'bro lives on this chat rent free',
  'say less... actually say nothing',
  'the chat would be peaceful without you fr',
  'you type like you getting paid per message',
  'chronically online and it shows',
  'who hurt you? cuz you never shut up',
  'touch grass. seriously. right now',
];

module.exports = {
  command: 'heat',
  category: 'groupanalytics',
  description: 'Top 10 most active talkers in the group',
  groupOnly: true,
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      const leaderboard = crittixAura.getHeatLeaderboard(chatId, 10);

      if (!leaderboard || leaderboard.length === 0) {
        return reply('🌡️ No heat data yet. People need to start talking first.');
      }

      const mentions = leaderboard.map(u => u.userId);

      const medals = ['🥇', '🥈', '🥉'];

      let text = `╔════════════════════════么\n`;
      text    += `║ 🌡️ *HEAT LEADERBOARD*\n`;
      text    += `║ 🔥 Most active talkers in this chat\n`;
      text    += `╚════════════════════════么\n\n`;

      leaderboard.forEach((user, i) => {
        const medal = medals[i] || `${i + 1}.`;
        const roast = ROASTS[i % ROASTS.length];
        const num = user.userId.split('@')[0];
        text += `${medal} @${num} — 🔥 ${user.heat} heat\n`;
        text += `    ↳ ${roast}\n\n`;
      });

      text += `么════════════════════════么`;

      await sock.sendMessage(chatId, { text, mentions }, { quoted: msg });

    } catch (e) {
      reply('failed — ' + e.message);
    }
  }
};