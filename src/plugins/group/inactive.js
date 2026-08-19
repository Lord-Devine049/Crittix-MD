/*
 * INACTIVE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h       = require('../../lib/helpers');
const actTrack = require('../../lib/activity-tracker');
const p = require('../../lib/phrases');


module.exports = [

  {
    command: 'inactive',
    category: 'groupanalytics',
    description: 'List members inactive for 7+ days',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, isOwner, isSudo, reply }) => {
      const sender_ = msg.key.participant || msg.key.remoteJid;
      if (!await h.isSenderAdmin(sock, chatId, sender_))
        return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId))
        return reply(p.phrases.adminOnly());

      await reply('🔍 scanning inactive members...');

      const meta     = await sock.groupMetadata(chatId);
      const inactive = actTrack.getInactive(chatId, meta.participants, 7);

      if (!inactive.length)
        return reply(`✅ No inactive members found\n\nEveryone has been active in the last 7 days`);

      const mentions = inactive.map(p => p.jid);
      let txt = `╔════════════════════════么\n`;
      txt    += `║ 💤 *INACTIVE MEMBERS*\n`;
      txt    += `║ Haven't sent a message in 7+ days\n`;
      txt    += `╚════════════════════════么\n\n`;

      inactive.forEach((p, i) => {
        txt += `${i+1}. @${p.jid.split('@')[0]}\n`;
      });

      txt += `\n*Total:* ${inactive.length} inactive member${inactive.length > 1 ? 's' : ''}\n`;
      txt += `Use *.kickinactive* to remove them\n`;
      txt += `么════════════════════════么`;

      await sock.sendMessage(chatId, { text: txt, mentions }, { quoted: msg });
    }
  },

  {
    command: 'kickinactive',
    category: 'groupanalytics',
    description: 'Kick all members inactive for 7+ days',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, isOwner, isSudo, reply }) => {
      const sender_ = msg.key.participant || msg.key.remoteJid;
      if (!await h.isSenderAdmin(sock, chatId, sender_))
        return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId))
        return reply(p.phrases.adminOnly());

      await reply('🔍 finding inactive members...');

      const meta     = await sock.groupMetadata(chatId);
      const inactive = actTrack.getInactive(chatId, meta.participants, 7);

      if (!inactive.length)
        return reply(`✅ No inactive members to kick`);

      await reply(`⏳ kicking ${inactive.length} inactive member${inactive.length > 1 ? 's' : ''}...`);

      let kicked = 0, failed = 0;
      for (const p of inactive) {
        try {
          await sock.groupParticipantsUpdate(chatId, [p.jid], 'remove');
          kicked++;
          await new Promise(r => setTimeout(r, 800)); // delay to avoid spam
        } catch(_) { failed++; }
      }

      await sock.sendMessage(chatId, {
        text:
          `╔════════════════════════么\n` +
          `║ 🦶 *KICKINACTIVE DONE*\n` +
          `╚════════════════════════么\n\n` +
          `✅ Kicked: *${kicked}*\n` +
          `❌ Failed: *${failed}*\n\n` +
          `么════════════════════════么`
      }, { quoted: msg });
    }
  }

];
