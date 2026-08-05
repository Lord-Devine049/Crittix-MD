/* AURALEADERBOARD.JS - Crittix-MD / Created by: LORD DEVINE */
const crittixAura = require('../../lib/crittix-aura');

module.exports = {
  command: ['auraleaderboard', 'alb', 'auralb'],
  category: 'groupanalytics',
  description: 'Global aura leaderboard — top aura farmers',
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      const top = crittixAura.getAuraLeaderboard(10);
      if (!top || top.length === 0)
        return reply(`⚡ No aura data yet.\n\nUse *.registeraura* then *.farmaura* daily to climb!`);

      const medals = ['👑','🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
      const mentions = top.map(u => u.userId);

      let txt = `╔═══════════════════════════════╗\n║ ⚡ *AURA LEADERBOARD*\n║ 🏆 Top aura farmers globally\n╚═══════════════════════════════╝\n\n`;
      top.forEach((user, i) => {
        const num = user.userId.split('@')[0];
        txt += `${medals[i] || `${i+1}.`} @${num}\n`;
        txt += `   ⚡ ${user.aura} aura • ${user.rank.title}\n`;
      });
      txt += `\n么════════════════════════么\n`;
      txt += `Farm daily with *.farmaura* to climb`;

      await sock.sendMessage(chatId, { text: txt, mentions }, { quoted: msg });
    } catch (e) { reply('failed — ' + e.message); }
  }
};
