const globalXP = require('../../lib/global-xp');
/* ROB.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
module.exports = {
  command: 'rob',
  category: 'arena',
  description: 'Rob another user (risky!)',
  execute: async ({ sock, msg, args, sender, senderNumber, chatId, prefix, reply }) => {
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const victimJid = mentionedJid || (args[0] ? `${args[0].replace(/[^0-9]/g,'')}@s.whatsapp.net` : null);
    if (!victimJid || victimJid === sender) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}rob @user\n\n💀 ${h.toBoldItalic('Rob someone elses coins!')}`);
    const result = vault.robUser(sender, victimJid);
    const victimNum = victimJid.split('@')[0];
    if (!result.success) {
      if (result.reason === 'cooldown') return reply(`⏳ ${h.toBoldItalic('Too soon to rob again!')} ${h.demonEmoji()}\n\n⌛ ${h.toBoldItalic('Wait')}: ${vault.formatCooldown(result.cooldown)}`);
      if (result.reason === 'broke') return reply(`😂 ${h.toBoldItalic(`@${victimNum} is broke!`)} ${h.demonEmoji()}\n\nThey only have 🪙 ${vault.formatBalance(result.balance)}`);
      if (result.reason === 'shielded') return reply(`🛡️ ${h.toBoldItalic(`@${victimNum} has a Rob Shield!`)} ${h.demonEmoji()}\n\nYou bounced off their protection!`);
      if (result.reason === 'caught') return reply(`🚨 ${h.toBoldItalic('ROB FAILED!')} ${h.demonEmoji()}\n\nYou got caught and paid a fine of 🪙 ${vault.formatBalance(result.fine)}\n\n💀 ${h.toBoldItalic('Better luck next time!')}`);
    }
    globalXP.addXP(sender, msg.pushName || senderNumber);
    let txt = `╔═══════════════════════════════╗\n║ 🦹 𝐑𝐎𝐁 𝐒𝐔𝐂𝐂𝐄𝐒𝐒\n╚═══════════════════════════════╝\n\n`;
    txt += `👤 ${h.toBoldItalic(`Robbed @${victimNum}`)}\n`;
    txt += `💰 ${h.toBoldItalic('Stolen')}: 🪙 ${vault.formatBalance(result.stolen)} (${result.percent}%)\n`;
    if (result.leveledUp) txt += `\n⭐ ${h.toBoldItalic(`LEVEL UP! Level ${result.newLevel}`)} 🎉`;
    txt += `\n\n💀 ${h.toBoldItalic('Crime pays... sometimes')} ${h.demonEmoji()}`;
    await sock.sendMessage(chatId, { text: txt, mentions: mentionedJid ? [mentionedJid] : [] }, { quoted: msg });
  }
};
