/*
 * TAGALL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'tagall',
  aliases: ['everyone', 'all'],
  category: 'forbiddenarts',
  description: 'Tag all members with style',
  groupOnly: true,
  execute: async ({ sock, msg, args, chatId, isOwner, isSudo, prefix, reply }) => {
    const meta     = await sock.groupMetadata(chatId);
    const members  = meta.participants.map(p => p.id);
    const userMsg  = args.join(' ') || 'Attention!';
    const count    = members.length;

    let text = `╔════════════════════════么\n`;
    text    += `║ 📢 *${userMsg}*\n`;
    text    += `║ 👥 *Members:* ${count}\n`;
    text    += `╚════════════════════════么\n\n`;
    text    += members.map(m => `闇 @${m.split('@')[0]}`).join('\n');

    await sock.sendMessage(chatId, { text, mentions: members }, { quoted: msg });
  }
};
