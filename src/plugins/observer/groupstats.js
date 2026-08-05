/* GROUPSTATS.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const observer = require('../../lib/observer');
module.exports = {
  command: 'groupstats',
  category: 'groupanalytics',
  description: 'Show group activity statistics',
  groupOnly: true,
  execute: async ({ sock, msg, chatId, groupMetadata, isGroupMsg, reply }) => {
    if (!isGroupMsg) return reply(`✘ ${h.toBoldItalic('Group only you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    const groupId = groupMetadata?.id || chatId;
    try {
      const stats = observer.getGroupStats(groupId);
      const memberCount = groupMetadata?.participants?.length || 0;
      const topUsers = Array.isArray(stats?.topUsers) ? stats.topUsers : [];
      let txt = `╔═══════════════════════════════╗\n║ 📊 𝐆𝐑𝐎𝐔𝐏 𝐒𝐓𝐀𝐓𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `👥 ${h.toBoldItalic('Group')}: ${groupMetadata?.subject || 'Unknown'}\n`;
      txt += `👤 ${h.toBoldItalic('Members')}: ${memberCount}\n`;
      txt += `💬 ${h.toBoldItalic('Total Messages')}: ${(stats?.messages || 0).toLocaleString()}\n`;
      txt += `⌨️ ${h.toBoldItalic('Total Commands')}: ${(stats?.commands || 0).toLocaleString()}\n\n`;
      if (topUsers.length > 0) {
        const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
        txt += `🔥 ${h.toBoldItalic('Most Active')}:\n`;
        topUsers.forEach(([jid, count], i) => { const num = jid.split('@')[0]; txt += `${medals[i]} @${num} — ${count} msgs\n`; });
        await sock.sendMessage(chatId, { text: txt + `\n💀 ${h.toBoldItalic('Observer stats')} ${h.demonEmoji()}`, mentions: topUsers.map(([jid]) => jid) }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, { text: txt + `\n💀 ${h.toBoldItalic('Observer stats')} ${h.demonEmoji()}` }, { quoted: msg });
      }
    } catch (err) { return reply(`✘ ${h.toBoldItalic('Could not fetch stats')} ${h.demonEmoji()}`); }
  }
};
