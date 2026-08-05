/*
 * SNIPE.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Shows last deleted message in group on demand
 */
const snipeStore = require('../../lib/snipe-store');

module.exports = {
  command: 'snipe',
  category: 'abysscommands',
  description: 'Show last deleted message in this group',
  groupOnly: true,
  execute: async ({ sock, msg, chatId, reply }) => {
    const snipe = snipeStore.getSnipe(chatId);
    if (!snipe)
      return reply(`😑 nothing to snipe\n\nno deleted messages in the last 10 minutes`);

    const senderNum  = snipe.sender?.split('@')[0] || '?';
    const deleterNum = snipe.deleter?.split('@')[0] || senderNum;
    const mentions   = [snipe.sender, snipe.deleter].filter(Boolean);
    const timeAgo    = Math.floor((Date.now() - snipe.deletedAt) / 1000);
    const timeStr    = timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo/60)}m ago`;

    let txt = `╔════════════════════════么\n`;
    txt    += `║ 🎯 *SNIPED*\n`;
    txt    += `╚════════════════════════么\n\n`;
    txt    += `👤 *Sent by:* @${senderNum}\n`;
    txt    += `🗑 *Deleted by:* @${deleterNum}\n`;
    txt    += `🕐 *When:* ${timeStr}\n`;
    txt    += `📎 *Type:* ${snipe.msgType}\n\n`;

    if (snipe.text) {
      txt += `💬 *Message:*\n${snipe.text}\n\n`;
    } else {
      txt += `💬 *Message:* _(media — content not recoverable)_\n\n`;
    }
    txt += `么════════════════════════么`;

    await sock.sendMessage(chatId, { text: txt, mentions }, { quoted: msg });
  }
};
