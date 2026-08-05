/*
 * ADVICE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');

module.exports = {
  command: ['advice'],
  aliases: [],
  category: 'arena',
  description: 'Get a random piece of advice',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    try {
      const res = await axios.get('https://api.adviceslip.com/advice', { timeout: 8000 });
      const slip = res.data?.slip;
      if (!slip?.advice) return reply(h.demonFail('No advice today. Figure it out yourself.'));

      reply(`🧠 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗔𝗱𝘃𝗶𝗰𝗲*\n\n_${slip.advice}_`);
    } catch {
      reply(h.demonFail('Advice machine is broken. Make your own choices.'));
    }
  }
};
