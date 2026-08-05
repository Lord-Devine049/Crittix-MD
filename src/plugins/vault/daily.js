const globalXP = require('../../lib/global-xp');
/* DAILY.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
module.exports = {
  command: 'daily',
  category: 'arena',
  description: 'Claim your daily coin reward',
  execute: async ({ sender, reply, msg, senderNumber }) => {
    const result = vault.claimDaily(sender);
    if (result.success) globalXP.addXP(sender, msg.pushName || senderNumber);
    if (!result.success) return reply(`⏳ ${h.toBoldItalic('Daily already claimed!')} ${h.demonEmoji()}\n\n⌛ ${h.toBoldItalic('Cooldown')}: ${vault.formatCooldown(result.cooldown)}`);
    let txt = `╔═══════════════════════════════╗\n║ 🎁 𝐃𝐀𝐈𝐋𝐘 𝐑𝐄𝐖𝐀𝐑𝐃\n╚═══════════════════════════════╝\n\n`;
    txt += `🪙 ${h.toBoldItalic('Base Reward')}: ${vault.formatBalance(result.base)}\n`;
    if (result.streakBonus > 0) txt += `🔥 ${h.toBoldItalic(`Streak Bonus (Day ${result.streak})`)}: +${vault.formatBalance(result.streakBonus)}\n`;
    txt += `💰 ${h.toBoldItalic('Total Received')}: 🪙 ${vault.formatBalance(result.amount)}\n`;
    if (result.leveledUp) txt += `\n⭐ ${h.toBoldItalic(`LEVEL UP! You are now Level ${result.newLevel}`)} 🎉`;
    txt += `\n\n⏰ ${h.toBoldItalic('Come back tomorrow for more!')}`;
    return reply(txt);
  }
};
