/* ANTIAZA.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: 'antiaza',
  category: 'voidsystem',
  description: 'Block any messages that contain your account number from being forwarded',
  ownerOnly: true,
  execute: async ({ args, isOwner, prefix, reply }) => {
    if (!isOwner) return reply(`✘ ${h.toBoldItalic('Owner only you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    const db = h.loadDatabase();
    const action = args[0]?.toLowerCase();
    if (action === 'on') {
      db.antiaza = true; h.saveDatabase(db);
      return reply(`${h.demonEmoji()} ${h.toBoldItalic('Anti-aza ACTIVATED')} - ${h.toBoldItalic('Account details protected')} 🔥\n\n💀 ${h.toBoldItalic("Messages with your account number won't be forwarded")}`);
    } else if (action === 'off') {
      db.antiaza = false; h.saveDatabase(db);
      return reply(`✓ ${h.toBoldItalic('Anti-aza deactivated')}`);
    } else {
      const status = db.antiaza ? 'ON' : 'OFF';
      return reply(`${h.demonEmoji()} ${h.toBoldItalic('ANTI-AZA')}\n\n${h.toBoldItalic('Prevents messages with your account details from being forwarded.')}\n\n${h.toBoldItalic('Current')}: ${status}\n\n🔥 ${h.toBoldItalic('Usage')}:\n• ${prefix}antiaza on - Enable\n• ${prefix}antiaza off - Disable`);
    }
  }
};
