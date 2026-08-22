/*
 * DOG.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['dog', 'dogpic'],
  aliases: ['woof'],
  category: 'soultools',
  description: 'Random dog photo',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    try {
      const res = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 10000 });
      const img = res.data?.message;
      if (!img) return reply(p.phrases.error('could not fetch a dog. try again.'));

      await sock.sendMessage(chatId, {
        image: { url: img },
        caption: `🐶 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗗𝗼𝗴*`
      }, { quoted: msg });
    } catch {
      reply(p.phrases.error('dog fetch failed. try again.'));
    }
  }
};
