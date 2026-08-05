const globalXP = require('../../lib/global-xp');
/* GAMBLE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
module.exports = {
  command: ['gamble'],
  aliases: [],
  category: 'arena',
  description: 'Gamble your coins (45% win chance)',
  execute: async ({ args, sender, prefix, reply, msg, senderNumber }) => {
    const amountStr = args[0]?.toLowerCase();
    if (!amountStr) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}gamble <amount or all>\n\n${h.toBoldItalic('Example')}: ${prefix}gamble 500`);
    const bal = vault.getBalance(sender);
    let amount = amountStr === 'all' ? bal.balance : parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) return reply(`✘ ${h.toBoldItalic('Invalid amount')} ${h.demonEmoji()}`);
    const result = vault.gamble(sender, amount);
    if (!result.success) {
      if (result.reason === 'insufficient') return reply(`✘ ${h.toBoldItalic('Not enough coins!')} ${h.demonEmoji()}\n\n💰 ${h.toBoldItalic('Balance')}: 🪙 ${vault.formatBalance(result.balance)}`);
      return reply(`✘ ${h.toBoldItalic('Invalid amount')} ${h.demonEmoji()}`);
    }
    let txt = `╔═══════════════════════════════╗\n║ 🎲 𝐆𝐀𝐌𝐁𝐋𝐄\n╚═══════════════════════════════╝\n\n`;
    txt += `💰 ${h.toBoldItalic('Bet')}: 🪙 ${vault.formatBalance(amount)}\n`;
    if (result.won) {
      globalXP.addXP(sender, msg.pushName || senderNumber);
      txt += `🎉 ${h.toBoldItalic('YOU WON!')} ${h.demonEmoji()}\n`;
      txt += `💸 ${h.toBoldItalic('Winnings')}: 🪙 ${vault.formatBalance(result.winnings)} (${result.multiplier}x)\n`;
    } else {
      txt += `💀 ${h.toBoldItalic('YOU LOST!')} ${h.demonEmoji()}\n`;
      txt += `📉 ${h.toBoldItalic('Lost')}: 🪙 ${vault.formatBalance(amount)}\n`;
    }
    txt += `\n💰 ${h.toBoldItalic('New Balance')}: 🪙 ${vault.formatBalance(result.newBalance)}`;
    if (result.leveledUp) txt += `\n\n⭐ ${h.toBoldItalic(`LEVEL UP! Level ${result.newLevel}`)} 🎉`;
    return reply(txt);
  }
};
