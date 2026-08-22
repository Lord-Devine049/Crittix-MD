/*
 * DEMOTE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'demote',
  category: 'abysscommands',
  description: 'Demote admin',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    // Always have fresh participants for LID resolution
    let meta = groupMetadata;
    if (!meta?.participants) {
      try { meta = await sock.groupMetadata(chatId); } catch (_) {}
    }
    const participants = meta?.participants || [];
    // Pass participants so LID mentions/quotes are resolved to phone JIDs
    const rawTargets = h.getTarget(msg, participants);
    if (!rawTargets.length) return reply(p.phrases.wrongUsage('reply to someone\'s message or tag @user to demote them.'));
    // Use the resolved sender from divine.js (already LID-resolved)
    if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
    if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
    // Resolve any remaining @lid targets to phone JIDs using participant list
    const target = rawTargets.map(jid => {
      if (!jid.endsWith('@lid')) return jid;
      const clean = jid.replace(/:\d+@/, '@');
      const p = participants.find(x => (x.id || '').replace(/:\d+@/, '@') === clean || (x.lid || '').replace(/:\d+@/, '@') === clean);
      if (p?.phoneNumber) return p.phoneNumber.replace(/:\d+@/, '@');
      if (p?.id && !p.id.endsWith('@lid')) return p.id.replace(/:\d+@/, '@');
      return jid;
    });
    try {
      await sock.groupParticipantsUpdate(chatId, target, 'demote');
      reply(p.phrases.success('demoted @' + target[0].split('@')[0] + '.'), { mentions: target });
    } catch(e) { reply(p.phrases.error(e.message)); }
  }
};
