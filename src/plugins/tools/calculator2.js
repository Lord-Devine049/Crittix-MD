const p = require('../../lib/phrases');

module.exports = {
  command: 'calculator',
  aliases: ['cal2', 'math2', 'eval'],
  category: 'soultools',
  description: 'Advanced calculator supporting ×, ÷, π, e, powers. Usage: calculator 3×(4+2)÷π',
  execute: async ({ text, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('provide a math expression. example! .calculator 5x(3+2) supports + - x and brackets.'));

    try {
      const sanitized = text
        .replace(/[^0-9\-\/+*×÷πEe().piPI\s]/g, '')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π|pi/gi, 'Math.PI')
        .replace(/(?<![A-Za-z])e(?![A-Za-z])/g, 'Math.E');

      if (!sanitized.trim()) throw new Error('Empty expression');

      // eslint-disable-next-line no-new-func
      const result = new Function(`'use strict'; return (${sanitized})`)();

      if (!isFinite(result)) throw new Error('Invalid result');

      const display = text
        .replace(/Math\.PI/g, 'π')
        .replace(/Math\.E/g, 'e');

      reply(
        `🧮 *Calculator*\n\n` +
        `📥 ${display}\n` +
        `📤 *= ${result}*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    } catch {
      reply('❌ *Invalid expression*\nAllowed: `0-9 + - × ÷ π e ( )`');
    }
  }
};
