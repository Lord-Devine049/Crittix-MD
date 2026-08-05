/* LISTONLINE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const observer = require('../../lib/observer');
module.exports = {
  command: ['listonline', 'online'],
  aliases: ['online'],
  category: 'groupanalytics',
  description: 'List the most recently active members in the group',
  groupOnly: true,
  execute: async ({ sock, msg, chatId, groupMetadata, isGroupMsg, reply }) => {
    if (!isGroupMsg) return reply(`✘ ${h.toBoldItalic('Group only you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    const groupId = groupMetadata?.id || chatId;
    try {
      const participants = groupMetadata?.participants || [];
      const groupStats = observer.getGroupStats(groupId);
      const topUsersEntries = Array.isArray(groupStats?.topUsers) ? groupStats.topUsers : Object.entries(groupStats?.topUsers || {});
      const sortedByActivity = topUsersEntries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([jid, count]) => ({ jid, count }));
      if (sortedByActivity.length === 0) return reply(`✘ ${h.toBoldItalic('No activity tracked yet')} ${h.demonEmoji()}\n\nActivity is tracked as members use commands`);
      let txt = `╔═══════════════════════════════╗\n║ 🔥 𝐌𝐎𝐒𝐓 𝐀𝐂𝐓𝐈𝐕𝐄 𝐌𝐄𝐌𝐁𝐄𝐑𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `👥 ${h.toBoldItalic(`${sortedByActivity.length} active members tracked`)}\n\n`;
      const medals = ['👑','🥇','🥈','🥉'];
      sortedByActivity.forEach((m,i) => {
        const num = m.jid.split('@')[0];
        const medal = medals[i] || `${i+1}.`;
        txt += `${medal} @${num} — ${m.count} msgs\n`;
      });
      txt += `\n💀 ${h.toBoldItalic('Tracked via message count')} ${h.demonEmoji()}`;
      await sock.sendMessage(chatId, { text: txt, mentions: sortedByActivity.map(m => m.jid) }, { quoted: msg });
    } catch (err) { return reply(`✘ ${h.toBoldItalic('Failed to get active list')} ${h.demonEmoji()}`); }
  }
};
