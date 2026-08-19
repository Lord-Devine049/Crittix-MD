/*
 * DELETE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'delete',
  aliases: ['del'],
  category: 'abysscommands',
  description: 'Delete a replied message',
  groupOnly: false,

  execute: async ({ sock, msg, args, chatId, isGroupMsg, isOwner, isSudo, reply }) => {

    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.stanzaId) return reply(h.demonError('.delete', 'Reply to a message to delete, dumbass'));

    // Resolve bot JIDs
    const botJid = sock.authState?.creds?.me?.id?.replace(/:\d+@/, '@');
    const rawLid = sock.authState?.creds?.me?.lid;
    const botLid = rawLid ? rawLid.replace(/:\d+@/, '@') : null;

    const quotedSender = (ctx.participant || '').replace(/:\d+@/, '@');
    const isBotOwnMessage = quotedSender === botJid || (botLid && quotedSender === botLid);

    if (isGroupMsg && !isBotOwnMessage) {
      const botIsAdmin = await h.isBotAdmin(sock, chatId);
      if (!botIsAdmin) return reply(h.demonFail(`Give me admin first. I can't delete anything sitting here powerless.`));

      const sender_ = msg.key.participant || msg.key.remoteJid;
      const senderIsAdmin = await h.isSenderAdmin(sock, chatId, sender_);
      if (!senderIsAdmin && !isOwner && !isSudo) {
        return reply(p.phrases.adminOnly());
      }
    }

    try {
      const rawSend = sock._crittixRawSend || sock.sendMessage.bind(sock);

      await rawSend(chatId, {
        delete: {
          remoteJid: chatId,
          id: ctx.stanzaId,
          participant: ctx.participant,
          fromMe: isBotOwnMessage
        }
      });

      await rawSend(chatId, {
        delete: {
          remoteJid: chatId,
          id: msg.key.id,
          participant: msg.key.participant,
          fromMe: true
        }
      });

    } catch (e) {
      reply(h.demonFail(e.message));
    }
  }
};
