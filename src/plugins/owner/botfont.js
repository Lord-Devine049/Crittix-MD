/*
 * BOTFONT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'botfont',
  category: 'voidsystem',
  description: 'Change bot reply font',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const { AVAILABLE_FONTS, applyFont } = require('../../lib/fonts');
    const { set } = require('../../lib/config');
    const fontName = args[0]?.toLowerCase();
    if (!fontName) {
      const preview = AVAILABLE_FONTS.map(f => '➩ ' + f + ' → ' + applyFont('Hello', f)).join('\n');
      return reply('💜 Available fonts:\n\n' + preview + '\n\nUsage: .botfont <name>');
    }
    if (!AVAILABLE_FONTS.includes(fontName)) return reply(h.demonFail('Unknown font'));
    set({ FONT: fontName });
    reply('✓ Font set to *' + fontName + '*\n\nPreview: ' + applyFont('Crittix-MD', fontName));
  }
};
