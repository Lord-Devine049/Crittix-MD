/* REPEAT.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: 'repeat',
  category: 'soultools',
  description: 'Repeat text N times',
  execute: async ({ args, prefix, reply }) => {
    const repeatCount = parseInt(args[0]);
    const repeatText = args.slice(1).join(' ');
    if (!args[0] || !repeatText) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}repeat <number> <text>\n\n${h.toBoldItalic('Example')}: ${prefix}repeat 3 Hello!`);
    if (isNaN(repeatCount) || repeatCount < 1) return reply(`✘ ${h.toBoldItalic('Number must be 1 or more')} ${h.demonEmoji()}`);
    const safeCount = Math.min(repeatCount, 20);
    return reply(Array(safeCount).fill(repeatText).join('\n'));
  }
};
