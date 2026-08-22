/*
 * SCIENCEFACT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['sciencefact', 'funfact'],
  aliases: ['ffact'],
  category: 'arena',
  description: 'Get a random science/fun fact',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    try {
      const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 8000 });
      const fact = res.data?.text;
      if (!fact) return reply(p.phrases.error('No fact found. Universe is weird.'));
      reply(`🔬 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗙𝗮𝗰𝘁*\n\n_${fact}_`);
    } catch {
      reply(p.phrases.error('Fact machine broke. Try again.'));
    }
  }
};
