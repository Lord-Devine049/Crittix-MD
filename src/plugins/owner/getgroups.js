/*
 * GETGROUPS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'getgroups',
  category: 'voidsystem',
  description: 'List all groups bot is in',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    try {
      const groups = await sock.groupFetchAllParticipating();
      const ids = Object.keys(groups);
      if (!ids.length) return reply('Not in any groups');
      const list = ids.map((id,i) => (i+1) + '. ' + (groups[id].subject||id)).join('\n');
      reply('📋 Groups (' + ids.length + '):\n\n' + list);
    } catch(e) { reply(h.demonFail(e.message)); }
  }
};
