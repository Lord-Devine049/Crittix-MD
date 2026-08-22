/*
 * SETPREFIX.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'setprefix',
  category: 'voidsystem',
  description: 'Change bot prefix',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const np = args[0];
    if (!np) return reply(p.phrases.wrongUsage('type the new prefix after the command. example! .setprefix !'));
    const { set } = require('../../lib/config');
    set({ PREFIX: np });
    reply(p.phrases.success('prefix changed to ' + np + '.'));
  }
};
