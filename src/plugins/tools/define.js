/*
 * DEFINE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'define',
  category: 'soultools',
  description: 'Define a word',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const axios = require('axios');
    const word = args[0];
    if (!word) return reply(h.demonError('.define', '.define <word>'));
    try {
      const res = await axios.get('https://api.dictionaryapi.dev/api/v2/entries/en/' + word, { timeout: 8000 });
      const entry = res.data[0];
      const def = entry?.meanings[0]?.definitions[0];
      if (!def) return reply(h.demonFail('No definition found'));
      reply('📖 ' + word.toUpperCase() + '\n\n🔤 Type: ' + entry.meanings[0].partOfSpeech + '\n📝 Definition: ' + def.definition + (def.example ? '\n\n💬 Example: ' + def.example : ''));
    } catch(e) { reply(h.demonFail('Definition not found')); }
  }
};
