/*
 * ANTIDELETE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'antidelete',
  category: 'darkprotection',
  description: 'Toggle antidelete',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ ANTI_DELETE: true }); return reply('✓ antidelete enabled'); }
    if (action === 'off') { set({ ANTI_DELETE: false }); return reply('✓ antidelete disabled'); }
    reply('ℹ️ antidelete: ' + (getConfig().ANTI_DELETE ? 'ON' : 'OFF') + '\n\nUsage: .antidelete on/off');
  }
};
