const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = [
  {
    command: 'randomname',
    aliases: ['fakename', 'genname'],
    category: 'soultools',
    description: 'Generate a random fake name',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://randomuser.me/api/?nat=us,gb,au&inc=name', { timeout: 8000 });
        const n = r.data.results[0].name;
        reply(`👤 *Random Name:* ${n.first} ${n.last}`);
      } catch {
        const first = ['James','Emma','Oliver','Sophia','Liam','Ava','Noah','Isabella'];
        const last = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller'];
        reply(`👤 *Random Name:* ${first[Math.floor(Math.random()*first.length)]} ${last[Math.floor(Math.random()*last.length)]}`);
      }
    }
  },
  {
    command: 'randomaddress',
    aliases: ['fakeaddress', 'genaddress'],
    category: 'soultools',
    description: 'Generate a random fake address',
    execute: async ({ reply }) => {
      const streets = ['Maple Ave','Oak St','Pine Blvd','Cedar Rd','Elm St','Birch Lane','Walnut Dr'];
      const cities = ['Springfield','Riverside','Oakwood','Lakewood','Fairview','Greenville','Burlington'];
      const states = ['CA','TX','NY','FL','IL','OH','GA'];
      const num = Math.floor(Math.random()*9000)+1000;
      const zip = Math.floor(Math.random()*90000)+10000;
      reply(`🏠 *Random Address:*\n\n${num} ${streets[Math.floor(Math.random()*streets.length)]}\n${cities[Math.floor(Math.random()*cities.length)]}, ${states[Math.floor(Math.random()*states.length)]} ${zip}\nUSA`);
    }
  },
  {
    command: 'randompassword',
    aliases: ['genpassword', 'secpass'],
    category: 'soultools',
    description: 'Generate a strong random password. Usage: randompassword 16',
    execute: async ({ args, reply }) => {
      const len = Math.min(parseInt(args[0])||16, 64);
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}';
      let pass = '';
      for (let i = 0; i < len; i++) pass += chars[Math.floor(Math.random()*chars.length)];
      reply(`🔐 *Random Password (${len} chars):*\n\n\`${pass}\`\n\n_Save this securely! 🔒_`);
    }
  },
  {
    command: 'uuid',
    aliases: ['genuuid', 'guidgen'],
    category: 'soultools',
    description: 'Generate a UUID v4',
    execute: async ({ reply }) => {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random()*16|0;
        return (c==='x' ? r : (r&0x3|0x8)).toString(16);
      });
      reply(`🔑 *UUID v4:*\n\n\`${uuid}\``);
    }
  },
  {
    command: 'timestamp',
    aliases: ['unixtime', 'epochtime'],
    category: 'soultools',
    description: 'Get current Unix timestamp and convert one. Usage: timestamp or timestamp 1700000000',
    execute: async ({ args, reply }) => {
      if (args[0]) {
        const ts = parseInt(args[0]);
        const d = new Date(ts * 1000);
        reply(`⏱️ *Timestamp Convert:*\n\nUnix: \`${ts}\`\nDate: ${d.toUTCString()}\nLocal: ${d.toLocaleString()}`);
      } else {
        const now = Math.floor(Date.now()/1000);
        reply(`⏱️ *Current Timestamp:*\n\nUnix: \`${now}\`\nDate: ${new Date().toUTCString()}`);
      }
    }
  },
  {
    command: 'hash',
    aliases: ['hashtext', 'md5hash'],
    category: 'soultools',
    description: 'Generate hash of text. Usage: hash your text here',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type your text after the command. example! .hash hello world'));
      const crypto = require('crypto');
      const md5 = crypto.createHash('md5').update(text).digest('hex');
      const sha1 = crypto.createHash('sha1').update(text).digest('hex');
      const sha256 = crypto.createHash('sha256').update(text).digest('hex');
      reply(`🔒 *Hash Results:*\n\n📝 Input: "${text.slice(0,30)}${text.length>30?'...':''}"\n\n🔹 MD5: \`${md5}\`\n🔸 SHA1: \`${sha1}\`\n🔺 SHA256: \`${sha256}\``);
    }
  },
  {
    command: 'emojiinfo',
    aliases: ['emojimean', 'whatisemoji'],
    category: 'soultools',
    description: 'Get info about an emoji. Usage: emojiinfo 😂',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide an emoji to get its info. example! .emojiinfo 😂'));
      const emoji = text.trim().match(/\p{Emoji}/u);
      if (!emoji) return reply('❌ *No emoji found* — send an emoji character');
      const cp = emoji[0].codePointAt(0);
      const hex = cp.toString(16).toUpperCase();
      reply(`😀 *Emoji Info: ${emoji[0]}*\n\nUnicode: U+${hex}\nCode Point: ${cp}\nHTML: &#${cp};\nJavaScript: \\u{${hex}}`);
    }
  },
  {
    command: 'currencylist',
    aliases: ['listcurrencies', 'currencies'],
    category: 'soultools',
    description: 'List popular currency codes for conversion',
    execute: async ({ reply }) => {
      reply(`💱 *Popular Currency Codes:*\n\nUSD 🇺🇸 Dollar\nEUR 🇪🇺 Euro\nGBP 🇬🇧 Pound\nJPY 🇯🇵 Yen\nCNY 🇨🇳 Yuan\nINR 🇮🇳 Rupee\nAUD 🇦🇺 AUD\nCAD 🇨🇦 CAD\nCHF 🇨🇭 Franc\nKRW 🇰🇷 Won\nMYR 🇲🇾 Ringgit\nSGD 🇸🇬 SGD\nNGN 🇳🇬 Naira\nZAR 🇿🇦 Rand\nBTC ₿ Bitcoin\nETH Ξ Ethereum\n\n_Use .currency <amount> <FROM> <TO> to convert_`);
    }
  },
  {
    command: 'texttomorse',
    aliases: ['morse', 'morseencode'],
    category: 'soultools',
    description: 'Convert text to Morse code. Usage: texttomorse HELLO',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type your text to convert to morse code. example! .texttomorse hello world'));
      const map = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.',' ':'/'};
      const out = text.toUpperCase().split('').map(c => map[c] || '?').join(' ');
      reply(`📡 *Morse Code:*\n\n${text.toUpperCase()}\n\n\`${out}\``);
    }
  },
  {
    command: 'morsedecode',
    aliases: ['fromMorse', 'morsetotext'],
    category: 'soultools',
    description: 'Decode Morse code to text. Usage: morsedecode .... . .-.. .-.. ---',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide morse code to decode. example! .morsedecode .... . .-.. .-.. ---'));
      const map = {'.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H','..':'I','.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P','--.-':'Q','.-.':'R','...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X','-.--':'Y','--..':'Z','-----':'0','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6','--...':'7','---..':'8','----.':'9','/':' '};
      const out = text.trim().split(' ').map(c => map[c] || '?').join('');
      reply(`📡 *Decoded Morse:*\n\n\`${text}\`\n\n${out}`);
    }
  },
  {
    command: 'romannum',
    aliases: ['toroman', 'romanconvert'],
    category: 'soultools',
    description: 'Convert number to Roman numerals. Usage: romannum 2024',
    execute: async ({ text, reply }) => {
      const num = parseInt(text);
      if (!num || num < 1 || num > 3999) return reply(p.phrases.wrongUsage('provide a number between 1 and 3999. example! .romannum 2024'));
      const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
      const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
      let n = num, result = '';
      for (let i = 0; i < vals.length; i++) {
        while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
      }
      reply(`🏛️ *Roman Numerals:*\n\n${num} = *${result}*`);
    }
  },
  {
    command: 'fromanroman',
    aliases: ['fromroman', 'romantonum'],
    category: 'soultools',
    description: 'Convert Roman numerals to number. Usage: fromanroman XIV',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide a roman numeral to convert. example! .fromanroman MMXXIV'));
      const map = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
      const str = text.toUpperCase().trim();
      if (!/^[IVXLCDM]+$/.test(str)) return reply('❌ *Invalid Roman numeral* — only I,V,X,L,C,D,M allowed');
      let result = 0;
      for (let i = 0; i < str.length; i++) {
        const cur = map[str[i]], next = map[str[i+1]];
        result += next && cur < next ? -cur : cur;
      }
      reply(`🏛️ *Roman → Number:*\n\n${str} = *${result}*`);
    }
  },
  {
    command: 'wordrhyme',
    aliases: ['rhyme'],
    category: 'soultools',
    description: 'Find rhymes for a word. Usage: wordrhyme moon',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the word you want rhymes for. example! .wordrhyme moon'));
      try {
        const r = await axios.get(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(text.trim())}&max=15`, { timeout: 8000 });
        if (!r.data.length) return reply(`🎵 *No rhymes found for "${text}"*`);
        const rhymes = r.data.map(w => w.word).join(', ');
        reply(`🎵 *Rhymes for "${text}":*\n\n${rhymes}`);
      } catch { reply('⚠️ *Rhyme finder unavailable*'); }
    }
  },
  {
    command: 'synonym',
    aliases: ['synonyms', 'similwords'],
    category: 'soultools',
    description: 'Find synonyms for a word. Usage: synonym happy',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the word you want synonyms for. example! .synonym happy'));
      try {
        const r = await axios.get(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(text.trim())}&max=15`, { timeout: 8000 });
        if (!r.data.length) return reply(`📚 *No synonyms found for "${text}"*`);
        const syns = r.data.map(w => w.word).join(', ');
        reply(`📚 *Synonyms for "${text}":*\n\n${syns}`);
      } catch { reply('⚠️ *Synonym finder unavailable*'); }
    }
  },
  {
    command: 'antonym',
    aliases: ['antonyms', 'oppositeword'],
    category: 'soultools',
    description: 'Find antonyms for a word. Usage: antonym happy',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the word you want antonyms for. example! .antonym happy'));
      try {
        const r = await axios.get(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(text.trim())}&max=10`, { timeout: 8000 });
        if (!r.data.length) return reply(`📚 *No antonyms found for "${text}"*`);
        const ants = r.data.map(w => w.word).join(', ');
        reply(`📚 *Antonyms for "${text}":*\n\n${ants}`);
      } catch { reply('⚠️ *Antonym finder unavailable*'); }
    }
  },
  {
    command: 'wordassociate',
    aliases: [ 'relatedwords'],
    category: 'soultools',
    description: 'Find words associated with a word. Usage: wordassociate ocean',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the word you want associations for. example! .wordassociate ocean'));
      try {
        const r = await axios.get(`https://api.datamuse.com/words?ml=${encodeURIComponent(text.trim())}&max=15`, { timeout: 8000 });
        if (!r.data.length) return reply(`🔗 *No associations found for "${text}"*`);
        const words = r.data.map(w => w.word).join(', ');
        reply(`🔗 *Words related to "${text}":*\n\n${words}`);
      } catch { reply('⚠️ *Word association unavailable*'); }
    }
  },
  {
    command: 'crypto',
    aliases: ['cryptoprice', 'coinprice'],
    category: 'soultools',
    description: 'Get live crypto price with 24h change. Usage: crypto BTC',
    execute: async ({ args, reply }) => {
      const input = (args[0] || 'BTC').toUpperCase();

      // Symbol → CoinGecko ID mapping
      const SYMBOL_MAP = {
        BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin', SOL: 'solana',
        ADA: 'cardano', XRP: 'ripple', DOGE: 'dogecoin', DOT: 'polkadot',
        MATIC: 'matic-network', SHIB: 'shiba-inu', LTC: 'litecoin',
        AVAX: 'avalanche-2', LINK: 'chainlink', UNI: 'uniswap',
        ATOM: 'cosmos', XLM: 'stellar', TRX: 'tron', NEAR: 'near',
        ALGO: 'algorand', FTM: 'fantom', SAND: 'the-sandbox',
        MANA: 'decentraland', APE: 'apecoin', PEPE: 'pepe',
        TON: 'the-open-network', ARB: 'arbitrum', OP: 'optimism',
      };

      const coinId = SYMBOL_MAP[input] || input.toLowerCase();

      try {
        const r = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,eur,gbp&include_24hr_change=true&include_market_cap=true`,
          { timeout: 10000 }
        );
        const data = r.data[coinId];
        if (!data) return reply(`❌ *Unknown coin: ${input}*\n\n_Try: BTC, ETH, BNB, SOL, ADA, XRP, DOGE, MATIC, LTC_`);

        const change = data.usd_24h_change;
        const changeStr = change != null
          ? `${change >= 0 ? '📈 +' : '📉 '}${change.toFixed(2)}%`
          : 'N/A';
        const mcap = data.usd_market_cap;
        const mcapStr = mcap
          ? mcap >= 1e9 ? `$${(mcap / 1e9).toFixed(2)}B` : `$${(mcap / 1e6).toFixed(2)}M`
          : 'N/A';

        reply(
          `💰 *${input} Price (CoinGecko)*\n\n` +
          `💵 USD: $${data.usd?.toLocaleString()}\n` +
          `💶 EUR: €${data.eur?.toLocaleString()}\n` +
          `💷 GBP: £${data.gbp?.toLocaleString()}\n\n` +
          `📊 24h Change: ${changeStr}\n` +
          `🏦 Market Cap: ${mcapStr}`
        );
      } catch { reply(`❌ *Crypto price unavailable*\n\nCheck: coinmarketcap.com`); }
    }
  },
  {
    command: 'nftsearch',
    aliases: ['nftlook', 'web3search'],
    category: 'soultools',
    description: 'Quick Web3/NFT info guide',
    execute: async ({ text, reply }) => {
      reply(`🎨 *Web3 / NFT Info*\n\n_Looking for:_ "${text || 'NFT info'}"\n\n🔗 Top platforms:\n• OpenSea: opensea.io\n• Rarible: rarible.com\n• Magic Eden: magiceden.io\n• Foundation: foundation.app\n\n💡 _Use .crypto to check coin prices_`);
    }
  },
  {
    command: 'npminfo',
    aliases: ['npmpackage', 'npmcheck'],
    category: 'soultools',
    description: 'Get npm package info. Usage: npminfo express',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide the npm package name. example! .npminfo express'));
      try {
        const r = await axios.get(`https://registry.npmjs.org/${text.trim()}`, { timeout: 10000 });
        const d = r.data;
        const latest = d['dist-tags']?.latest;
        const v = d.versions?.[latest];
        reply(
          `📦 *npm: ${d.name}*\n\n` +
          `📌 Latest: ${latest}\n` +
          `📝 ${d.description || 'No description'}\n` +
          `👤 Author: ${typeof d.author === 'object' ? d.author?.name : d.author || 'Unknown'}\n` +
          `📅 Updated: ${new Date(d.time?.[latest]).toDateString()}\n` +
          `📥 Weekly Downloads: (check npmjs.com)\n` +
          `🔗 https://npmjs.com/package/${d.name}`
        );
      } catch { reply(`❌ *Package not found: ${text}*`); }
    }
  },
  {
    command: 'pubgstats',
    aliases: ['gamestats2', 'playerstats'],
    category: 'arena',
    description: 'Fun fictional game stat generator. Usage: pubgstats YourName',
    execute: async ({ text, senderNumber, reply }) => {
      const name = text || senderNumber;
      const kd = (Math.random()*5).toFixed(2);
      const wins = Math.floor(Math.random()*500);
      const matches = wins + Math.floor(Math.random()*2000);
      const kills = Math.floor(Math.random()*5000);
      const dmg = Math.floor(Math.random()*800000);
      const hs = Math.floor(Math.random()*40);
      reply(
        `🎮 *Game Stats: ${name}*\n\n` +
        `💀 K/D Ratio: *${kd}*\n` +
        `🏆 Wins: *${wins}*\n` +
        `🎯 Total Matches: *${matches}*\n` +
        `🔫 Total Kills: *${kills}*\n` +
        `💥 Total Damage: *${dmg.toLocaleString()}*\n` +
        `🎯 Headshot Rate: *${hs}%*\n\n` +
        `_Generated for fun — not real stats_`
      );
    }
  },
  {
    command: 'fakecv',
    aliases: ['generatcv', 'resumegen'],
    category: 'soultools',
    description: 'Generate a fake CV/resume entry. Usage: fakecv John Doe',
    execute: async ({ text, senderNumber, reply }) => {
      const name = text || ('User' + senderNumber);
      const jobs = ['Senior Software Engineer','Product Manager','Data Scientist','UX Designer','DevOps Engineer','Marketing Director'];
      const companies = ['TechCorp Inc.','NexaGroup','InnovateLtd','DataFlow Systems','CloudBase Co.','StarVentures'];
      const skills = ['Python','JavaScript','Leadership','Machine Learning','React','AWS','Docker','Kubernetes','SQL','Communication'];
      const job = jobs[Math.floor(Math.random()*jobs.length)];
      const comp = companies[Math.floor(Math.random()*companies.length)];
      const yearsExp = Math.floor(Math.random()*15)+1;
      const pickedSkills = skills.sort(()=>Math.random()-0.5).slice(0,5);
      reply(
        `📋 *Fake CV: ${name}*\n\n` +
        `👔 Current Role: *${job}*\n` +
        `🏢 Company: *${comp}*\n` +
        `📅 Experience: *${yearsExp} years*\n` +
        `💡 Skills: ${pickedSkills.join(', ')}\n\n` +
        `_This is generated for fun only_ 😄`
      );
    }
  },
  {
    command: 'smartinsult',
    aliases: ['intellectualroast', 'cleverroast'],
    category: 'arena',
    description: 'Smart/intellectual roast. Usage: smartinsult @user',
    execute: async ({ msg, reply }) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const tNum = mentioned ? mentioned.split('@')[0] : null;
      const roasts = [
        "has the IQ of a Wikipedia loading screen 🧠",
        "is proof that evolution can sometimes hit the back button 🔙",
        "argues with the confidence of someone who once read half a tweet 🐦",
        "is the human equivalent of a software bug that nobody bothered to fix 🐛",
        "misunderstands things with Olympic-level precision 🏅",
        "has opinions that expired before expiry dates were invented 📅",
        "could overcomplicate a yes or no question in a vacuum 💨",
        "radiates the kind of energy that makes professors lower the curve just by showing up 📉",
      ];
      const r = roasts[Math.floor(Math.random()*roasts.length)];
      if (tNum) reply(`🎓 @${tNum} ${r}`, { mentions: [mentioned] });
      else reply(`🎓 ${r}`);
    }
  },
];
