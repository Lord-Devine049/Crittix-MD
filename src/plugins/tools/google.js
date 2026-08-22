/* GOOGLE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');

module.exports = {
  command: ['google', 'search'],
  aliases: ['search'],
  category: 'soultools',
  description: 'Search Google for anything',
  execute: async ({ args, prefix, reply }) => {
    if (!args[0]) return reply(p.phrases.wrongUsage('type your search query after the command. example! .google who is lord devine'));
    const query = args.join(' ');
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return reply(`🔍 ${h.toBoldItalic('Google Search')}: ${query}\n\n🔗 ${searchUrl}`);
  }
};
