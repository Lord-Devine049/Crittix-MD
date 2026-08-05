/*
 * ALWAYSONLINE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'alwaysonline',
  category: 'darkprotection',
  description: 'Toggle alwaysonline',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ ALWAYS_ONLINE: true }); return reply('✓ alwaysonline enabled'); }
    if (action === 'off') { set({ ALWAYS_ONLINE: false }); return reply('✓ alwaysonline disabled'); }
    reply('ℹ️ alwaysonline: ' + (getConfig().ALWAYS_ONLINE ? 'ON' : 'OFF') + '\n\nUsage: .alwaysonline on/off');
  }
};
