/*
 * ANTIDELETE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'antidelete',
  category: 'darkprotection',
  description: 'Toggle antidelete',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ ANTI_DELETE: true }); return reply(p.phrases.success('antidelete enabled.')); }
    if (action === 'off') { set({ ANTI_DELETE: false }); return reply(p.phrases.success('antidelete disabled.')); }
    reply('ℹ️ antidelete: ' + (getConfig().ANTI_DELETE ? 'ON' : 'OFF') + '\n\nUsage: .antidelete on/off');
  }
};
