const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = [
  {
    command: 'randomcolor',
    aliases: ['randcolor', 'colorgen'],
    category: 'soultools',
    description: 'Generate a random color with hex, RGB, and preview',
    execute: async ({ reply }) => {
      const r = Math.floor(Math.random()*256);
      const g = Math.floor(Math.random()*256);
      const b = Math.floor(Math.random()*256);
      const hex = [r,g,b].map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();
      const brightness = (r*299+g*587+b*114)/1000;
      const tone = brightness > 128 ? 'Light' : 'Dark';
      reply(`🎨 *Random Color*\n\n🔷 HEX: #${hex}\n🔴 R: ${r}  🟢 G: ${g}  🔵 B: ${b}\n☀️ Tone: ${tone}\n\n_Preview: https://singlecolorimage.com/get/${hex}/300x100_`);
    }
  },
  {
    command: 'coinflip',
    aliases: [ 'headsortails'],
    category: 'soultools',
    description: 'Flip a coin — heads or tails?',
    execute: async ({ reply }) => {
      const result = Math.random() > 0.5 ? '🪙 *HEADS!*' : '🪙 *TAILS!*';
      reply(`🪙 *Coin Flip*\n\n${result}`);
    }
  },
  {
    command: 'rpsgame',
    aliases: ['rpsplay', 'handgame'],
    category: 'soultools',
    description: 'Play Rock Paper Scissors vs the bot. Usage: rpsgame rock',
    execute: async ({ args, reply }) => {
      const choices = ['rock','paper','scissors'];
      const emoji = { rock:'🪨', paper:'📄', scissors:'✂️' };
      const userChoice = (args[0]||'').toLowerCase();
      if (!choices.includes(userChoice)) return reply(p.phrases.wrongUsage('pick rock paper or scissors. example! .rpsgame rock'));
      const botChoice = choices[Math.floor(Math.random()*3)];
      let result;
      if (userChoice === botChoice) result = "🤝 *Draw!*";
      else if ((userChoice==='rock'&&botChoice==='scissors')||(userChoice==='paper'&&botChoice==='rock')||(userChoice==='scissors'&&botChoice==='paper'))
        result = "🎉 *You Win!*";
      else result = "🤖 *Bot Wins!*";
      reply(`✂️ *Rock Paper Scissors*\n\nYou: ${emoji[userChoice]} ${userChoice}\nBot: ${emoji[botChoice]} ${botChoice}\n\n${result}`);
    }
  },
  {
    command: 'passwordstrength',
    aliases: ['checkpass', 'passscore'],
    category: 'soultools',
    description: 'Check password strength. Usage: passwordstrength MyPass123!',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the password you want tested. example! .passwordstrength YourPassword123!'));
      const pass = text.trim();
      let score = 0;
      const checks = [
        { test: pass.length >= 8, label: 'At least 8 characters' },
        { test: pass.length >= 12, label: 'At least 12 characters' },
        { test: /[A-Z]/.test(pass), label: 'Has uppercase letters' },
        { test: /[a-z]/.test(pass), label: 'Has lowercase letters' },
        { test: /[0-9]/.test(pass), label: 'Has numbers' },
        { test: /[^A-Za-z0-9]/.test(pass), label: 'Has special characters' },
        { test: pass.length >= 16, label: 'Very long (16+)' },
      ];
      checks.forEach(c => { if (c.test) score++; });
      const levels = ['💀 Very Weak','🔴 Weak','🟡 Fair','🟠 Moderate','🟢 Strong','✅ Very Strong','🏆 Excellent'];
      const level = levels[Math.min(score, levels.length-1)];
      const checklist = checks.map(c => `${c.test?'✅':'❌'} ${c.label}`).join('\n');
      reply(`🔐 *Password Strength*\n\nPassword: ${'*'.repeat(pass.length)}\nLength: ${pass.length}\n\n${checklist}\n\nRating: *${level}*`);
    }
  },
  {
    command: 'diceroll',
    aliases: ['rolldice2', 'rolld6'],
    category: 'soultools',
    description: 'Roll multiple dice. Usage: diceroll 2d6',
    execute: async ({ text, reply }) => {
      const match = (text||'1d6').match(/(\d+)d(\d+)/i);
      if (!match) return reply(p.phrases.wrongUsage('use the format count then d then sides. example! .diceroll 2d6'));
      const count = Math.min(parseInt(match[1]), 10);
      const sides = Math.min(parseInt(match[2]), 100);
      const rolls = Array.from({length:count}, () => Math.floor(Math.random()*sides)+1);
      const total = rolls.reduce((a,b) => a+b, 0);
      reply(`🎲 *Dice Roll (${count}d${sides})*\n\nRolls: [${rolls.join(', ')}]\nTotal: *${total}*\nAverage: *${(total/count).toFixed(1)}*`);
    }
  },
  {
    command: 'spinner',
    aliases: ['wheelspin', 'randomchoice'],
    category: 'soultools',
    description: 'Spin a wheel to pick a random choice. Usage: spinner Pizza | Burger | Sushi',
    execute: async ({ text, reply }) => {
      if (!text || !text.includes('|')) return reply(p.phrases.wrongUsage('separate your options with pipes. example! .spinner option1 "option2" option3'));
      const choices = text.split('|').map(s => s.trim()).filter(Boolean);
      if (choices.length < 2) return reply('❌ *Need at least 2 options separated by |*');
      const winner = choices[Math.floor(Math.random()*choices.length)];
      const list = choices.map((c,i) => `${i===choices.indexOf(winner)?'👉':' '} ${c}`).join('\n');
      reply(`🎡 *Wheel Spin*\n\n${list}\n\n🏆 *Winner: ${winner}!*`);
    }
  },
  {
    command: 'numbertobinary',
    aliases: ['tobin', 'dectobin'],
    category: 'soultools',
    description: 'Convert decimal number to binary. Usage: numbertobinary 255',
    execute: async ({ text, reply }) => {
      const num = parseInt(text);
      if (isNaN(num)) return reply(p.phrases.wrongUsage('provide a number to convert. example! .numbertobinary 255'));
      reply(`🔢 *Decimal → Binary*\n\n${num} = \`${num.toString(2)}\`\n\nHex: \`0x${num.toString(16).toUpperCase()}\`\nOctal: \`${num.toString(8)}\``);
    }
  },
  {
    command: 'binarytodec',
    aliases: ['frombin', 'bintodec'],
    category: 'soultools',
    description: 'Convert binary to decimal. Usage: binarytodec 11111111',
    execute: async ({ text, reply }) => {
      const bin = (text||'').trim();
      if (!/^[01]+$/.test(bin)) return reply(p.phrases.wrongUsage('provide a binary number using only 0 and 1. example! .binarytodec 11111111'));
      const dec = parseInt(bin, 2);
      reply(`🔢 *Binary → Decimal*\n\n\`${bin}\` = *${dec}*\n\nHex: \`0x${dec.toString(16).toUpperCase()}\``);
    }
  },
  {
    command: 'stoptimer',
    aliases: ['stopwatch', 'laptime'],
    category: 'soultools',
    description: 'Quick stop timer — measures bot processing speed',
    execute: async ({ reply }) => {
      const t1 = Date.now();
      await new Promise(r => setTimeout(r, 100));
      const t2 = Date.now();
      const elapsed = t2 - t1;
      reply(`⏱️ *Stopwatch*\n\n🕐 Start → Stop\n⚡ Elapsed: *${elapsed}ms*\n\n_Bot response time measured._`);
    }
  },
  {
    command: 'inspire',
    aliases: ['dailyinspo', 'quoteofday'],
    category: 'soultools',
    description: 'Get an inspirational quote from ZenQuotes',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://zenquotes.io/api/random', { timeout: 8000 });
        const q = r.data[0];
        reply(`✨ *Inspiration*\n\n💬 "${q.q}"\n\n— *${q.a}*`);
      } catch {
        reply(`✨ *Inspiration*\n\n💬 "The darkest hour has only sixty minutes."\n\n— *Morris Mandel*`);
      }
    }
  },
  {
    command: 'cocktail',
    aliases: ['randomdrink', 'cocktailrecipe'],
    category: 'soultools',
    description: 'Get a random cocktail recipe',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://www.thecocktaildb.com/api/json/v1/1/random.php', { timeout: 8000 });
        const drink = r.data.drinks[0];
        const ingredients = [];
        for (let i = 1; i <= 15; i++) {
          const ing = drink[`strIngredient${i}`];
          const meas = drink[`strMeasure${i}`];
          if (ing) ingredients.push(`• ${meas ? meas.trim() : ''} ${ing.trim()}`);
        }
        reply(
          `🍹 *${drink.strDrink}*\n\n` +
          `🏷️ Category: ${drink.strCategory}\n` +
          `🔞 Type: ${drink.strAlcoholic}\n\n` +
          `📦 *Ingredients:*\n${ingredients.join('\n')}\n\n` +
          `📋 *Instructions:*\n${drink.strInstructions.slice(0,400)}...`
        );
      } catch { reply('🍹 *Cocktail database unavailable*\n\nTry again later!'); }
    }
  },
  {
    command: 'mealidea',
    aliases: ['randommeal', 'whattoeat'],
    category: 'soultools',
    description: 'Get a random meal idea',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php', { timeout: 8000 });
        const meal = r.data.meals[0];
        reply(
          `🍽️ *${meal.strMeal}*\n\n` +
          `🌍 Cuisine: ${meal.strArea}\n` +
          `🏷️ Category: ${meal.strCategory}\n\n` +
          `📋 *Instructions:* (summary)\n${meal.strInstructions.slice(0,300)}...`
        );
      } catch { reply('🍽️ *Meal database unavailable*\n\nTry again later!'); }
    }
  },
  {
    command: 'agify',
    aliases: ['guessage', 'nameage'],
    category: 'soultools',
    description: 'Guess age based on a name. Usage: agify John',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide a first name. example! .agify john'));
      try {
        const r = await axios.get(`https://api.agify.io?name=${encodeURIComponent(text.trim())}`, { timeout: 8000 });
        if (!r.data.age) return reply(`❓ *Can't guess age for "${text}"*`);
        reply(`🎂 *Age Guess*\n\nName: *${r.data.name}*\nEstimated Age: *${r.data.age}*\nSample Size: ${r.data.count} people`);
      } catch { reply('⚠️ *Age guesser unavailable*'); }
    }
  },
  {
    command: 'genderify',
    aliases: ['guessgender', 'namegender'],
    category: 'soultools',
    description: 'Guess gender from a name. Usage: genderify Alex',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide a first name. example! .genderify alex'));
      try {
        const r = await axios.get(`https://api.genderize.io?name=${encodeURIComponent(text.trim())}`, { timeout: 8000 });
        const pct = Math.round((r.data.probability || 0) * 100);
        const gender = r.data.gender || 'unknown';
        reply(`👤 *Gender Guess*\n\nName: *${r.data.name}*\nGender: *${gender.charAt(0).toUpperCase()+gender.slice(1)}*\nConfidence: *${pct}%*\nSample: ${r.data.count} people`);
      } catch { reply('⚠️ *Gender guesser unavailable*'); }
    }
  },
  {
    command: 'nationality',
    aliases: ['guessnationality', 'nameratio'],
    category: 'soultools',
    description: 'Guess nationality from a name. Usage: nationality Arjun',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide a first name. example! .nationality arjun'));
      try {
        const r = await axios.get(`https://api.nationalize.io?name=${encodeURIComponent(text.trim())}`, { timeout: 8000 });
        const top = (r.data.country || []).slice(0, 5);
        if (!top.length) return reply(`❓ *No nationality data for "${text}"*`);
        const list = top.map(c => `🌍 ${c.country_id} — ${Math.round(c.probability*100)}%`).join('\n');
        reply(`🌍 *Nationality Guess*\n\nName: *${r.data.name}*\n\n${list}`);
      } catch { reply('⚠️ *Nationality guesser unavailable*'); }
    }
  },
];
