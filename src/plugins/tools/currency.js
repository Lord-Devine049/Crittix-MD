/*
 * CURRENCY.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['currency'],
  aliases: ['curr'],
  category: 'soultools',
  description: 'Convert currencies',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text || args.length < 3) {
      return reply(
        `💱 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗖𝘂𝗿𝗿𝗲𝗻𝗰𝘆*\n\n` +
        `Usage: ${prefix}currency [amount] [from] [to]\n` +
        `Example: ${prefix}currency 100 USD EUR`
      );
    }

    const [amount, from, to] = args;

    try {
      const res = await axios.get(
        `https://api.exchangerate.host/convert?from=${from.toUpperCase()}&to=${to.toUpperCase()}&amount=${amount}`,
        { timeout: 10000 }
      );

      if (!res.data?.result) throw new Error('Invalid response');

      reply(
        `💱 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗖𝘂𝗿𝗿𝗲𝗻𝗰𝘆*\n\n` +
        `${amount} ${from.toUpperCase()} = *${res.data.result.toFixed(4)} ${to.toUpperCase()}*`
      );
    } catch (err) {
      reply(p.phrases.error('exchange rate service is down. try again later.'));
    }
  }
};
