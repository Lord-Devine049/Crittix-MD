/*
 * AFK.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'afk',
  category: 'soultools',
  description: 'Set AFK status',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const reason = args.join(' ') || 'No reason';
    global.afkStore = global.afkStore || {};
    global.afkStore[sender] = { reason, since: Date.now() };
    reply('😴 AFK set\n📝 Reason: ' + reason + '\n\nYou will be un-AFK when you send a message');
  }
};
