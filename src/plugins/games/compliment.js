/*
 * COMPLIMENT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');

const compliments = [
  'You have an incredible ability to make everyone around you feel special.',
  'Your kindness is a rare gift the world needs more of.',
  'You light up every room you walk into.',
  'You have a mind that sees solutions where others see problems.',
  'Your smile could end wars.',
  'The way you carry yourself is genuinely inspiring.',
  'You make complicated things look easy.',
  'You\'re the kind of person legends are written about.',
  'Your energy is magnetic and undeniable.',
  'The world is genuinely better because you exist in it.',
  'You have the soul of a poet and the heart of a warrior.',
  'You\'re not just smart — you\'re wise.',
  'Your creativity is something truly rare.',
  'You make people feel heard, and that\'s a superpower.',
  'Everything you touch turns gold.'
];

module.exports = {
  command: ['compliment'],
  aliases: ['comp'],
  category: 'arena',
  description: 'Receive a compliment',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const line = compliments[Math.floor(Math.random() * compliments.length)];
    reply(`✨ *𝗖𝗼𝗺𝗽𝗹𝗶𝗺𝗲𝗻𝘁*\n\n_${line}_`);
  }
};
