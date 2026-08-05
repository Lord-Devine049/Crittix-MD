/*
 * TOOLS-FINAL.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: currencyconvert, moviepoll, hashconvert, dicephrase, moodtracker,
 *           passwordgen2, emojimath, factseries, cryptowatch, phrasechain
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

module.exports = [

  {
    command: 'currencyconvert',
    aliases: ['convertcurrency', 'fxconvert'],
    category: 'soultools',
    description: 'Convert between currencies. Usage: currencyconvert 100 USD ZAR',
    execute: async ({ args, reply }) => {
      const [amount, from, to] = args;
      if (!amount || !from || !to) return reply(h.demonError('.currencyconvert', '.currencyconvert <amount> <FROM> <TO> — e.g. .currencyconvert 100 USD ZAR'));
      const num = parseFloat(amount);
      if (isNaN(num)) return reply(h.demonFail('invalid amount'));
      const fromCode = from.toUpperCase();
      const toCode = to.toUpperCase();
      try {
        const res = await axios.get(`https://open.er-api.com/v6/latest/${fromCode}`, { timeout: 8000 });
        if (res.data.result !== 'success') return reply(h.demonFail(`unsupported currency: ${fromCode}`));
        const rate = res.data.rates[toCode];
        if (!rate) return reply(h.demonFail(`unsupported target currency: ${toCode}`));
        const converted = (num * rate).toFixed(4);
        const rateStr = rate.toFixed(6);
        reply(
          `💱 *CURRENCY CONVERSION*\n\n` +
          `${num.toLocaleString()} ${fromCode} = *${parseFloat(converted).toLocaleString()} ${toCode}*\n\n` +
          `📈 Rate: 1 ${fromCode} = ${rateStr} ${toCode}\n` +
          `🕐 Rate updated: ${res.data.time_last_update_utc?.slice(0, 16) || 'recently'}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`currency lookup failed — ${e.message}`)); }
    }
  },

  {
    command: 'moviepoll',
    aliases: ['filmvote', 'movievote'],
    category: 'soultools',
    description: 'Start a group poll to pick a movie to watch. Usage: moviepoll start <movie1> | <movie2> | vote 1/2 | results',
    groupOnly: true,
    execute: async ({ chatId, sender, senderNumber, args, reply, isOwner, isSudo, sock }) => {
      const polls = loadDB('movie-poll.json');
      if (!polls[chatId]) polls[chatId] = null;
      const action = args[0]?.toLowerCase();
      if (action === 'start') {
        if (!await h.isSenderAdmin(sock, chatId, sender))
          return reply(h.demonFail('only admins can start a movie poll'));
          if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
        const raw = args.slice(1).join(' ');
        const options = raw.split('|').map(s => s.trim()).filter(Boolean);
        if (options.length < 2) return reply(h.demonError('.moviepoll', '.moviepoll start <Movie 1> | <Movie 2> | <Movie 3>'));
        polls[chatId] = { options, votes: {}, started: Date.now() };
        saveDB('movie-poll.json', polls);
        const list = options.map((o, i) => `*${i + 1}.* ${o}`).join('\n');
        return reply(`🎬 *MOVIE POLL STARTED*\n\n${list}\n\nVote with: .moviepoll vote <number>\nResults: .moviepoll results\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const poll = polls[chatId];
      if (!poll) return reply(h.demonFail('no active movie poll. Admin can start one with .moviepoll start'));
      if (action === 'results') {
        const tally = {};
        poll.options.forEach((_, i) => tally[i] = 0);
        Object.values(poll.votes).forEach(v => tally[v] = (tally[v] || 0) + 1);
        const total = Object.values(tally).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
        const lines = sorted.map(([i, c]) => {
          const pct = total ? Math.round((c / total) * 100) : 0;
          const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
          return `${poll.options[i]}: ${bar} ${c} (${pct}%)`;
        }).join('\n');
        return reply(`🎬 *MOVIE POLL RESULTS*\n\n${lines}\n\nTotal votes: ${total}\n🏆 Winner: *${poll.options[parseInt(sorted[0][0])]}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'vote') {
        const choice = parseInt(args[1]) - 1;
        if (isNaN(choice) || choice < 0 || choice >= poll.options.length)
          return reply(h.demonFail(`pick a number between 1 and ${poll.options.length}`));
        poll.votes[sender] = choice;
        saveDB('movie-poll.json', polls);
        return reply(`🎬 @${senderNumber} voted for *${poll.options[choice]}* ✅\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(h.demonError('.moviepoll', '.moviepoll start <Movie1> | <Movie2> | vote <number> | results'));
    }
  },

  {
    command: 'hashconvert',
    aliases: ['texthash', 'genhash'],
    category: 'soultools',
    description: 'Convert text to md5, sha1, sha256 or sha512 hash. Usage: hashconvert sha256 <text>',
    execute: async ({ args, text, reply }) => {
      const algo = args[0]?.toLowerCase();
      const input = args.slice(1).join(' ').trim();
      const supported = ['md5', 'sha1', 'sha256', 'sha512'];
      if (!algo || !supported.includes(algo) || !input) {
        return reply(h.demonError('.hashconvert', `.hashconvert <${supported.join('|')}> <text>`));
      }
      const hash = crypto.createHash(algo).update(input).digest('hex');
      reply(
        `🔐 *HASH CONVERTER*\n\n` +
        `📝 Input: \`${input.slice(0, 100)}\`\n` +
        `⚙️ Algorithm: *${algo.toUpperCase()}*\n` +
        `🔑 Hash:\n\`\`\`${hash}\`\`\`\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'dicephrase',
    aliases: ['dicewords', 'passphraseroll'],
    category: 'soultools',
    description: 'Generate a random passphrase using dice-word style. Usage: dicephrase <word-count 3-8>',
    execute: async ({ args, reply }) => {
      const wordlist = [
        'cobra','nova','blaze','storm','cipher','vault','echo','delta','razor','frost','viper',
        'titan','ghost','apex','rogue','saber','flux','surge','chrome','wraith','ember','forge',
        'lunar','nexus','orbit','prism','quartz','relay','shadow','torque','ultra','vector',
        'warden','xenon','yield','zenith','anchor','beacon','comet','drone','elite','falcon',
        'gambit','hunter','impact','javelin','knight','lance','matrix','nitro','onyx','pulse',
        'quake','rampart','stealth','thunder','unity','venom','whisper','xray','yak','zero'
      ];
      const count = Math.min(Math.max(parseInt(args[0]) || 4, 3), 8);
      const words = Array.from({ length: count }, () => wordlist[Math.floor(Math.random() * wordlist.length)]);
      const phrase = words.join('-');
      const diceRolls = words.map(() => Math.floor(Math.random() * 6) + 1);
      reply(
        `🎲 *DICE PASSPHRASE*\n\n` +
        `🔑 Phrase: \`\`\`${phrase}\`\`\`\n` +
        `🎯 Words: ${count}\n` +
        `🎲 Dice: ${diceRolls.join(', ')}\n\n` +
        `Strong. Random. Crittix-approved. 😤\n\n` +
        `⚠️ Save it somewhere safe. The bot won't remember it.\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'moodtracker',
    aliases: ['logmood', 'dailymood'],
    category: 'soultools',
    description: 'Log your personal daily mood privately. Usage: moodtracker <mood/emoji> | moodtracker history',
    execute: async ({ sender, senderNumber, args, reply }) => {
      const moods = loadDB('mood-tracker.json');
      if (!moods[sender]) moods[sender] = [];
      const action = args[0]?.toLowerCase();
      if (action === 'history') {
        const entries = moods[sender].slice(-7);
        if (!entries.length) return reply(`📊 No mood logs yet.\n\nStart logging: .moodtracker 😊\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        const lines = entries.reverse().map(e => `• ${e.date}: ${e.mood}`).join('\n');
        return reply(`📊 *MOOD HISTORY — @${senderNumber}*\n\n${lines}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const moodInput = args.join(' ').slice(0, 50).trim();
      if (!moodInput) return reply(h.demonError('.moodtracker', '.moodtracker <mood or emoji> | .moodtracker history'));
      const today = new Date().toISOString().slice(0, 10);
      const existing = moods[sender].findIndex(e => e.date === today);
      if (existing >= 0) moods[sender][existing].mood = moodInput;
      else moods[sender].push({ date: today, mood: moodInput });
      if (moods[sender].length > 90) moods[sender] = moods[sender].slice(-90);
      saveDB('mood-tracker.json', moods);
      reply(`✅ *MOOD LOGGED*\n\n📅 ${today}: *${moodInput}*\n\nKept private. Check your history: .moodtracker history\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },


  {
    command: 'emojimath',
    aliases: ['mathemoji', 'emojicalc'],
    category: 'soultools',
    description: 'Solve simple math problems shown with emoji counts. Usage: emojimath',
    execute: async ({ reply }) => {
      const emojis = ['🍕','⭐','🔥','💎','🎯','🏆','💀','👑','🎲','🐍'];
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      const ops = ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      let answer;
      if (op === '+') answer = a + b;
      else if (op === '-') answer = a - b;
      else answer = a * b;
      const rowA = emoji.repeat(a);
      const rowB = emoji.repeat(Math.abs(b));
      const key = `emojimath_${Date.now()}`;
      reply(
        `🧮 *EMOJI MATH CHALLENGE*\n\n` +
        `${rowA}\n` +
        `${op === '-' ? '➖ ' : op === '+' ? '➕ ' : '✖️ '} ${rowB}\n\n` +
        `❓ ${a} ${op} ${b} = ?\n\n` +
        `Answer: ||${answer}||\n\n` +
        `(The answer is hidden — reveal it to check!)\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'factseries',
    aliases: ['topicfacts', 'factblast'],
    category: 'soultools',
    description: 'Get 5 rapid facts on a topic. Usage: factseries <topic>',
    execute: async ({ args, reply }) => {
      const topic = args.join(' ').toLowerCase().trim();
      if (!topic) return reply(h.demonError('.factseries', '.factseries <topic> — e.g. .factseries sharks | .factseries bitcoin'));
      const topicData = {
        sharks: [
          'Sharks have been around for over 450 million years — older than trees.',
          'Most sharks must keep moving to breathe. Stop swimming = stop breathing.',
          'Sharks can detect one part of blood in 100 million parts of water.',
          'Greenland sharks can live over 400 years, making them the longest-lived vertebrates.',
          'Sharks have no bones — their skeleton is made entirely of cartilage.'
        ],
        bitcoin: [
          'Bitcoin\'s creator, Satoshi Nakamoto, is still unknown. The identity is a complete mystery.',
          'Only 21 million Bitcoin will ever exist. About 19.5 million are already mined.',
          'Bitcoin\'s first real-world purchase was 2 pizzas for 10,000 BTC in 2010.',
          'The Bitcoin blockchain has never been hacked. Individual wallets and exchanges have — not the chain.',
          'About 20% of all Bitcoin is estimated to be permanently lost due to lost wallets/keys.'
        ],
        octopus: [
          'Octopuses have three hearts and blue blood.',
          'Each octopus arm has its own mini-brain and can act independently.',
          'Octopuses can edit their own RNA on the fly to adapt to cold temperatures.',
          'They can unscrew jars from the inside. Labs have documented this repeatedly.',
          'Octopuses live alone and die shortly after reproducing.'
        ],
        sleep: [
          'Humans spend about 26 years sleeping over a lifetime.',
          'Your brain is more active during REM sleep than when you\'re awake.',
          'The record for longest time without sleep is 11 days, 25 minutes — held by Randy Gardner.',
          'Sleep deprivation kills faster than food deprivation.',
          'You can\'t sneeze while sleeping — muscle atonia prevents it.'
        ],
        money: [
          'The US $1 bill lasts about 18 months before wearing out.',
          'More Monopoly money is printed each year than real money worldwide.',
          'The word "salary" comes from the Latin "salarium" — Roman soldiers were paid in salt.',
          'ATMs had to pass a test where drunk people could use them successfully to be approved.',
          'Credit cards were originally called "Charg-It" cards when introduced in 1946.'
        ]
      };
      const key = Object.keys(topicData).find(k => topic.includes(k));
      if (key) {
        const facts = topicData[key];
        const lines = facts.map((f, i) => `${i + 1}. ${f}`).join('\n\n');
        return reply(`📚 *5 FACTS: ${key.toUpperCase()}*\n\n${lines}\n\nKnowledge is a weapon. Keep loading it. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      try {
        const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`, { timeout: 8000 });
        const extract = res.data.extract;
        if (!extract) return reply(h.demonFail(`no facts found for "${topic}". Try: sharks, bitcoin, octopus, sleep, money`));
        const sentences = extract.match(/[^.!?]+[.!?]+/g) || [];
        const selected = sentences.slice(0, 5).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n\n');
        reply(`📚 *FACT SERIES: ${topic.toUpperCase()}*\n\n${selected}\n\nVia Wikipedia.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch { reply(h.demonFail(`couldn't find facts on "${topic}". Try: sharks, bitcoin, octopus, sleep, money`)); }
    }
  },

  {
    command: 'cryptowatch',
    aliases: ['coinwatch', 'trackprice'],
    category: 'soultools',
    description: 'Watch live price of any crypto. Usage: cryptowatch <coin> e.g. cryptowatch bitcoin',
    execute: async ({ args, reply }) => {
      const coin = args.join('').toLowerCase().trim() || 'bitcoin';
      const aliases = { btc: 'bitcoin', eth: 'ethereum', bnb: 'binancecoin', sol: 'solana', doge: 'dogecoin', ada: 'cardano', xrp: 'ripple', dot: 'polkadot', matic: 'matic-network', shib: 'shiba-inu' };
      const id = aliases[coin] || coin;
      try {
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd,zar&include_24hr_change=true&include_market_cap=true`, { timeout: 8000 });
        const data = res.data[id];
        if (!data) return reply(h.demonFail(`coin "${coin}" not found. Try: bitcoin, ethereum, solana, dogecoin, cardano`));
        const change = data.usd_24h_change?.toFixed(2);
        const changeArrow = change > 0 ? '📈' : '📉';
        const mcap = data.usd_market_cap ? `$${(data.usd_market_cap / 1e9).toFixed(2)}B` : 'N/A';
        reply(
          `💹 *${id.toUpperCase()} LIVE PRICE*\n\n` +
          `💵 USD: *$${data.usd?.toLocaleString()}*\n` +
          `🇿🇦 ZAR: *R${data.zar?.toLocaleString()}*\n` +
          `${changeArrow} 24h Change: *${change}%*\n` +
          `📊 Market Cap: *${mcap}*\n\n` +
          `Data: CoinGecko 😤\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(h.demonFail(`price lookup failed — ${e.message}`)); }
    }
  },

  {
    command: 'phrasechain',
    aliases: ['phraselink', 'chainwords'],
    category: 'soultools',
    description: 'Each player adds a word that starts with the last letter of the previous word. Usage: phrasechain start | phrasechain <word>',
    groupOnly: true,
    execute: async ({ chatId, sender, senderNumber, args, reply }) => {
      const chains = loadDB('phrase-chains.json');
      if (!chains[chatId]) chains[chatId] = null;
      const action = args[0]?.toLowerCase();
      if (action === 'start') {
        const starters = ['apple', 'eagle', 'energy', 'yellow', 'wonder', 'night', 'tiger', 'ember', 'rapid', 'dream'];
        const starter = starters[Math.floor(Math.random() * starters.length)];
        chains[chatId] = { words: [starter], lastSender: null, started: Date.now() };
        saveDB('phrase-chains.json', chains);
        return reply(`🔗 *PHRASE CHAIN STARTED*\n\nFirst word: *${starter}*\n\nAdd a word starting with: *${starter.slice(-1).toUpperCase()}*\nCommand: .phrasechain <word>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const chain = chains[chatId];
      if (!chain) return reply(h.demonFail('no active phrase chain. Start with .phrasechain start'));
      if (action === 'end') {
        const final = chain.words.join(' → ');
        chains[chatId] = null;
        saveDB('phrase-chains.json', chains);
        return reply(`🏁 *PHRASE CHAIN ENDED*\n\n${final}\n\n${chain.words.length} words total. Not bad. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const word = action?.replace(/[^a-z]/gi, '').toLowerCase();
      if (!word || word.length < 2) return reply(h.demonError('.phrasechain', '.phrasechain <word>'));
      if (chain.lastSender === sender) return reply(h.demonFail('not so fast — let someone else go before you play again'));
      if (chain.words.includes(word)) return reply(h.demonFail(`"${word}" was already used`));
      const lastWord = chain.words[chain.words.length - 1];
      const required = lastWord.slice(-1).toLowerCase();
      if (word[0].toLowerCase() !== required) return reply(h.demonFail(`word must start with *${required.toUpperCase()}* (last letter of "${lastWord}")`));
      chain.words.push(word);
      chain.lastSender = sender;
      saveDB('phrase-chains.json', chains);
      reply(`✅ @${senderNumber} played: *${word}*\n\nNext word must start with: *${word.slice(-1).toUpperCase()}*\n📊 Chain length: ${chain.words.length}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }

];
