const axios = require('axios');
const p = require('../../lib/phrases');


const owoMap = { r: 'w', l: 'w', R: 'W', L: 'W' };
const leetMap = { a:'4',e:'3',i:'1',o:'0',s:'5',t:'7',g:'9',b:'8' };
const natoAlpha = {a:'Alpha',b:'Bravo',c:'Charlie',d:'Delta',e:'Echo',f:'Foxtrot',g:'Golf',
  h:'Hotel',i:'India',j:'Juliet',k:'Kilo',l:'Lima',m:'Mike',n:'November',o:'Oscar',
  p:'Papa',q:'Quebec',r:'Romeo',s:'Sierra',t:'Tango',u:'Uniform',v:'Victor',
  w:'Whiskey',x:'X-ray',y:'Yankee',z:'Zulu'};

function rot13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}
function toFullWidth(str) {
  return str.replace(/[!-~]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0));
}
function toSuperscript(str) {
  const map = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
    'a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ',
    'k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ',
    'v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ'};
  return str.toLowerCase().split('').map(c => map[c] || c).join('');
}
function zalgo(str) {
  const up = ['̍','̎','̄','̅','̿','̑','̆','̐','͒','͗','͑','̇','̈','̊','͂','̓','̈'];
  const down = ['̖','̗','̘','̙','̜','̝','̞','̟','̠','̤','̥','̦','̩','̪','̫','̬','̭'];
  return str.split('').map(c => {
    if (c === ' ') return c;
    const u = up[Math.floor(Math.random()*up.length)];
    const d = down[Math.floor(Math.random()*down.length)];
    return c + u + d;
  }).join('');
}
function piglatin(word) {
  const vowels = 'aeiou';
  const w = word.toLowerCase();
  if (vowels.includes(w[0])) return w + 'way';
  let i = 0;
  while (i < w.length && !vowels.includes(w[i])) i++;
  return w.slice(i) + w.slice(0,i) + 'ay';
}
function mockText(str) {
  return str.split('').map((c,i) => i%2===0 ? c.toLowerCase() : c.toUpperCase()).join('');
}

module.exports = [
  {
    command: 'owoify',
    aliases: ['owo'],
    category: 'creativetools',
    description: 'Convert text to OwO speech',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want owoified. example! .owoify hello world'));
      const r = text.replace(/[rl]/gi, c => owoMap[c] || c)
        .replace(/n([aeiou])/gi, 'ny$1')
        .replace(/!/g, '! UwU');
      reply(`🐾 *OWO-ified:*\n\n${r} OwO`);
    }
  },
  {
    command: 'mocktext',
    aliases: ['mocking'],
    category: 'creativetools',
    description: 'Convert text to mocking SpongeBob style',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want mocked. example! .mocktext i am the best'));
      reply(`🧽 *mOcKiNg TeXt:*\n\n${mockText(text)}`);
    }
  },
  {
    command: 'vaporwave',
    aliases: ['vapor', 'aesthetic'],
    category: 'creativetools',
    description: 'Convert text to vaporwave full-width style',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want vapourwaved. example! .vaporwave crittix'));
      reply(`🌊 *Vaporwave:*\n\n${toFullWidth(text)}`);
    }
  },
  {
    command: 'reverse',
    aliases: [ 'backwards'],
    category: 'creativetools',
    description: 'Reverse a string of text',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want reversed. example! .reverse hello'));
      reply(`🔄 *Reversed:*\n\n${text.split('').reverse().join('')}`);
    }
  },
  {
    command: 'clap',
    aliases: ['claptext'],
    category: 'creativetools',
    description: 'Add 👏 between every word',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want clapped. example! .clap stop the cap'));
      reply(`👏 *Clap text:*\n\n${text.split(' ').join(' 👏 ')} 👏`);
    }
  },
  {
    command: 'piglatin',
    aliases: ['pig', 'pigspeak'],
    category: 'creativetools',
    description: 'Translate text to pig latin',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text to convert to pig latin. example! .piglatin hello world'));
      const out = text.split(' ').map(piglatin).join(' ');
      reply(`🐷 *Pig Latin:*\n\n${out}`);
    }
  },
  {
    command: 'zalgo',
    aliases: ['glitch', 'corrupt'],
    category: 'creativetools',
    description: 'Corrupt text with zalgo glitch effect',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want corrupted with zalgo. example! .zalgo crittix md'));
      reply(`💀 *Zalgo:*\n\n${zalgo(text)}`);
    }
  },
  {
    command: 'tinytext',
    aliases: ['tiny', 'superscript'],
    category: 'creativetools',
    description: 'Convert text to tiny superscript',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want made tiny. example! .tinytext lord devine'));
      reply(`🔡 *Tiny Text:*\n\n${toSuperscript(text)}`);
    }
  },
  {
    command: 'leet',
    aliases: ['leetspeak', '1337'],
    category: 'creativetools',
    description: 'Convert text to leet speak (1337)',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want in leet speak. example! .leet crittix'));
      const out = text.toLowerCase().split('').map(c => leetMap[c] || c).join('');
      reply(`💻 *L33t:*\n\n${out}`);
    }
  },
  {
    command: 'nato',
    aliases: ['phonetic', 'natoalphabet'],
    category: 'creativetools',
    description: 'Convert text to NATO phonetic alphabet',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text to convert to nato alphabet. example! .nato hello'));
      const out = text.toLowerCase().split('').map(c => natoAlpha[c] ? natoAlpha[c] : (c===' ' ? '/ ' : c.toUpperCase())).join(' - ');
      reply(`✈️ *NATO Phonetic:*\n\n${out}`);
    }
  },
  {
    command: 'wordcount',
    aliases: ['wc', 'countwords'],
    category: 'creativetools',
    description: 'Count words, characters, and lines in text',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want counted. example! .wordcount how many words is this'));
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const chars = text.length;
      const charNoSpace = text.replace(/\s/g,'').length;
      const lines = text.split('\n').length;
      reply(`📊 *Text Stats:*\n\n📝 Words: *${words}*\n🔤 Characters: *${chars}*\n✂️ Chars (no spaces): *${charNoSpace}*\n↩️ Lines: *${lines}*`);
    }
  },
  {
    command: 'palindrome',
    aliases: ['ispalindrome', 'checkpalindrome'],
    category: 'creativetools',
    description: 'Check if text is a palindrome',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the word to check if it\'s a palindrome. example! .palindrome racecar'));
      const clean = text.toLowerCase().replace(/[^a-z0-9]/g,'');
      const rev = clean.split('').reverse().join('');
      const is = clean === rev;
      reply(`🔁 *Palindrome Check:*\n\n"${text}"\n\n${is ? '✅ *YES* — it is a palindrome!' : '❌ *NO* — not a palindrome'}`);
    }
  },
  {
    command: 'camelcase',
    aliases: ['tocamel', 'camel'],
    category: 'creativetools',
    description: 'Convert text to camelCase',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text to convert to camel case. example! .camelcase my example text'));
      const out = text.toLowerCase().split(/[\s_\-]+/).map((w,i) => i===0 ? w : w.charAt(0).toUpperCase()+w.slice(1)).join('');
      reply(`🐪 *camelCase:*\n\n${out}`);
    }
  },
  {
    command: 'snakecase',
    aliases: ['tosnake', 'snake'],
    category: 'creativetools',
    description: 'Convert text to snake_case',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text to convert to snake case. example! .snakecase my example text'));
      const out = text.toLowerCase().replace(/[\s\-]+/g,'_');
      reply(`🐍 *snake_case:*\n\n${out}`);
    }
  },
  {
    command: 'kebabcase',
    aliases: ['tokebab', 'kebab'],
    category: 'creativetools',
    description: 'Convert text to kebab-case',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text to convert to kebab case. example! .kebabcase my example text'));
      const out = text.toLowerCase().replace(/[\s_]+/g,'-');
      reply(`🍢 *kebab-case:*\n\n${out}`);
    }
  },
  {
    command: 'titlecase',
    aliases: ['totitle', 'propercase'],
    category: 'creativetools',
    description: 'Convert text to Title Case',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want in title case. example! .titlecase the dark knight rises'));
      const out = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      reply(`📖 *Title Case:*\n\n${out}`);
    }
  },
  {
    command: 'emojify',
    aliases: ['addemoji', 'emojitext'],
    category: 'creativetools',
    description: 'Add random emojis after each word',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want emojified. example! .emojify hello world'));
      const emojis = ['😂','🔥','💯','😎','🤩','✨','🎉','👏','😍','🫡','💀','👀','🙌','⚡','🌊'];
      const out = text.split(' ').map(w => w + emojis[Math.floor(Math.random()*emojis.length)]).join(' ');
      reply(`😂 *Emojified:*\n\n${out}`);
    }
  },
  {
    command: 'shout',
    aliases: ['scream', 'yell'],
    category: 'creativetools',
    description: 'SHOUT text in all caps with emphasis',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the message you want shouted. example! .shout crittix is the best'));
      reply(`📣 *SHOUTING:*\n\n${text.toUpperCase()}!!!`);
    }
  },
  {
    command: 'whisper',
    aliases: ['quiet', 'hush'],
    category: 'creativetools',
    description: 'Format text as a quiet whisper',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type your secret message. example! .whisper nobody knows this'));
      reply(`🤫 _(whispers)_\n\n_${text.toLowerCase()}..._`);
    }
  }
];
