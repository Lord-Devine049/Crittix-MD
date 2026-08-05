/*
 * BLOCKUSER.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['block', 'unblock'],
  aliases: [],
  category: 'abysscommands',
  description: 'Block or unblock a user',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = (command || 'block').toLowerCase();

    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const mentioned = ctx?.mentionedJid?.[0];
    const quotedParticipant = ctx?.participant;
    const fromText = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;

    const target = mentioned || quotedParticipant || fromText;

    if (!target || target === '@s.whatsapp.net')
      return reply(h.demonError(`.${cmd}`, `.${cmd} @user OR reply to user`));

    try {
      await sock.updateBlockStatus(target, cmd === 'block' ? 'block' : 'unblock');
      const action = cmd === 'block' ? '🚫 Blocked' : '✅ Unblocked';
      reply(`${action}: @${target.split('@')[0]}`);
    } catch {
      reply(h.demonFail(`Failed to ${cmd} user. Check number format.`));
    }
  }
};
