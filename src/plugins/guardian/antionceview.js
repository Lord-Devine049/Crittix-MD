/*
 * ANTIONCEVIEW.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'antionceview',
  category: 'voidsystem',
  description: 'Toggle antionceview',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const action = args[0]?.toLowerCase();
    const { set, getConfig } = require('../../lib/config');
    if (action === 'on') { set({ ANTIONCEVIEW: true }); return reply(p.phrases.success('antionceview enabled.')); }
    if (action === 'off') { set({ ANTIONCEVIEW: false }); return reply(p.phrases.success('antionceview disabled.')); }
    reply('ℹ️ antionceview: ' + (getConfig().ANTIONCEVIEW ? 'ON' : 'OFF') + '\n\nUsage: .antionceview on/off');
  }
};
