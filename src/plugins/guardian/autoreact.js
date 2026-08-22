/*
 * AUTOREACT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'autoreact',
  category: 'voidsystem',
  description: 'Toggle autoreact',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ AUTO_REACT: true }); return reply(p.phrases.success('autoreact enabled.')); }
    if (action === 'off') { set({ AUTO_REACT: false }); return reply(p.phrases.success('autoreact disabled.')); }
    reply('ℹ️ autoreact: ' + (getConfig().AUTO_REACT ? 'ON' : 'OFF') + '\n\nUsage: .autoreact on/off');
  }
};
