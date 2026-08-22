/*
 * POEM.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['poem', 'poetry'],
  aliases: ['verse'],
  category: 'arena',
  description: 'Get a random poem',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    try {
      const res = await axios.get('https://poetrydb.org/random', { timeout: 10000 });
      const poem = Array.isArray(res.data) ? res.data[0] : res.data;

      if (!poem || !poem.lines)
        return reply(p.phrases.error('No poems found. The muse is silent.'));

      const lines = poem.lines.join('\n');
      const body = lines.substring(0, 800) + (lines.length > 800 ? '\n...' : '');

      reply(
        `📜 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗣𝗼𝗲𝗺*\n\n` +
        `*${poem.title}*\n` +
        `_by ${poem.author}_\n\n` +
        `${body}`
      );
    } catch {
      reply(p.phrases.error('Poem fetch failed. The poet is asleep.'));
    }
  }
};
