/*
 * JOKE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'joke',
  category: 'soultools',
  description: 'Get a random joke',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const axios = require('axios');
    try {
      const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist', { timeout: 8000 });
      const j = res.data;
      const text = j.type === 'twopart' ? j.setup + '\n\n😂 ' + j.delivery : j.joke;
      reply('😂 JOKE:\n\n' + text);
    } catch(e) { reply(p.phrases.error('could not fetch a joke. try again.')); }
  }
};
