/*
 * BOTBIO.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'botbio',
  category: 'voidsystem',
  description: 'Change bot bio/status',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const bio = args.join(' ');
    if (!bio) return reply(p.phrases.wrongUsage('type the new bot bio after the command. example! .botbio crittix md. the darkest bot alive.'));
    try {
      await sock.updateProfileStatus(bio);
      const { set } = require('../../lib/config');
      set({ BOT_BIO: bio });
      reply(p.phrases.success('bot bio updated.'));
    } catch(e) { reply(p.phrases.error(e.message)); }
  }
};
