'use strict';
const db = require('../../lib/db');
const h  = require('../../lib/helpers');
module.exports = {
  command: 'warn',
  category: 'abysscommands',
  description: 'Warn a member',
  groupOnly: true,
  execute: async ({ sock, msg, args, sender, chatId, isOwner, isSudo, reply }) => {
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    if (!target.length) return reply('reply or tag user to warn them');
    if (!await h.isSenderAdmin(sock, chatId, sender)) return reply("you ain't even an admin, why are you trying to use this");
    if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
    const reason    = args.slice(1).join(' ') || 'no reason given';
    const threshold = db.getWarnThreshold(chatId);
    const count     = db.addWarning(chatId, target[0], 'warn');
    if (count >= threshold) {
      await sock.sendMessage(chatId, {
        text: '@' + target[0].split('@')[0] + ' final warning — removed. reason: ' + reason,
        mentions: target
      }, { quoted: msg });
      try { await sock.groupParticipantsUpdate(chatId, target, 'remove'); } catch (_) {}
      db.clearWarnings(chatId, target[0], 'warn');
    } else {
      await sock.sendMessage(chatId, {
        text: '@' + target[0].split('@')[0] + ' warning ' + count + '/' + threshold + ' — reason: ' + reason,
        mentions: target
      }, { quoted: msg });
    }
  }
};