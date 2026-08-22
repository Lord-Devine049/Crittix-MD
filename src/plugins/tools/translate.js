/*
 * TRANSLATE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'translate',
  category: 'soultools',
  description: 'Translate text',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const axios = require('axios');
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const qText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
    const lang = args[0] || 'en';
    const input = args.slice(1).join(' ') || qText;
    if (!input) return reply(p.phrases.wrongUsage('provide a language code and your text. or reply to a message. example! .translate fr hello world'));
    try {
      const res = await axios.get('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(input) + '&langpair=auto|' + lang, { timeout: 10000 });
      const out = res.data?.responseData?.translatedText;
      if (!out) return reply(p.phrases.error('Translation failed'));
      reply('🌐 Translation (→' + lang + '):\n\n' + out);
    } catch(e) { reply(p.phrases.error('Translation API error')); }
  }
};
