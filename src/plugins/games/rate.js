/*
 * RATE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['rate'],
  aliases: ['rateme'],
  category: 'arena',
  description: 'Rate yourself or something out of 100',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const thing = text || `@${sender.split('@')[0]}`;
    const score = Math.floor(Math.random() * 101);
    const bar = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10));

    let verdict;
    if (score >= 90) verdict = '🔥 Legendary';
    else if (score >= 70) verdict = '✨ Fire';
    else if (score >= 50) verdict = '👍 Decent';
    else if (score >= 30) verdict = '😐 Mid';
    else verdict = '💀 Trash';

    reply(
      `📊 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗥𝗮𝘁𝗲*\n\n` +
      `Subject: *${thing}*\n\n` +
      `[${bar}] ${score}/100\n\n` +
      `Verdict: ${verdict}`
    );
  }
};
