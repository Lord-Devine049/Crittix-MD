/*
 * STYLETEXT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'styletext',
  category: 'creativetools',
  description: 'Style text with a font',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const { AVAILABLE_FONTS, applyFont } = require('../../lib/fonts');
    const fontName = args[0]?.toLowerCase();
    const txt = args.slice(1).join(' ');
    if (!fontName || !txt) return reply(h.demonError('.styletext', '.styletext bold Hello World\n\nFonts: ' + AVAILABLE_FONTS.join(', ')));
    if (!AVAILABLE_FONTS.includes(fontName)) return reply(h.demonFail('Unknown font. Available: ' + AVAILABLE_FONTS.join(', ')));
    reply(applyFont(txt, fontName));
  }
};
