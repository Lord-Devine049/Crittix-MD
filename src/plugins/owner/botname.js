/*
 * BOTNAME.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'botname',
  category: 'voidsystem',
  description: 'Change bot name',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const name = args.join(' ').trim();
    if (!name) return reply(h.demonError('.botname', '.botname <new name>'));
    const { set } = require('../../lib/config');
    set({ BOT_NAME: name });
    reply('✓ Bot name set to *' + name + '*');
  }
};
