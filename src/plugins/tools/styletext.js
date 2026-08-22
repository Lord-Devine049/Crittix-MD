/*
 * STYLETEXT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'styletext',
  category: 'creativetools',
  description: 'Style text with a font',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const { AVAILABLE_FONTS, applyFont } = require('../../lib/fonts');
    const fontName = args[0]?.toLowerCase();
    const txt = args.slice(1).join(' ');
    if (!fontName || !txt) return reply(p.phrases.wrongUsage('provide a font name then your text. example! .styletext bold hello world'));
    if (!AVAILABLE_FONTS.includes(fontName)) return reply(p.phrases.notFound('unknown font. check available fonts with .styletext'));
    reply(applyFont(txt, fontName));
  }
};
