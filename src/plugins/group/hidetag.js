/*
 * HIDETAG.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'hidetag',
  aliases: ['ht', 'silent'],
  category: 'forbiddenarts',
  description: 'Tag all members invisibly with a message',
  groupOnly: true,
  execute: async ({ sock, msg, args, chatId, isOwner, isSudo, prefix, reply }) => {
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_))
      return reply(h.demonFail('Admins only'));
      if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));

    const userMsg = args.join(' ');
    if (!userMsg) return reply(h.demonError(
      `${prefix}hidetag`,
      `${prefix}hidetag good morning y'all`,
      'Provide a message to send with the invisible tag'
    ));

    const meta    = await sock.groupMetadata(chatId);
    const members = meta.participants.map(p => p.id);

    // Send message with invisible mentions — no @names visible
    await sock.sendMessage(chatId, { text: userMsg, mentions: members });
  }
};
