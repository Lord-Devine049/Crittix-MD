const globalXP = require('../../lib/global-xp');
/* MONTHLY.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
module.exports = {
  command: 'monthly',
  category: 'groupanalytics',
  description: 'Claim your monthly coin reward',
  execute: async ({ sender, reply, msg, senderNumber }) => {
    const result = vault.claimMonthly(sender);
    if (result.success) globalXP.addXP(sender, msg.pushName || senderNumber);
    if (!result.success) return reply(`⏳ ${h.toBoldItalic('Monthly already claimed!')} ${h.demonEmoji()}\n\n⌛ ${h.toBoldItalic('Cooldown')}: ${vault.formatCooldown(result.cooldown)}`);
    let txt = `╔═══════════════════════════════╗\n║ 🎁 𝐌𝐎𝐍𝐓𝐇𝐋𝐘 𝐑𝐄𝐖𝐀𝐑𝐃\n╚═══════════════════════════════╝\n\n`;
    txt += `💰 ${h.toBoldItalic('Received')}: 🪙 ${vault.formatBalance(result.amount)}\n`;
    if (result.leveledUp) txt += `\n⭐ ${h.toBoldItalic(`LEVEL UP! You are now Level ${result.newLevel}`)} 🎉`;
    txt += `\n\n⏰ ${h.toBoldItalic('Come back in 30 days!')}`;
    return reply(txt);
  }
};
