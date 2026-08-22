/*
 * ALWAYSONLINE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'alwaysonline',
  category: 'darkprotection',
  description: 'Toggle alwaysonline',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ ALWAYS_ONLINE: true }); return reply(p.phrases.success('alwaysonline enabled.')); }
    if (action === 'off') { set({ ALWAYS_ONLINE: false }); return reply(p.phrases.success('alwaysonline disabled.')); }
    reply('ℹ️ alwaysonline: ' + (getConfig().ALWAYS_ONLINE ? 'ON' : 'OFF') + '\n\nUsage: .alwaysonline on/off');
  }
};
