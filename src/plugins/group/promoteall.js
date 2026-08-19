/*
 * PROMOTEALL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'promoteall',
  category: 'forbiddenarts',
  description: 'Promote all to admin',
  ownerOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
    const meta = await sock.groupMetadata(chatId);
    const nonAdmins = meta.participants.filter(p => !p.admin);
    for (const p of nonAdmins) {
      try { await sock.groupParticipantsUpdate(chatId, [p.id], 'promote'); } catch(_) {}
      await new Promise(r => setTimeout(r, 800));
    }
    reply('✓ All members promoted');
  }
};
