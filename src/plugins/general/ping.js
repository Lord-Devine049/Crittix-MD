/*
 * PING.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'ping',
  category: 'soultools',
  description: 'Check bot response speed',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    const s = Date.now(); await reply('☠︎Pong! ' + (Date.now()-s) + 'ms');
  }
};
