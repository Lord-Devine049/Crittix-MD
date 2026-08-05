/*
 * ANTIEDIT.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Spy feature: when anyone edits a message (in groups or DMs),
 * the bot forwards the original text + edited text to the owner's DM.
 */
const { set, getConfig } = require('../../lib/config');

module.exports = {
  command: 'antiedit',
  category: 'voidsystem',
  description: 'Toggle antiedit — spy mode: forwards original + edited text to owner DM',
  sudoOnly: true,
  execute: async ({ args, prefix, reply }) => {
    const action = args[0]?.toLowerCase();
    const cfg = getConfig();

    if (action === 'on') {
      set({ ANTI_EDIT: true });
      return reply(
        `✏️ *ANTIEDIT: ON* 🟢\n\n` +
        `When anyone edits a message (group or DM), the bot will forward the original text and the new edited text to your DM.\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }

    if (action === 'off') {
      set({ ANTI_EDIT: false });
      return reply(`✏️ *ANTIEDIT: OFF* 🔴\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }

    const current = cfg.ANTI_EDIT ? '🟢 ON' : '🔴 OFF';
    return reply(
      `✏️ *ANTIEDIT*\n\n` +
      `Detects when anyone edits a message in groups or DMs and forwards the original + edited text to your DM.\n\n` +
      `Status: ${current}\n\n` +
      `Usage:\n• ${prefix}antiedit on\n• ${prefix}antiedit off`
    );
  }
};
