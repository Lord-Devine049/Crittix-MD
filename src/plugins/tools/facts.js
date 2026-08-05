const axios = require('axios');

module.exports = [
  {
    command: 'catfact',
    aliases: ['catfacts', 'meowfact'],
    category: 'soultools',
    description: 'Get a random cat fact',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://catfact.ninja/fact', { timeout: 8000 });
        reply(`🐱 *Cat Fact*\n\n${r.data.fact}`);
      } catch {
        const facts = ['Cats sleep 12-16 hours a day. 😴', 'A group of cats is called a clowder.', 'Cats can make over 100 different sounds.', 'A cat\'s nose is as unique as a human fingerprint.'];
        reply(`🐱 *Cat Fact*\n\n${facts[Math.floor(Math.random()*facts.length)]}`);
      }
    }
  },
  {
    command: 'birdfact',
    aliases: ['birdfacts', 'tweetfact'],
    category: 'soultools',
    description: 'Get a random bird fact',
    execute: async ({ reply }) => {
      const facts = [
        'Owls can rotate their heads 270 degrees! 🦉',
        'Crows can recognize and remember human faces. 🐦‍⬛',
        'The Arctic Tern migrates 44,000 miles each year — the longest migration of any animal. 🌍',
        'Flamingos are born grey and turn pink from the food they eat. 🦩',
        'Hummingbirds are the only birds that can fly backwards. 🐦',
        'Penguins propose to their mates with pebbles. 🐧',
        'A parrot can live up to 80 years. 🦜',
        'Eagles have eyesight 4-8 times stronger than humans. 🦅',
        'Woodpeckers peck 20 times per second. 🪶',
        'Swans mate for life. 🦢',
      ];
      reply(`🦜 *Bird Fact*\n\n${facts[Math.floor(Math.random()*facts.length)]}`);
    }
  },
  {
    command: 'numberfact',
    aliases: ['numfact', 'mathfact2'],
    category: 'soultools',
    description: 'Get a fact about a number. Usage: numberfact 42',
    execute: async ({ args, reply }) => {
      const num = parseInt(args[0]) || Math.floor(Math.random() * 1000);
      try {
        const r = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 8000 });
        reply(`🔢 *Number Fact: ${num}*\n\n${r.data}`);
      } catch {
        reply(`🔢 *Number Fact: ${num}*\n\n${num} is ${num % 2 === 0 ? 'even' : 'odd'} and ${num > 0 ? 'positive' : 'negative'}. Its square is ${num*num}.`);
      }
    }
  },
  {
    command: 'yearfact',
    aliases: ['historyyear', 'yearinfo'],
    category: 'soultools',
    description: 'Get a fact about a year. Usage: yearfact 1969',
    execute: async ({ args, reply }) => {
      const year = parseInt(args[0]) || new Date().getFullYear() - Math.floor(Math.random()*50);
      try {
        const r = await axios.get(`http://numbersapi.com/${year}/year`, { timeout: 8000 });
        reply(`📅 *Year Fact: ${year}*\n\n${r.data}`);
      } catch {
        reply(`📅 *Year Fact: ${year}*\n\n${year} was ${new Date().getFullYear() - year} years ago!`);
      }
    }
  },
  {
    command: 'spacefact',
    aliases: ['astronomyfact', 'universefact'],
    category: 'soultools',
    description: 'Get a random space/astronomy fact',
    execute: async ({ reply }) => {
      const facts = [
        '🌌 There are more stars in the universe than grains of sand on all Earth\'s beaches combined.',
        '☀️ Light from the Sun takes 8 minutes and 20 seconds to reach Earth.',
        '🪐 Saturn is so light it would float in water (if there was a bathtub big enough).',
        '🌙 The Moon is moving away from Earth at 3.8 cm per year.',
        '⭐ Neutron stars are so dense, a teaspoon of one would weigh a billion tons.',
        '🚀 A year on Venus is shorter than a day on Venus.',
        '💫 There are an estimated 2 trillion galaxies in the observable universe.',
        '🌍 Earth is the only planet not named after a god.',
        '☄️ The asteroid belt contains millions of asteroids but 99% of its mass is just 4 large bodies.',
        '🌑 A black hole the mass of the Sun would be only 6km wide.',
      ];
      reply(`🚀 *Space Fact*\n\n${facts[Math.floor(Math.random()*facts.length)]}`);
    }
  },
  {
    command: 'techfact',
    aliases: ['techfacts', 'codefact'],
    category: 'soultools',
    description: 'Get a random technology fact',
    execute: async ({ reply }) => {
      const facts = [
        '💻 The first computer mouse was made of wood in 1964.',
        '🌐 There are over 1.9 billion websites on the internet.',
        '📧 About 333 billion emails are sent every day.',
        '🤖 The first computer bug was an actual bug — a moth trapped in a relay in 1947.',
        '📱 The average person checks their phone 96 times per day.',
        '💾 The first hard drive (IBM, 1956) could store 5MB and was the size of two refrigerators.',
        '🎮 The video game industry is worth more than the movie and music industries combined.',
        '🔒 The most common password is still "123456".',
        '🐍 Python is named after Monty Python, not the snake.',
        '⚡ Every minute, 500 hours of video are uploaded to YouTube.',
      ];
      reply(`💻 *Tech Fact*\n\n${facts[Math.floor(Math.random()*facts.length)]}`);
    }
  },
  {
    command: 'historyfact',
    aliases: ['histfact', 'historicalfact'],
    category: 'soultools',
    description: 'Get a random historical fact',
    execute: async ({ reply }) => {
      const facts = [
        '⚔️ The Great Wall of China is not visible from space with the naked eye — that\'s a myth!',
        '📜 Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.',
        '🍫 Chocolate was used as currency by the ancient Aztecs.',
        '🦕 The T-Rex lived closer in time to us than it did to the Stegosaurus.',
        '🎠 The Eiffel Tower was supposed to be demolished in 1909 but was saved because it made a great radio antenna.',
        '🏛️ The ancient Roman Empire had a population of 70-80 million people — about 21% of the world\'s population at the time.',
        '🐘 Mammoths were still alive when the Egyptian pyramids were built.',
        '🗺️ The shortest war in history lasted 38-45 minutes (Anglo-Zanzibar War, 1896).',
        '⚗️ Einstein never failed math — that is a complete myth.',
        '🎵 Beethoven was almost completely deaf when he composed his Ninth Symphony.',
      ];
      reply(`📜 *History Fact*\n\n${facts[Math.floor(Math.random()*facts.length)]}`);
    }
  },
  {
    command: 'wordofday',
    aliases: ['wod', 'dailyword'],
    category: 'soultools',
    description: 'Get an interesting word of the day with definition',
    execute: async ({ reply }) => {
      const words = [
        { word: 'Ephemeral', def: 'Lasting for a very short time.', example: '"The ephemeral beauty of cherry blossoms."' },
        { word: 'Sonder', def: 'The realization that each passerby has a life as vivid and complex as your own.', example: '"She felt a deep sonder walking through the crowded city."' },
        { word: 'Petrichor', def: 'The pleasant, earthy smell after rain.', example: '"The petrichor filled the air after the storm."' },
        { word: 'Serendipity', def: 'Finding something good without looking for it.', example: '"Their meeting was pure serendipity."' },
        { word: 'Mellifluous', def: 'Sweet or musical; pleasant to hear.', example: '"Her mellifluous voice filled the room."' },
        { word: 'Laconic', def: 'Using very few words.', example: '"His laconic response was simply: \'No.\'."' },
        { word: 'Ineffable', def: 'Too great or extreme to be expressed in words.', example: '"The ineffable joy of holding your child."' },
        { word: 'Hiraeth', def: 'A homesickness for a home you can\'t return to, or one that never was.', example: '"Travelling gave him a strange hiraeth."' },
      ];
      const w = words[Math.floor(Math.random()*words.length)];
      reply(`📚 *Word of the Day*\n\n🔤 *${w.word}*\n\n📖 ${w.def}\n\n💬 _${w.example}_`);
    }
  },
  {
    command: 'randomjoke',
    aliases: [],
    category: 'soultools',
    description: 'Get a random two-part joke',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 8000 });
        reply(`😂 *Joke:*\n\n${r.data.setup}\n\n||${r.data.punchline}||`);
      } catch {
        const jokes = [
          { s: 'Why do programmers prefer dark mode?', p: 'Because light attracts bugs! 🐛' },
          { s: 'Why did the JavaScript developer wear glasses?', p: 'Because he couldn\'t C#! 😂' },
          { s: 'What do you call a fish without eyes?', p: 'A fsh! 🐟' },
        ];
        const j = jokes[Math.floor(Math.random()*jokes.length)];
        reply(`😂 *Joke:*\n\n${j.s}\n\n||${j.p}||`);
      }
    }
  },
  {
    command: 'motivation',
    aliases: ['motivate', 'inspire2'],
    category: 'soultools',
    description: 'Get a motivational quote or message',
    execute: async ({ reply }) => {
      const quotes = [
        '"The secret of getting ahead is getting started." — Mark Twain',
        '"It does not matter how slowly you go as long as you do not stop." — Confucius',
        '"Life is what happens when you\'re busy making other plans." — John Lennon',
        '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt',
        '"You miss 100% of the shots you don\'t take." — Wayne Gretzky',
        '"Whether you think you can or you think you can\'t, you\'re right." — Henry Ford',
        '"The only way to do great work is to love what you do." — Steve Jobs',
        '"In the middle of every difficulty lies opportunity." — Albert Einstein',
        '"It\'s not whether you get knocked down, it\'s whether you get up." — Vince Lombardi',
        '"Believe you can and you\'re halfway there." — Theodore Roosevelt',
      ];
      reply(`⚡ *Motivation*\n\n${quotes[Math.floor(Math.random()*quotes.length)]}`);
    }
  },
  {
    command: 'uselessfact',
    aliases: ['wtffact2', 'randomtrivia'],
    category: 'soultools',
    description: 'Get a random useless but interesting fact',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 8000 });
        reply(`🤯 *Useless Fact*\n\n${r.data.text}`);
      } catch {
        const facts = [
          'A group of flamingos is called a "flamboyance." 🦩',
          'Honey never expires. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.',
          'Snails can sleep for 3 years straight. 🐌',
          'The shortest war lasted 38 minutes.',
          'Bananas are curved because they grow toward the sun. 🍌',
        ];
        reply(`🤯 *Useless Fact*\n\n${facts[Math.floor(Math.random()*facts.length)]}`);
      }
    }
  },
  {
    command: 'lifeadvice',
    aliases: ['lifetip', 'wisdomtip'],
    category: 'soultools',
    description: 'Get a random piece of life advice',
    execute: async ({ reply }) => {
      const advice = [
        '🌟 Spend less time comparing yourself to others and more time becoming who you want to be.',
        '💰 Invest in experiences over things — memories last longer than objects.',
        '😴 Prioritize sleep. A well-rested mind solves more problems than a tired one.',
        '📱 Set phone-free hours every day. Your brain needs space to breathe.',
        '🤝 The quality of your life is directly related to the quality of your relationships.',
        '📚 Read every day. Even 10 pages a day is 15 books a year.',
        '💪 The most important habit you can build is showing up consistently, even when you don\'t feel like it.',
        '🙏 Gratitude is the fastest way to shift your perspective.',
        '🏃 Your body is the vehicle for everything you want to do. Take care of it.',
        '🔥 Don\'t wait for the perfect moment. Take the moment and make it perfect.',
      ];
      reply(`💡 *Life Advice*\n\n${advice[Math.floor(Math.random()*advice.length)]}`);
    }
  },
  {
    command: 'iqtest',
    aliases: ['quickiq', 'braintest'],
    category: 'soultools',
    description: 'Quick brain test question',
    execute: async ({ reply }) => {
      const tests = [
        { q: 'A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost?', a: '5 cents ($0.05) — not 10 cents!' },
        { q: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?', a: '5 minutes! Each machine makes 1 widget in 5 minutes.' },
        { q: 'In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days to cover the lake, how long to cover half?', a: '47 days. On day 47 it is half — then doubles on day 48.' },
        { q: 'What comes once in a minute, twice in a moment, but never in a thousand years?', a: 'The letter M!' },
      ];
      const t = tests[Math.floor(Math.random()*tests.length)];
      reply(`🧠 *Brain Teaser*\n\n${t.q}\n\n_Think carefully before scrolling..._\n\n\n||💡 *Answer:* ${t.a}||`);
    }
  },
  {
    command: 'mythfact',
    aliases: ['bustedmyth', 'truorfalse'],
    category: 'soultools',
    description: 'Bust a popular myth with the real fact',
    execute: async ({ reply }) => {
      const myths = [
        { myth: '❌ Myth: We only use 10% of our brains.', fact: '✅ BUSTED: Brain scans show we use virtually all parts of the brain, and most of it is active almost all the time.' },
        { myth: '❌ Myth: Lightning never strikes the same place twice.', fact: '✅ BUSTED: The Empire State Building is struck by lightning about 23 times per year!' },
        { myth: '❌ Myth: Goldfish have a 3-second memory.', fact: '✅ BUSTED: Goldfish can remember things for months and can be trained.' },
        { myth: '❌ Myth: Humans have only 5 senses.', fact: '✅ BUSTED: Humans have at least 9 senses including balance, temperature, pain, and proprioception.' },
        { myth: '❌ Myth: Napoleon was very short.', fact: '✅ BUSTED: Napoleon was 5\'7" (170cm), above average height for his time.' },
        { myth: '❌ Myth: Bulls are enraged by the color red.', fact: '✅ BUSTED: Bulls are colorblind to red. It\'s the movement of the cape that provokes them.' },
      ];
      const m = myths[Math.floor(Math.random()*myths.length)];
      reply(`🔬 *Myth Busted!*\n\n${m.myth}\n\n${m.fact}`);
    }
  },
  {
    command: 'didyouknow',
    aliases: ['dyk', 'funlearn'],
    category: 'soultools',
    description: 'Get an amazing "Did You Know?" fact',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 8000 });
        reply(`🤩 *Did You Know?*\n\n${r.data.text}`);
      } catch {
        const facts = [
          '🤩 Did you know? Octopuses have three hearts and blue blood! 🐙',
          '🤩 Did you know? The Hawaiian alphabet only has 13 letters!',
          '🤩 Did you know? A shrimp\'s heart is in its head! 🦐',
          '🤩 Did you know? Wombat poop is cube-shaped. It\'s the only animal in the world that produces cube-shaped feces!',
        ];
        reply(facts[Math.floor(Math.random()*facts.length)]);
      }
    }
  },
];
