/*
 * POLL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'poll',
  category: 'abysscommands',
  description: 'Create a group poll',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_)) return reply(h.demonFail('Admins only'));
    if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
    const parts = args.join(' ').split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 3) return reply(h.demonError('.poll', '.poll Question | Option1 | Option2'));
    const [question, ...options] = parts;
    await sock.sendMessage(chatId, { poll: { name: question, values: options, selectableCount: 1 } }, { quoted: msg });
  }
};
