/*
 * WEATHER.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'weather',
  category: 'soultools',
  description: 'Get weather for a location',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const axios = require('axios');
    const loc = args.join(' ');
    if (!loc) return reply(p.phrases.wrongUsage('type the city name after the command. example! .weather lagos'));
    try {
      const res = await axios.get('https://wttr.in/' + encodeURIComponent(loc) + '?format=3', { timeout: 8000 });
      reply('🌤️ ' + res.data);
    } catch(e) { reply(p.phrases.error('Weather API error')); }
  }
};
