const globalXP = require('../../lib/global-xp');
/* WORK.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
module.exports = {
  command: 'work',
  category: 'arena',
  description: 'Work to earn coins (2 hour cooldown)',
  execute: async ({ sender, reply, msg, senderNumber }) => {
    const result = vault.doWork(sender);
    if (result.success) globalXP.addXP(sender, msg.pushName || senderNumber);
    if (!result.success) return reply(`⏳ ${h.toBoldItalic('You are still tired!')} ${h.demonEmoji()}\n\n⌛ ${h.toBoldItalic('Rest for')}: ${vault.formatCooldown(result.cooldown)}`);
    let txt = `╔═══════════════════════════════╗\n║ 💼 𝐖𝐎𝐑𝐊\n╚═══════════════════════════════╝\n\n`;
    txt += `${result.job.emoji} ${h.toBoldItalic(result.job.name)}\n`;
    if (result.usedTool) txt += `🔧 ${h.toBoldItalic('Tool bonus applied!')} (+30%)\n`;
    txt += `\n💰 ${h.toBoldItalic('Earned')}: 🪙 ${vault.formatBalance(result.amount)}\n`;
    if (result.leveledUp) txt += `\n⭐ ${h.toBoldItalic(`LEVEL UP! You are now Level ${result.newLevel}`)} 🎉`;
    txt += `\n\n⌛ ${h.toBoldItalic('Work again in 2 hours')}`;
    return reply(txt);
  }
};
