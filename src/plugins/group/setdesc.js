/*
 * SETDESC.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'setdesc',
  category: 'abysscommands',
  description: 'Set group description',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_)) return reply(h.demonFail('Admins only'));
    if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
    const desc = args.join(' ');
    if (!desc) return reply(h.demonError('.setdesc', '.setdesc <description>'));
    try { await sock.groupUpdateDescription(chatId, desc); reply('✓ Group description updated'); }
    catch(e) { reply(h.demonFail(e.message)); }
  }
};
