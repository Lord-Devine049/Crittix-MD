/*
 * MATHQUIZ.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['mathquiz', 'mathfact', 'calculate2'],
  aliases: [],
  category: 'arena',
  description: 'Random math quiz or calculate an expression',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = (command || 'mathquiz').toLowerCase();

    if (cmd === 'calculate2') {
      if (!text) return reply(h.demonError('.calculate2', '.calculate2 <expression>'));
      try {
        // eslint-disable-next-line no-new-func
        const result = Function('"use strict"; return (' + text + ')')();
        reply(`🧮 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗖𝗮𝗹𝗰*\n\n${text} = *${result}*`);
      } catch {
        reply(h.demonFail('Invalid expression. Check your math.'));
      }
      return;
    }

    // Math quiz
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer;

    if (op === '+') answer = a + b;
    else if (op === '-') answer = a - b;
    else answer = a * b;

    reply(
      `➕ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗮𝘁𝗵 𝗤𝘂𝗶𝘇*\n\n` +
      `${a} ${op} ${b} = ?\n\n` +
      `_Reply: \`${prefix}mathanswer ${answer}\` to check_`
    );
  }
};
