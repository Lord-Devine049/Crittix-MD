/*
 * ANTISWEAR.JS — RAID CRASHER
 * Created by: 𝐋𝐎𝐑𝐃♰𝔻𝐄𝐕𝐈𝐍𝐄
 */
const db                = require('../../lib/db');
const { checkBotAdmin } = require('../../lib/anti-handlers');

module.exports = {
  command:     'antiswear',
  category: 'darkprotection',
  description: 'Toggle antiswear — on / off / set kick / set delete',
  sudoOnly:    true,
  groupOnly:   true,

  execute: async ({ sock, args, chatId, reply }) => {
    const action = args[0]?.toLowerCase();
    const sub    = args[1]?.toLowerCase();

    const infoText = () => {
      const cur = db.getAnti(chatId, 'antiswear') || 'off';
      return `ℹ️ antiswear: *${cur}*\n\n.antiswear on — warn 3x then kick\n.antiswear set kick — delete + instant kick\n.antiswear set delete — delete + mention only\n.antiswear off — disable`;
    };

    if (!action) return reply(infoText());

    if (action === 'off') {
      db.setAnti(chatId, 'antiswear', false);
      return reply(`✓ antiswear off`);
    }

    // Block any enabling action if bot isn't admin
    const botIsAdmin = await checkBotAdmin(sock, chatId);
    if (!botIsAdmin) return reply(`make me admin first fool`);

    let mode;
    if (action === 'on')                           mode = 'warn';
    else if (action === 'set' && sub === 'kick')   mode = 'kick';
    else if (action === 'set' && sub === 'delete') mode = 'delete';
    else return reply(infoText());

    db.setAnti(chatId, 'antiswear', mode);

    const labels = { warn: 'warn 3x then kick', kick: 'instant kick', delete: 'delete only' };
    reply(`✓ antiswear — ${labels[mode]}`);
  }
};
