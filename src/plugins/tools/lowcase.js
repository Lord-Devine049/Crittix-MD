/* LOWCASE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');

module.exports = {
  command: 'lowcase',
  category: 'soultools',
  description: 'Convert text to lowercase',
  execute: async ({ text, prefix, reply }) => {
    const input = text.replace(/^[^\s]+\s*/, '').trim();
    if (!input) return reply(p.phrases.wrongUsage('type the text you want lowercased. example! .lowcase HELLO WORLD'));
    return reply(`🔡 ${input.toLowerCase()}`);
  }
};
