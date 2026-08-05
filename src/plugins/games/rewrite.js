/*
 * REWRITE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

const prefixes = [
  'In other words,', 'To put it differently,', 'Simply stated,',
  'What this means is:', 'Allow me to rephrase that:', 'Basically,',
  'In plain terms,', 'Here\'s another way to see it:', 'If I had to say it again:',
  'The bottom line is:'
];

module.exports = {
  command: ['rewrite'],
  aliases: [],
  category: 'arena',
  description: 'Rewrite/rephrase your text',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(h.demonError('.rewrite', '.rewrite <your text>'));

    // Simple local rephrase: shuffle word order in a stylistic way
    const words = text.split(' ');
    const pick = prefixes[Math.floor(Math.random() * prefixes.length)];

    // Reverse clause order if there's a comma, otherwise keep words
    const rephrased = text.includes(',')
      ? text.split(',').reverse().map(s => s.trim()).join(', ')
      : words.join(' ');

    reply(
      `✏️ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗥𝗲𝘄𝗿𝗶𝘁𝗲*\n\n` +
      `*Original:* _${text}_\n\n` +
      `*Rewritten:* _${pick} ${rephrased}_`
    );
  }
};
