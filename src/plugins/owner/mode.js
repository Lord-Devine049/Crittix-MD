/*
 * MODE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'mode',
  category: 'voidsystem',
  description: 'Set bot mode public/self',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const m = args[0]?.toLowerCase();
    if (!['public','self'].includes(m)) return reply(p.phrases.wrongUsage('use .mode public or .mode self. nothing else.'));
    const { set } = require('../../lib/config');
    set({ MODE: m });
    reply(p.phrases.success('mode set to ' + m + '.'));
  }
};
