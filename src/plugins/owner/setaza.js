/* SETAZA.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: 'setaza',
  category: 'voidsystem',
  description: 'Set your payment/account details',
  ownerOnly: true,
  execute: async ({ text, isOwner, prefix, reply }) => {
    if (!isOwner) return reply(`✘ ${h.toBoldItalic('Owner only you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    const input = text.replace(/^[^\s]+\s*/, '').trim();
    if (!input) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}setaza <name>, <bank>, <account number>\n\n${h.toBoldItalic('Example')}: ${prefix}setaza LORD DEVINE, GTBank, 0123456789`);
    const parts = input.split(',').map(s => s.trim());
    if (parts.length < 3) return reply(`✘ ${h.toBoldItalic('Need 3 parts separated by commas')} ${h.demonEmoji()}\n\n${h.toBoldItalic('Format')}: name, bank, account number`);
    const [accountName, bankName, accountNumber] = parts;
    if (!accountName || !bankName || !accountNumber) return reply(`✘ ${h.toBoldItalic('All fields required')} ${h.demonEmoji()}`);
    const db = h.loadDatabase();
    db.aza = { accountName, bankName, accountNumber };
    h.saveDatabase(db);
    return reply(
      `✅ ${h.toBoldItalic('Account Details Saved!')} ${h.demonEmoji()}\n\n` +
      `╔════════════════════════════════════════╗\n` +
      `║ 👤 ${h.toBoldItalic('Name')}   : ${accountName}\n` +
      `║ 🏦 ${h.toBoldItalic('Bank')}   : ${bankName}\n` +
      `║ 🔢 ${h.toBoldItalic('Acct No')} : ${accountNumber}\n` +
      `╚════════════════════════════════════════╝\n\n` +
      `💀 ${h.toBoldItalic('Use .aza to display anytime')} ${h.demonEmoji()}`
    );
  }
};
