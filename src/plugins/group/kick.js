/*
 * KICK.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'kick',
  category: 'abysscommands',
  description: 'Remove member from group',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    if (!target.length) return reply(p.phrases.wrongUsage('reply to someone\'s message or tag @user to kick them.'));
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_)) return reply(p.phrases.adminOnly());
    if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
    try {
      await sock.groupParticipantsUpdate(chatId, target, 'remove');
      reply(p.phrases.success('kicked @' + target[0].split('@')[0] + '.'), { mentions: target });
    } catch(e) { reply(p.phrases.error(e.message)); }
  }
};
