/*
 * ANIME-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: animequote, animecharacter, animenews, animeschedule,
 *           animerecommend, mangarecommend, animevoiceactor,
 *           animewatchlist, openingtheme
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');

const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

const JIKAN = 'https://api.jikan.moe/v4';

const animeQuotes = [
  { quote: "It's not the face that makes someone a monster, it's the choices they make with their lives.", char: 'Naruto Uzumaki', anime: 'Naruto' },
  { quote: "The only ones who should kill are those who are prepared to be killed.", char: 'Lelouch Lamperouge', anime: 'Code Geass' },
  { quote: "If you don't take risks, you can't create a future.", char: 'Monkey D. Luffy', anime: 'One Piece' },
  { quote: "People's lives don't end when they die. It ends when they lose faith.", char: 'Itachi Uchiha', anime: 'Naruto Shippuden' },
  { quote: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", char: 'Kenshin Himura', anime: 'Rurouni Kenshin' },
  { quote: "A lesson without pain is meaningless. You can't gain something without sacrificing something else in return.", char: 'Edward Elric', anime: 'Fullmetal Alchemist' },
  { quote: "Power comes in response to a need, not a desire.", char: 'Son Goku', anime: 'Dragon Ball Z' },
  { quote: "The world's not perfect. But it's there for us trying the best it can.", char: 'Roy Mustang', anime: 'Fullmetal Alchemist' },
  { quote: "Fear is not evil. It tells you what your weakness is. And once you know your weakness, you can become stronger.", char: 'Gildarts Clive', anime: 'Fairy Tail' },
  { quote: "Giving up is what kills people. When people reject giving up... they finally win the right to transcend humanity.", char: 'Alucard', anime: 'Hellsing' },
  { quote: "If you're gonna insist on gambling and then complain when you lose, you should've just stayed home.", char: 'Ryota Suzui', anime: 'Kakegurui' },
  { quote: "You should enjoy the little detours to the fullest. Because that's where you'll find things more important than what you want.", char: 'Ging Freecss', anime: 'Hunter x Hunter' },
  { quote: "Even if I'm worthless and carry demon blood… you have treated me as a real person.", char: 'Zenitsu Agatsuma', anime: 'Demon Slayer' },
  { quote: "The only way to truly escape the mundane is for you to constantly be evolving.", char: 'Izaya Orihara', anime: 'Durarara!!' },
  { quote: "Don't be in such a hurry to throw away your life. No matter how disgraceful or embarrassing it may be, you need to keep struggling to find your way out.", char: 'Makarov Dreyar', anime: 'Fairy Tail' },
];

module.exports = [

  {
    command: 'animequote',
    aliases: ['aquote', 'animesay'],
    category: 'shadowutilities',
    description: 'Random anime character quote. Usage: animequote',
    execute: async ({ reply }) => {
      const q = animeQuotes[Math.floor(Math.random() * animeQuotes.length)];
      reply(
        `╔════╗\n` +
        `  𓆘 *ANIME QUOTE*\n` +
        `╚════╝\n\n` +
        `❝ _${q.quote}_ ❞\n\n` +
        `— *${q.char}*\n` +
        `📺 ${q.anime}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'animecharacter',
    aliases: ['animechar'],
    category: 'shadowutilities',
    description: 'Look up an anime character from Jikan/MAL. Usage: animecharacter <name>',
    execute: async ({ args, reply }) => {
      const name = args.join(' ');
      if (!name) return reply(h.demonError('animecharacter', 'animecharacter <character name>'));
      try {
        await reply(`🔍 Searching for *${name}*...`);
        const res = await axios.get(`${JIKAN}/characters?q=${encodeURIComponent(name)}&limit=1`, { timeout: 15000 });
        const c = res.data.data?.[0];
        if (!c) return reply(h.demonFail(`couldn't find character: *${name}*`));
        const nick = c.nicknames?.slice(0, 3).join(', ') || 'None';
        const animeList = c.anime?.slice(0, 3).map(a => a.anime?.title).filter(Boolean).join(', ') || 'Unknown';
        reply(
          `╔════╗\n` +
          `  𓆘 *ANIME CHARACTER*\n` +
          `╚════╝\n\n` +
          `🎌 *Name:* ${c.name}\n` +
          `🇯🇵 *Kanji:* ${c.name_kanji || 'N/A'}\n` +
          `💬 *Nicknames:* ${nick}\n` +
          `📺 *Appears in:* ${animeList}\n` +
          `❤️ *Favorites:* ${c.favorites?.toLocaleString() || 0}\n\n` +
          `📝 ${(c.about || 'No biography available.').slice(0, 300).replace(/\n/g, ' ')}...\n\n` +
          `🔗 ${c.url || ''}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`lookup failed — ${e.message}`)); }
    }
  },

  {
    command: 'animenews',
    aliases: ['animeupdates', 'latestanime'],
    category: 'shadowutilities',
    description: 'Latest anime news from MyAnimeList. Usage: animenews',
    execute: async ({ reply }) => {
      try {
        await reply('📰 Fetching latest anime news...');
        const res = await axios.get(`${JIKAN}/news/anime`, { timeout: 15000 });
        const articles = res.data.data?.slice(0, 5);
        if (!articles?.length) return reply(h.demonFail('no news available right now'));
        const text = articles.map((a, i) =>
          `${i + 1}. *${a.title}*\n   👤 ${a.author_username} | 💬 ${a.comments}\n   🔗 ${a.url}`
        ).join('\n\n');
        reply(
          `╔════╗\n` +
          `  𓆘 *ANIME NEWS*\n` +
          `╚════╝\n\n` +
          `${text}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`news fetch failed — ${e.message}`)); }
    }
  },

  {
    command: 'animeschedule',
    aliases: ['aniseason', 'seasonanime', 'currentanime'],
    category: 'shadowutilities',
    description: 'Current season airing anime schedule. Usage: animeschedule',
    execute: async ({ reply }) => {
      try {
        await reply('📅 Fetching current season schedule...');
        const res = await axios.get(`${JIKAN}/seasons/now?limit=10`, { timeout: 20000 });
        const list = res.data.data?.slice(0, 10);
        if (!list?.length) return reply(h.demonFail('no schedule data available'));
        const text = list.map((a, i) =>
          `${i + 1}. *${a.title}* (${a.type || 'TV'})\n   ⭐ ${a.score || 'N/A'} | 📺 Ep ${a.episodes || '?'} | 🎭 ${(a.genres?.slice(0, 2).map(g => g.name).join(', ') || 'N/A')}`
        ).join('\n\n');
        reply(
          `╔════╗\n` +
          `  𓆘 *CURRENT SEASON*\n` +
          `╚════╝\n\n` +
          `${text}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`schedule fetch failed — ${e.message}`)); }
    }
  },

  {
    command: 'animerecommend',
    aliases: ['recoanime', 'animepick', 'whatwatch'],
    category: 'shadowutilities',
    description: 'Anime recommendations by genre. Usage: animerecommend <genre>',
    execute: async ({ args, reply }) => {
      const genre = args.join(' ') || 'action';
      const genreMap = {
        action: 1, adventure: 2, comedy: 4, drama: 8, fantasy: 10,
        horror: 14, mystery: 7, romance: 22, scifi: 24, thriller: 41,
        supernatural: 37, sports: 30, slice: 36, mecha: 18, psychological: 40
      };
      const key = genre.toLowerCase();
      const gid = genreMap[key] || genreMap['action'];
      try {
        await reply(`🎯 Finding *${genre}* anime recs...`);
        const res = await axios.get(`${JIKAN}/anime?genres=${gid}&order_by=score&sort=desc&limit=5`, { timeout: 20000 });
        const list = res.data.data?.slice(0, 5);
        if (!list?.length) return reply(h.demonFail('no recommendations found'));
        const text = list.map((a, i) =>
          `${i + 1}. *${a.title}*\n   ⭐ ${a.score} | 📺 ${a.episodes || '?'} eps | ${a.status}`
        ).join('\n\n');
        reply(
          `╔════╗\n` +
          `  𓆘 *ANIME RECOMMENDATIONS*\n` +
          `╚════╝\n\n` +
          `🎭 Genre: *${genre.toUpperCase()}*\n\n` +
          `${text}\n\n` +
          `Available genres: action, adventure, comedy, drama, fantasy, horror, mystery, romance, scifi, thriller\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`recs failed — ${e.message}`)); }
    }
  },

  {
    command: 'mangarecommend',
    aliases: ['recomanga', 'mangapick', 'whatread'],
    category: 'shadowutilities',
    description: 'Manga recommendations by genre. Usage: mangarecommend <genre>',
    execute: async ({ args, reply }) => {
      const genre = args.join(' ') || 'action';
      const genreMap = {
        action: 1, adventure: 2, comedy: 4, drama: 8, fantasy: 10,
        horror: 14, mystery: 7, romance: 22, scifi: 24, thriller: 41,
        supernatural: 37, sports: 30, slice: 36, mecha: 18, psychological: 40
      };
      const key = genre.toLowerCase();
      const gid = genreMap[key] || 1;
      try {
        await reply(`📖 Finding *${genre}* manga recs...`);
        const res = await axios.get(`${JIKAN}/manga?genres=${gid}&order_by=score&sort=desc&limit=5`, { timeout: 20000 });
        const list = res.data.data?.slice(0, 5);
        if (!list?.length) return reply(h.demonFail('no manga recs found'));
        const text = list.map((a, i) =>
          `${i + 1}. *${a.title}*\n   ⭐ ${a.score} | 📚 ${a.chapters || '?'} chs | ${a.status}`
        ).join('\n\n');
        reply(
          `╔════╗\n` +
          `  𓆘 *MANGA RECOMMENDATIONS*\n` +
          `╚════╝\n\n` +
          `📖 Genre: *${genre.toUpperCase()}*\n\n` +
          `${text}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`manga recs failed — ${e.message}`)); }
    }
  },

  {
    command: 'animevoiceactor',
    aliases: ['anivoice', 'va', 'voiceactor'],
    category: 'shadowutilities',
    description: 'Look up anime voice actor info. Usage: animevoiceactor <name>',
    execute: async ({ args, reply }) => {
      const name = args.join(' ');
      if (!name) return reply(h.demonError('animevoiceactor', 'animevoiceactor <voice actor name>'));
      try {
        await reply(`🎙️ Looking up VA: *${name}*...`);
        const res = await axios.get(`${JIKAN}/people?q=${encodeURIComponent(name)}&limit=1`, { timeout: 15000 });
        const va = res.data.data?.[0];
        if (!va) return reply(h.demonFail(`couldn't find voice actor: *${name}*`));
        reply(
          `╔════╗\n` +
          `  𓆘 *VOICE ACTOR INFO*\n` +
          `╚════╝\n\n` +
          `🎙️ *Name:* ${va.name}\n` +
          `🇯🇵 *Kanji:* ${va.name_kanji || 'N/A'}\n` +
          `🎂 *Birthday:* ${va.birthday ? new Date(va.birthday).toDateString() : 'Unknown'}\n` +
          `❤️ *Favorites:* ${va.favorites?.toLocaleString() || 0}\n\n` +
          `📝 ${(va.about || 'No bio available.').slice(0, 300).replace(/\n/g, ' ')}...\n\n` +
          `🔗 ${va.url || ''}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘹 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`VA lookup failed — ${e.message}`)); }
    }
  },

  {
    command: 'animewatchlist',
    aliases: ['mywatchlist', 'watchlist', 'animetodo'],
    category: 'shadowutilities',
    description: 'Manage your personal anime watchlist. Usage: animewatchlist add <title> | remove <title> | list | clear',
    execute: async ({ sender, args, reply }) => {
      const db = loadDB('anime_watchlist.json');
      if (!db[sender]) db[sender] = [];
      const action = args[0]?.toLowerCase();
      const title = args.slice(1).join(' ');

      if (action === 'list' || !action) {
        if (!db[sender].length) return reply(`📋 *Your watchlist is empty!*\nUse: .animewatchlist add <title>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        return reply(
          `╔════╗\n` +
          `  𓆘 *YOUR WATCHLIST*\n` +
          `╚════╝\n\n` +
          db[sender].map((t, i) => `${i + 1}. ${t}`).join('\n') +
          `\n\n📊 Total: ${db[sender].length} anime\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }
      if (action === 'add') {
        if (!title) return reply(h.demonError('animewatchlist', 'animewatchlist add <anime title>'));
        if (db[sender].includes(title)) return reply(`⚠️ *${title}* is already in your watchlist, dumbass.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        db[sender].push(title);
        saveDB('anime_watchlist.json', db);
        return reply(`✅ Added *${title}* to your watchlist!\n📋 Total: ${db[sender].length}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'remove') {
        if (!title) return reply(h.demonError('animewatchlist', 'animewatchlist remove <anime title>'));
        const idx = db[sender].indexOf(title);
        if (idx === -1) return reply(h.demonFail(`*${title}* not found in your watchlist`));
        db[sender].splice(idx, 1);
        saveDB('anime_watchlist.json', db);
        return reply(`🗑️ Removed *${title}* from your watchlist.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'clear') {
        db[sender] = [];
        saveDB('anime_watchlist.json', db);
        return reply(`🗑️ Watchlist cleared. Back to zero, you absolute slacker.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(h.demonError('animewatchlist', 'animewatchlist add | remove | list | clear'));
    }
  },

  {
    command: 'openingtheme',
    aliases: ['animeopening', 'animeop', 'opening'],
    category: 'shadowutilities',
    description: 'Get the opening theme info for an anime. Usage: openingtheme <anime name>',
    execute: async ({ args, reply }) => {
      const name = args.join(' ');
      if (!name) return reply(h.demonError('openingtheme', 'openingtheme <anime name>'));
      try {
        await reply(`🎵 Fetching opening theme for *${name}*...`);
        const search = await axios.get(`${JIKAN}/anime?q=${encodeURIComponent(name)}&limit=1`, { timeout: 15000 });
        const anime = search.data.data?.[0];
        if (!anime) return reply(h.demonFail(`anime not found: *${name}*`));
        const detail = await axios.get(`${JIKAN}/anime/${anime.mal_id}/themes`, { timeout: 15000 });
        const openings = detail.data.data?.openings;
        const endings = detail.data.data?.endings;
        if (!openings?.length) return reply(h.demonFail(`no theme data for *${anime.title}*`));
        reply(
          `╔════╗\n` +
          `  𓆘 *ANIME THEMES*\n` +
          `╚════╝\n\n` +
          `📺 *${anime.title}*\n\n` +
          `🎵 *OPENINGS (${openings.length}):*\n` +
          openings.slice(0, 5).map((o, i) => `${i + 1}. ${o}`).join('\n') +
          (endings?.length ? `\n\n🎶 *ENDINGS (${endings.length}):*\n` + endings.slice(0, 3).map((e, i) => `${i + 1}. ${e}`).join('\n') : '') +
          `\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`theme fetch failed — ${e.message}`)); }
    }
  },

];
