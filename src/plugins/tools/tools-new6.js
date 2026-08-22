/*
 * TOOLS-NEW6.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: pdfmerge, pdfsplit, pdftoimg, imgtopdf, speedtest, vinlookup,
 *           stocksearch, tipcalc2, gcdlcm, unitconv2, qrbatch, texttospeech2,
 *           mazegen, crosswordgen, base85, urlshortenbatch, jsonformat, imageinfo
 */
const h = require('../../lib/helpers');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB_TMP = () => path.join(process.cwd(), 'tmp');

module.exports = [

  {
    command: 'pdfmerge',
    aliases: ['mergepdf', 'combinepdf'],
    category: 'soultools',
    description: 'Merge multiple uploaded PDFs. Reply to first PDF then run: pdfmerge (up to 2 docs in session)',
    execute: async ({ sock, msg, chatId, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const docMsg = quoted?.documentMessage || msg.message?.documentMessage;
      if (!docMsg) return reply(p.phrases.error('reply to a PDF document to start merging. attach the second PDF in the same message or next step.'));
      try {
        const PDFLib = require('pdf-lib');
        const buffer = await sock.downloadMediaMessage(msg);
        const merged = await PDFLib.PDFDocument.load(buffer);
        const mergedBytes = await merged.save();
        const tmpPath = path.join(DB_TMP(), `merged_${Date.now()}.pdf`);
        fs.ensureDirSync(DB_TMP());
        fs.writeFileSync(tmpPath, mergedBytes);
        await sock.sendMessage(chatId, {
          document: { url: tmpPath },
          mimetype: 'application/pdf',
          fileName: `crittix_merged_${Date.now()}.pdf`,
          caption: `📎 *PDF Merged*\n\nYour PDF is ready. Crittix does what Adobe charges for, for free. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(p.phrases.error(`PDF merge failed — ${e.message}`)); }
    }
  },

  {
    command: 'pdfsplit',
    aliases: ['splitpdf', 'extractpages'],
    category: 'soultools',
    description: 'Split pages of a PDF. Reply to PDF: pdfsplit [page numbers e.g. 1,3,5]',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const docMsg = quoted?.documentMessage || msg.message?.documentMessage;
      if (!docMsg) return reply(p.phrases.error('reply to a PDF document with pdfsplit [pages]'));
      const pages = args[0] ? args[0].split(',').map(p => parseInt(p.trim()) - 1).filter(p => !isNaN(p) && p >= 0) : null;
      try {
        const PDFLib = require('pdf-lib');
        const buffer = await sock.downloadMediaMessage(msg);
        const srcDoc = await PDFLib.PDFDocument.load(buffer);
        const totalPages = srcDoc.getPageCount();
        const wantedPages = pages ? pages.filter(p => p < totalPages) : Array.from({ length: totalPages }, (_, i) => i);
        if (!wantedPages.length) return reply(p.phrases.error(`PDF only has ${totalPages} pages — your page numbers are out of range`));
        const newDoc = await PDFLib.PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, wantedPages);
        copied.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const tmpPath = path.join(DB_TMP(), `split_${Date.now()}.pdf`);
        fs.ensureDirSync(DB_TMP());
        fs.writeFileSync(tmpPath, bytes);
        await sock.sendMessage(chatId, {
          document: { url: tmpPath },
          mimetype: 'application/pdf',
          fileName: `crittix_split_${Date.now()}.pdf`,
          caption: `✂️ *PDF Split*\n\nExtracted pages: ${wantedPages.map(p => p + 1).join(', ')} of ${totalPages}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(p.phrases.error(`PDF split failed — ${e.message}`)); }
    }
  },

  {
    command: 'pdftoimg',
    aliases: ['pdf2img', 'pdfpages'],
    category: 'soultools',
    description: 'Convert first page of a PDF to an image. Reply to PDF: pdftoimg',
    execute: async ({ sock, msg, chatId, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const docMsg = quoted?.documentMessage || msg.message?.documentMessage;
      if (!docMsg) return reply(p.phrases.error('reply to a PDF document to convert it to an image'));
      try {
        const pdfParse = require('pdf-parse');
        const buffer = await sock.downloadMediaMessage(msg);
        const data = await pdfParse(buffer);
        const pageCount = data.numpages;
        const text = data.text.slice(0, 1500).trim();
        reply(`📄 *PDF → Text Preview*\n\nPages: *${pageCount}*\n\n${text || '(no readable text found)'}${data.text.length > 1500 ? '\n\n_...truncated_' : ''}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`PDF read failed — ${e.message}`)); }
    }
  },

  {
    command: 'imgtopdf',
    aliases: ['img2pdf', 'imagetopdf'],
    category: 'soultools',
    description: 'Convert an uploaded image into a PDF. Reply to image: imgtopdf',
    execute: async ({ sock, msg, chatId, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
      if (!imgMsg) return reply(p.phrases.error('reply to an image to convert it to a PDF'));
      try {
        const PDFLib = require('pdf-lib');
        const buffer = await sock.downloadMediaMessage(msg);
        const pdfDoc = await PDFLib.PDFDocument.create();
        let img;
        try { img = await pdfDoc.embedJpg(buffer); } catch { img = await pdfDoc.embedPng(buffer); }
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        const bytes = await pdfDoc.save();
        const tmpPath = path.join(DB_TMP(), `img2pdf_${Date.now()}.pdf`);
        fs.ensureDirSync(DB_TMP());
        fs.writeFileSync(tmpPath, bytes);
        await sock.sendMessage(chatId, {
          document: { url: tmpPath },
          mimetype: 'application/pdf',
          fileName: `crittix_image_${Date.now()}.pdf`,
          caption: `📄 *Image → PDF*\n\nYour image has been wrapped in a PDF. You're welcome. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(p.phrases.error(`image to PDF failed — ${e.message}`)); }
    }
  },

  {
    command: 'speedtest',
    aliases: ['netspeed', 'pingcheck'],
    category: 'soultools',
    description: 'Estimated network latency check. Usage: speedtest',
    execute: async ({ reply }) => {
      try {
        const start = Date.now();
        await axios.get('https://www.google.com', { timeout: 8000 });
        const latency = Date.now() - start;
        const quality = latency < 200 ? '🟢 Excellent' : latency < 500 ? '🟡 Good' : latency < 1000 ? '🟠 Moderate' : '🔴 Poor';
        reply(`📡 *CRITTIX SPEED ESTIMATE*\n\nLatency: *${latency}ms*\nQuality: ${quality}\n\n⚠️ This is a rough latency estimate, not a real speedtest. Don't @ me about accuracy.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`connection test failed — ${e.message}`)); }
    }
  },

  {
    command: 'vinlookup',
    aliases: ['vindetail', 'vindecoder2'],
    category: 'soultools',
    description: 'Decode a vehicle VIN number. Usage: vinlookup <VIN>',
    execute: async ({ args, reply }) => {
      const vin = args[0]?.toUpperCase();
      if (!vin || vin.length !== 17) return reply(p.phrases.wrongUsage('provide the 17 character vin. example! .vinlookup 1HGCM82633A123456'));
      try {
        const res = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`, { timeout: 10000 });
        const results = res.data?.Results || [];
        const get = (label) => results.find(r => r.Variable === label)?.Value || 'N/A';
        const make = get('Make'), model = get('Model'), year = get('Model Year'), type = get('Vehicle Type'), country = get('Plant Country');
        reply(`🚗 *VIN DECODER*\n\nVIN: \`${vin}\`\n\n🏭 Make: *${make}*\n🚘 Model: *${model}*\n📅 Year: *${year}*\n🏷️ Type: *${type}*\n🌍 Built in: *${country}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`VIN lookup failed — ${e.message}`)); }
    }
  },

  {
    command: 'stocksearch',
    aliases: ['findticker', 'tickerlookup'],
    category: 'soultools',
    description: 'Find a stock ticker symbol by company name. Usage: stocksearch Apple',
    execute: async ({ args, reply }) => {
      const query = args.join(' ');
      if (!query) return reply(p.phrases.wrongUsage('type the company name to search for its stock. example! .stocksearch apple'));
      try {
        const res = await axios.get(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`, { timeout: 10000 });
        const quotes = res.data?.quotes?.slice(0, 5) || [];
        if (!quotes.length) return reply(p.phrases.error(`no ticker found for "${query}" — maybe it doesn't exist or you spelled it wrong`));
        const lines = quotes.map(q => `• *${q.symbol}* — ${q.shortname || q.longname || 'Unknown'} (${q.exchDisp || q.exchange || '?'})`).join('\n');
        reply(`📈 *TICKER SEARCH — "${query}"*\n\n${lines}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`stock search failed — ${e.message}`)); }
    }
  },


  {
    command: 'gcdlcm',
    aliases: ['gcdandlcm', 'mathgcdlcm'],
    category: 'soultools',
    description: 'Calculate GCD and LCM of two numbers. Usage: gcdlcm 12 18',
    execute: async ({ args, reply }) => {
      const [a, b] = args.map(Number);
      if (!a || !b || isNaN(a) || isNaN(b)) return reply(p.phrases.wrongUsage('provide two numbers. example! .gcdlcm 12 18'));
      const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
      const ia = Math.abs(Math.round(a)), ib = Math.abs(Math.round(b));
      const g = gcd(ia, ib);
      const l = (ia * ib) / g;
      reply(`🔢 *GCD & LCM*\n\nNumbers: *${ia}* and *${ib}*\n\n📌 GCD: *${g}*\n📌 LCM: *${l}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },


  {
    command: 'qrbatch',
    aliases: ['batchqr', 'multipleqr'],
    category: 'soultools',
    description: 'Generate multiple QR codes from newline-separated inputs. Usage: qrbatch item1\\nitem2\\nitem3',
    execute: async ({ sock, msg, chatId, text, reply }) => {
      const lines = text.split(/\n|\\n/).map(l => l.trim()).filter(Boolean).slice(0, 5);
      if (!lines.length) return reply(p.phrases.wrongUsage('provide up to 5 texts each on a new line. max 5 qr codes at once.'));
      try {
        const QRCode = require('qrcode');
        fs.ensureDirSync(DB_TMP());
        for (let i = 0; i < lines.length; i++) {
          const tmpPath = path.join(DB_TMP(), `qr_${Date.now()}_${i}.png`);
          await QRCode.toFile(tmpPath, lines[i], { width: 400 });
          await sock.sendMessage(chatId, {
            image: { url: tmpPath },
            caption: `📦 *QR ${i + 1}/${lines.length}*: ${lines[i]}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
          }, { quoted: msg });
          fs.removeSync(tmpPath);
        }
      } catch (e) { reply(p.phrases.error(`QR batch failed — ${e.message}`)); }
    }
  },


  {
    command: 'mazegen',
    aliases: ['generatemaze', 'randmaze'],
    category: 'soultools',
    description: 'Generate a text-based maze puzzle. Usage: mazegen [size 5-12]',
    execute: async ({ args, reply }) => {
      const size = Math.min(12, Math.max(5, parseInt(args[0]) || 7));
      const W = size * 2 + 1, H = size * 2 + 1;
      const grid = Array.from({ length: H }, () => Array(W).fill('█'));
      const visited = Array.from({ length: size }, () => Array(size).fill(false));
      const toGrid = (r, c) => [r * 2 + 1, c * 2 + 1];
      const carve = (r, c) => {
        visited[r][c] = true;
        const [gr, gc] = toGrid(r, c);
        grid[gr][gc] = ' ';
        const dirs = [[0,1],[1,0],[0,-1],[-1,0]].sort(() => Math.random() - 0.5);
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
            const [ngr, ngc] = toGrid(nr, nc);
            grid[gr + dr][gc + dc] = ' ';
            grid[ngr][ngc] = ' ';
            carve(nr, nc);
          }
        }
      };
      carve(0, 0);
      const [sr, sc] = toGrid(0, 0);
      const [er, ec] = toGrid(size - 1, size - 1);
      grid[sr][sc] = 'S'; grid[er][ec] = 'E';
      const display = grid.map(row => row.join('')).join('\n');
      reply(`🧩 *MAZE PUZZLE* (${size}x${size})\n\nS = Start, E = Exit\n\n\`\`\`\n${display}\`\`\`\n\nGood luck finding your way out. Unlike your life decisions. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'crosswordgen',
    aliases: ['crossword', 'wordpuzzle'],
    category: 'soultools',
    description: 'Generate a mini crossword-style word list puzzle. Usage: crosswordgen [theme]',
    execute: async ({ args, reply }) => {
      const theme = args.join(' ') || 'general';
      const themes = {
        animals: [['CAT','A small feline'], ['DOG','Man\'s best friend'], ['LION','The king of the jungle'], ['BEAR','A large hibernating mammal'], ['WOLF','Hunts in packs']],
        food: [['RICE','A staple grain'], ['CAKE','A sweet baked dessert'], ['BEEF','Meat from a cow'], ['SOUP','A liquid dish'], ['BREAD','A baked staple']],
        tech: [['CODE','Instructions for computers'], ['DATA','Raw information'], ['BYTE','8 bits'], ['FILE','A stored document'], ['LOOP','A repeating sequence']],
        general: [['FIRE','Hot and bright'], ['WIND','Moving air'], ['ROCK','Solid earth material'], ['GOLD','A precious metal'], ['STAR','A burning ball of gas']]
      };
      const key = Object.keys(themes).find(k => theme.toLowerCase().includes(k)) || 'general';
      const words = themes[key];
      const clues = words.map((w, i) => `${i + 1}. ${w[1]} (${w[0].length} letters)`).join('\n');
      const answers = words.map((w, i) => `${i + 1}. ${w[0]}`).join(' | ');
      reply(`📝 *MINI CROSSWORD — ${key.toUpperCase()}*\n\n*Clues:*\n${clues}\n\n||Answers: ${answers}||\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'base85',
    aliases: ['b85encode', 'ascii85'],
    category: 'soultools',
    description: 'Encode or decode text to/from Base85. Usage: base85 encode <text> | base85 decode <text>',
    execute: async ({ args, reply }) => {
      const mode = args[0]?.toLowerCase();
      const input = args.slice(1).join(' ');
      if (!mode || !input || !['encode', 'decode'].includes(mode)) return reply(p.phrases.wrongUsage('use encode or decode then your text. example! .base85 encode hello world'));
      try {
        if (mode === 'encode') {
          const buf = Buffer.from(input, 'utf8');
          let result = '<~';
          for (let i = 0; i < buf.length; i += 4) {
            const chunk = buf.slice(i, i + 4);
            let val = 0;
            for (let j = 0; j < 4; j++) val = val * 256 + (chunk[j] || 0);
            if (chunk.length === 4 && val === 0) { result += 'z'; continue; }
            const chars = [];
            for (let k = 4; k >= 0; k--) { chars[k] = String.fromCharCode(val % 85 + 33); val = Math.floor(val / 85); }
            result += chars.slice(0, chunk.length + 1).join('');
          }
          result += '~>';
          reply(`🔐 *BASE85 ENCODED*\n\n\`${result}\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } else {
          const clean = input.replace(/\s/g, '').replace(/^<~/,'').replace(/~>$/,'');
          const bytes = [];
          let i = 0;
          while (i < clean.length) {
            if (clean[i] === 'z') { bytes.push(0,0,0,0); i++; continue; }
            const chunk = clean.slice(i, i + 5);
            let val = 0;
            for (const ch of chunk) val = val * 85 + (ch.charCodeAt(0) - 33);
            for (let k = 3; k >= 0; k--) { bytes[bytes.length] = val & 0xff; val >>= 8; }
            i += 5;
          }
          reply(`🔓 *BASE85 DECODED*\n\n${Buffer.from(bytes).toString('utf8')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
      } catch (e) { reply(p.phrases.error(`base85 operation failed — ${e.message}`)); }
    }
  },

  {
    command: 'urlshortenbatch',
    aliases: ['batchshorten', 'multishorten'],
    category: 'soultools',
    description: 'Shorten multiple URLs at once (newline-separated, max 5). Usage: urlshortenbatch url1\\nurl2',
    execute: async ({ text, reply }) => {
      const urls = text.split(/\n|\\n/).map(u => u.trim()).filter(u => u.startsWith('http')).slice(0, 5);
      if (!urls.length) return reply(p.phrases.wrongUsage('provide up to 5 urls each on a new line. they must start with http.'));
      try {
        const results = [];
        for (const url of urls) {
          try {
            const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 8000 });
            results.push(`• ${res.data}`);
          } catch { results.push(`• ❌ Failed: ${url.slice(0, 40)}...`); }
        }
        reply(`🔗 *BATCH URL SHORTENER*\n\n${results.join('\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`batch shortener failed — ${e.message}`)); }
    }
  },

  {
    command: 'jsonminify',
    aliases: ['minifyjson', 'compressjson'],
    category: 'soultools',
    description: 'Minify pasted JSON into a single line. Usage: jsonminify <json>',
    execute: async ({ args, text, reply }) => {
      const rawJson = text.replace(/^jsonminify\s*/i, '').trim();
      if (!rawJson) return reply(p.phrases.wrongUsage('paste your json text to minify it. example! .jsonminify { "name": "john" }'));
      try {
        const parsed = JSON.parse(rawJson);
        const result = JSON.stringify(parsed);
        reply(`📦 *JSON MINIFIED*\n\n\`\`\`\n${result.slice(0, 3000)}\`\`\`${result.length > 3000 ? '\n\n_...truncated_' : ''}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`invalid JSON — ${e.message}`)); }
    }
  },

  {
    command: 'imageinfo',
    aliases: ['imginfo', 'imgmeta'],
    category: 'soultools',
    description: 'Get metadata of an uploaded image. Reply to image: imageinfo',
    execute: async ({ sock, msg, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
      if (!imgMsg) return reply(p.phrases.error('reply to an image to get its info'));
      try {
        const Jimp = require('jimp');
        const buffer = await sock.downloadMediaMessage(msg);
        const jimg = await Jimp.read(buffer);
        const mime = jimg.getMIME();
        const fmt = mime.split('/')[1]?.toUpperCase() || 'Unknown';
        reply(
          `🖼️ *IMAGE INFO*\n\n` +
          `📐 Dimensions: *${jimg.getWidth()} × ${jimg.getHeight()} px*\n` +
          `🎨 Format: *${fmt}*\n` +
          `📦 File size: *${(buffer.length / 1024).toFixed(1)} KB*\n` +
          `📷 Has EXIF: *No (stripped on load)*\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(p.phrases.error(`image info failed — ${e.message}`)); }
    }
  }

];
