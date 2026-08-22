/*
 * HIDETAG.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'hidetag',
  aliases: ['ht', 'silent'],
  category: 'forbiddenarts',
  description: 'Tag all members invisibly with a message',
  groupOnly: true,
  execute: async ({ sock, msg, args, chatId, isOwner, isSudo, prefix, reply }) => {
    const userMsg = args.join(' ');
    if (!userMsg) return reply(p.phrases.wrongUsage('provide a message to silently tag everyone with. example! .hidetag good morning everyone.'));

    const meta    = await sock.groupMetadata(chatId);
    const members = meta.participants.map(m => m.id);

    // Send the clean tagged message
    await sock.sendMessage(chatId, { text: userMsg, mentions: members });

    // Delete the original .hidetag command message so only the clean message remains
    try {
      await sock.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          id: msg.key.id,
          participant: msg.key.participant,
          fromMe: false
        }
      });
    } catch (_) {}
  }
};
