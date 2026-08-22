/*
 * AUTORECORDING.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'autorecording',
  category: 'voidsystem',
  description: 'Toggle autorecording',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ AUTO_RECORDING: true }); return reply(p.phrases.success('autorecording enabled.')); }
    if (action === 'off') { set({ AUTO_RECORDING: false }); return reply(p.phrases.success('autorecording disabled.')); }
    reply('ℹ️ autorecording: ' + (getConfig().AUTO_RECORDING ? 'ON' : 'OFF') + '\n\nUsage: .autorecording on/off');
  }
};
