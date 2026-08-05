/*
 * TRANSLATE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

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
    if (!input) return reply(h.demonError('.translate', '.translate <lang> <text> OR reply to message'));
    try {
      const res = await axios.get('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(input) + '&langpair=auto|' + lang, { timeout: 10000 });
      const out = res.data?.responseData?.translatedText;
      if (!out) return reply(h.demonFail('Translation failed'));
      reply('🌐 Translation (→' + lang + '):\n\n' + out);
    } catch(e) { reply(h.demonFail('Translation API error')); }
  }
};
