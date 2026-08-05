const globalXP = require('../../lib/global-xp');
/*
 * NUMBATTLE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['numbattle', 'coinbattle'],
  aliases: ['numroll'],
  category: 'arena',
  description: 'Battle the bot with numbers or coins',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = command?.toLowerCase() || 'numbattle';

    if (cmd === 'numbattle') {
      const userRoll = Math.floor(Math.random() * 100) + 1;
      const botRoll = Math.floor(Math.random() * 100) + 1;

      if (userRoll > botRoll) globalXP.addXP(sender, msg.pushName || senderNumber);
      const result = userRoll > botRoll
        ? '🎉 *You Win!*'
        : userRoll < botRoll
          ? '💀 *You Lose!*'
          : '🤝 *It\'s a Tie!*';

      reply(
        `🎲 *𝗡𝘂𝗺𝗕𝗮𝘁𝘁𝗹𝗲*\n\n` +
        `You rolled: *${userRoll}*\n` +
        `Bot rolled: *${botRoll}*\n\n` +
        result
      );

    } else if (cmd === 'coinbattle') {
      const sides = ['Heads', 'Tails'];
      const userFlip = sides[Math.floor(Math.random() * 2)];
      const botFlip = sides[Math.floor(Math.random() * 2)];

      if (userFlip === botFlip) globalXP.addXP(sender, msg.pushName || senderNumber);
      const result = userFlip === botFlip ? '🎉 *You Win!*' : '💀 *You Lose!*';

      reply(
        `🪙 *𝗖𝗼𝗶𝗻𝗕𝗮𝘁𝘁𝗹𝗲*\n\n` +
        `You: *${userFlip}*\n` +
        `Bot: *${botFlip}*\n\n` +
        result
      );
    }
  }
};
