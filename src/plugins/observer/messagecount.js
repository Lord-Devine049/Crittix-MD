/* MESSAGECOUNT.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const observer = require('../../lib/observer');
module.exports = {
  command: ['messagecount'],
  aliases: ['msgcount', 'messages'],
  category: 'groupanalytics',
  description: 'Check how many messages you have sent',
  execute: async ({ msg, sender, senderNumber, chatId, isGroupMsg, groupMetadata, reply }) => {
    try {
      const userData = observer.getUserStats(sender);
      const name = msg.pushName || senderNumber;
      const groupId = isGroupMsg ? (groupMetadata?.id || chatId) : null;
      const globalCount = observer.getMessageCount(sender, null);
      const groupCount = groupId ? observer.getMessageCount(sender, groupId) : null;
      let txt = `╔═══════════════════════════════╗\n║ 💬 𝐌𝐄𝐒𝐒𝐀𝐆𝐄 𝐂𝐎𝐔𝐍𝐓\n╚═══════════════════════════════╝\n\n`;
      txt += `👤 ${h.toBoldItalic(name)}\n\n`;
      txt += `💬 ${h.toBoldItalic('Total Messages')}: ${(userData?.messages || 0).toLocaleString()}\n`;
      txt += `⌨️ ${h.toBoldItalic('Commands Used')}: ${(userData?.commands || 0).toLocaleString()}\n`;
      if (groupId && groupCount !== null) txt += `👥 ${h.toBoldItalic('In This Group')}: ${groupCount.toLocaleString()}\n`;
      txt += `🔥 ${h.toBoldItalic('Streak')}: ${userData?.streak || 1} days\n`;
      txt += `\n💀 ${h.toBoldItalic('Keep grinding')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) { return reply(`✘ ${h.toBoldItalic('Failed to load stats')} ${h.demonEmoji()}`); }
  }
};
