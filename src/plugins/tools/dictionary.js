const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = {
  command: 'dictionary',
  aliases: ['dict', 'meaning', 'wordmeaning'],
  category: 'soultools',
  description: 'Look up the meaning of a word. Usage: dictionary ephemeral',
  execute: async ({ sock, msg, text, chatId, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the word you want to look up. example! .dictionary ephemeral'));

    try {
      const res = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text.trim().toLowerCase())}`
      );

      const entry = res.data?.[0];
      if (!entry) return reply('❌ *Word not found*');

      const meanings = entry.meanings?.slice(0, 3) || [];
      let out = `📖 *${entry.word}*\n`;

      if (entry.phonetic) out += `🔊 ${entry.phonetic}\n`;
      out += '\n';

      for (const m of meanings) {
        out += `*${m.partOfSpeech}*\n`;
        const defs = m.definitions?.slice(0, 2) || [];
        defs.forEach((d, i) => {
          out += `${i + 1}. ${d.definition}\n`;
          if (d.example) out += `   _"${d.example}"_\n`;
        });
        if (m.synonyms?.length) out += `💡 Synonyms: ${m.synonyms.slice(0, 4).join(', ')}\n`;
        out += '\n';
      }

      out += `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
      reply(out);
    } catch {
      reply('❌ *Definition not found* • Check spelling and try again');
    }
  }
};
