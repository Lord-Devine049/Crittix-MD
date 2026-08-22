/*
 * ANTITAGALL.JS
 * Created by: 𝐋𝐎𝐑𝐃♰𝔻𝐄𝐕𝐈𝐍𝐄
 */
const db                = require('../../lib/db');
const { checkBotAdmin } = require('../../lib/anti-handlers');
const p = require('../../lib/phrases');


module.exports = {
  command:     'antitagall',
  category: 'darkprotection',
  description: 'Toggle antitagall — on / off / set kick / set delete',
  sudoOnly:    true,
  groupOnly:   true,

  execute: async ({ sock, args, chatId, reply }) => {
    const action = args[0]?.toLowerCase();
    const sub    = args[1]?.toLowerCase();

    const infoText = () => {
      const cur = db.getAnti(chatId, 'antitagall') || 'off';
      return `ℹ️ antitagall: *${cur}*\n\n.antitagall on — warn 3x then kick\n.antitagall set kick — delete + instant kick\n.antitagall set delete — delete + mention only\n.antitagall off — disable`;
    };

    if (!action) return reply(infoText());

    if (action === 'off') {
      db.setAnti(chatId, 'antitagall', false);
      return reply(p.phrases.success('antitagall disabled.'));
    }

    // Block any enabling action if bot isn't admin
    const botIsAdmin = await checkBotAdmin(sock, chatId);
    if (!botIsAdmin) return reply(`make me admin first fool`);

    let mode;
    if (action === 'on')                           mode = 'warn';
    else if (action === 'set' && sub === 'kick')   mode = 'kick';
    else if (action === 'set' && sub === 'delete') mode = 'delete';
    else return reply(infoText());

    db.setAnti(chatId, 'antitagall', mode);

    const labels = { warn: 'warn 3x then kick', kick: 'instant kick', delete: 'delete only' };
    reply(p.phrases.success(`antitagall set to ${labels[mode]}.`));
  }
};
