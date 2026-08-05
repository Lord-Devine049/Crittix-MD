/*
 * ADD.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'add',
  category: 'abysscommands',
  description: 'Add member to group',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const num = args[0]?.replace(/\D/g,'');
    if (!num || num.length < 10) return reply(h.demonError('.add', '.add 2348xxxxxxx'));
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_)) return reply(h.demonFail('Admins only'));
    if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
    try {
      await sock.groupParticipantsUpdate(chatId, [num + '@s.whatsapp.net'], 'add');
      reply('✓ Added +' + num);
    } catch(e) { reply(h.demonFail(e.message)); }
  }
};
