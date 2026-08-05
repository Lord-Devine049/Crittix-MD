
const axios = require('axios');

// ── Riddle store: chatId → { answer: string, msgId: string, expiry: number }
if (!global.riddleStore) global.riddleStore = new Map();

const riddles = [
  { q: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?", a: "a map" },
  { q: "The more you take, the more you leave behind. What am I?", a: "footsteps" },
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", a: "an echo" },
  { q: "What has hands but can't clap?", a: "a clock" },
  { q: "I have a head and a tail but no body. What am I?", a: "a coin" },
  { q: "The more you feed me, the more I grow. Give me water and I die. What am I?", a: "fire" },
  { q: "I'm light as a feather but the strongest person can't hold me for more than a few minutes. What am I?", a: "breath" },
  { q: "What gets wetter as it dries?", a: "a towel" },
  { q: "What can you catch but not throw?", a: "a cold" },
  { q: "I have an eye but cannot see. What am I?", a: "a needle" },
];

const neverHaveIEver = [
  "Never have I ever sent a message to the wrong person 📱",
  "Never have I ever lied about my age 🎂",
  "Never have I ever cried at a movie 🎬",
  { text: "Never have I ever stayed awake for 24+ hours straight 😴" },
  "Never have I ever eaten an entire pizza alone 🍕",
  "Never have I ever forgotten someone's name right after being introduced 😅",
  "Never have I ever faked being sick to skip school/work 🤒",
  "Never have I ever stalked someone's social media for hours 👀",
  "Never have I ever dropped my phone in water 💦",
  "Never have I ever ghosted someone 👻",
];

const wyr2 = [
  "Would you rather be able to fly ✈️ OR be invisible 👁️?",
  "Would you rather live in the past 🕰️ OR the future 🚀?",
  "Would you rather have unlimited money 💰 OR unlimited time ⏰?",
  "Would you rather be the funniest person alive 😂 OR the smartest 🧠?",
  "Would you rather eat only sweet food 🍰 OR only spicy food 🌶️ forever?",
  "Would you rather lose your phone 📱 OR your wallet 💳?",
  "Would you rather speak every language 🌍 OR play every instrument 🎵?",
  "Would you rather have 3 true friends 👥 OR 1000 fake ones?",
  "Would you rather control time ⏳ OR control minds 🧠?",
  "Would you rather explore space 🚀 OR the deep ocean 🌊?",
];

const rouletteMsg = ['🟢 SAFE! The chamber was empty. You live to play another round!',
  '🟢 SAFE! Lucky you... this time.',
  '🟢 SAFE! The bullet wasn\'t for you today.',
  '🔴 💥 BANG! You\'re out. Better luck in the afterlife!'];

const animalFacts = {
  slap: { emoji: '👋', actions: ['slapped', 'smacked', 'whacked', 'bonked'] },
  hug: { emoji: '🤗', actions: ['hugged', 'embraced', 'squeezed', 'cuddled'] },
  pat: { emoji: '🫂', actions: ['patted', 'gently patted', 'headpatted', 'patted tenderly'] },
  shoot: { emoji: '🔫', actions: ['shot', 'blasted', 'sniped', 'fired at'] },
  punch: { emoji: '👊', actions: ['punched', 'decked', 'knocked out', 'uppercut'] },
};

module.exports = [
  {
    command: 'neverhaveiever',
    aliases: ['nhie', 'never'],
    category: 'arena',
    description: 'Get a random Never Have I Ever prompt',
    execute: async ({ reply }) => {
      const item = neverHaveIEver[Math.floor(Math.random() * neverHaveIEver.length)];
      const text = typeof item === 'string' ? item : item.text;
      reply(`🍷 *Never Have I Ever*\n\n${text}\n\n_Drink if you have!_ 🥂`);
    }
  },
  {
    command: 'roulette',
    aliases: ['russianroulette', 'spingun'],
    category: 'arena',
    description: 'Play Russian Roulette (1 in 4 chance)',
    execute: async ({ reply }) => {
      const chance = Math.floor(Math.random() * 4);
      await new Promise(r => setTimeout(r, 1200));
      reply(`🔫 *Russian Roulette*\n\n_*click*_\n\n${rouletteMsg[chance]}`);
    }
  },
  {
    command: 'anagram',
    aliases: ['scrambleword', 'wordscramble'],
    category: 'arena',
    description: 'Scramble a word into an anagram',
    execute: async ({ text, reply }) => {
      if (!text) return reply('🔤 *Usage:* anagram yourword');
      const word = text.trim().toLowerCase();
      const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
      reply(`🔤 *Anagram Scramble*\n\nOriginal: *${word}*\nScrambled: *${scrambled}*\n\n_Can you unscramble it?_`);
    }
  },
  {
    command: 'emojiquiz',
    aliases: [ 'guessmovie'],
    category: 'arena',
    description: 'Guess the movie/show from emojis',
    execute: async ({ reply }) => {
      const quizzes = [
        { q: '🦁👑🌍', a: 'The Lion King' },
        { q: '🧙‍♂️💍🔥🌋', a: 'The Lord of the Rings' },
        { q: '🕷️🏙️🕸️', a: 'Spider-Man' },
        { q: '🧊👸❄️', a: 'Frozen' },
        { q: '🐟👓🌊🔍', a: 'Finding Nemo' },
        { q: '🚂⚡🏰🧙', a: 'Harry Potter' },
        { q: '🦇🌃💰🏙️', a: 'Batman' },
        { q: '🌀🔵🌌🦸', a: 'Avatar' },
        { q: '🧟💀🔫🌍', a: 'The Walking Dead' },
        { q: '🚀🤖❤️🌱', a: 'WALL-E' },
      ];
      const q = quizzes[Math.floor(Math.random() * quizzes.length)];
      reply(`🎬 *Emoji Quiz*\n\n${q.q}\n\n🎯 Guess the movie!\n\n||*Answer: ${q.a}*||`);
    }
  },
  {
    command: 'slap',
    aliases: ['bslap', 'smack'],
    category: 'shadowstrike',
    description: 'Slap someone with an anime GIF. Usage: slap @user',
    execute: async ({ sock, chatId, msg, text, reply }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || (text && text.replace(/[^0-9]/g,'') ? text.replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      const sender = msg.key.participant || msg.key.remoteJid;
      const sNum = sender.split('@')[0];
      const tNum = target ? target.split('@')[0] : 'someone';
      const caption = `👋 *@${sNum}* slapped *@${tNum}*! 💥\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
      try {
        const res = await axios.get('https://waifu.pics/api/sfw/slap', { timeout: 8000 });
        const gifUrl = res.data?.url;
        if (!gifUrl) throw new Error('no gif');
        await sock.sendMessage(chatId, { video: { url: gifUrl }, gifPlayback: true, caption, mentions: [sender, target].filter(Boolean) }, { quoted: msg });
      } catch { reply(caption, { mentions: [sender, target].filter(Boolean) }); }
    }
  },
  {
    command: 'hug',
    aliases: ['embrace'],
    category: 'shadowstrike',
    description: 'Hug someone with an anime GIF. Usage: hug @user',
    execute: async ({ sock, chatId, msg, text, reply }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || (text && text.replace(/[^0-9]/g,'') ? text.replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      const sender = msg.key.participant || msg.key.remoteJid;
      const sNum = sender.split('@')[0];
      const tNum = target ? target.split('@')[0] : 'everyone';
      const caption = `🤗 *@${sNum}* hugged *@${tNum}*! 💜\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
      try {
        const res = await axios.get('https://waifu.pics/api/sfw/hug', { timeout: 8000 });
        const gifUrl = res.data?.url;
        if (!gifUrl) throw new Error('no gif');
        await sock.sendMessage(chatId, { video: { url: gifUrl }, gifPlayback: true, caption, mentions: [sender, target].filter(Boolean) }, { quoted: msg });
      } catch { reply(caption, { mentions: [sender, target].filter(Boolean) }); }
    }
  },
  {
    command: 'pat',
    aliases: ['headpat', 'petpet'],
    category: 'shadowstrike',
    description: 'Pat someone on the head with an anime GIF. Usage: pat @user',
    execute: async ({ sock, chatId, msg, text, reply }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || (text && text.replace(/[^0-9]/g,'') ? text.replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      const sender = msg.key.participant || msg.key.remoteJid;
      const sNum = sender.split('@')[0];
      const tNum = target ? target.split('@')[0] : 'someone';
      const caption = `🫂 *@${sNum}* patted *@${tNum}*! 🐾\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
      try {
        const res = await axios.get('https://waifu.pics/api/sfw/pat', { timeout: 8000 });
        const gifUrl = res.data?.url;
        if (!gifUrl) throw new Error('no gif');
        await sock.sendMessage(chatId, { video: { url: gifUrl }, gifPlayback: true, caption, mentions: [sender, target].filter(Boolean) }, { quoted: msg });
      } catch { reply(caption, { mentions: [sender, target].filter(Boolean) }); }
    }
  },
  {
    command: 'punch',
    aliases: ['hit', 'bop'],
    category: 'shadowstrike',
    description: 'Punch someone with an anime GIF. Usage: punch @user',
    execute: async ({ sock, chatId, msg, text, reply }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || (text && text.replace(/[^0-9]/g,'') ? text.replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null);
      const sender = msg.key.participant || msg.key.remoteJid;
      const sNum = sender.split('@')[0];
      const tNum = target ? target.split('@')[0] : 'someone';
      const caption = `👊 *@${sNum}* punched *@${tNum}*! 💥\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
      try {
        const res = await axios.get('https://waifu.pics/api/sfw/bonk', { timeout: 8000 });
        const gifUrl = res.data?.url;
        if (!gifUrl) throw new Error('no gif');
        await sock.sendMessage(chatId, { video: { url: gifUrl }, gifPlayback: true, caption, mentions: [sender, target].filter(Boolean) }, { quoted: msg });
      } catch { reply(caption, { mentions: [sender, target].filter(Boolean) }); }
    }
  },
  {
    command: 'lovecheck',
    aliases: ['lovemeter', 'lovecalc2'],
    category: 'arena',
    description: 'Check love compatibility between two names. Usage: lovecheck Name1 | Name2',
    execute: async ({ text, reply }) => {
      if (!text || !text.includes('|')) return reply('💕 *Usage:* lovecheck Name1 | Name2');
      const [a, b] = text.split('|').map(s => s.trim());
      const seed = (a + b).split('').reduce((acc,c) => acc + c.charCodeAt(0), 0);
      const pct = (seed % 101);
      const bar = '❤️'.repeat(Math.floor(pct/10)) + '🖤'.repeat(10 - Math.floor(pct/10));
      const msgs = pct >= 80 ? '💍 Soulmates!' : pct >= 60 ? '💑 Great match!' : pct >= 40 ? '😊 Could work!' : pct >= 20 ? '😬 Might struggle...' : '💀 Run!';
      reply(`💕 *Love Check*\n\n👤 ${a} × ${b} 👤\n\n${bar}\n\n❤️ *${pct}%* • ${msgs}`);
    }
  },
  {
    command: 'complimentbattle',
    aliases: ['compbattle', 'cbattle'],
    category: 'arena',
    description: 'Tag two people to get a compliment battle result. Usage: complimentbattle @a @b',
    execute: async ({ msg, text, reply }) => {
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (mentions.length < 2) return reply('💬 *Usage:* complimentbattle @person1 @person2');
      const [a, b] = mentions;
      const compliments = [
        'a radiant ball of sunshine ☀️',
        'the most charismatic person in any room 💫',
        'someone whose smile can cure sadness 😊',
        'a diamond in the rough 💎',
        'the kind of soul that lifts everyone around them 🌟',
        'pure positive energy bottled in human form ✨',
      ];
      const ca = compliments[Math.floor(Math.random() * compliments.length)];
      const cb = compliments[Math.floor(Math.random() * compliments.length)];
      const winner = Math.random() > 0.5 ? a : b;
      reply(`💬 *Compliment Battle*\n\n@${a.split('@')[0]} is ${ca}\n@${b.split('@')[0]} is ${cb}\n\n🏆 *Winner:* @${winner.split('@')[0]}!`, { mentions: [a, b] });
    }
  },
  {
    command: 'dirtyjokes',
    aliases: ['dirtyj', 'spicyjoke'],
    category: 'arena',
    description: 'Get a (clean-ish) spicy joke',
    execute: async ({ reply }) => {
      const jokes = [
        "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
        "I asked my dog what two minus two is. He said nothing. 🐶",
        "Why don't scientists trust atoms? Because they make up everything! ⚛️",
        "My wife told me I had to stop acting like a flamingo. I had to put my foot down. 🦩",
        "I'm reading a book about anti-gravity. It's impossible to put down! 📚",
        "Why did the bicycle fall over? Because it was two-tired! 🚲",
        "I told my wife she was drawing her eyebrows too high. She looked surprised. 😲",
        "What do you call a fake noodle? An impasta! 🍝",
      ];
      reply(`😏 *Spicy Joke:*\n\n${jokes[Math.floor(Math.random() * jokes.length)]}`);
    }
  },
];
