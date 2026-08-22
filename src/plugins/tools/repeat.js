/* REPEAT.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');

module.exports = {
  command: 'repeat',
  category: 'soultools',
  description: 'Repeat text N times',
  execute: async ({ args, prefix, reply }) => {
    const repeatCount = parseInt(args[0]);
    const repeatText = args.slice(1).join(' ');
    if (!args[0] || !repeatText) return reply(p.phrases.wrongUsage('provide a number then your text. example! .repeat 3 hello!'));
    if (isNaN(repeatCount) || repeatCount < 1) return reply(`✘ ${h.toBoldItalic('Number must be 1 or more')} ${h.demonEmoji()}`);
    const safeCount = Math.min(repeatCount, 20);
    return reply(Array(safeCount).fill(repeatText).join('\n'));
  }
};
