/* TRANSFER.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');

module.exports = {
  command: ['transfer', 'send', 'give'],
  aliases: ['send', 'give'],
  category: 'arena',
  description: 'Transfer coins to another user',
  execute: async ({ sock, msg, args, sender, chatId, prefix, reply }) => {

    // Use same method as kick.js — h.getTarget handles all mention/reply cases
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const targets = h.getTarget(msg, _gtP);
    const mentionedJid = targets?.[0] || null;

    // Amount is always the last arg, strip any garbage chars
    const rawAmount = args[args.length - 1];
    const amount = parseInt(String(rawAmount || '').replace(/[^0-9]/g, ''));

    if (!mentionedJid || !amount || amount <= 0)
      return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}transfer @user <amount>\n\n${h.toBoldItalic('Example')}: ${prefix}transfer @friend 500`);

    if (mentionedJid === sender)
      return reply(`✘ ${h.toBoldItalic("Can't send to yourself")} ${h.demonEmoji()}`);

    const result = vault.transfer(sender, mentionedJid, amount);

    if (!result.success) {
      if (result.reason === 'insufficient')
        return reply(`✘ ${h.toBoldItalic('Not enough coins!')} ${h.demonEmoji()}\n\n💰 ${h.toBoldItalic('Balance')}: 🪙 ${vault.formatBalance(result.balance)}`);
      return reply(`✘ ${h.toBoldItalic('Invalid amount')} ${h.demonEmoji()}`);
    }

    const toNum = mentionedJid.split('@')[0];
    let txt = `╔═══════════════════════════════╗\n║ 💸 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑\n╚═══════════════════════════════╝\n\n`;
    txt += `✅ ${h.toBoldItalic('Transfer Successful!')} ${h.demonEmoji()}\n\n`;
    txt += `📤 ${h.toBoldItalic('Sent to')}: @${toNum}\n`;
    txt += `💰 ${h.toBoldItalic('Amount')}: 🪙 ${vault.formatBalance(amount)}\n`;
    txt += `\n💰 ${h.toBoldItalic('Your Balance')}: 🪙 ${vault.formatBalance(result.fromBalance)}`;

    await sock.sendMessage(chatId, { text: txt, mentions: [mentionedJid] }, { quoted: msg });
  }
};