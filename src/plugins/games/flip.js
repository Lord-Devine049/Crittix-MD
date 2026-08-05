/*
 * FLIP.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'flip',
  category: 'shadowgames',
  description: 'Flip a coin',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const result = Math.random() > 0.5 ? 'Heads 🪙' : 'Tails 💿';
    reply('🪙 Coin flip: *' + result + '*');
  }
};
