/*
 * RELIGION.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: bible, quran
 */
const axios = require('axios');
const h = require('../../lib/helpers');

module.exports = [

  {
    command: 'bible',
    aliases: ['bibleverse', 'verse'],
    category: 'soultools',
    description: 'Look up a Bible verse by reference. Usage: .bible John 3:16',
    execute: async ({ text, args, reply }) => {
      const ref = text || args.join(' ');
      if (!ref) return reply(h.demonError('.bible', '.bible <Book Chapter:Verse> — e.g. .bible John 3:16'));
      try {
        const encoded = encodeURIComponent(ref.trim());
        const res = await axios.get(`https://bible-api.com/${encoded}`, { timeout: 10000 });
        const data = res.data;
        if (!data || data.error) return reply(h.demonFail(`Verse not found: "${ref}". Check your reference format.`));
        const verses = data.verses?.map(v => v.text.trim()).join(' ') || data.text?.trim() || 'No text found.';
        reply(
          `📖 *${data.reference || ref.toUpperCase()}*\n\n` +
          `_"${verses}"_\n\n` +
          `— *${data.translation_name || 'World English Bible'}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) {
        reply(h.demonFail(`Bible API failed. Even the servers need rest sometimes.\n${e.message}`));
      }
    }
  },

  {
    command: 'quran',
    aliases: ['quranverse', 'ayah'],
    category: 'soultools',
    description: 'Look up a Quran verse by surah:ayah. Usage: .quran 2:255',
    execute: async ({ text, args, reply }) => {
      const ref = text || args.join(' ');
      if (!ref || !ref.includes(':')) return reply(h.demonError('.quran', '.quran <surah>:<ayah> — e.g. .quran 2:255'));
      const [surah, ayah] = ref.trim().split(':').map(Number);
      if (!surah || !ayah || isNaN(surah) || isNaN(ayah)) return reply(h.demonFail('Invalid reference. Use: .quran 2:255 (surah:ayah)'));
      try {
        const [enRes, arRes] = await Promise.all([
          axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.sahih`, { timeout: 10000 }),
          axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`, { timeout: 10000 })
        ]);
        const en = enRes.data?.data;
        const ar = arRes.data?.data;
        if (!en) return reply(h.demonFail(`Ayah ${surah}:${ayah} not found. Check the reference.`));
        reply(
          `🌙 *QURAN — Surah ${en.surah?.englishName} (${ar?.surah?.name || ''}) | Ayah ${ayah}*\n\n` +
          `*Arabic:*\n${ar?.text || ''}\n\n` +
          `*English (Sahih International):*\n_"${en.text}"_\n\n` +
          `📍 ${en.surah?.englishName} (${en.surah?.englishNameTranslation}) — Verse ${en.numberInSurah}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) {
        reply(h.demonFail(`Quran API failed. Divine timing issue.\n${e.message}`));
      }
    }
  }

];
