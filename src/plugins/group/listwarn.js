'use strict';
const db = require('../../lib/db');
module.exports = {
  command: 'listwarn',
  category: 'groupanalytics',
  description: 'List all warnings in group',
  groupOnly: true,
  execute: async ({ sock, msg, chatId, sender, isOwner, isSudo, reply }) => {
    const h = require('../../lib/helpers');
    if (!await h.isSenderAdmin(sock, chatId, sender)) return reply("admins only");
    if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
    const allWarns = db.getWarnings(chatId);
    const entries  = Object.entries(allWarns);
    if (!entries.length) return reply('no warnings in this group');
    const lines    = [];
    const mentions = [];
    for (const [jid, features] of entries) {
      const featureLines = Object.entries(features).filter(([, c]) => c > 0).map(([f, c]) => '  ' + f + ': ' + c);
      if (featureLines.length) { lines.push('@' + jid.split('@')[0]); lines.push(...featureLines); mentions.push(jid); }
    }
    if (!lines.length) return reply('no active warnings');
    await sock.sendMessage(chatId, { text: '🖤 warnings\n\n' + lines.join('\n'), mentions }, { quoted: msg });
  }
};