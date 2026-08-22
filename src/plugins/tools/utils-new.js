/*
 * UTILS-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: phonenumberinfo, emailvalidate, timezone2, wordfreq, textsummarize,
 *           linkscraper, imageresize2, colorname, dicepoker, numberplate,
 *           passwordaudit, base91, hextocolor, ipsubnet
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const p = require('../../lib/phrases');


// ─── Color name lookup (nearest named color) ──────────────────────────────
const NAMED_COLORS = [
  ['Red','#FF0000'],[' Scarlet','#FF2400'],['Crimson','#DC143C'],['Orange','#FFA500'],
  ['Gold','#FFD700'],['Yellow','#FFFF00'],['Lime','#00FF00'],['Green','#008000'],
  ['Teal','#008080'],['Cyan','#00FFFF'],['SkyBlue','#87CEEB'],['Blue','#0000FF'],
  ['Navy','#000080'],['Purple','#800080'],['Violet','#EE82EE'],['Magenta','#FF00FF'],
  ['Pink','#FFC0CB'],['White','#FFFFFF'],['Silver','#C0C0C0'],['Gray','#808080'],
  ['Black','#000000'],['Brown','#A52A2A'],['Coral','#FF7F50'],['Salmon','#FA8072'],
  ['Ivory','#FFFFF0'],['Beige','#F5F5DC'],['Maroon','#800000'],['Olive','#808000'],
  ['Outrageous Orange','#FF5733'],['Turquoise','#40E0D0'],['Indigo','#4B0082'],['Mint','#98FF98'],
];
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
};
const colorDistance = ([r1,g1,b1],[r2,g2,b2]) => Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2);
const findNearestColor = (hex) => {
  let best = NAMED_COLORS[0], bestDist = Infinity;
  const rgb = hexToRgb(hex.padEnd(7,'0'));
  for (const [name, namedHex] of NAMED_COLORS) {
    const d = colorDistance(rgb, hexToRgb(namedHex));
    if (d < bestDist) { bestDist = d; best = [name, namedHex]; }
  }
  return best;
};

// ─── Dice poker hands ──────────────────────────────────────────────────────
const evaluateDicePoker = (dice) => {
  const counts = {};
  dice.forEach(d => { counts[d] = (counts[d] || 0) + 1; });
  const vals = Object.values(counts).sort((a,b) => b-a);
  const keys = Object.keys(counts).map(Number).sort((a,b)=>a-b);
  if (vals[0] === 5) return 'FIVE OF A KIND 🎰';
  if (vals[0] === 4) return 'FOUR OF A KIND 💪';
  if (vals[0] === 3 && vals[1] === 2) return 'FULL HOUSE 🏠';
  const isFlush = keys.length === 5 && (keys[4]-keys[0]) === 4 && new Set(keys).size === 5;
  if (isFlush) return 'STRAIGHT 📈';
  if (vals[0] === 3) return 'THREE OF A KIND 🎲';
  if (vals[0] === 2 && vals[1] === 2) return 'TWO PAIR ✌️';
  if (vals[0] === 2) return 'ONE PAIR 👊';
  return 'HIGH CARD 😔';
};

// ─── Number plate formats ─────────────────────────────────────────────────
const PLATE_FORMATS = {
  'ng': () => `${randLetter()}${randLetter()}${randNum()}${randNum()} ${randLetter()}${randLetter}${randLetter()}`.replace(/\s/,' '),
  'uk': () => `${randLetter()}${randLetter()}${randNum()}${randNum()} ${randLetter()}${randLetter()}${randLetter()}`,
  'us': () => `${randLetter()}${randLetter()}${randLetter()}-${randNum()}${randNum()}${randNum()}`,
  'de': () => `${randLetter()}${randLetter()} ${randLetter()}${randLetter()} ${randNum()}${randNum()}${randNum()}`,
  'gh': () => `GH-${randNum()}${randNum()}${randNum()}-${randNum()}${randNum()}`,
};
const randLetter = () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random()*23)];
const randNum = () => Math.floor(Math.random()*10);
const fmtPlate = (country) => {
  const fn = PLATE_FORMATS[country.toLowerCase()] || PLATE_FORMATS['us'];
  return fn();
};

// ─── Base91 encoding ──────────────────────────────────────────────────────
const BASE91_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
const encodeBase91 = (input) => {
  const bytes = Buffer.from(input, 'utf8');
  let b = 0, n = 0, out = '';
  for (const byte of bytes) {
    b |= byte << n;
    n += 8;
    if (n > 13) { let v = b & 8191; if (v > 88) { b >>= 13; n -= 13; } else { v = b & 16383; b >>= 14; n -= 14; } out += BASE91_CHARS[v % 91] + BASE91_CHARS[Math.floor(v / 91)]; }
  }
  if (n) { out += BASE91_CHARS[b % 91]; if (n > 7 || b > 90) out += BASE91_CHARS[Math.floor(b / 91)]; }
  return out;
};
const decodeBase91 = (input) => {
  let v = -1, b = 0, n = 0; const out = [];
  for (const c of input) {
    const p = BASE91_CHARS.indexOf(c);
    if (p < 0) continue;
    if (v < 0) { v = p; } else { v += p * 91; b |= v << n; n += (v & 8191) > 88 ? 13 : 14; v = -1; do { out.push(b & 255); b >>= 8; n -= 8; } while (n > 7); }
  }
  if (v > -1) out.push((b | v << n) & 255);
  return Buffer.from(out).toString('utf8');
};

// ─── Common weak passwords ────────────────────────────────────────────────
const WEAK_PASSWORDS = new Set(['password','123456','password123','admin','letmein','welcome','qwerty','abc123','iloveyou','monkey','shadow','123456789','password1','12345678','1234567','sunshine','princess','football','charlie','donald','batman','master','superman','hello','freedom']);

module.exports = [

  {
    command: 'phonenumberinfo',
    aliases: ['phoneinfo', 'numinfo'],
    category: 'soultools',
    description: 'Look up carrier/region info for a phone number. Usage: .phonenumberinfo <number>',
    execute: async ({ text, args, reply }) => {
      const num = (text || args.join(' ')).replace(/\s+/g,'').replace(/^00/,'+');
      if (!num) return reply(p.phrases.wrongUsage('provide a phone number with country code. example! .phonenumberinfo +2348012345678'));
      try {
        const { parsePhoneNumber, getCountries, getCountryCallingCode } = require('libphonenumber-js');
        const phone = parsePhoneNumber(num.startsWith('+') ? num : `+${num}`);
        if (!phone?.isValid()) return reply(p.phrases.error(`Invalid phone number: ${num}`));
        reply(
          `📱 *PHONE NUMBER INFO*\n\n` +
          `📞 Number: *${phone.formatInternational()}*\n` +
          `🌍 Country: *${phone.country || 'Unknown'}*\n` +
          `📡 Type: *${phone.getType() || 'Unknown'}*\n` +
          `✅ Valid: *${phone.isValid() ? 'Yes' : 'No'}*\n` +
          `🔢 National: *${phone.formatNational()}*\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(p.phrases.error(`Phone lookup failed: ${e.message}`)); }
    }
  },

  {
    command: 'emailvalidate',
    aliases: ['checkemail', 'validateemail'],
    category: 'soultools',
    description: 'Check if an email address is valid and domain has MX records. Usage: .emailvalidate <email>',
    execute: async ({ text, args, reply }) => {
      const email = (text || args.join(' ')).trim().toLowerCase();
      if (!email) return reply(p.phrases.wrongUsage('provide an email address. example! .emailvalidate test@gmail.com'));
      const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      const formatOk = emailRegex.test(email);
      const domain = email.split('@')[1];
      if (!formatOk) return reply(`❌ *Email Validation*\n\nEmail: ${email}\nFormat: *INVALID*\nFix the format first.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      try {
        const dns = require('dns').promises;
        const mxRecords = await dns.resolveMx(domain).catch(() => []);
        const hasMx = mxRecords.length > 0;
        reply(
          `📧 *EMAIL VALIDATION*\n\n` +
          `📩 Email: *${email}*\n` +
          `✅ Format: *VALID*\n` +
          `🌐 Domain: *${domain}*\n` +
          `📮 MX Records: *${hasMx ? `YES (${mxRecords.length} record${mxRecords.length > 1 ? 's' : ''})` : 'NONE — domain might not accept email'}*\n` +
          `${hasMx ? '✅ Looks deliverable' : '⚠️ Domain has no mail server — may bounce'}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(p.phrases.error(`Email validation failed: ${e.message}`)); }
    }
  },


  {
    command: 'wordfreq',
    aliases: ['wordcount', 'topwords'],
    category: 'soultools',
    description: 'Count word frequency in text, show top 10. Usage: .wordfreq <text>',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('paste your text to analyze word frequency. example! .wordfreq paste your paragraph here'));
      const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','as','is','was','are','were','be','been','have','has','had','that','this','it','its']);
      const words = input.toLowerCase().replace(/[^a-z\s]/g,'').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      const freq = {};
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      const top10 = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10);
      if (!top10.length) return reply(p.phrases.error('No meaningful words found. Try longer text.'));
      const list = top10.map(([w,c],i) => `${i+1}. *${w}* — ${c}x`).join('\n');
      reply(`📊 *WORD FREQUENCY*\n\n_Top 10 words (${words.length} total):_\n\n${list}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'textsummarize',
    aliases: ['summarizetext', 'tldr'],
    category: 'soultools',
    description: 'Extractive summarization of a text block. Usage: .textsummarize <text>',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input || input.length < 50) return reply(p.phrases.error('Give me at least 50 characters of text to summarize, genius.'));
      // Extractive summarization: score sentences by word frequency
      const sentences = input.match(/[^.!?]+[.!?]*/g) || [input];
      const words = input.toLowerCase().replace(/[^a-z\s]/g,'').split(/\s+/);
      const freq = {};
      words.forEach(w => { if (w.length > 3) freq[w] = (freq[w]||0) + 1; });
      const scored = sentences.map(s => ({
        text: s.trim(),
        score: s.toLowerCase().split(/\s+/).reduce((sum,w) => sum + (freq[w]||0), 0)
      }));
      const top = scored.sort((a,b) => b.score-a.score).slice(0, Math.min(3, sentences.length));
      const summary = top.map(s => s.text).join(' ');
      reply(
        `📝 *SUMMARY*\n\n` +
        `${summary.substring(0, 600)}\n\n` +
        `_Original: ${input.length} chars → Summary: ${summary.length} chars (${Math.round((1 - summary.length/input.length)*100)}% shorter)_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'linkscraper',
    aliases: ['extractlinks', 'findurls'],
    category: 'soultools',
    description: 'Extract all URLs from a block of text. Usage: .linkscraper <text>',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.error('Give me text to scrape URLs from.'));
      const urlRegex = /https?:\/\/[^\s,;"'<>]+/gi;
      const urls = [...new Set(input.match(urlRegex) || [])];
      if (!urls.length) return reply(`🔗 *LINK SCRAPER*\n\nNo URLs found in that text.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      const list = urls.slice(0, 20).map((u, i) => `${i+1}. ${u}`).join('\n');
      reply(`🔗 *LINK SCRAPER — ${urls.length} URL(s) found*\n\n${list}${urls.length > 20 ? `\n\n_...and ${urls.length-20} more_` : ''}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },


  {
    command: 'colorname',
    aliases: ['namethiscolor', 'colorlookup'],
    category: 'soultools',
    description: 'Find the closest named color for a hex code. Usage: .colorname #FF5733',
    execute: async ({ text, args, reply }) => {
      let hex = (text || args[0] || '').trim().replace('#','');
      if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return reply(p.phrases.error('Invalid hex code. Use format: #FF5733 or FF5733'));
      const [name, namedHex] = findNearestColor(`#${hex}`);
      const [r,g,b] = hexToRgb(`#${hex}`);
      reply(`🎨 *COLOR NAME*\n\nHex: *#${hex.toUpperCase()}*\nNearest named color: *${name}*\nNamed hex: *${namedHex}*\nRGB: *rgb(${r}, ${g}, ${b})*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'dicepoker',
    aliases: ['rollpoker', 'fivedicegame'],
    category: 'arena',
    description: 'Roll 5 dice and evaluate the poker hand. Usage: .dicepoker',
    execute: async ({ reply }) => {
      const dice = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
      const faces = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };
      const hand = evaluateDicePoker(dice);
      reply(
        `🎲 *DICE POKER*\n\n` +
        `${dice.map(d => faces[d]).join('  ')}\n` +
        `_(${dice.join(', ')})_\n\n` +
        `🃏 Hand: *${hand}*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'numberplate',
    aliases: ['fakeplate', 'genplate'],
    category: 'soultools',
    description: 'Generate a random vehicle number plate in a country format. Usage: .numberplate ng|uk|us|de|gh',
    execute: async ({ text, args, reply }) => {
      const country = (text || args[0] || 'us').toLowerCase();
      const plate = fmtPlate(country);
      const available = Object.keys(PLATE_FORMATS).join(', ');
      reply(`🚗 *NUMBER PLATE GENERATOR*\n\nCountry: *${country.toUpperCase()}*\nPlate: *${plate}*\n\n_For fun only. Not real._\nAvailable: ${available}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'passwordaudit',
    aliases: ['auditpassword', 'pwdaudit'],
    category: 'soultools',
    description: 'Detailed password strength audit. Usage: .passwordaudit <password>',
    execute: async ({ text, args, reply }) => {
      const pwd = text || args.join(' ');
      if (!pwd) return reply(p.phrases.wrongUsage('provide the password you want audited. example! .passwordaudit mypassword123'));
      const issues = [];
      const checks = [];
      if (pwd.length < 8) issues.push('Too short (under 8 chars)');
      checks.push(`Length: ${pwd.length} chars ${pwd.length >= 12 ? '✅' : pwd.length >= 8 ? '⚠️' : '❌'}`);
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNum = /[0-9]/.test(pwd);
      const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
      checks.push(`Uppercase: ${hasUpper ? '✅' : '❌'}`);
      checks.push(`Lowercase: ${hasLower ? '✅' : '❌'}`);
      checks.push(`Numbers: ${hasNum ? '✅' : '❌'}`);
      checks.push(`Symbols: ${hasSymbol ? '✅' : '❌'}`);
      const isCommon = WEAK_PASSWORDS.has(pwd.toLowerCase());
      checks.push(`Known weak password: ${isCommon ? '❌ YES' : '✅ No'}`);
      if (isCommon) issues.push('This is a commonly known weak password');
      const hasRepeat = /(.)\1{2,}/.test(pwd);
      if (hasRepeat) issues.push('Repeated characters detected');
      const hasSequential = /(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/.test(pwd.toLowerCase());
      if (hasSequential) issues.push('Sequential patterns detected');
      const charTypes = [hasUpper,hasLower,hasNum,hasSymbol].filter(Boolean).length;
      const score = Math.min(100, Math.max(0, (pwd.length * 4) + (charTypes * 10) - (issues.length * 15) - (isCommon ? 50 : 0)));
      const rating = score >= 80 ? '🟢 STRONG' : score >= 50 ? '🟡 MODERATE' : '🔴 WEAK';
      reply(
        `🔐 *PASSWORD AUDIT*\n\n` +
        `${checks.join('\n')}\n\n` +
        `📊 Score: *${score}/100*\n` +
        `Rating: *${rating}*\n` +
        `${issues.length ? `\n⚠️ Issues:\n${issues.map(i=>`• ${i}`).join('\n')}` : '\n✅ No major issues found'}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'base91',
    aliases: ['b91encode', 'b91decode'],
    category: 'soultools',
    description: 'Base91 encode or decode text. Usage: .base91 encode <text> | .base91 decode <text>',
    execute: async ({ text, args, reply }) => {
      const action = (args[0] || 'encode').toLowerCase();
      const input = args.slice(1).join(' ') || text?.replace(/^(encode|decode)\s*/i,'').trim();
      if (!input) return reply(p.phrases.wrongUsage('use encode or decode then your text. example! .base91 encode hello world'));
      try {
        if (action === 'encode') {
          const encoded = encodeBase91(input);
          reply(`🔡 *BASE91 ENCODED*\n\n${encoded}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } else {
          const decoded = decodeBase91(input);
          reply(`🔓 *BASE91 DECODED*\n\n${decoded}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
      } catch (e) { reply(p.phrases.error(`Base91 failed: ${e.message}`)); }
    }
  },

  {
    command: 'hextocolor',
    aliases: ['hex2color', 'colorinfo2'],
    category: 'soultools',
    description: 'Convert hex color to RGB, HSL and show swatch image. Usage: .hextocolor #FF5733',
    execute: async ({ sock, msg, chatId, text, args, reply }) => {
      let hex = (text || args[0] || '').trim().replace('#','');
      if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return reply(p.phrases.error('Invalid hex. Use: .hextocolor #FF5733'));
      const [r,g,b] = hexToRgb(`#${hex}`);
      const r1=r/255, g1=g/255, b1=b/255;
      const max=Math.max(r1,g1,b1), min=Math.min(r1,g1,b1), l=(max+min)/2;
      let h2=0, s=0;
      if (max!==min) {
        const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
        if (max===r1) h2=((g1-b1)/d+(g1<b1?6:0))/6;
        else if (max===g1) h2=((b1-r1)/d+2)/6;
        else h2=((r1-g1)/d+4)/6;
      }
      const hsl = `hsl(${Math.round(h2*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
      const [name] = findNearestColor(`#${hex}`);
      try {
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(300, 100);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = `#${hex}`;
        ctx.fillRect(0, 0, 300, 100);
        ctx.fillStyle = l > 0.5 ? '#000' : '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`#${hex.toUpperCase()}`, 150, 55);
        const buf = canvas.toBuffer('image/png');
        const tmpPath = path.join(process.cwd(), 'tmp', `color_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, buf);
        await sock.sendMessage(chatId, {
          image: { url: tmpPath },
          caption: `🎨 *COLOR: #${hex.toUpperCase()}*\n\nRGB: *rgb(${r}, ${g}, ${b})*\nHSL: *${hsl}*\nNearest Name: *${name}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch {
        reply(`🎨 *COLOR: #${hex.toUpperCase()}*\n\nRGB: *rgb(${r}, ${g}, ${b})*\nHSL: *${hsl}*\nNearest Name: *${name}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
    }
  },

  {
    command: 'ipsubnet',
    aliases: ['subnetcalc', 'cidrinfo'],
    category: 'soultools',
    description: 'Calculate subnet info for an IP/CIDR. Usage: .ipsubnet 192.168.1.0/24',
    execute: async ({ text, args, reply }) => {
      const input = (text || args[0] || '').trim();
      if (!input || !input.includes('/')) return reply(p.phrases.wrongUsage('provide an ip address with cidr notation. example! .ipsubnet 192.168.1.0/24'));
      const [ip, cidrStr] = input.split('/');
      const cidr = parseInt(cidrStr);
      if (isNaN(cidr) || cidr < 0 || cidr > 32) return reply(p.phrases.error('CIDR must be 0-32. e.g. /24'));
      const octets = ip.split('.').map(Number);
      if (octets.length !== 4 || octets.some(o => isNaN(o) || o > 255)) return reply(p.phrases.error('Invalid IP address format.'));
      const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
      const ipInt = (octets[0]<<24|octets[1]<<16|octets[2]<<8|octets[3]) >>> 0;
      const networkInt = (ipInt & mask) >>> 0;
      const broadcastInt = (networkInt | (~mask >>> 0)) >>> 0;
      const toIp = (n) => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
      const hosts = cidr >= 31 ? Math.pow(2,32-cidr) : Math.pow(2,32-cidr) - 2;
      const maskStr = toIp(mask);
      reply(
        `🌐 *SUBNET CALCULATOR*\n\n` +
        `📍 Input: *${input}*\n` +
        `🔢 Network: *${toIp(networkInt)}*\n` +
        `📡 Broadcast: *${toIp(broadcastInt)}*\n` +
        `🎭 Subnet Mask: *${maskStr}*\n` +
        `💻 Usable Hosts: *${hosts.toLocaleString()}*\n` +
        `📊 Host Range: *${toIp(networkInt+1)} — ${toIp(broadcastInt-1)}*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }

];
