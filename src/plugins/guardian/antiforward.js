/*
 * ANTIFORWARD.JS 
 * Created by: 𝐋𝐎𝐑𝐃♰𝔻𝐄𝐕𝐈𝐍𝐄
 */
const db                = require('../../lib/db');
const { checkBotAdmin } = require('../../lib/anti-handlers');

module.exports = {
  command:     'antiforward',
  aliases:     ['antishare', 'noshare', 'blockforward'],
  category: 'darkprotection',
  description: 'Toggle antiforward/antishare — on / off / set kick / set delete',
  sudoOnly:    true,
  groupOnly:   true,

  execute: async ({ sock, args, chatId, reply }) => {
    const action = args[0]?.toLowerCase();
    const sub    = args[1]?.toLowerCase();

    const infoText = () => {
      const cur = db.getAnti(chatId, 'antiforward') || 'off';
      return `ℹ️ antiforward: *${cur}*\n\n.antiforward on — warn 3x then kick\n.antiforward set kick — delete + instant kick\n.antiforward set delete — delete + mention only\n.antiforward off — disable`;
    };

    if (!action) return reply(infoText());

    if (action === 'off') {
      db.setAnti(chatId, 'antiforward', false);
      return reply(`✓ antiforward off`);
    }

    const botIsAdmin = await checkBotAdmin(sock, chatId);
    if (!botIsAdmin) return reply(`make me admin first fool`);

    let mode;
    if (action === 'on')                           mode = 'warn';
    else if (action === 'set' && sub === 'kick')   mode = 'kick';
    else if (action === 'set' && sub === 'delete') mode = 'delete';
    else return reply(infoText());

    db.setAnti(chatId, 'antiforward', mode);

    const labels = { warn: 'warn 3x then kick', kick: 'instant kick', delete: 'delete only' };
    reply(`✓ antiforward — ${labels[mode]}`);
  }
};
