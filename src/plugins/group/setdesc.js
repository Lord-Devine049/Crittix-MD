/*
 * SETDESC.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'setdesc',
  category: 'abysscommands',
  description: 'Set group description',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_)) return reply(p.phrases.adminOnly());
    if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
    const desc = args.join(' ');
    if (!desc) return reply(p.phrases.wrongUsage('type the new description after the command. example! .setdesc no spamming here.'));
    try { await sock.groupUpdateDescription(chatId, desc); reply(p.phrases.success('group description updated.')); }
    catch(e) { reply(p.phrases.error(e.message)); }
  }
};
