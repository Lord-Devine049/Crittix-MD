/*
 * ANTICALL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'anticall',
  category: 'darkprotection',
  description: 'Toggle anticall',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ ANTICALL: true }); return reply('✓ anticall enabled'); }
    if (action === 'off') { set({ ANTICALL: false }); return reply('✓ anticall disabled'); }
    reply('ℹ️ anticall: ' + (getConfig().ANTICALL ? 'ON' : 'OFF') + '\n\nUsage: .anticall on/off');
  }
};
