/*
 * URBAN.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['urban', 'ud'],
  aliases: ['slang'],
  category: 'arena',
  description: 'Look up slang on Urban Dictionary',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the word to look up on urban dictionary. example! .urban no cap'));

    try {
      const res = await axios.get(
        `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(text)}`,
        { timeout: 10000 }
      );

      const list = res.data?.list;
      if (!list || list.length === 0)
        return reply(p.phrases.error(`No Urban Dictionary definition for "${text}"`));

      const entry = list[0];
      const def = (entry.definition || '').replace(/[\[\]]/g, '').substring(0, 500);
      const example = (entry.example || '').replace(/[\[\]]/g, '').substring(0, 300);

      reply(
        `📖 *𝗨𝗿𝗯𝗮𝗻 𝗗𝗶𝗰𝘁𝗶𝗼𝗻𝗮𝗿𝘆*\n\n` +
        `*${entry.word}*\n\n` +
        `${def}\n\n` +
        (example ? `_Example: ${example}_` : '') + `\n\n` +
        `👍 ${entry.thumbs_up} • 👎 ${entry.thumbs_down}`
      );
    } catch {
      reply(p.phrases.error('Urban Dictionary is offline. Check later.'));
    }
  }
};
