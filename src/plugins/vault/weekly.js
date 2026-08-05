const globalXP = require('../../lib/global-xp');
/* WEEKLY.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
module.exports = {
  command: 'weekly',
  category: 'groupanalytics',
  description: 'Claim your weekly coin reward',
  execute: async ({ sender, reply, msg, senderNumber }) => {
    const result = vault.claimWeekly(sender);
    if (result.success) globalXP.addXP(sender, msg.pushName || senderNumber);
    if (!result.success) return reply(`⏳ ${h.toBoldItalic('Weekly already claimed!')} ${h.demonEmoji()}\n\n⌛ ${h.toBoldItalic('Cooldown')}: ${vault.formatCooldown(result.cooldown)}`);
    let txt = `╔═══════════════════════════════╗\n║ 🎁 𝐖𝐄𝐄𝐊𝐋𝐘 𝐑𝐄𝐖𝐀𝐑𝐃\n╚═══════════════════════════════╝\n\n`;
    txt += `💰 ${h.toBoldItalic('Received')}: 🪙 ${vault.formatBalance(result.amount)}\n`;
    if (result.leveledUp) txt += `\n⭐ ${h.toBoldItalic(`LEVEL UP! You are now Level ${result.newLevel}`)} 🎉`;
    txt += `\n\n⏰ ${h.toBoldItalic('Come back in 7 days!')}`;
    return reply(txt);
  }
};
