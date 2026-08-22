/*
 * ANTIDEMOTE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h  = require('../../lib/helpers');
const db = require('../../lib/db');
const p = require('../../lib/phrases');


module.exports = {
  command: 'antidemote',
  category: 'darkprotection',
  description: 'Prevent unauthorized demotions in this group',
  groupOnly: true,
  execute: async ({ sock, msg, args, chatId, isOwner, isSudo, reply }) => {
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_))
      return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());

    const action  = args[0]?.toLowerCase();
    const current = db.getAnti(chatId, 'antidemote');

    if (!action) {
      return reply(
        `╔════════════════════════么\n` +
        `║ 🛡️ *ANTIDEMOTE*\n` +
        `║ Status: ${current ? '✅ ON' : '❌ OFF'}\n` +
        `╚════════════════════════么\n\n` +
        `Usage: .antidemote on/off`
      );
    }

    if (action === 'on') {
      db.setAnti(chatId, 'antidemote', true);
      return reply(
        `╔════════════════════════么\n` +
        `║ 🛡️ *ANTIDEMOTE ENABLED*\n` +
        `║ Any admin who demotes another\n` +
        `║ admin will be called out &\n` +
        `║ the demotion reversed.\n` +
        `║ Only owner is exempt.\n` +
        `╚════════════════════════么`
      );
    }

    if (action === 'off') {
      db.setAnti(chatId, 'antidemote', false);
      return reply(
        `╔════════════════════════么\n` +
        `║ 🛡️ *ANTIDEMOTE DISABLED*\n` +
        `╚════════════════════════么`
      );
    }

    reply(p.phrases.wrongUsage('use .antidemote on to enable it. or .antidemote off to disable it.'));
  }
};
