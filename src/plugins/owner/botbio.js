/*
 * BOTBIO.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'botbio',
  category: 'voidsystem',
  description: 'Change bot bio/status',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const bio = args.join(' ');
    if (!bio) return reply(h.demonError('.botbio', '.botbio <new bio>'));
    try {
      await sock.updateProfileStatus(bio);
      const { set } = require('../../lib/config');
      set({ BOT_BIO: bio });
      reply('✓ Bio updated: ' + bio);
    } catch(e) { reply(h.demonFail(e.message)); }
  }
};
