/*
 * BOTNAME.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'botname',
  category: 'voidsystem',
  description: 'Change bot name',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const name = args.join(' ').trim();
    if (!name) return reply(p.phrases.wrongUsage('type the new bot name after the command. example! .botname crittix nephilim'));
    const { set } = require('../../lib/config');
    set({ BOT_NAME: name });
    reply(p.phrases.success('bot name set to ' + name + '.'));
  }
};
