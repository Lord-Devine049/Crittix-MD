/*
 * GROUPLINK.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'grouplink',
  category: 'abysscommands',
  description: 'Get group invite link',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    try { const code = await sock.groupInviteCode(chatId); reply('🔗 https://chat.whatsapp.com/' + code); }
    catch(e) { reply(p.phrases.adminOnly()); }
  }
};
