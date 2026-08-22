/*
 * QUOTE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'quote',
  category: 'soultools',
  description: 'Get an inspirational quote',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const axios = require('axios');
    try {
      const res = await axios.get('https://zenquotes.io/api/random', { timeout: 8000 });
      const q = res.data[0];
      reply('💬 \"' + q.q + '\"\n\n— ' + q.a);
    } catch(e) { reply(p.phrases.error('could not fetch a quote. try again.')); }
  }
};
