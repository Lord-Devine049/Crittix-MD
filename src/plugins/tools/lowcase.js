/* LOWCASE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: 'lowcase',
  category: 'soultools',
  description: 'Convert text to lowercase',
  execute: async ({ text, prefix, reply }) => {
    const input = text.replace(/^[^\s]+\s*/, '').trim();
    if (!input) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}lowcase <text>`);
    return reply(`🔡 ${input.toLowerCase()}`);
  }
};
