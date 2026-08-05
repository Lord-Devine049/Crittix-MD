/*
 * LISTADMINS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'listadmins',
  aliases: ['admins', 'adminlist'],
  category: 'groupanalytics',
  description: 'List all group admins',
  groupOnly: true,
  execute: async ({ sock, msg, chatId, reply }) => {
    const meta   = await sock.groupMetadata(chatId);
    const admins = meta.participants.filter(p => p.admin);
    if (!admins.length) return reply(h.demonFail('No admins found'));

    let text = `╔════════════════════════么\n`;
    text    += `║ 👑 *GROUP ADMINS*\n`;
    text    += `║ 🛡️ *Total:* ${admins.length}\n`;
    text    += `╠════════════════════════\n`;
    admins.forEach((a, i) => {
      const role = a.admin === 'superadmin' ? '⭐ Owner' : '🛡️ Admin';
      text += `║ ${role}\n`;
      text += `║ 闇 @${a.id.split('@')[0]}\n`;
      if (i < admins.length - 1) text += `╠────────────────────────\n`;
    });
    text    += `╚════════════════════════么`;

    await sock.sendMessage(chatId, { text, mentions: admins.map(a => a.id) });
  }
};
