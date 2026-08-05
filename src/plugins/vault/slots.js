const globalXP = require('../../lib/global-xp');
/* SLOTS.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
module.exports = {
  command: 'slots',
  category: 'arena',
  description: 'Play the slot machine',
  execute: async ({ args, sender, prefix, reply, msg, senderNumber }) => {
    const amountStr = args[0]?.toLowerCase();
    if (!amountStr) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}slots <amount or all>\n\n${h.toBoldItalic('Example')}: ${prefix}slots 200`);
    const bal = vault.getBalance(sender);
    let amount = amountStr === 'all' ? bal.balance : parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) return reply(`✘ ${h.toBoldItalic('Invalid amount')} ${h.demonEmoji()}`);
    const result = vault.slots(sender, amount);
    if (!result.success) {
      if (result.reason === 'insufficient') return reply(`✘ ${h.toBoldItalic('Not enough coins!')} ${h.demonEmoji()}\n\n💰 ${h.toBoldItalic('Balance')}: 🪙 ${vault.formatBalance(result.balance)}`);
      return reply(`✘ ${h.toBoldItalic('Invalid amount')} ${h.demonEmoji()}`);
    }
    const spinDisplay = `[ ${result.spin.join(' | ')} ]`;
    let txt = `╔═══════════════════════════════╗\n║ 🎰 𝐒𝐋𝐎𝐓𝐒\n╚═══════════════════════════════╝\n\n`;
    txt += `🎰 ${spinDisplay}\n\n`;
    txt += `💰 ${h.toBoldItalic('Bet')}: 🪙 ${vault.formatBalance(amount)}\n`;
    if (result.isSkull) {
      txt += `💀 ${h.toBoldItalic('SKULL JACKPOT! You lost DOUBLE!')} 😭\n`;
      txt += `📉 ${h.toBoldItalic('Lost')}: 🪙 ${vault.formatBalance(result.lost)}\n`;
    } else if (result.won) {
      globalXP.addXP(sender, msg.pushName || senderNumber);
      txt += `🎉 ${h.toBoldItalic('YOU WON!')} ${h.demonEmoji()}\n`;
      txt += `💸 ${h.toBoldItalic('Winnings')}: 🪙 ${vault.formatBalance(result.winnings)} (${result.multiplier}x)\n`;
    } else {
      txt += `💀 ${h.toBoldItalic('YOU LOST!')} ${h.demonEmoji()}\n`;
      txt += `📉 ${h.toBoldItalic('Lost')}: 🪙 ${vault.formatBalance(result.lost)}\n`;
    }
    txt += `\n💰 ${h.toBoldItalic('New Balance')}: 🪙 ${vault.formatBalance(result.newBalance)}`;
    if (result.leveledUp) txt += `\n\n⭐ ${h.toBoldItalic(`LEVEL UP! Level ${result.newLevel}`)} 🎉`;
    return reply(txt);
  }
};
