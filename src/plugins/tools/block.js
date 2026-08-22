/*
 * BLOCK.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'block',
  category: 'soultools',
  description: 'Block a user',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    if (!target.length) return reply(p.phrases.wrongUsage('reply to someone\'s message or tag @user to block them.'));
    await sock.updateBlockStatus(target[0], 'block');
    reply(p.phrases.success('blocked @' + target[0].split('@')[0] + '.'), { mentions: target });
  }
};
