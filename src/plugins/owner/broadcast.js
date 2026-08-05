/*
 * BROADCAST.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'broadcast',
  category: 'forbiddenarts',
  description: 'Broadcast message to all groups',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const txt = args.join(' ');
    if (!txt) return reply(h.demonError('.broadcast', '.broadcast <message>'));
    try {
      const groups = await sock.groupFetchAllParticipating();
      const ids = Object.keys(groups);
      let sent = 0;
      for (const gid of ids) {
        try { await sock.sendMessage(gid, { text: '📢 ' + txt }); sent++; } catch(_) {}
        await new Promise(r => setTimeout(r, 1000));
      }
      reply('✓ Broadcast sent to ' + sent + '/' + ids.length + ' groups');
    } catch(e) { reply(h.demonFail(e.message)); }
  }
};
