/*
 * TOOLS-NEW2.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: anagramsolver, wordladder, sudoku, qrlogo, barcodegen,
 *           barcodescan, colorpalette, gradientgen
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const QRCode = require('qrcode');
const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


module.exports = [

  {
    command: 'anagramsolver',
    aliases: [ 'unscramble'],
    category: 'soultools',
    description: 'Find anagrams of a word. Usage: anagramsolver listen',
    execute: async ({ args, reply }) => {
      const word = args[0]?.toLowerCase().replace(/[^a-z]/g, '');
      if (!word || word.length < 2) return reply(p.phrases.wrongUsage('provide a word to solve anagrams for. example! .anagramsolver listen'));
      try {
        const { data } = await axios.get(`https://api.datamuse.com/words?sp=${word.split('').sort().join('')}&max=20&md=f`, { timeout: 10000 });
        if (!data?.length) return reply(p.phrases.notFound(`no anagrams found for "${word}".`));
        const sorted = word.split('').sort().join('');
        const anagrams = data.filter(w => w.word !== word && w.word.split('').sort().join('') === sorted);
        if (!anagrams.length) return reply(p.phrases.notFound(`no proper anagrams found for "${word}".`));
        reply(
          `🔤 *ANAGRAM SOLVER*\n\n` +
          `📝 Input: *${word}*\n` +
          `🔄 Anagrams (${anagrams.length}):\n\n` +
          anagrams.map(w => `• ${w.word}`).join('\n') +
          `\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) {
        reply(p.phrases.error(`anagram solver down — ${e.message}`));
      }
    }
  },

  {
    command: 'wordladder',
    aliases: ['wordladder2'],
    category: 'soultools',
    description: 'Generate a word ladder puzzle between two same-length words. Usage: wordladder cat dog',
    execute: async ({ args, reply }) => {
      const start = args[0]?.toLowerCase().replace(/[^a-z]/g, '');
      const end = args[1]?.toLowerCase().replace(/[^a-z]/g, '');
      if (!start || !end) return reply(p.phrases.wrongUsage('provide two words of the same length. example! .wordladder cat dog'));
      if (start.length !== end.length) return reply(p.phrases.error(`"${start}" and "${end}" must be the same length.`));
      // BFS on common short words
      const commonWords3 = ['cat','bat','bad','bag','ban','bar','bas','bat','bay','bed','bet','big','bit','bog','bow','box','boy','bud','bug','bun','bus','but','buy','cab','can','cap','car','cut','dab','dad','dam','day','dig','dim','dip','dog','dot','dry','dug','duo','ear','eat','egg','elm','end','era','eve','eye','fan','far','fat','few','fig','fin','fit','fix','fly','fog','for','fox','fry','fun','gap','gas','gel','gem','get','god','got','gum','gun','gut','guy','had','ham','has','hat','hay','hen','her','hid','him','hip','his','hit','hog','hop','hot','how','hug','hum','hut','ice','ill','inn','ion','ire','ivy','jab','jab','jam','jar','jaw','jet','jig','job','jog','joy','jug','jut','keg','key','kid','kin','kit','lab','lad','lap','law','lay','led','leg','let','lid','lip','lit','log','lot','low','lug','mad','man','map','mar','mat','max','may','men','met','mix','mob','mop','mud','mug','nag','nap','nip','nit','nod','nor','not','now','nun','nut','oar','odd','ode','off','oil','old','orb','ore','our','out','owe','own','pad','pal','pan','pap','par','pat','paw','pay','peg','pen','pep','pet','pie','pig','pin','pit','ply','pod','pop','pot','pow','pro','pub','pug','pun','pup','put','rag','ram','ran','rap','rat','raw','red','ref','rib','rid','rig','rim','rip','rob','rod','rot','row','rub','rug','rum','run','rut','sad','sag','sap','sat','saw','say','set','sew','she','shy','sin','sip','sit','six','ski','sky','sly','sob','sod','son','sop','sot','sow','soy','spa','spy','sub','sue','sum','sun','tab','tan','tap','tar','tea','ten','the','tie','tin','tip','toe','too','top','toy','try','tub','tug','two','use','van','vat','via','vow','wag','war','was','wax','way','web','wed','wet','who','why','wig','win','wit','woe','won','woo','wow','yam','yap','yaw','yew','you','zap','zip','zit','zoo'];
      if (start.length !== 3) {
        return reply(`🔤 *WORD LADDER PUZZLE*\n\n📝 *${start.toUpperCase()}* → *${end.toUpperCase()}*\n\n⚠️ _Full BFS is only supported for 3-letter words in this version._\n\nHint: Change one letter at a time to get from *${start}* to *${end}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const queue = [[start, [start]]];
      const visited = new Set([start]);
      let result = null;
      while (queue.length) {
        const [word, path] = queue.shift();
        if (word === end) { result = path; break; }
        if (path.length > 6) continue;
        for (const w of commonWords3) {
          if (visited.has(w)) continue;
          let diff = 0;
          for (let i = 0; i < word.length; i++) if (word[i] !== w[i]) diff++;
          if (diff === 1) { visited.add(w); queue.push([w, [...path, w]]); }
        }
      }
      if (!result) {
        return reply(`🔤 *WORD LADDER: ${start.toUpperCase()} → ${end.toUpperCase()}*\n\n😑 No ladder found in my word list — try different words\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(
        `🔤 *WORD LADDER PUZZLE*\n\n` +
        `Start: *${start.toUpperCase()}*  →  End: *${end.toUpperCase()}*\n\n` +
        `Steps (${result.length - 1}):\n` +
        result.map((w, i) => `${i + 1}. ${w.toUpperCase()}`).join(' → \n') +
        `\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'sudoku',
    aliases: ['sudokupuzzle'],
    category: 'soultools',
    description: 'Generate a random sudoku puzzle. Usage: sudoku easy|medium|hard',
    execute: async ({ args, reply }) => {
      const diff = (args[0] || 'medium').toLowerCase();
      const removals = { easy: 30, medium: 45, hard: 55 }[diff] || 45;
      // Generate solved grid
      const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
      const isValid = (g, row, col, num) => {
        for (let x = 0; x < 9; x++) {
          if (g[row][x] === num || g[x][col] === num) return false;
          const br = 3 * Math.floor(row / 3) + Math.floor(x / 3);
          const bc = 3 * Math.floor(col / 3) + x % 3;
          if (g[br][bc] === num) return false;
        }
        return true;
      };
      const solve = (g) => {
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (g[r][c] === 0) {
              const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
              for (const n of nums) {
                if (isValid(g, r, c, n)) { g[r][c] = n; if (solve(g)) return true; g[r][c] = 0; }
              }
              return false;
            }
          }
        }
        return true;
      };
      solve(grid);
      const puzzle = grid.map(row => [...row]);
      let removed = 0;
      while (removed < removals) {
        const r = Math.floor(Math.random() * 9), c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; removed++; }
      }
      const fmt = (g) => {
        let s = '';
        for (let r = 0; r < 9; r++) {
          if (r % 3 === 0 && r !== 0) s += '------+-------+------\n';
          for (let c = 0; c < 9; c++) {
            if (c % 3 === 0 && c !== 0) s += '| ';
            s += (g[r][c] === 0 ? '.' : g[r][c]) + ' ';
          }
          s += '\n';
        }
        return s;
      };
      reply(
        `🧩 *SUDOKU PUZZLE (${diff.toUpperCase()})*\n\n` +
        `\`\`\`\n${fmt(puzzle)}\`\`\`\n` +
        `Fill in the blanks (.) so each row, column, and 3x3 box has digits 1-9.\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'qrlogo',
    aliases: ['qrcode2', 'qr2'],
    category: 'soultools',
    description: 'Generate a QR code for text/URL. Usage: qrlogo https://example.com',
    execute: async ({ text, args, sock, chatId, msg, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('type your text or url to generate a qr code. example! .qrlogo https://crittix.com'));
      try {
        const tmpPath = path.join(process.cwd(), 'tmp', `qr_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        await QRCode.toFile(tmpPath, input, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
        await sock.sendMessage(chatId, { image: { url: tmpPath }, caption: `📱 *QR Code Generated*\n\n🔗 Content: ${input.substring(0, 80)}${input.length > 80 ? '...' : ''}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) {
        reply(p.phrases.error(`QR generation failed — ${e.message}`));
      }
    }
  },

  {
    command: 'barcodegen',
    aliases: ['barcode', 'makebcode'],
    category: 'soultools',
    description: 'Generate a barcode image from text/number. Usage: barcodegen 1234567890',
    execute: async ({ text, args, sock, chatId, msg, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('type your text or numbers to generate a barcode. example! .barcodegen 1234567890'));
      try {
        const width = 300, height = 100;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#000000';
        // Simple Code-128 style visual barcode
        const chars = input.substring(0, 20);
        let x = 10;
        const barWidth = Math.floor((width - 20) / (chars.length * 7));
        for (let i = 0; i < chars.length * 7; i++) {
          const bit = (chars.charCodeAt(Math.floor(i / 7)) >> (6 - (i % 7))) & 1;
          if (bit) ctx.fillRect(x, 10, Math.max(barWidth, 2), height - 30);
          x += Math.max(barWidth, 2) + 1;
        }
        ctx.fillStyle = '#000000';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(chars, width / 2, height - 5);
        const buf = canvas.toBuffer('image/png');
        const tmpPath = path.join(process.cwd(), 'tmp', `barcode_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, buf);
        await sock.sendMessage(chatId, { image: { url: tmpPath }, caption: `📊 *Barcode Generated*\n\n📝 Input: \`${chars}\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) {
        reply(p.phrases.error(`barcode generation failed — ${e.message}`));
      }
    }
  },

  {
    command: 'barcodescan',
    aliases: ['readbarcode', 'bcodescan'],
    category: 'soultools',
    description: 'Decode a barcode from an uploaded image. Reply to an image with: barcodescan',
    execute: async ({ sock, msg, chatId, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
      if (!imgMsg) return reply(p.phrases.error('reply to an image containing a barcode'));
      try {
        const buffer = await sock.downloadMediaMessage(msg);
        const jsQR = require('jsqr');
        const jimp = require('jimp');
        const img = await jimp.read(buffer);
        const imgData = {
          data: new Uint8ClampedArray(img.bitmap.data),
          width: img.bitmap.width,
          height: img.bitmap.height
        };
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (!code) return reply(p.phrases.notFound('no barcode or qr found in that image. make sure it\'s clear and well-lit'));
        reply(`📊 *Barcode Scanned!*\n\n🔍 Decoded: *${code.data}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) {
        reply(p.phrases.error(`barcode scan failed — ${e.message}`));
      }
    }
  },

  {
    command: 'colorpalette',
    aliases: ['palette', 'colors'],
    category: 'soultools',
    description: 'Generate a 5-color palette from a base hex color or random. Usage: colorpalette #ff6b00',
    execute: async ({ args, sock, chatId, msg, reply }) => {
      const base = args[0]?.replace('#', '') || Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
      const hexToRgb = h => ({ r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) });
      const rgbToHex = (r, g, b) => `#${[r, g, b].map(x => Math.min(255, Math.max(0, Math.round(x))).toString(16).padStart(2, '0')).join('')}`;
      const clamp = (v) => Math.min(255, Math.max(0, Math.round(v)));
      const rgb = hexToRgb(base.padStart(6, '0'));
      const palette = [
        rgbToHex(clamp(rgb.r * 0.5), clamp(rgb.g * 0.5), clamp(rgb.b * 0.5)),
        rgbToHex(clamp(rgb.r * 0.75), clamp(rgb.g * 0.75), clamp(rgb.b * 0.75)),
        `#${base.padStart(6, '0')}`,
        rgbToHex(clamp(rgb.r + (255 - rgb.r) * 0.25), clamp(rgb.g + (255 - rgb.g) * 0.25), clamp(rgb.b + (255 - rgb.b) * 0.25)),
        rgbToHex(clamp(rgb.r + (255 - rgb.r) * 0.6), clamp(rgb.g + (255 - rgb.g) * 0.6), clamp(rgb.b + (255 - rgb.b) * 0.6)),
      ];
      // Draw palette image
      const width = 500, height = 100;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const segW = width / palette.length;
      palette.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(i * segW, 0, segW, height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(color, i * segW + segW / 2, height / 2 + 4);
      });
      const buf = canvas.toBuffer('image/png');
      const tmpPath = path.join(process.cwd(), 'tmp', `palette_${Date.now()}.png`);
      fs.ensureDirSync(path.dirname(tmpPath));
      fs.writeFileSync(tmpPath, buf);
      await sock.sendMessage(chatId, {
        image: { url: tmpPath },
        caption: `🎨 *COLOR PALETTE*\n\nBase: \`#${base}\`\n\n` + palette.map((c, i) => `${i + 1}. \`${c}\``).join('\n') + '\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
      }, { quoted: msg });
      fs.removeSync(tmpPath);
    }
  },

  {
    command: 'gradientgen',
    aliases: ['gradient', 'gradimg'],
    category: 'soultools',
    description: 'Generate a gradient image between two hex colors. Usage: gradientgen #ff0000 #0000ff',
    execute: async ({ args, sock, chatId, msg, reply }) => {
      let c1 = (args[0] || 'ff6b6b').replace('#', '');
      let c2 = (args[1] || '4ecdc4').replace('#', '');
      if (c1.length < 6) c1 = c1.padStart(6, '0');
      if (c2.length < 6) c2 = c2.padStart(6, '0');
      try {
        const width = 500, height = 150;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, `#${c1}`);
        grad.addColorStop(1, `#${c2}`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`#${c1} → #${c2}`, width / 2, height / 2 + 6);
        const buf = canvas.toBuffer('image/png');
        const tmpPath = path.join(process.cwd(), 'tmp', `grad_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, buf);
        await sock.sendMessage(chatId, { image: { url: tmpPath }, caption: `🌈 *Gradient*\n\nFrom: \`#${c1}\`  →  To: \`#${c2}\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) {
        reply(p.phrases.error(`gradient generation failed — ${e.message}`));
      }
    }
  }

];
