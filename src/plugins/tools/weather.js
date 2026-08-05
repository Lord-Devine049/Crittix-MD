/*
 * WEATHER.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'weather',
  category: 'soultools',
  description: 'Get weather for a location',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const axios = require('axios');
    const loc = args.join(' ');
    if (!loc) return reply(h.demonError('.weather', '.weather <city>'));
    try {
      const res = await axios.get('https://wttr.in/' + encodeURIComponent(loc) + '?format=3', { timeout: 8000 });
      reply('🌤️ ' + res.data);
    } catch(e) { reply(h.demonFail('Weather API error')); }
  }
};
