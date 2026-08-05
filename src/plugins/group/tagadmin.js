/*
 * TAGADMIN.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'tagadmin',
  aliases: ['tagadmins'],
  category: 'abysscommands',
  description: 'Tag all admins with style',
  groupOnly: true,
  execute: async ({ sock, msg, args, chatId, isOwner, isSudo, reply }) => {
    const meta    = await sock.groupMetadata(chatId);
    const admins  = meta.participants.filter(p => p.admin).map(p => p.id);
    if (!admins.length) return reply(h.demonFail('No admins found'));

    const userMsg = args.join(' ') || 'Attention Admins!';
    const count   = admins.length;

    let text = `╔════════════════════════么\n`;
    text    += `║ 👑 *${userMsg}*\n`;
    text    += `║ 🛡️ *Admins:* ${count}\n`;
    text    += `╚════════════════════════么\n\n`;
    text    += admins.map(a => `闇 @${a.split('@')[0]}`).join('\n');

    await sock.sendMessage(chatId, { text, mentions: admins });
  }
};
