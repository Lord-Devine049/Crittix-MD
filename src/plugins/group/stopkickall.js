/*
 * STOPKICKALL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'stopkickall',
  category: 'forbiddenarts',
  description: 'Stop kickall operation',
  ownerOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    global.kickAllCancel[chatId] = true;
    reply('✓ KickAll cancelled');
  }
};
