/*
 * CALC.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'calc',
  category: 'soultools',
  description: 'Calculate math expression',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const expr = args.join(' ');
    if (!expr) return reply(p.phrases.wrongUsage('provide a math expression. example! .calc 2+2*5'));
    try {
      const result = Function('"use strict"; return (' + expr.replace(/[^0-9+\-*/.()% ]/g,'') + ')')();
      reply('🧮 ' + expr + ' = *' + result + '*');
    } catch(e) { reply(p.phrases.error('invalid math expression.')); }
  }
};
