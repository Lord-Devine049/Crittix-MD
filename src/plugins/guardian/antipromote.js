/*
 * ANTIPROMOTE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h  = require('../../lib/helpers');
const db = require('../../lib/db');
const p = require('../../lib/phrases');


module.exports = {
  command: 'antipromote',
  category: 'darkprotection',
  description: 'Prevent unauthorized promotions in this group',
  groupOnly: true,
  execute: async ({ sock, msg, args, chatId, isOwner, isSudo, reply }) => {
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_))
      return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());

    const action  = args[0]?.toLowerCase();
    const current = db.getAnti(chatId, 'antipromote');

    if (!action) {
      return reply(
        `╔════════════════════════么\n` +
        `║ 🛡️ *ANTIPROMOTE*\n` +
        `║ Status: ${current ? '✅ ON' : '❌ OFF'}\n` +
        `╚════════════════════════么\n\n` +
        `Usage: .antipromote on/off`
      );
    }

    if (action === 'on') {
      db.setAnti(chatId, 'antipromote', true);
      return reply(
        `╔════════════════════════么\n` +
        `║ 🛡️ *ANTIPROMOTE ENABLED*\n` +
        `║ Any admin who promotes someone\n` +
        `║ will be called out & reversed.\n` +
        `║ Only owner is exempt.\n` +
        `╚════════════════════════么`
      );
    }

    if (action === 'off') {
      db.setAnti(chatId, 'antipromote', false);
      return reply(
        `╔════════════════════════么\n` +
        `║ 🛡️ *ANTIPROMOTE DISABLED*\n` +
        `╚════════════════════════么`
      );
    }

    reply(h.demonError('.antipromote', '.antipromote on/off'));
  }
};
