/*
 * ROAST.JS (ENHANCED) - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');

const roastLines = [
  'You\'re the human equivalent of a participation trophy.',
  'I\'d call you a tool, but even tools are useful.',
  'You\'re not stupid, you just have bad luck thinking.',
  'Somewhere out there, a tree is tirelessly producing oxygen for you. You owe it an apology.',
  'I\'ve met rocks with more personality.',
  'You\'re proof that evolution can go backwards.',
  'If brains were taxed, you\'d get a refund.',
  'You\'re the reason shampoo has instructions.',
  'Your Wi-Fi password should be your IQ: 0.',
  'I would roast you more, but my mother told me not to burn trash.',
  'You\'re like a cloud. When you disappear, it\'s a beautiful day.',
  'Even Google can\'t find your purpose.',
  'You\'re so slow, you\'d lose a race to a traffic jam.',
  'I\'d explain it to you, but I left my crayons at home.',
  'Some drink from the fountain of knowledge. You just gargled.',
];

module.exports = {
  command: ['roast'],
  aliases: ['burn'],
  category: 'darkintelligence',
  description: 'Roast someone or get roasted',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const line = roastLines[Math.floor(Math.random() * roastLines.length)];

    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const mentioned = ctx?.mentionedJid?.[0];
    const target = mentioned
      ? `@${mentioned.split('@')[0]}`
      : text
        ? text
        : `@${sender.split('@')[0]}`;

    reply(`🔥 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗥𝗼𝗮𝘀𝘁*\n\n${target}, ${line}`);
  }
};
