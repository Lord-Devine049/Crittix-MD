const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'demoteall',
  category: 'forbiddenarts',
  description: 'Demote all admins',
  ownerOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.botNeedsAdmin());
    const meta = await sock.groupMetadata(chatId);
    const { botJid, botLid } = h.getBotJids(sock);
    const admins = meta.participants.filter(p => p.admin && !h.isBotParticipant(p, botJid, botLid));
    for (const a of admins) {
      try { await sock.groupParticipantsUpdate(chatId, [a.id], 'demote'); } catch(_) {}
      await new Promise(r => setTimeout(r, 800));
    }
    reply(p.phrases.success('all admins demoted.'));
  }
};
