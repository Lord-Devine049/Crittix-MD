/* MYXP.JS - Crittix-MD / Created by: LORD DEVINE */
const globalXP = require('../../lib/global-xp');

module.exports = {
  command: 'myxp',
  category: 'arena',
  description: 'Check your global XP rank',
  execute: async ({ sender, senderNumber, reply }) => {
    try {
      const user = globalXP.getUserXP(sender);
      if (!user) return reply(`😑 no XP yet\n\nplay games or complete activities to start earning`);

      const { rank, total } = globalXP.getUserRank(sender);

      let txt = `╔════════════════════════么\n`;
      txt    += `║ ⚡ *GLOBAL XP*\n`;
      txt    += `╚════════════════════════么\n\n`;
      txt    += `👤 @${senderNumber}\n`;
      txt    += `⚡ XP: *${user.xp}*\n`;
      txt    += `🎮 Games: *${user.games}*\n`;
      txt    += `🌍 Rank: *#${rank}* of ${total}\n\n`;
      txt    += `么════════════════════════么`;

      reply(txt);
    } catch (e) { reply('failed — ' + e.message); }
  }
};
