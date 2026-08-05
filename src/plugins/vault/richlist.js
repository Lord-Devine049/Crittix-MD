/* RICHLIST.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');

module.exports = {
  command: ['richlist', 'rich'],
  category: 'arena',
  description: 'Show the richest users (vault economy)',
  execute: async ({ sock, msg, chatId, reply }) => {
    const top = vault.getLeaderboard();
    if (top.length === 0)
      return reply(`📊 ${h.toBoldItalic('No economy data yet')} ${h.demonEmoji()}\n\nStart earning with .daily and .work!`);

    const medals = ['👑','🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    const mentions = top.map(u => u.jid);

    let txt = `╔═══════════════════════════════╗\n║ 💰 𝐑𝐈𝐂𝐇 𝐋𝐈𝐒𝐓\n╚═══════════════════════════════╝\n\n`;
    top.forEach((user, i) => {
      const num = user.jid.split('@')[0];
      txt += `${medals[i] || `${i+1}.`} @${num}\n   🪙 ${vault.formatBalance(user.total)} | ⭐ Lv${user.level}\n`;
    });
    txt += `\n💀 ${h.toBoldItalic('Grind harder')} ${h.demonEmoji()}`;

    await sock.sendMessage(chatId, { text: txt, mentions }, { quoted: msg });
  }
};
