/*
 * AUTOREAD.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'autoread',
  category: 'voidsystem',
  description: 'Toggle autoread',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ AUTO_READ: true }); return reply(p.phrases.success('autoread enabled.')); }
    if (action === 'off') { set({ AUTO_READ: false }); return reply(p.phrases.success('autoread disabled.')); }
    reply('ℹ️ autoread: ' + (getConfig().AUTO_READ ? 'ON' : 'OFF') + '\n\nUsage: .autoread on/off');
  }
};
