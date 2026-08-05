/*
 * AUTOVIEWSTATUS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'autoviewstatus',
  category: 'voidsystem',
  description: 'Toggle autoviewstatus',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ AUTO_VIEW_STATUS: true }); return reply('✓ autoviewstatus enabled'); }
    if (action === 'off') { set({ AUTO_VIEW_STATUS: false }); return reply('✓ autoviewstatus disabled'); }
    reply('ℹ️ autoviewstatus: ' + (getConfig().AUTO_VIEW_STATUS ? 'ON' : 'OFF') + '\n\nUsage: .autoviewstatus on/off');
  }
};
