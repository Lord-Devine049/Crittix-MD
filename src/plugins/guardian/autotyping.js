/*
 * AUTOTYPING.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'autotyping',
  category: 'voidsystem',
  description: 'Toggle autotyping',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ AUTO_TYPING: true }); return reply(p.phrases.success('autotyping enabled.')); }
    if (action === 'off') { set({ AUTO_TYPING: false }); return reply(p.phrases.success('autotyping disabled.')); }
    reply('ℹ️ autotyping: ' + (getConfig().AUTO_TYPING ? 'ON' : 'OFF') + '\n\nUsage: .autotyping on/off');
  }
};
