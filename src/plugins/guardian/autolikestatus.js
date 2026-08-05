/* AUTOLIKESTATUS.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const { getConfig, set } = require('../../lib/config');

module.exports = {
  command: 'autolikestatus',
  category: 'voidsystem',
  description: 'Automatically react ❤️ to all contacts status updates',
  ownerOnly: true,
  execute: async ({ args, prefix, reply }) => {
    const action = args[0]?.toLowerCase();
    const cfg = getConfig();

    if (action === 'on') {
      set({ AUTO_LIKE_STATUS: true });
      return reply(`${h.demonEmoji()} ${h.toBoldItalic('Auto like status ACTIVATED')} 🔥\n\n${h.toBoldItalic('Bot will react ❤️ to every status update automatically.')}`);
    }

    if (action === 'off') {
      set({ AUTO_LIKE_STATUS: false });
      return reply(`✓ ${h.toBoldItalic('Auto like status deactivated')}`);
    }

    const current = cfg.AUTO_LIKE_STATUS ? '🟢 ON' : '🔴 OFF';
    return reply(
      `${h.demonEmoji()} ${h.toBoldItalic('AUTO LIKE STATUS')}\n\n` +
      `${h.toBoldItalic('Automatically react ❤️ to all contacts status updates.')}\n\n` +
      `${h.toBoldItalic('Current')}: ${current}\n\n` +
      `🔥 ${h.toBoldItalic('Usage')}:\n` +
      `• ${prefix}autolikestatus on\n` +
      `• ${prefix}autolikestatus off`
    );
  }
};
