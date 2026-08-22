/*
 * DELSUDO.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'delsudo',
  category: 'voidsystem',
  description: 'Remove a sudo user',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    const num = target[0]?.split('@')[0] || args[0]?.replace(/\D/g,'');
    if (!num) return reply(p.phrases.wrongUsage('tag someone or provide their number to remove sudo. example! .delsudo @user'));
    const { removeSudo } = require('../../lib/config');
    removeSudo(num);
    reply(p.phrases.success('sudo removed: +' + num + '.'));
  }
};
