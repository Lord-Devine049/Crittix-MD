/*
 * JAIL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h    = require('../../lib/helpers');
const jail = require('../../lib/jail');
const p = require('../../lib/phrases');


module.exports = [

  {
    command: 'jail',
    category: 'abysscommands',
    description: 'Jail a member — their messages will be auto-deleted',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, isOwner, isSudo, reply }) => {
      // Sender must be admin
      const sender_ = msg.key.participant || msg.key.remoteJid;
      if (!await h.isSenderAdmin(sock, chatId, sender_))
        return reply(p.phrases.adminOnly());

      // Owner (connected user) must be admin
      if (!await h.isBotAdmin(sock, chatId))
        return reply(p.phrases.adminOnly());

      // Get target from reply or mention
      // Pass group participants so LID JIDs are resolved to real phone JIDs before storing
      let _jailParticipants = [];
      try { _jailParticipants = (await sock.groupMetadata(chatId)).participants; } catch (_) {}
      const target = h.getTarget(msg, _jailParticipants);
      if (!target.length) return reply(p.phrases.wrongUsage('reply to the person\'s message or tag @user to jail them.'));

      const victim = target[0].replace(/:\d+@/, '@');

      // Can't jail the bot itself
      const { botJid, botLid } = h.getBotJids(sock);
      if (h.isBotParticipant({ id: victim }, botJid, botLid)) return reply(p.phrases.cantTargetBot());

      // Can't jail an admin
      const victimIsAdmin = await h.isSenderAdmin(sock, chatId, victim);
      if (victimIsAdmin) return reply(p.phrases.error('you cannot jail an admin.'));

      jail.jailMember(chatId, victim);

      await sock.sendMessage(chatId, {
        text:
          `🔒 *JAILED*\n\n` +
          `@${victim.split('@')[0]} has been locked up.\n` +
          `Every message they send will be deleted.\n\n` +
          `Use *.unjail* + reply to release them.`,
        mentions: [victim]
      }, { quoted: msg });
    }
  },

  {
    command: 'unjail',
    category: 'abysscommands',
    description: 'Release a jailed member',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, isOwner, isSudo, reply }) => {
      // Sender must be admin, and connected user must be admin
      const sender_ = msg.key.participant || msg.key.remoteJid;
      if (!await h.isSenderAdmin(sock, chatId, sender_))
        return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId))
        return reply(p.phrases.adminOnly());

      // Resolve LID → real phone JID before looking up jail list
      let _unjailParticipants = [];
      try { _unjailParticipants = (await sock.groupMetadata(chatId)).participants; } catch (_) {}
      const target = h.getTarget(msg, _unjailParticipants);
      if (!target.length) return reply(p.phrases.wrongUsage('reply to the person\'s message or tag @user to release them from jail.'));

      const victim = target[0].replace(/:\d+@/, '@');

      if (!jail.isJailed(chatId, victim))
        return reply(`@${victim.split('@')[0]} is not jailed`, { mentions: [victim] });

      jail.unjailMember(chatId, victim);

      await sock.sendMessage(chatId, {
        text:
          `🔓 *RELEASED*\n\n` +
          `@${victim.split('@')[0]} has been freed from jail.\n` +
          `They can send messages again.`,
        mentions: [victim]
      }, { quoted: msg });
    }
  },

  {
    command: 'jaillist',
    aliases: ['jailed'],
    category: 'abysscommands',
    description: 'See all jailed members in this group',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, reply }) => {
      const jailed = jail.getJailed(chatId);
      if (!jailed.length) return reply(p.phrases.notFound('no one is currently jailed in this group.'));

      const mentions = jailed;
      let txt = `╔════════════════════════么\n║ 🔒 *JAIL LIST*\n╚════════════════════════么\n\n`;
      jailed.forEach((jid, i) => {
        txt += `${i + 1}. @${jid.split('@')[0]}\n`;
      });
      txt += `\n么════════════════════════么`;

      await sock.sendMessage(chatId, { text: txt, mentions }, { quoted: msg });
    }
  }

];
