/*
 * JID.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['jid', 'getjid', 'myjid'],
  aliases: ['id'],
  category: 'soultools',
  description: 'Get chat or user JID',
  execute: async ({ sock, msg, args, text, sender, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, prefix, reply }) => {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const mentionedJid = ctx?.mentionedJid?.[0];
    const quotedParticipant = ctx?.participant;

    if (mentionedJid || quotedParticipant) {
      const target = mentionedJid || quotedParticipant;
      return reply(
        `🆔 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗝𝗜𝗗*\n\n` +
        `User: \`${target}\`\n` +
        `Chat: \`${chatId}\``
      );
    }

    reply(
      `🆔 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗝𝗜𝗗*\n\n` +
      `You: \`${sender}\`\n` +
      `Chat: \`${chatId}\``
    );
  }
};
