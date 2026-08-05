/* GOOGLE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: ['google', 'search'],
  aliases: ['search'],
  category: 'soultools',
  description: 'Search Google for anything',
  execute: async ({ args, prefix, reply }) => {
    if (!args[0]) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}google <query> ${h.demonEmoji()}`);
    const query = args.join(' ');
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return reply(`🔍 ${h.toBoldItalic('Google Search')}: ${query}\n\n🔗 ${searchUrl}`);
  }
};
