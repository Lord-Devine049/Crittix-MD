/*
 * TOOLS-NEW5.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: primecheck, factorial, fibonacci, gcd, lcm, discountcalc,
 *           tipcalc, loancalc, emicalc, dateconverter, leapyearcheck,
 *           numerology, tarotcard, dreaminterpret, biorhythm, bannergen,
 *           logogen, taglinegen
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

const ask = async (prompt, system = 'You are a helpful assistant.') => {
  const res = await axios.post('https://chateverywhere.app/api/chat/', {
    model: { id: 'gpt-4', name: 'GPT-4' },
    messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    temperature: 0.9
  }, { timeout: 20000 });
  return String(res.data || '').trim();
};

module.exports = [

  {
    command: 'primecheck',
    aliases: ['isprime', 'prime'],
    category: 'soultools',
    description: 'Check if a number is prime. Usage: primecheck 17',
    execute: async ({ args, reply }) => {
      const n = parseInt(args[0]);
      if (isNaN(n) || n < 0) return reply(h.demonError('.primecheck', '.primecheck <positive integer>'));
      if (n < 2) return reply(`🔢 *${n}* is NOT prime — numbers below 2 don't count, genius\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      if (n === 2) return reply(`✅ *2 is prime* — the only even prime. impressive that you didn't know that 🙄\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      if (n % 2 === 0) return reply(`❌ *${n} is NOT prime* — even numbers aren't prime (except 2, which you probably forgot)\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      let isPrime = true;
      for (let i = 3; i <= Math.sqrt(n); i += 2) { if (n % i === 0) { isPrime = false; break; } }
      reply(`${isPrime ? '✅' : '❌'} *${n.toLocaleString()} is ${isPrime ? '' : 'NOT '}prime*\n\n${isPrime ? 'Divisible only by 1 and itself. Clean.' : `Divisible by ${(() => { for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return i; })()}`}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'factorial',
    aliases: ['fact'],
    category: 'soultools',
    description: 'Calculate factorial of a number. Usage: factorial 10',
    execute: async ({ args, reply }) => {
      const n = parseInt(args[0]);
      if (isNaN(n) || n < 0) return reply(h.demonError('.factorial', '.factorial <non-negative integer>'));
      if (n > 20) return reply(h.demonFail(`${n}! is astronomically huge — I'm limiting to 20 to spare your brain`));
      let result = BigInt(1);
      for (let i = 2n; i <= BigInt(n); i++) result *= i;
      reply(`🔢 *${n}! = ${result.toLocaleString()}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'fibonacci',
    aliases: ['fib', 'fibseq'],
    category: 'soultools',
    description: 'Get Fibonacci sequence up to n terms. Usage: fibonacci 10',
    execute: async ({ args, reply }) => {
      const n = parseInt(args[0]);
      if (isNaN(n) || n < 1 || n > 50) return reply(h.demonError('.fibonacci', '.fibonacci <1-50>'));
      const seq = [0n, 1n];
      for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
      const display = seq.slice(0, n);
      reply(`🌀 *FIBONACCI (${n} terms)*\n\n${display.join(', ')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'gcd',
    aliases: ['greatestcommondivisor', 'hcf'],
    category: 'soultools',
    description: 'Greatest common divisor of two numbers. Usage: gcd 48 18',
    execute: async ({ args, reply }) => {
      const a = parseInt(args[0]), b = parseInt(args[1]);
      if (isNaN(a) || isNaN(b)) return reply(h.demonError('.gcd', '.gcd <number1> <number2>'));
      const gcdFn = (x, y) => y === 0 ? x : gcdFn(y, x % y);
      const result = gcdFn(Math.abs(a), Math.abs(b));
      reply(`🔢 *GCD(${a}, ${b}) = ${result}*\n\nBoth divide evenly by ${result}.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'lcm',
    aliases: ['leastcommonmultiple'],
    category: 'soultools',
    description: 'Least common multiple of two numbers. Usage: lcm 12 18',
    execute: async ({ args, reply }) => {
      const a = parseInt(args[0]), b = parseInt(args[1]);
      if (isNaN(a) || isNaN(b)) return reply(h.demonError('.lcm', '.lcm <number1> <number2>'));
      const gcdFn = (x, y) => y === 0 ? x : gcdFn(y, x % y);
      const result = Math.abs(a * b) / gcdFn(Math.abs(a), Math.abs(b));
      reply(`🔢 *LCM(${a}, ${b}) = ${result}*\n\nSmallest number divisible by both.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'discountcalc',
    aliases: ['discount', 'saleprice'],
    category: 'soultools',
    description: 'Calculate discounted price. Usage: discountcalc 200 25% (price, discount%)',
    execute: async ({ args, reply }) => {
      const price = parseFloat(args[0]);
      const disc = parseFloat(args[1]?.replace('%', ''));
      if (isNaN(price) || isNaN(disc)) return reply(h.demonError('.discountcalc', '.discountcalc <price> <discount%> — e.g. discountcalc 200 25'));
      const saved = price * (disc / 100);
      const final = price - saved;
      reply(
        `💸 *DISCOUNT CALCULATOR*\n\n` +
        `🏷️ Original: *$${price.toFixed(2)}*\n` +
        `📉 Discount: *${disc}%*\n` +
        `💰 You save: *$${saved.toFixed(2)}*\n` +
        `✅ Final price: *$${final.toFixed(2)}*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'tipcalc',
    aliases: ['tip', 'splittip'],
    category: 'soultools',
    description: 'Calculate tip and split. Usage: tipcalc 80 15% 4 (bill, tip%, people)',
    execute: async ({ args, reply }) => {
      const bill = parseFloat(args[0]);
      const tipPct = parseFloat(args[1]?.replace('%', '') || 15);
      const people = parseInt(args[2] || 1);
      if (isNaN(bill)) return reply(h.demonError('.tipcalc', '.tipcalc <bill> [tip%] [people] — e.g. tipcalc 80 15 4'));
      const tip = bill * (tipPct / 100);
      const total = bill + tip;
      const perPerson = total / people;
      reply(
        `💵 *TIP CALCULATOR*\n\n` +
        `🧾 Bill: *$${bill.toFixed(2)}*\n` +
        `💡 Tip (${tipPct}%): *$${tip.toFixed(2)}*\n` +
        `💰 Total: *$${total.toFixed(2)}*\n` +
        `👥 Per person (${people}): *$${perPerson.toFixed(2)}*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'loancalc',
    aliases: [ 'mortgage'],
    category: 'soultools',
    description: 'Calculate loan monthly payment. Usage: loancalc 10000 5% 24 (principal, rate, months)',
    execute: async ({ args, reply }) => {
      const p = parseFloat(args[0]);
      const r = parseFloat(args[1]?.replace('%', '')) / 100 / 12;
      const n = parseInt(args[2]);
      if (isNaN(p) || isNaN(r) || isNaN(n)) return reply(h.demonError('.loancalc', '.loancalc <principal> <annual_rate%> <months> — e.g. loancalc 10000 5 24'));
      const monthly = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = monthly * n;
      const interest = total - p;
      reply(
        `🏦 *LOAN CALCULATOR*\n\n` +
        `💰 Principal: *$${p.toLocaleString()}*\n` +
        `📊 Annual Rate: *${(r * 12 * 100).toFixed(2)}%*\n` +
        `📅 Term: *${n} months*\n\n` +
        `📆 Monthly Payment: *$${monthly.toFixed(2)}*\n` +
        `💸 Total Payment: *$${total.toFixed(2)}*\n` +
        `🔥 Total Interest: *$${interest.toFixed(2)}*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'emicalc',
    aliases: ['emi'],
    category: 'soultools',
    description: 'Calculate EMI. Usage: emicalc 500000 8.5% 36',
    execute: async ({ args, reply }) => {
      const p = parseFloat(args[0]);
      const r = parseFloat(args[1]?.replace('%', '')) / 100 / 12;
      const n = parseInt(args[2]);
      if (isNaN(p) || isNaN(r) || isNaN(n)) return reply(h.demonError('.emicalc', '.emicalc <principal> <annual_rate%> <months>'));
      const emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      reply(
        `💳 *EMI CALCULATOR*\n\n` +
        `💰 Principal: *₹${p.toLocaleString()}*\n` +
        `📊 Rate: *${(r * 12 * 100).toFixed(2)}% p.a.*\n` +
        `📅 Tenure: *${n} months*\n\n` +
        `📆 Monthly EMI: *₹${emi.toFixed(2)}*\n` +
        `💸 Total Amount: *₹${total.toFixed(2)}*\n` +
        `🔥 Interest Paid: *₹${(total - p).toFixed(2)}*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'dateconverter',
    aliases: ['convertdate', 'dateconv'],
    category: 'soultools',
    description: 'Convert date to Julian Day Number and back. Usage: dateconverter 2024-06-15',
    execute: async ({ args, reply }) => {
      const input = args[0];
      if (!input) return reply(h.demonError('.dateconverter', '.dateconverter <YYYY-MM-DD>'));
      const d = new Date(input);
      if (isNaN(d.getTime())) return reply(h.demonFail(`invalid date — use YYYY-MM-DD format like 2024-06-15`));
      const a = Math.floor((14 - (d.getMonth() + 1)) / 12);
      const y = d.getFullYear() + 4800 - a;
      const m = (d.getMonth() + 1) + 12 * a - 3;
      const jdn = d.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
      reply(
        `📅 *DATE CONVERTER*\n\n` +
        `📆 Gregorian: *${d.toDateString()}*\n` +
        `🔢 Julian Day Number: *${jdn}*\n` +
        `📊 Unix Timestamp: *${Math.floor(d.getTime() / 1000)}*\n` +
        `🌍 ISO 8601: *${d.toISOString().split('T')[0]}*\n` +
        `📅 Day of year: *${Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 86400000) + 1}*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'leapyearcheck',
    aliases: ['isleap', 'leapyear'],
    category: 'soultools',
    description: 'Check if a year is a leap year. Usage: leapyearcheck 2024',
    execute: async ({ args, reply }) => {
      const year = parseInt(args[0]);
      if (isNaN(year)) return reply(h.demonError('.leapyearcheck', '.leapyearcheck <year>'));
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      reply(`${isLeap ? '✅' : '❌'} *${year} is ${isLeap ? '' : 'NOT '}a Leap Year*\n\n${isLeap ? `February ${year} had 29 days. Extra day, still the same amount of drama.` : `February ${year} had 28 days. Basic.`}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'numerology',
    aliases: ['numlife', 'lifenum'],
    category: 'soultools',
    description: 'Get your numerology life path number. Usage: numerology 1995-08-23 OR numerology John',
    execute: async ({ args, reply }) => {
      const input = args.join(' ');
      if (!input) return reply(h.demonError('.numerology', '.numerology <name or birthdate YYYY-MM-DD>'));
      const digits = input.replace(/\D/g, '').split('').map(Number);
      if (digits.length === 0) {
        // Name numerology
        const map = { a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8 };
        const nums = input.toLowerCase().replace(/[^a-z]/g,'').split('').map(c => map[c] || 0);
        digits.push(...nums);
      }
      let sum = digits.reduce((a, b) => a + b, 0);
      while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
      }
      const meanings = {
        1:'Leader. Natural born boss — or a tyrant. Fine line.',
        2:'Peacekeeper. You\'d rather die than start a fight. relatable.',
        3:'Creative soul. Could\'ve been famous. Could\'ve. Past tense.',
        4:'Builder. Hardworking to a fault. Gets no vacations.',
        5:'Adventurer. Commitment issues disguised as "free spirit."',
        6:'Nurturer. Takes care of everyone except themselves.',
        7:'Seeker. Overthinks everything at 3am.',
        8:'Achiever. Obsessed with success. Probably has a vision board.',
        9:'Humanitarian. Wants to save the world but can\'t save their relationship.',
        11:'Master Intuitive. Psychic vibes or just anxious? both.',
        22:'Master Builder. Could change the world. Probably won\'t.',
        33:'Master Teacher. Enlightened or delusional — jury\'s still out.'
      };
      reply(`🔮 *NUMEROLOGY*\n\nInput: *${input}*\n\n🔢 Life Path Number: *${sum}*\n\n${meanings[sum] || 'Unknown number.'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'tarotcard',
    aliases: ['tarot', 'drawcard'],
    category: 'soultools',
    description: 'Draw a random tarot card. Usage: tarotcard',
    execute: async ({ reply }) => {
      const cards = [
        { name:'The Fool', meaning:'New beginnings, spontaneity, freedom — or just reckless stupidity. 50/50.'},
        { name:'The Magician', meaning:'Willpower and skill. You have what it takes. Whether you use it is a different story.'},
        { name:'The High Priestess', meaning:'Intuition and secrets. Your gut knows something your brain refuses to accept.'},
        { name:'The Empress', meaning:'Fertility, abundance, nature. Things are growing — whether you want them to or not.'},
        { name:'The Emperor', meaning:'Authority and structure. Someone\'s about to tell you what to do. Probably you.'},
        { name:'The Hierophant', meaning:'Tradition and conformity. You\'re about to do something painfully conventional.'},
        { name:'The Lovers', meaning:'Love, choices, alignment. A decision involving your heart. Don\'t mess this up.'},
        { name:'The Chariot', meaning:'Determination and control. You\'re winning — barely — but you\'re winning.'},
        { name:'Strength', meaning:'Courage and patience. Raw power managed gracefully. You more than most.'},
        { name:'The Hermit', meaning:'Solitude and reflection. Touch grass, but make it spiritual.'},
        { name:'Wheel of Fortune', meaning:'Change is coming. Could be good. Could be catastrophic. Probably both.'},
        { name:'Justice', meaning:'Truth and law. What you did is catching up to you. Or finally being recognized.'},
        { name:'The Hanged Man', meaning:'Pause, surrender, waiting. You\'re stuck. On purpose. For a reason. Maybe.'},
        { name:'Death', meaning:'Transformation, not literal death. Something ends. Something begins. Drama either way.'},
        { name:'Temperance', meaning:'Balance and moderation. You\'re being told to calm down. By tarot.'},
        { name:'The Devil', meaning:'Bondage and materialism. You\'re addicted to something. You know what it is.'},
        { name:'The Tower', meaning:'Sudden upheaval and chaos. Everything\'s about to fall apart. Buckle up.'},
        { name:'The Star', meaning:'Hope, renewal, inspiration. After the Tower, here we are. Healing arc.'},
        { name:'The Moon', meaning:'Illusion, fear, the subconscious. Nothing is what it seems right now.'},
        { name:'The Sun', meaning:'Joy, vitality, success. Good times. Rare but they happen.'},
        { name:'Judgement', meaning:'Reflection and awakening. Time to answer for your choices. Good luck.'},
        { name:'The World', meaning:'Completion and accomplishment. You did it. Take a second to appreciate that.'},
      ];
      const card = cards[Math.floor(Math.random() * cards.length)];
      reply(`🃏 *TAROT DRAW*\n\n🔮 Card: *${card.name}*\n\n📜 ${card.meaning}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'dreaminterpret',
    aliases: ['dream', 'dreammeaning'],
    category: 'soultools',
    description: 'Playful dream keyword interpretation. Usage: dreaminterpret flying',
    execute: async ({ args, reply }) => {
      const keyword = args.join(' ').toLowerCase();
      if (!keyword) return reply(h.demonError('.dreaminterpret', '.dreaminterpret <dream keyword>'));
      const meanings = {
        flying:'Desire for freedom or escaping responsibility. You don\'t wanna be where you are. Relatable.',
        falling:'Loss of control in your waking life. Something\'s about to hit the floor. Maybe you.',
        teeth:'Anxiety about appearance or communication. You said something dumb recently.',
        water:'Emotions are overwhelming you. And you thought you were fine.',
        snake:'Betrayal, fear, or hidden desires. Someone in your circle is sus.',
        chased:'Avoiding a problem that isn\'t going away. Bro just turn around.',
        school:'Performance anxiety. The exam never ends, even in sleep.',
        death:'Transformation, change, endings. Stop panicking — it\'s metaphorical.',
        money:'Ambition, self-worth, security issues. You think about money too much.',
        house:'Your psyche, your inner self. Which room was sketchy?',
        fire:'Passion, destruction, transformation. Either you\'re inspired or it\'s all burning down.',
        baby:'New beginnings or a project you\'re nurturing. Or actual anxiety about babies.',
        car:'Control over your life direction. Were you driving or a passenger?',
        lost:'Identity crisis or life confusion. Valid. Everybody\'s a bit lost.',
        wedding:'Commitment anxiety. Yours or someone else\'s.',
      };
      const match = Object.keys(meanings).find(k => keyword.includes(k));
      const response = match ? meanings[match] : `"${keyword}" in dreams typically signals something your subconscious is processing. Might be stress, might be random. Your brain is weird.`;
      reply(`🌙 *DREAM INTERPRETATION*\n\n🔍 Keyword: *${keyword}*\n\n💭 ${response}\n\n⚠️ _This is entertainment only — not actual psychology._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'biorhythm',
    aliases: ['biocycle', 'biorythm'],
    category: 'soultools',
    description: 'Calculate biorhythm cycles from birthdate. Usage: biorhythm 1995-08-23',
    execute: async ({ args, reply }) => {
      const bdate = args[0];
      if (!bdate) return reply(h.demonError('.biorhythm', '.biorhythm <YYYY-MM-DD birthdate>'));
      const birth = new Date(bdate);
      if (isNaN(birth.getTime())) return reply(h.demonFail('invalid date — use YYYY-MM-DD'));
      const today = new Date();
      const days = Math.floor((today - birth) / 86400000);
      const physical = Math.sin(2 * Math.PI * days / 23);
      const emotional = Math.sin(2 * Math.PI * days / 28);
      const intellectual = Math.sin(2 * Math.PI * days / 33);
      const bar = (v) => {
        const pct = Math.round((v + 1) * 50);
        const filled = Math.round(pct / 10);
        return `[${'█'.repeat(filled)}${'░'.repeat(10 - filled)}] ${pct}%`;
      };
      const status = (v) => v > 0.3 ? 'HIGH 🔥' : v < -0.3 ? 'LOW ❄️' : 'NEUTRAL ⚖️';
      reply(
        `🌊 *BIORHYTHM*\n\n` +
        `👤 Born: ${birth.toDateString()}\n📅 Today: ${today.toDateString()}\n📊 Day: ${days}\n\n` +
        `💪 Physical (23d cycle):\n${bar(physical)} — ${status(physical)}\n\n` +
        `❤️ Emotional (28d cycle):\n${bar(emotional)} — ${status(emotional)}\n\n` +
        `🧠 Intellectual (33d cycle):\n${bar(intellectual)} — ${status(intellectual)}\n\n` +
        `⚠️ _Pseudoscience for fun only. Don't plan surgery around this._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'taglinegen',
    aliases: ['tagline', 'slogan'],
    category: 'soultools',
    description: 'Generate taglines/slogans for a keyword. Usage: taglinegen coffee shop',
    execute: async ({ text, args, reply }) => {
      const topic = text || args.join(' ');
      if (!topic) return reply(h.demonError('.taglinegen', '.taglinegen <brand/keyword>'));
      await reply('✍️ generating taglines...');
      try {
        const result = await ask(`Generate 5 catchy, creative taglines/slogans for: "${topic}". Make them short, punchy, and memorable. Number them 1-5.`, 'You are a creative marketing expert. Generate bold, memorable taglines.');
        reply(`💡 *TAGLINE GENERATOR*\n\n🎯 Topic: *${topic}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`tagline AI down — ${e.message}`)); }
    }
  },

  {
    command: 'bannergen',
    aliases: ['banner', 'textbanner'],
    category: 'soultools',
    description: 'Generate a text banner image. Usage: bannergen My Title | subtitle',
    execute: async ({ text, args, sock, chatId, msg, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(h.demonError('.bannergen', '.bannergen <title> | <subtitle>'));
      const [title, sub] = input.split('|').map(s => s?.trim());
      try {
        const width = 800, height = 250;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#1a1a2e');
        grad.addColorStop(1, '#16213e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, width - 16, height - 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((title || input).substring(0, 25), width / 2, 130);
        if (sub) {
          ctx.fillStyle = '#e94560';
          ctx.font = '28px Arial';
          ctx.fillText(sub.substring(0, 40), width / 2, 180);
        }
        ctx.fillStyle = '#8888aa';
        ctx.font = '14px Arial';
        ctx.fillText('𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗', width / 2, 230);
        const buf = canvas.toBuffer('image/png');
        const tmpPath = path.join(process.cwd(), 'tmp', `banner_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, buf);
        await sock.sendMessage(chatId, { image: { url: tmpPath }, caption: `🎨 *Banner: ${title || input}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(h.demonFail(`banner generation failed — ${e.message}`)); }
    }
  },

  {
    command: 'logogen',
    aliases: ['logo', 'textlogo'],
    category: 'soultools',
    description: 'Generate a text logo image. Usage: logogen BrandName',
    execute: async ({ args, text, sock, chatId, msg, reply }) => {
      const name = (text || args.join(' ')).substring(0, 15);
      if (!name) return reply(h.demonError('.logogen', '.logogen <brand name>'));
      try {
        const size = 400;
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        const colors = ['#e94560','#0f3460','#533483','#e94560','#06b6d4','#8b5cf6'];
        const c1 = colors[Math.floor(Math.random() * colors.length)];
        const c2 = colors[Math.floor(Math.random() * colors.length)];
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        const fontSize = Math.max(30, Math.floor(200 / name.length));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name.toUpperCase(), size / 2, size / 2);
        const buf = canvas.toBuffer('image/png');
        const tmpPath = path.join(process.cwd(), 'tmp', `logo_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, buf);
        await sock.sendMessage(chatId, { image: { url: tmpPath }, caption: `🎨 *Logo: ${name}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(h.demonFail(`logo generation failed — ${e.message}`)); }
    }
  }

];
