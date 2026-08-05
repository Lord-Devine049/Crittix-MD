const db = require('../../lib/db');
module.exports = {
  command: 'resetwarn',
  category: 'abysscommands',
  description: 'Reset warnings for a user',
  groupOnly: true,
  execute: async ({ sock, msg, chatId, sender, isOwner, isSudo, reply }) => {
    const h = require('../../lib/helpers');
    if (!await h.isSenderAdmin(sock, chatId, sender)) return reply("admins only");
    if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    if (!target.length) return reply('reply or tag user to reset their warnings');
    const userWarns = db.getWarnings(chatId)[target[0]];
    if (!userWarns || !Object.keys(userWarns).length) return reply('@' + target[0].split('@')[0] + ' has no warnings');
    for (const feature of Object.keys(userWarns)) db.clearWarnings(chatId, target[0], feature);
    await sock.sendMessage(chatId, { text: '@' + target[0].split('@')[0] + ' warnings cleared, clean slate', mentions: target }, { quoted: msg });
  }
};