const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = [
  {
    command: 'chucknorris',
    aliases: ['chuckjoke', 'norrisfact'],
    category: 'creativetools',
    description: 'Get a random Chuck Norris joke',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://api.chucknorris.io/jokes/random', { timeout: 8000 });
        reply(`🥋 *Chuck Norris Fact:*\n\n${r.data.value}`);
      } catch {
        reply(`🥋 *Chuck Norris Fact:*\n\nChuck Norris doesn't use WhatsApp — WhatsApp uses him.`);
      }
    }
  },
  {
    command: 'dadjoke',
    aliases: ['dadjoke2', 'badjoke'],
    category: 'creativetools',
    description: 'Get a classic dad joke',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' }, timeout: 8000 });
        reply(`👨 *Dad Joke:*\n\n${r.data.joke}`);
      } catch {
        const jokes = [
          "I'm reading a book on anti-gravity. It's impossible to put down! 📚",
          "I asked my dog what 2 minus 2 is. He said nothing. 🐶",
          "What do you call a factory that makes okay products? A satisfactory! 🏭",
        ];
        reply(`👨 *Dad Joke:*\n\n${jokes[Math.floor(Math.random()*jokes.length)]}`);
      }
    }
  },
  {
    command: 'yomama',
    aliases: ['yomomma', 'mamamjoke'],
    category: 'creativetools',
    description: 'Get a Yo Mama joke',
    execute: async ({ reply }) => {
      const jokes = [
        "Yo mama is so slow, she took 9 months to make a joke! ⏰",
        "Yo mama is so kind, even her jokes are too nice to roast anyone. 🥰",
        "Yo mama is so strong, she opened a jar without complaining. 💪",
        "Yo mama's cooking is so good, even the smoke alarm cheers! 🔥",
        "Yo mama is so wise, she Googles before asking questions! 🧠",
        "Yo mama is so fancy, she puts on a robe to watch Netflix. 👘",
        "Yo mama is so punctual, she's always right on time... unlike this joke. ⏱️",
      ];
      reply(`😂 *Yo Mama:*\n\n${jokes[Math.floor(Math.random()*jokes.length)]}`);
    }
  },
  {
    command: 'pickupline',
    aliases: ['flirtline', 'cheesyline'],
    category: 'creativetools',
    description: 'Get a cheesy pickup line',
    execute: async ({ reply }) => {
      const lines = [
        "Are you a magician? Every time I look at you, everyone else disappears. 🎩",
        "Do you have a map? I keep getting lost in your eyes. 🗺️",
        "Are you made of copper and tellurium? Because you're CuTe. ⚗️",
        "Do you believe in love at first sight, or should I walk by again? 😏",
        "Is your name Google? Because you have everything I've been searching for. 🔍",
        "Are you a bank loan? Because you've got my interest. 💰",
        "Do you like science? Because I've got great chemistry with you. 🧪",
        "Are you a camera? Every time I look at you, I smile. 📸",
      ];
      reply(`💕 *Pick-Up Line:*\n\n${lines[Math.floor(Math.random()*lines.length)]}`);
    }
  },
  {
    command: 'wouldyourate',
    aliases: ['ratechoice', 'scoreit'],
    category: 'creativetools',
    description: 'Rate something out of 10. Usage: wouldyourate pizza',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the thing you want rated. example! .wouldyourate pineapple on pizza'));
      const score = Math.floor(Math.random() * 10) + 1;
      const stars = '⭐'.repeat(score) + '☆'.repeat(10-score);
      const comments = ['Terrible!','Pretty bad.','Meh.','Below average.','Average.','Not bad.','Decent.','Good.','Really good!','Absolutely amazing! 🔥'];
      reply(`⭐ *Rating: "${text}"*\n\n${stars}\n\n*${score}/10* — ${comments[score-1]}`);
    }
  },
  {
    command: 'randomquestion',
    aliases: ['randq', 'questionofday'],
    category: 'creativetools',
    description: 'Get a random thought-provoking question',
    execute: async ({ reply }) => {
      const questions = [
        "If you could have dinner with any 3 people (alive or dead), who would you choose and why? 🍽️",
        "What one skill do you wish you had mastered 5 years ago? 🎯",
        "If you could live in any era of history for one year, which would you pick? 📜",
        "What's one thing about yourself that you wish others understood better? 💭",
        "If you could wake up tomorrow with any superpower, what would it be and why? ⚡",
        "What's the most important lesson you've learned in the past year? 📚",
        "If money wasn't a concern, what would your ideal life look like? 🌈",
        "What's a belief you hold that most people around you would disagree with? 🤔",
        "If you could only watch one genre of movies for the rest of your life, what would it be? 🎬",
        "What's something you've always wanted to do but keep putting off? Why? 🚀",
      ];
      reply(`🤔 *Question of the Moment:*\n\n${questions[Math.floor(Math.random()*questions.length)]}`);
    }
  },
  {
    command: 'moodcheck',
    aliases: ['howufeeling'],
    category: 'creativetools',
    description: 'Get a random mood check-in prompt',
    execute: async ({ reply }) => {
      const moods = [
        { mood: '😊 Good Vibes', tip: 'Keep that energy! Share it with someone around you.' },
        { mood: '😴 Tired', tip: 'Rest isn\'t lazy — it\'s necessary. Take a break.' },
        { mood: '🔥 Motivated', tip: 'Strike while the iron is hot! Use that energy on your goals.' },
        { mood: '😤 Frustrated', tip: 'Take a deep breath. Every problem has a solution, even if you can\'t see it yet.' },
        { mood: '🌊 Calm', tip: 'Ride the calm. Reflect, plan, and set your intentions.' },
        { mood: '🎉 Excited', tip: 'Great! Channel that excitement into something productive.' },
        { mood: '😔 Low', tip: 'It\'s okay not to be okay. Be gentle with yourself today.' },
        { mood: '🤔 Thoughtful', tip: 'Trust your instincts — your mind is working on something important.' },
      ];
      const pick = moods[Math.floor(Math.random()*moods.length)];
      reply(`💭 *Mood Check-In*\n\n${pick.mood}\n\n💡 ${pick.tip}`);
    }
  },
  {
    command: 'tongue',
    aliases: ['tonguetwister', 'twister'],
    category: 'creativetools',
    description: 'Get a random tongue twister',
    execute: async ({ reply }) => {
      const twisters = [
        "She sells seashells by the seashore. The shells she sells are surely seashells. 🐚",
        "Peter Piper picked a peck of pickled peppers. How many pickled peppers did Peter Piper pick? 🫑",
        "How much wood would a woodchuck chuck if a woodchuck could chuck wood? 🪵",
        "Six slippery snails slid slowly seaward. 🐌",
        "Red lorry, yellow lorry, red lorry, yellow lorry. 🚛",
        "Unique New York. You know you need unique New York. 🗽",
        "Whether the weather be fine or whether the weather be not... 🌦️",
        "I scream, you scream, we all scream for ice cream! 🍦",
        "Which witch switched the Swiss wristwatches? ⌚",
      ];
      const t = twisters[Math.floor(Math.random()*twisters.length)];
      reply(`👅 *Tongue Twister:*\n\n${t}\n\n_Say it 5× fast!_`);
    }
  },
  {
    command: 'fortunecookie',
    aliases: ['cookie', 'luckcookie'],
    category: 'creativetools',
    description: 'Open a fortune cookie for today',
    execute: async ({ reply }) => {
      const fortunes = [
        "A lifetime of happiness awaits you — if you choose joy daily. 🍀",
        "The greatest risk is not taking one. 🔥",
        "Your kindness will be returned tenfold. 💫",
        "A quiet mind is a powerful mind. 🧘",
        "The door you've been waiting for is about to open. 🚪",
        "Hard work beats talent when talent doesn't work. 💪",
        "Today's decisions are tomorrow's reality. Choose wisely. ⚖️",
        "An unexpected friendship will change your life. 🤝",
        "Your creativity will solve a problem no one else can. 🎨",
        "Focus on what you can control, and release the rest. 🌊",
      ];
      reply(`🥠 *Fortune Cookie*\n\n_*crack*_\n\n"${fortunes[Math.floor(Math.random()*fortunes.length)]}"`);
    }
  },
  {
    command: 'starfact',
    aliases: ['zodiacfact', 'starsign2'],
    category: 'creativetools',
    description: 'Get a fact about a zodiac sign. Usage: starfact aries',
    execute: async ({ text, reply }) => {
      const data = {
        aries:       { date:'Mar 21 – Apr 19', trait:'Bold, ambitious, and passionate. Natural-born leaders. 🔥' },
        taurus:      { date:'Apr 20 – May 20', trait:'Reliable, patient, and devoted. Loves comfort and beauty. 🌹' },
        gemini:      { date:'May 21 – Jun 20', trait:'Curious, adaptable, and witty. Masters of communication. 💬' },
        cancer:      { date:'Jun 21 – Jul 22', trait:'Intuitive, emotional, and protective. Deeply loyal. 🌙' },
        leo:         { date:'Jul 23 – Aug 22', trait:'Dramatic, creative, and generous. Born to shine. ☀️' },
        virgo:       { date:'Aug 23 – Sep 22', trait:'Analytical, kind, and hardworking. Attention to detail. 🌿' },
        libra:       { date:'Sep 23 – Oct 22', trait:'Diplomatic, fair-minded, and social. Love balance. ⚖️' },
        scorpio:     { date:'Oct 23 – Nov 21', trait:'Passionate, brave, and determined. Fiercely private. 🦂' },
        sagittarius: { date:'Nov 22 – Dec 21', trait:'Extroverted, optimistic, and adventurous. Love freedom. 🏹' },
        capricorn:   { date:'Dec 22 – Jan 19', trait:'Responsible, disciplined, and self-controlled. Born achievers. 🏔️' },
        aquarius:    { date:'Jan 20 – Feb 18', trait:'Progressive, original, and humanitarian. Visionaries. ♒' },
        pisces:      { date:'Feb 19 – Mar 20', trait:'Compassionate, artistic, and wise. Deeply empathetic. 🐟' },
      };
      const sign = (text||'').toLowerCase().trim();
      if (!sign || !data[sign]) {
        const all = Object.keys(data).join(', ');
        return reply(p.phrases.wrongUsage('provide your star sign. example! .starfact aries'));
      }
      const d = data[sign];
      reply(`⭐ *${sign.charAt(0).toUpperCase()+sign.slice(1)}*\n\n📅 Dates: ${d.date}\n\n💫 ${d.trait}`);
    }
  },
];
