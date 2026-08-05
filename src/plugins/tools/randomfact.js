/*
 * RANDOMFACT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'randomfact',
  category: 'soultools',
  description: 'Get a random fact',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const axios = require('axios');
    try {
      const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', { timeout: 8000 });
      reply('🧠 Random Fact:\n\n' + res.data.text);
    } catch(e) { reply(h.demonFail('Could not fetch fact')); }
  }
};
