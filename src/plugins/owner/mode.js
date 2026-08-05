/*
 * MODE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'mode',
  category: 'voidsystem',
  description: 'Set bot mode public/self',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const m = args[0]?.toLowerCase();
    if (!['public','self'].includes(m)) return reply(h.demonError('.mode', '.mode public OR .mode self'));
    const { set } = require('../../lib/config');
    set({ MODE: m });
    reply('✓ Mode set to *' + m + '*');
  }
};
