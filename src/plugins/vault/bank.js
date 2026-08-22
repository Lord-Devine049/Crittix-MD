/*
 * BANK.JS - Crittix-MD (deposit / withdraw)
 * Created by: LORD DEVINE
 * Bank keeps coins safe from rob. Max bank = 50,000 (upgradeable via shop)
 */
const vault = require('../../lib/vault');
const h     = require('../../lib/helpers');
const p = require('../../lib/phrases');


const BASE_CAP = 50000;

module.exports = [
  {
    command: 'deposit',
    aliases: ['dep'],
    category: 'arena',
    description: 'Deposit coins into your bank',
    execute: async ({ sender, args, reply }) => {
      const bal = vault.getBalance(sender);
      if (!bal) return reply(p.phrases.error('No vault account. Use .daily to start'));

      const amount = args[0]?.toLowerCase() === 'all' ? bal.balance : parseInt(args[0]);
      if (!amount || amount <= 0) return reply(p.phrases.wrongUsage('provide an amount to deposit. example! .deposit 500. or .deposit all to deposit everything.'));
      if (amount > bal.balance) return reply(`😑 you only have 🪙 ${bal.balance.toLocaleString()}`);

      const cap = BASE_CAP + (vault.getInventory(sender).filter(i => i.id === 'vault').length * 10000);
      if ((bal.bank || 0) + amount > cap)
        return reply(`🏦 bank full — max capacity: 🪙 ${cap.toLocaleString()}\nUpgrade with .shop`);

      vault.updateBalance(sender, -amount, amount);
      const newBal = vault.getBalance(sender);
      reply(
        `╔════════════════════════么\n║ 🏦 *DEPOSITED*\n╚════════════════════════么\n\n` +
        `💸 Deposited: *🪙 ${amount.toLocaleString()}*\n` +
        `💰 Wallet: *🪙 ${newBal.balance.toLocaleString()}*\n` +
        `🏦 Bank: *🪙 ${newBal.bank.toLocaleString()}*\n` +
        `么════════════════════════么`
      );
    }
  },
  {
    command: 'withdraw',
    aliases: ['with'],
    category: 'arena',
    description: 'Withdraw coins from your bank',
    execute: async ({ sender, args, reply }) => {
      const bal = vault.getBalance(sender);
      if (!bal) return reply(p.phrases.error('No vault account. Use .daily to start'));

      const amount = args[0]?.toLowerCase() === 'all' ? (bal.bank || 0) : parseInt(args[0]);
      if (!amount || amount <= 0) return reply(p.phrases.wrongUsage('provide an amount to withdraw. example! .withdraw 200. or .withdraw all.'));
      if (amount > (bal.bank || 0)) return reply(`😑 bank only has 🪙 ${(bal.bank||0).toLocaleString()}`);

      vault.updateBalance(sender, amount, -amount);
      const newBal = vault.getBalance(sender);
      reply(
        `╔════════════════════════么\n║ 🏦 *WITHDRAWN*\n╚════════════════════════么\n\n` +
        `💸 Withdrawn: *🪙 ${amount.toLocaleString()}*\n` +
        `💰 Wallet: *🪙 ${newBal.balance.toLocaleString()}*\n` +
        `🏦 Bank: *🪙 ${newBal.bank.toLocaleString()}*\n` +
        `么════════════════════════么`
      );
    }
  }
];
