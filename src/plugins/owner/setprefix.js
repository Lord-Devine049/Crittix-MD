/*
 * SETPREFIX.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'setprefix',
  category: 'voidsystem',
  description: 'Change bot prefix',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const np = args[0];
    if (!np) return reply(h.demonError('.setprefix', '.setprefix <new prefix>'));
    const { set } = require('../../lib/config');
    set({ PREFIX: np });
    reply('✓ Prefix changed to *' + np + '*');
  }
};
