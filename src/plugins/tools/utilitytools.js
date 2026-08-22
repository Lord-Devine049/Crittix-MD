// UTILITY TOOLS — 15 practical utility commands
const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = [
  {
  command: ['mathsolve'],
  category: 'soultools',
  description: 'Solve a math expression',
  execute: async ({ args, chatId, sock, msg, reply }) => {
    const expr = args.join(' ').trim();
    if (!expr) return reply(p.phrases.wrongUsage('provide a math expression. example! .mathsolve 2+2'));

    try {
      const { data } = await axios.get(
        `https://apis.davidcyril.name.ng/tools/calculate?expr=${encodeURIComponent(expr)}`,
        { timeout: 10000 }
      );

      if (!data?.success) return reply('❌ invalid expression');

      await sock.sendMessage(chatId, {
        text: `🧮 *Calculator*\n\n📝 \`${data.expression}\`\n\n= *${data.result}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });

    } catch (e) {
      reply('❌ calculation failed — ' + e.message);
    }
  }
  },
  {
    command: 'temperature',
    aliases: ['tempconv', 'converttemp'],
    category: 'soultools',
    description: 'Convert temperature. Usage: temperature 100 c or temperature 32 f',
    execute: async ({ args, reply }) => {
      const val = parseFloat(args[0]);
      const unit = (args[1] || '').toLowerCase();
      if (isNaN(val) || !unit) return reply(p.phrases.wrongUsage('provide a value and unit. example! .temperature 100 c. or .temperature 32 f'));
      if (unit === 'c') {
        const f = (val * 9/5) + 32;
        const k = val + 273.15;
        reply(`🌡️ *Temperature*\n\n${val}°C = *${f.toFixed(2)}°F* = *${k.toFixed(2)}K*`);
      } else if (unit === 'f') {
        const c = (val - 32) * 5/9;
        const k = c + 273.15;
        reply(`🌡️ *Temperature*\n\n${val}°F = *${c.toFixed(2)}°C* = *${k.toFixed(2)}K*`);
      } else {
        reply('❌ *Unknown unit* — use c (Celsius) or f (Fahrenheit)');
      }
    }
  },
  {
    command: 'lengthconv',
    aliases: ['convertlength', 'lengthconvert'],
    category: 'soultools',
    description: 'Convert length units. Usage: lengthconv 100 cm m',
    execute: async ({ args, reply }) => {
      const val = parseFloat(args[0]);
      const from = (args[1]||'').toLowerCase();
      const to = (args[2]||'').toLowerCase();
      const factors = { mm:0.001, cm:0.01, m:1, km:1000, inch:0.0254, ft:0.3048, yd:0.9144, mi:1609.344 };
      if (isNaN(val) || !factors[from] || !factors[to])
        return reply(p.phrases.wrongUsage('provide a value and two units. example! .lengthconv 100 cm m'));
      const result = (val * factors[from]) / factors[to];
      reply(`📏 *Length Convert:*\n\n${val} ${from} = *${parseFloat(result.toFixed(6))} ${to}*`);
    }
  },
  {
    command: 'weightconv',
    aliases: ['convertweight', 'massconv'],
    category: 'soultools',
    description: 'Convert weight units. Usage: weightconv 70 kg lb',
    execute: async ({ args, reply }) => {
      const val = parseFloat(args[0]);
      const from = (args[1]||'').toLowerCase();
      const to = (args[2]||'').toLowerCase();
      const factors = { g:0.001, kg:1, lb:0.453592, oz:0.0283495, ton:1000, mg:0.000001 };
      if (isNaN(val) || !factors[from] || !factors[to])
        return reply(p.phrases.wrongUsage('provide a value and two units. example! .weightconv 70 kg lb'));
      const result = (val * factors[from]) / factors[to];
      reply(`⚖️ *Weight Convert:*\n\n${val} ${from} = *${parseFloat(result.toFixed(6))} ${to}*`);
    }
  },
  {
    command: 'percentage',
    aliases: ['percent', 'pct'],
    category: 'soultools',
    description: 'Calculate percentages. Usage: percentage 15 of 200',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide the percentage and the number. example! .percentage 15 of 200'));
      const match = text.match(/(\d+\.?\d*)\s*(?:of|%of|percent of)\s*(\d+\.?\d*)/i);
      if (!match) return reply(p.phrases.wrongUsage('provide the percentage and the number. example! .percentage 15 of 200'));
      const pct = parseFloat(match[1]);
      const total = parseFloat(match[2]);
      const result = (pct / 100) * total;
      reply(`📊 *Percentage Calculator*\n\n${pct}% of ${total} = *${result.toFixed(2)}*\n\n_i.e. ${result.toFixed(2)} out of ${total}_`);
    }
  },
  {
    command: 'randomnum',
    aliases: ['randnum', 'rng'],
    category: 'soultools',
    description: 'Generate a random number in a range. Usage: randomnum 1 100',
    execute: async ({ args, reply }) => {
      const min = parseInt(args[0]) || 1;
      const max = parseInt(args[1]) || 100;
      if (min >= max) return reply(p.phrases.wrongUsage('provide a minimum and maximum number. example! .randomnum 1 100'));
      const result = Math.floor(Math.random() * (max - min + 1)) + min;
      reply(`🎲 *Random Number*\n\nRange: ${min} – ${max}\nResult: *${result}*`);
    }
  },
  {
    command: 'hex',
    aliases: [ 'colorhex'],
    category: 'soultools',
    description: 'Get info about a hex color. Usage: hex #FF5733',
    execute: async ({ args, reply }) => {
      const code = (args[0] || '').replace('#','');
      if (!code || !/^[0-9A-Fa-f]{6}$/.test(code))
        return reply(p.phrases.wrongUsage('provide a 6 digit hex color code. example! .hex FF5733'));
      const r = parseInt(code.slice(0,2),16);
      const g = parseInt(code.slice(2,4),16);
      const b = parseInt(code.slice(4,6),16);
      const brightness = (r*299 + g*587 + b*114) / 1000;
      const isDark = brightness < 128;
      reply(
        `🎨 *Color: #${code.toUpperCase()}*\n\n` +
        `🔴 Red: ${r}\n🟢 Green: ${g}\n🔵 Blue: ${b}\n` +
        `☀️ Brightness: ${Math.round(brightness)}\n` +
        `🌑 Tone: ${isDark ? 'Dark color' : 'Light color'}\n\n` +
        `_Preview: https://singlecolorimage.com/get/${code}/200x200_`
      );
    }
  },
  {
    command: 'ascii',
    aliases: ['asciiart', 'textart'],
    category: 'soultools',
    description: 'Generate simple ASCII art from text. Usage: ascii HELLO',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want in ascii. example! .ascii crittix'));
      try {
        const r = await axios.get(`https://artii.herokuapp.com/make?text=${encodeURIComponent(text)}&font=banner`, { timeout: 10000 });
        reply(`\`\`\`\n${r.data}\n\`\`\``);
      } catch {
        // Simple fallback block letters
        const out = text.toUpperCase().split('').map(c => `[${c}]`).join('');
        reply(`🔤 *ASCII Art:*\n\n\`\`\`${out}\`\`\``);
      }
    }
  },
  {
    command: 'charinfo',
    aliases: ['charcode', 'unicodeinfo'],
    category: 'soultools',
    description: 'Get Unicode info for a character. Usage: charinfo A',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide a single character. example! .charinfo A'));
      const char = text.trim()[0];
      const code = char.codePointAt(0);
      const hex = code.toString(16).toUpperCase().padStart(4,'0');
      reply(
        `🔣 *Character Info*\n\n` +
        `Character: *${char}*\n` +
        `Unicode: *U+${hex}*\n` +
        `Decimal: *${code}*\n` +
        `Binary: *${code.toString(2)}*\n` +
        `Octal: *${code.toString(8)}*\n` +
        `HTML Entity: *&#${code};*`
      );
    }
  },
  {
    command: 'colorrgb',
    aliases: ['rgbcolor', 'rgbhex'],
    category: 'soultools',
    description: 'Convert RGB to HEX and vice versa. Usage: colorrgb 255 87 51',
    execute: async ({ args, text, reply }) => {
      const nums = text.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
      if (nums.length === 3) {
        const [r,g,b] = nums;
        if ([r,g,b].some(n => n < 0 || n > 255)) return reply('❌ RGB values must be 0-255');
        const hex = [r,g,b].map(n => n.toString(16).padStart(2,'0')).join('').toUpperCase();
        reply(`🎨 *RGB → HEX*\n\nRGB(${r}, ${g}, ${b}) = *#${hex}*`);
      } else {
        const code = text.replace('#','').trim();
        if (!/^[0-9A-Fa-f]{6}$/.test(code)) return reply(p.phrases.wrongUsage('provide rgb values or a hex code. example! .colorrgb 255 87 51'));
        const r = parseInt(code.slice(0,2),16);
        const g = parseInt(code.slice(2,4),16);
        const b = parseInt(code.slice(4,6),16);
        reply(`🎨 *HEX → RGB*\n\n#${code.toUpperCase()} = *RGB(${r}, ${g}, ${b})*`);
      }
    }
  },
  {
    command: 'bmi',
    aliases: ['calcbmi', 'bodymass'],
    category: 'soultools',
    description: 'Calculate BMI. Usage: bmi 70 175 (weight kg, height cm)',
    execute: async ({ args, reply }) => {
      const weight = parseFloat(args[0]);
      const height = parseFloat(args[1]);
      if (!weight || !height) return reply(p.phrases.wrongUsage('provide your weight in kg and height in cm. example! .bmi 70 175'));
      const hm = height / 100;
      const bmi = weight / (hm * hm);
      let category;
      if (bmi < 18.5) category = '🔵 Underweight';
      else if (bmi < 25) category = '🟢 Normal weight';
      else if (bmi < 30) category = '🟡 Overweight';
      else category = '🔴 Obese';
      reply(
        `⚕️ *BMI Calculator*\n\n` +
        `⚖️ Weight: ${weight}kg\n` +
        `📏 Height: ${height}cm\n` +
        `📊 BMI: *${bmi.toFixed(1)}*\n` +
        `🏷️ Category: ${category}\n\n` +
        `_Healthy range: 18.5 – 24.9_`
      );
    }
  },
  {
    command: 'agecheck',
    aliases: ['calcage', 'howold'],
    category: 'soultools',
    description: 'Calculate exact age from birthdate. Usage: agecheck 2000-05-15',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide your birthdate in YYYY-MM-DD format. example! .agecheck 2000-05-15'));
      const dob = new Date(text.trim());
      if (isNaN(dob)) return reply('❌ *Invalid date* — use format: YYYY-MM-DD');
      const now = new Date();
      let years = now.getFullYear() - dob.getFullYear();
      let months = now.getMonth() - dob.getMonth();
      let days = now.getDate() - dob.getDate();
      if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
      if (months < 0) { years--; months += 12; }
      const totalDays = Math.floor((now - dob) / 86400000);
      reply(
        `🎂 *Age Calculator*\n\n` +
        `📅 Born: ${dob.toDateString()}\n` +
        `⏳ Age: *${years} years, ${months} months, ${days} days*\n` +
        `📊 Total days lived: *${totalDays.toLocaleString()}*\n` +
        `🎉 Birthday: ${new Date(now.getFullYear(), dob.getMonth(), dob.getDate()).toDateString()}`
      );
    }
  },
];
