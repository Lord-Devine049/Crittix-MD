/*
 * MYAURA.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const crittixAura = require('../../lib/crittix-aura');

module.exports = {
  command: 'myaura',
  category: 'arena',
  description: 'Check your aura stats',
  execute: async ({ msg, sender, senderNumber, reply }) => {
    try {
      const aura = crittixAura.getUserAura(sender);

      if (!aura) {
        return reply(`😑 you're not registered\n\nuse *.registeraura* to join the aura system first`);
      }

      const rank = crittixAura.getRank(aura.aura);

      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      const remaining = dayInMs - (now - aura.lastFarm);
      const canFarm = remaining <= 0;
      const hrs = Math.floor(remaining / (60 * 60 * 1000));
      const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const farmStatus = canFarm ? '✅ ready to farm' : `⏳ ${hrs}h ${mins}m left`;

      let text = `╔════════════════════════么\n`;
      text    += `║ ⚡ *AURA STATS*\n`;
      text    += `╚════════════════════════么\n\n`;
      text    += `👤 @${senderNumber}\n`;
      text    += `⚡ Aura: *${aura.aura}*\n`;
      text    += `🏆 Rank: *${rank.title}*\n`;
      text    += `📊 Progress: [${rank.bar}] ${rank.progress}%\n`;
      text    += `🌍 Global: *#${aura.position}* of ${aura.totalUsers}\n`;
      text    += `🌾 Farm: ${farmStatus}\n\n`;
      text    += `么════════════════════════么`;

      reply(text);
    } catch (e) {
      reply('failed — ' + e.message);
    }
  }
};
