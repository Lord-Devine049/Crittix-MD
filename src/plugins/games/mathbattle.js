const globalXP = require('../../lib/global-xp');
/*
 * MATHBATTLE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


const activeGames = {};

module.exports = {
  command: ['mathbattle', 'mathanswer'],
  aliases: [],
  category: 'arena',
  description: 'Math battle — answer a random math question',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = (command || 'mathbattle').toLowerCase();

    if (cmd === 'mathanswer') {
      const game = activeGames[chatId];
      if (!game) return reply(p.phrases.error(`No active math game. Start one: ${prefix}mathbattle`));

      const guess = parseInt(text);
      if (isNaN(guess)) return reply(p.phrases.error('Provide a number'));

      const correct = guess === game.answer;
      delete activeGames[chatId];

      if (correct) {
        globalXP.addXP(sender, msg.pushName || senderNumber);
        reply(
          `🎉 *Correct!*\n\n` +
          `${game.a} ${game.op} ${game.b} = *${game.answer}*\n\n` +
          `@${sender.split('@')[0]} gets the brain badge 🧠`
        );
      } else {
        reply(
          `❌ *Wrong!*\n\n` +
          `${game.a} ${game.op} ${game.b} = *${game.answer}*\n\n` +
          `Your guess: ${guess}`
        );
      }
      return;
    }

    // Start a new math battle
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;

    if (op === '+') { a = Math.floor(Math.random() * 100) + 1; b = Math.floor(Math.random() * 100) + 1; answer = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 100) + 1; b = Math.floor(Math.random() * a) + 1; answer = a - b; }
    else if (op === '×') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; answer = a * b; }
    else { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * a) + 1; answer = Math.floor(a / b); }

    activeGames[chatId] = { a, b, op, answer };

    reply(
      `🧮 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗮𝘁𝗵 𝗕𝗮𝘁𝘁𝗹𝗲*\n\n` +
      `${a} ${op} ${b} = ?\n\n` +
      `_Reply: ${prefix}mathanswer <number>_`
    );
  }
};
