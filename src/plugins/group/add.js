/*
 * ADD.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'add',
  category: 'abysscommands',
  description: 'Add member to group',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const num = args[0]?.replace(/\D/g,'');
    if (!num || num.length < 10) return reply(p.phrases.wrongUsage('provide a valid phone number. example! .add 2348xxxxxxx'));
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_)) return reply(p.phrases.adminOnly());
    if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
    try {
      await sock.groupParticipantsUpdate(chatId, [num + '@s.whatsapp.net'], 'add');
      reply(p.phrases.success('added +' + num + ' to the group.'));
    } catch(e) { reply(p.phrases.error(e.message)); }
  }
};
