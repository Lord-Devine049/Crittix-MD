/*
 * BROADCAST.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'broadcast',
  category: 'forbiddenarts',
  description: 'Broadcast message to all groups',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const txt = args.join(' ');
    if (!txt) return reply(p.phrases.wrongUsage('type the message to broadcast to all groups. example! .broadcast server maintenance at midnight.'));
    try {
      const groups = await sock.groupFetchAllParticipating();
      const ids = Object.keys(groups);
      let sent = 0;
      for (const gid of ids) {
        try { await sock.sendMessage(gid, { text: '📢 ' + txt }); sent++; } catch(_) {}
        await new Promise(r => setTimeout(r, 1000));
      }
      reply(p.phrases.success('broadcast sent to ' + sent + '/' + ids.length + ' groups.'));
    } catch(e) { reply(p.phrases.error(e.message)); }
  }
};
