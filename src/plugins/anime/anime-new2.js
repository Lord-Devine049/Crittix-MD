/*
 * ANIME-NEW2.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: animecharacter2, animefight, animetrivia, mangachapter,
 *           animeending, animestudio, anitrend, animecanon
 */
const axios = require('axios');
const h = require('../../lib/helpers');

const jikan = async (endpoint) => {
  const r = await axios.get(`https://api.jikan.moe/v4/${endpoint}`, { timeout: 15000 });
  return r.data;
};

const ANIME_TRIVIA = [
  { q: 'Which anime features the character Monkey D. Luffy?', a: ['one piece'] },
  { q: 'What is the name of the Survey Corps in Attack on Titan?', a: ['survey corps', 'scouting legion'] },
  { q: 'Who is the author of Naruto?', a: ['masashi kishimoto', 'kishimoto'] },
  { q: 'What studio produced Demon Slayer?', a: ['ufotable'] },
  { q: 'What is Goku\'s Saiyan birth name?', a: ['kakarot'] },
  { q: 'Which anime is set in Amestris?', a: ['fullmetal alchemist', 'fma', 'fullmetal alchemist brotherhood'] },
  { q: 'Who kills the No-Face demon in Spirited Away?', a: ['nobody', 'it\'s exorcised', 'chihiro'] },
  { q: 'What power system does Hunter x Hunter use?', a: ['nen'] },
  { q: 'Who is the "God of the New World" in Death Note?', a: ['kira', 'light yagami', 'light'] },
  { q: 'What sport is featured in Haikyuu!!?', a: ['volleyball'] },
];

const WATCH_ORDERS = {
  'attack on titan': 'S1 → S2 → S3 Part 1 → S3 Part 2 → The Final Season (S4 Parts 1-3). No filler.',
  'naruto': 'Naruto (eps 1-220, skip fillers: 136-220 mostly filler) → Naruto Shippuden (eps 1-500, major filler arcs: 57-71, 91-112, 144-151, 176-196, 284-295, 303-320, 347-361, 416-417, 422-423, 427-450, 480-483) → Boruto (optional)',
  'one piece': 'Episodes 1+ (very long, use a filler guide). Key arcs: Marineford, Dressrosa, Whole Cake Island, Wano.',
  'dragon ball': 'Dragon Ball (original) → Dragon Ball Z → Dragon Ball Z Kai (cleaner) → Dragon Ball Super → Dragon Ball GT (optional, non-canon)',
  'fate': 'Recommended: Fate/Zero → Fate/Stay Night: Unlimited Blade Works → Heaven\'s Feel trilogy (films)',
  'hunter x hunter': '2011 version covers everything. Watch that. Skip the 1999 version if you want speed.',
  'fullmetal alchemist': 'Watch Brotherhood directly. The 2003 version diverges. Brotherhood is the complete manga adaptation.',
  'jojo\'s bizarre adventure': 'Part 1 → 2 → 3 → 4 → 5 → 6 → 7 (manga only). All parts are self-contained but share lore.',
};

const activeAnimeTrivia = new Map();

module.exports = [


  {
    command: 'animefight',
    aliases: ['animevsanime', 'charvs'],
    category: 'shadowutilities',
    description: 'Pit two anime characters in a stat-based battle. Usage: .animefight <char1> vs <char2>',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input || !input.toLowerCase().includes(' vs ')) return reply(h.demonError('.animefight', '.animefight <char1> vs <char2>'));
      const [name1, name2] = input.split(/ vs /i).map(s => s.trim());
      try {
        const [r1, r2] = await Promise.all([
          jikan(`characters?q=${encodeURIComponent(name1)}&limit=1`),
          jikan(`characters?q=${encodeURIComponent(name2)}&limit=1`)
        ]);
        const c1 = r1.data?.[0];
        const c2 = r2.data?.[0];
        if (!c1 || !c2) return reply(h.demonFail('One or both characters not found. Check the names.'));
        const fav1 = c1.favorites || 100;
        const fav2 = c2.favorites || 100;
        const power1 = fav1 + Math.floor(Math.random() * 2000);
        const power2 = fav2 + Math.floor(Math.random() * 2000);
        const winner = power1 >= power2 ? c1.name : c2.name;
        const ratio = Math.abs(((power1 - power2) / Math.max(power1, power2)) * 100).toFixed(0);
        const flavors = ['barely edges out','obliterates','body bags','respectfully defeats','destroys in 3 moves'];
        const flavor = flavors[Math.floor(Math.random()*flavors.length)];
        reply(
          `⚔️ *ANIME BATTLE*\n\n` +
          `🔴 *${c1.name}* (❤️ ${fav1.toLocaleString()} fans)\n` +
          `VS\n` +
          `🔵 *${c2.name}* (❤️ ${fav2.toLocaleString()} fans)\n\n` +
          `${'─'.repeat(20)}\n` +
          `🏆 *${winner}* ${flavor} their opponent!\n` +
          `📊 Margin: *${ratio}%* power difference\n\n` +
          `_(Results are random + fan-powered. Don't @ me.)_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`Fight setup failed: ${e.message}`)); }
    }
  },

  {
    command: 'animetrivia',
    aliases: ['animeq', 'weebtrivia'],
    category: 'shadowutilities',
    description: 'Anime-specific single trivia question with 30s timer. Usage: .animetrivia',
    execute: async ({ sock, msg, chatId, reply }) => {
      if (activeAnimeTrivia.has(chatId)) return reply(h.demonFail('An anime trivia question is already active! Answer it first.'));
      const q = ANIME_TRIVIA[Math.floor(Math.random() * ANIME_TRIVIA.length)];
      const expires = Date.now() + 30000;
      activeAnimeTrivia.set(chatId, { ...q, expires });
      setTimeout(() => {
        if (activeAnimeTrivia.get(chatId)?.expires === expires) {
          activeAnimeTrivia.delete(chatId);
          sock.sendMessage(chatId, { text: `⏰ Time's up! The answer was: *${q.a[0]}*\nA certified weeb would've known that.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` });
        }
      }, 30000);
      await sock.sendMessage(chatId, { text: `🎌 *ANIME TRIVIA*\n\n❓ ${q.q}\n\nType your answer! 30 seconds on the clock.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
    }
  },

  {
    command: 'mangachapter',
    aliases: ['latestmanga', 'mangaupdate'],
    category: 'shadowutilities',
    description: 'Get latest chapter info for a manga. Usage: .mangachapter <manga title>',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(h.demonError('.mangachapter', '.mangachapter <manga title>'));
      try {
        const res = await jikan(`manga?q=${encodeURIComponent(query)}&limit=1`);
        const manga = res.data?.[0];
        if (!manga) return reply(h.demonFail(`No manga found for "${query}".`));
        reply(
          `📖 *${manga.title}* (${manga.title_japanese || ''})\n\n` +
          `📚 Chapters: *${manga.chapters || 'Ongoing'}*\n` +
          `📊 Volumes: *${manga.volumes || 'Ongoing'}*\n` +
          `📡 Status: *${manga.status}*\n` +
          `⭐ Score: *${manga.score || 'N/A'}*\n` +
          `📝 ${manga.synopsis?.substring(0, 200) || 'No synopsis.'}...\n\n` +
          `🔗 ${manga.url}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`Manga lookup failed: ${e.message}`)); }
    }
  },

  {
    command: 'animeending',
    aliases: ['animeED', 'endingtheme'],
    category: 'shadowutilities',
    description: 'Get the ending theme of an anime. Usage: .animeending <anime title>',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(h.demonError('.animeending', '.animeending <anime title>'));
      try {
        const res = await jikan(`anime?q=${encodeURIComponent(query)}&limit=1`);
        const anime = res.data?.[0];
        if (!anime) return reply(h.demonFail(`No anime found for "${query}".`));
        const fullRes = await jikan(`anime/${anime.mal_id}/themes`);
        const endings = fullRes.data?.endings || [];
        if (!endings.length) return reply(`🎵 *${anime.title}*\n\nNo ending themes found in database.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        const list = endings.slice(0, 5).join('\n');
        reply(`🎵 *${anime.title} — ENDING THEMES*\n\n${list}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`Ending theme lookup failed: ${e.message}`)); }
    }
  },

  {
    command: 'animestudio',
    aliases: ['producerstudio', 'whomadeanime'],
    category: 'shadowutilities',
    description: 'Look up an anime production studio and their works. Usage: .animestudio <studio name>',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(h.demonError('.animestudio', '.animestudio <studio name>'));
      try {
        const res = await axios.get(`https://api.jikan.moe/v4/producers?q=${encodeURIComponent(query)}&limit=1`, { timeout: 12000 });
        const studio = res.data?.data?.[0];
        if (!studio) return reply(h.demonFail(`No studio found for "${query}".`));
        const worksRes = await jikan(`producers/${studio.mal_id}/anime?limit=8`);
        const works = worksRes.data?.map(a => `• *${a.title}* (${a.year || '?'})`).join('\n') || 'No works found.';
        reply(
          `🎬 *${studio.titles?.find(t=>t.type==='Default')?.title || studio.mal_id}*\n\n` +
          `📺 *Notable Works:*\n${works}\n\n` +
          `⭐ Established: ${studio.established || 'Unknown'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`Studio lookup failed: ${e.message}`)); }
    }
  },

  {
    command: 'anitrend',
    aliases: ['animethisseason', 'trendanime'],
    category: 'shadowutilities',
    description: 'Show currently trending anime this season. Usage: .anitrend',
    execute: async ({ reply }) => {
      try {
        const res = await jikan('seasons/now?limit=10');
        const animes = res.data?.slice(0, 8) || [];
        if (!animes.length) return reply(h.demonFail('No trending anime found right now.'));
        const list = animes.map((a, i) => `${i+1}. *${a.title}* ⭐ ${a.score || 'N/A'} | ${a.episodes || '?'} eps`).join('\n');
        const season = res.pagination?.current_page ? '' : '';
        reply(`📺 *TRENDING ANIME THIS SEASON*\n\n${list}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`Trending anime fetch failed: ${e.message}`)); }
    }
  },

  {
    command: 'animecanon',
    aliases: ['watchorder', 'animeorder'],
    category: 'shadowutilities',
    description: 'Get the canon watch order for an anime series. Usage: .animecanon <anime title>',
    execute: async ({ text, args, reply }) => {
      const query = (text || args.join(' ')).toLowerCase().trim();
      if (!query) return reply(h.demonError('.animecanon', '.animecanon <anime title>'));
      const found = Object.keys(WATCH_ORDERS).find(k => query.includes(k) || k.includes(query));
      if (found) {
        return reply(`📋 *WATCH ORDER: ${found.toUpperCase()}*\n\n${WATCH_ORDERS[found]}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(
        `📋 *WATCH ORDER: ${query.toUpperCase()}*\n\n` +
        `No curated watch order stored for this series.\n\n` +
        `💡 General rule: Follow release order unless a prequel is listed. Skip obvious filler arcs.\n\n` +
        `📌 Available curated orders:\n${Object.keys(WATCH_ORDERS).map(k => `• ${k}`).join('\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }

];

module.exports.activeAnimeTrivia = activeAnimeTrivia;
