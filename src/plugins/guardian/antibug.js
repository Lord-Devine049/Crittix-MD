/*
 * ANTIBUG.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'antibug',
  category: 'darkprotection',
  description: 'Toggle antibug',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ ANTIBUG: true }); return reply('✓ antibug enabled'); }
    if (action === 'off') { set({ ANTIBUG: false }); return reply('✓ antibug disabled'); }
    reply('ℹ️ antibug: ' + (getConfig().ANTIBUG ? 'ON' : 'OFF') + '\n\nUsage: .antibug on/off');
  }
};
