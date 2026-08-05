/*
 * FLIRT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');

const flirtLines = [
  'Are you a magician? Because whenever I look at you, everyone else disappears.',
  'Do you have a map? I keep getting lost in your eyes.',
  'Is your name Google? Because you have everything I\'ve been searching for.',
  'If you were a vegetable, you\'d be a cute-cumber.',
  'Do you believe in love at first sight, or should I walk by again?',
  'Are you a parking ticket? Because you\'ve got "fine" written all over you.',
  'I must be a snowflake, because I\'ve fallen for you.',
  'Are you a bank loan? Because you have my interest.',
  'Do you like science? Because I\'ve got great chemistry with you.',
  'If you were a song, you\'d be the best track on the album.',
  'You must be made of copper and tellurium, because you\'re CuTe.',
  'Is your name Wifi? Because I\'m feeling a connection.',
  'You\'re like a fine wine. You get better every time I think about you.',
  'If kisses were snowflakes, I\'d send you a blizzard.',
  'Are you a camera? Because every time I see you, I smile.'
];

module.exports = {
  command: ['flirt'],
  aliases: ['charm'],
  category: 'arena',
  description: 'Send a flirt line',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const line = flirtLines[Math.floor(Math.random() * flirtLines.length)];
    reply(`💘 *𝗙𝗹𝗶𝗿𝘁*\n\n_${line}_`);
  }
};
