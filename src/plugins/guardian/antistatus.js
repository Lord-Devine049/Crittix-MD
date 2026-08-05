/* ANTISTATUS.JS - Crittix-MD / Created by: LORD DEVINE */
const db = require('../../lib/db');
const h  = require('../../lib/helpers');

module.exports = {
  command: ['antistatus', 'antistatusmention'],
  category: 'darkprotection',
  description: 'Delete messages that mention status updates',
  groupOnly: true,
  execute: async ({ sock, msg, args, sender, chatId, groupMetadata, isGroupMsg, prefix, reply }) => {
    if (!isGroupMsg) return reply(`✘ ${h.toBoldItalic('Group only')}!`);
    const groupId      = groupMetadata?.id || chatId;
    const senderIsAdmin = await h.isSenderAdmin(sock, groupId, sender).catch(() => false);
    if (!senderIsAdmin) return reply(`✘ ${h.toBoldItalic('Admins only')}!`);
    const botIsAdmin = await h.isBotAdmin(sock, groupId).catch(() => false);
    if (!botIsAdmin) return reply(h.demonFail('Make my Lord Admin'));

    const action = (args[0] || '').toLowerCase();

    if (action === 'on') {
      db.setAnti(groupId, 'antistatusmention', 'delete');
      return reply(
        `${h.demonEmoji()} *Anti-Status Mention ON*\n\n` +
        `Messages tagging someone from a status will be deleted.`
      );
    }

    if (action === 'off') {
      db.setAnti(groupId, 'antistatusmention', false);
      return reply(`✓ *Anti-Status Mention OFF*`);
    }

    const current = db.getAnti(groupId, 'antistatusmention');
    return reply(
      `${h.demonEmoji()} *ANTI-STATUS MENTION*\n\n` +
      `Deletes messages that tag someone from a status update.\n\n` +
      `Current: ${current ? '🟢 ON' : '🔴 OFF'}\n\n` +
      `Usage:\n` +
      `• ${prefix}antistatusmention on\n` +
      `• ${prefix}antistatusmention off`
    );
  }
};
