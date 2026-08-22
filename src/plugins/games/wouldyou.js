/*
 * WOULDYOU.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['wyr', 'wyr2'],
  aliases: ['wouldyourather', 'wouldyourather2'],
  category: 'arena',
  description: 'Get a Would You Rather question (from API)',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    try {
      const res = await axios.get('https://api.truthordarebot.xyz/v1/wyr', { timeout: 8000 });
      const q = res.data?.question;
      if (!q) return reply(p.phrases.error('No question found. Ask yourself.'));
      reply(`🤔 *𝗪𝗼𝘂𝗹𝗱 𝗬𝗼𝘂 𝗥𝗮𝘁𝗵𝗲𝗿*\n\n❖ ${q}`);
    } catch {
      reply(p.phrases.error('WYR fetch failed. Think for yourself.'));
    }
  }
};
