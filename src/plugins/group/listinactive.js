/* LISTINACTIVE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');
const observer = require('../../lib/observer');
module.exports = {
  command: ['listinactive'],
  aliases: [],
  category: 'groupanalytics',
  description: 'List the most inactive members in the group',
  groupOnly: true,
  execute: async ({ sock, msg, args, sender, chatId, groupMetadata, isGroupMsg, prefix, reply }) => {
    if (!isGroupMsg) return reply(`✘ ${h.toBoldItalic('Group only you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    const groupId = groupMetadata?.id || chatId;
    const senderIsAdmin = await h.isSenderAdmin(sock, groupId, sender);
    if (!senderIsAdmin) return reply(p.phrases.adminOnly());
    try {
      const daysCutoff = parseInt(args[0]) || 7;
      const cutoffMs = daysCutoff * 24 * 60 * 60 * 1000;
      const participants = groupMetadata?.participants || [];
      const groupStats = observer.getGroupStats(groupId);
      const topUsersMap = {};
      if (groupStats?.topUsers) {
        const entries = Array.isArray(groupStats.topUsers) ? groupStats.topUsers : Object.entries(groupStats.topUsers);
        entries.forEach(([jid, count]) => { topUsersMap[jid] = count; });
      }
      const inactiveList = participants.filter(p => {
        if (p.admin) return false;
        const count = topUsersMap[p.id] || 0;
        return count === 0;
      });
      if (inactiveList.length === 0) return reply(p.phrases.notFound("no inactive members found." ${h.demonEmoji()}`);
      const top = inactiveList.slice(0, 20);
      let txt = `╔═══════════════════════════════╗\n║ 💀 𝐈𝐍𝐀𝐂𝐓𝐈𝐕𝐄 𝐌𝐄𝐌𝐁𝐄𝐑𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `👥 ${h.toBoldItalic(`${inactiveList.length} inactive found`)}\n📅 ${h.toBoldItalic('(No commands used in this group)')}\n\n`;
      top.forEach((p,i) => { const num = p.id.split('@')[0]; txt += `${i+1}. @${num}\n`; });
      if (inactiveList.length > 20) txt += `\n... +${inactiveList.length - 20} more`;
      txt += `\n\n💀 ${h.toBoldItalic('Use .kick @user to remove them')} ${h.demonEmoji()}`;
      await sock.sendMessage(chatId, { text: txt, mentions: top.map(p => p.id) }, { quoted: msg });
    } catch (err) { return reply(`✘ ${h.toBoldItalic('Failed to get inactive list')} ${h.demonEmoji()}`); }
  }
};
