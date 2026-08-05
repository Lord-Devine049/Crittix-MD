/* AZA.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: ['aza', 'myaza'],
  aliases: ['myaza'],
  category: 'voidsystem',
  description: 'Display owner payment/account details',
  execute: async ({ prefix, reply }) => {
    const db = h.loadDatabase();
    const aza = db.aza;
    if (!aza || !aza.accountNumber) {
      return reply(
        `╔════════════════════════════════════════╗\n` +
        `║ 💳 𝐀𝐂𝐂𝐎𝐔𝐍𝐓 𝐃𝐄𝐓𝐀𝐈𝐋𝐒\n` +
        `╚════════════════════════════════════════╝\n\n` +
        `❌ ${h.toBoldItalic('Account details not set yet')} ${h.demonEmoji()}\n\n` +
        `💀 ${h.toBoldItalic('Set with')}: ${prefix}setaza <name>, <bank>, <account number>`
      );
    }
    return reply(
      `╔════════════════════════════════════════╗\n` +
      `║ 💳 𝐀𝐂𝐂𝐎𝐔𝐍𝐓 𝐃𝐄𝐓𝐀𝐈𝐋𝐒\n` +
      `╚════════════════════════════════════════╝\n\n` +
      `╔════════════════════════════════════════╗\n` +
      `║ 👤 ${h.toBoldItalic('Name')}   : ${aza.accountName}\n` +
      `║ 🏦 ${h.toBoldItalic('Bank')}   : ${aza.bankName}\n` +
      `║ 🔢 ${h.toBoldItalic('Acct No')} : ${aza.accountNumber}\n` +
      `╚════════════════════════════════════════╝\n\n` +
      `💀 ${h.toBoldItalic('Send your payment to the details above')} ${h.demonEmoji()}`
    );
  }
};
