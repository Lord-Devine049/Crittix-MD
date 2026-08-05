const h = require('../../lib/helpers');

module.exports = {
  command: 'demoteall',
  category: 'forbiddenarts',
  description: 'Demote all admins',
  ownerOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('I\'m not admin. Who set this up?'));
    const meta = await sock.groupMetadata(chatId);
    const { botJid, botLid } = h.getBotJids(sock);
    const admins = meta.participants.filter(p => p.admin && !h.isBotParticipant(p, botJid, botLid));
    for (const a of admins) {
      try { await sock.groupParticipantsUpdate(chatId, [a.id], 'demote'); } catch(_) {}
      await new Promise(r => setTimeout(r, 800));
    }
    reply('✓ All admins demoted');
  }
};
