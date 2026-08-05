/* RANK.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const observer = require('../../lib/observer');
module.exports = {
  command: 'rank',
  category: 'groupanalytics',
  description: 'Show your activity rank in the chat',
  execute: async ({ msg, sender, senderNumber, chatId, isGroupMsg, groupMetadata, reply }) => {
    try {
      const userData = observer.getUserStats(sender);
      const name = msg.pushName || senderNumber;
      const groupId = isGroupMsg ? (groupMetadata?.id || chatId) : null;
      const rankInfo = observer.getRank(sender, groupId);
      const msgs = userData?.messages || 0;
      const rankTitles = [[25000,'☠️ CRITTIX LEGEND'],[8000,'👿 DEMON LORD'],[3000,'😈 SHADOW PRINCE'],[1200,'💀 DARK KNIGHT'],[500,'🔥 FLAME WARRIOR'],[150,'⚔️ WARRIOR'],[50,'🗡️ FIGHTER'],[0,'🌑 NEWCOMER']];
      const [,title] = rankTitles.find(([t]) => msgs >= t) || [0,'🌑 NEWCOMER'];
      let txt = `╔═══════════════════════════════╗\n║ 🏆 𝐘𝐎𝐔𝐑 𝐑𝐀𝐍𝐊\n╚═══════════════════════════════╝\n\n`;
      txt += `👤 ${h.toBoldItalic(name)}\n\n${title}\n\n`;
      txt += `💬 ${h.toBoldItalic('Messages')}: ${msgs.toLocaleString()}\n`;
      txt += `⌨️ ${h.toBoldItalic('Commands')}: ${(userData?.commands || 0).toLocaleString()}\n`;
      if (rankInfo?.rank) txt += `📊 ${h.toBoldItalic('Position')}: #${rankInfo.rank} of ${rankInfo.total}\n`;
      txt += `\n💀 ${h.toBoldItalic('Grind harder to rank up')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) { return reply(`✘ ${h.toBoldItalic('Failed to load rank')} ${h.demonEmoji()}`); }
  }
};
