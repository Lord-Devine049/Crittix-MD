const globalXP = require('../../lib/global-xp');
/*
 * HANGMAN.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


const games = {};

const visuals = [
  '```\n+---+\n    |\n    |\n    |\n   ===\n```',
  '```\n+---+\n O  |\n    |\n    |\n   ===\n```',
  '```\n+---+\n O  |\n |  |\n    |\n   ===\n```',
  '```\n+---+\n O  |\n/|  |\n    |\n   ===\n```',
  '```\n+---+\n O  |\n/|\\ |\n    |\n   ===\n```',
  '```\n+---+\n O  |\n/|\\ |\n/   |\n   ===\n```',
  '```\n+---+\n O  |\n/|\\ |\n/ \\ |\n   ===\n```'
];

module.exports = {
  command: ['hangman'],
  aliases: ['hm'],
  category: 'shadowgames',
  description: 'Play hangman',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const game = games[chatId];

    if (!game) {
      if (!args[0]) return reply(p.phrases.wrongUsage('provide the word for players to guess. example! .hangman crittix'));

      const word = args[0].toLowerCase().replace(/[^a-z]/g, '');
      if (word.length < 2) return reply(p.phrases.error('Word must be at least 2 letters'));

      games[chatId] = {
        word,
        display: '_'.repeat(word.length).split(''),
        attempts: 6,
        guessed: [],
        wrong: 0
      };

      reply(
        `🎮 *𝗛𝗮𝗻𝗴𝗺𝗮𝗻 𝗦𝘁𝗮𝗿𝘁𝗲𝗱*\n\n` +
        `${visuals[0]}\n\n` +
        `Word: \`${games[chatId].display.join(' ')}\`\n` +
        `Attempts left: 6\n\n` +
        `_Guess: ${prefix}hangman <letter>_`
      );
      return;
    }

    if (!args[0]) return reply(p.phrases.error(`Game in progress. Guess: ${prefix}hangman <letter>`));

    const letter = args[0].toLowerCase();
    if (letter.length !== 1 || !/[a-z]/.test(letter))
      return reply(p.phrases.error('One letter at a time, a-z only'));

    if (game.guessed.includes(letter))
      return reply(p.phrases.error(`Already guessed "${letter}"`));

    game.guessed.push(letter);

    if (game.word.includes(letter)) {
      for (let i = 0; i < game.word.length; i++)
        if (game.word[i] === letter) game.display[i] = letter;
    } else {
      game.wrong++;
      game.attempts--;
    }

    const visual = visuals[Math.min(game.wrong, visuals.length - 1)];

    if (!game.display.includes('_')) {
      globalXP.addXP(sender, msg.pushName || senderNumber);
      const win = `🎉 *You Won!*\n\nWord: \`${game.word}\`\n\n${visual}`;
      delete games[chatId];
      return reply(win);
    }

    if (game.attempts <= 0) {
      const lose = `💀 *Game Over!*\n\nWord was: \`${game.word}\`\n\n${visual}`;
      delete games[chatId];
      return reply(lose);
    }

    reply(
      `🎮 *𝗛𝗮𝗻𝗴𝗺𝗮𝗻*\n\n` +
      `${visual}\n\n` +
      `Word: \`${game.display.join(' ')}\`\n` +
      `Attempts left: ${game.attempts}\n` +
      `Guessed: ${game.guessed.join(', ')}`
    );
  }
};
