/* BALANCE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
module.exports = {
  command: ['balance', 'bal', 'wallet'],
  aliases: ['bal', 'wallet'],
  category: 'arena',
  description: 'Check your coin balance',
  execute: async ({ msg, sender, senderNumber, reply }) => {
    const data = vault.getBalance(sender);
    const name = msg.pushName || senderNumber;
    const xpFill = Math.min(10, Math.max(0, Math.floor((data.xp / data.xpNeeded) * 10)));
    const xpBar = '█'.repeat(xpFill) + '░'.repeat(10 - xpFill);
    let txt = `╔═══════════════════════════════╗\n║ 💰 𝐕𝐀𝐔𝐋𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄\n╚═══════════════════════════════╝\n\n`;
    txt += `👤 ${h.toBoldItalic(name)}\n\n`;
    txt += `💰 ${h.toBoldItalic('Wallet')}: 🪙 ${vault.formatBalance(data.balance)}\n`;
    txt += `🏦 ${h.toBoldItalic('Bank')}: 🪙 ${vault.formatBalance(data.bank)}\n`;
    txt += `📊 ${h.toBoldItalic('Total')}: 🪙 ${vault.formatBalance(data.total)}\n`;
    txt += `📈 ${h.toBoldItalic('Total Earned')}: 🪙 ${vault.formatBalance(data.totalEarned)}\n\n`;
    txt += `⭐ ${h.toBoldItalic('Level')}: ${data.level}\n`;
    txt += `🔮 ${h.toBoldItalic('XP')}: ${xpBar} (${data.xp}/${data.xpNeeded})\n`;
    txt += `\n💀 ${h.toBoldItalic('Use .daily to claim rewards')}`;
    return reply(txt);
  }
};
