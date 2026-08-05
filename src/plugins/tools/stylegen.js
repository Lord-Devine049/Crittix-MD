const STYLES = {
  bold:         t => t.split('').map(c => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.includes(c)
    ? String.fromCodePoint(c.codePointAt(0) + (c >= 'a' ? 0x1D400 - 97 : 0x1D400 - 65)) : c).join(''),
  italic:       t => [...t].map(c => {
    const code = c.codePointAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x1D608 - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x1D622 - 97);
    return c;
  }).join(''),
  bubble:       t => [...t].map(c => {
    const code = c.codePointAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + code - 97);
    if (code >= 48 && code <= 57) return ['⓪','①','②','③','④','⑤','⑥','⑦','⑧','⑨'][code - 48];
    return c;
  }).join(''),
  smallcaps:    t => [...t].map(c => 'abcdefghijklmnopqrstuvwxyz'.indexOf(c) >= 0
    ? 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ'['abcdefghijklmnopqrstuvwxyz'.indexOf(c)] : c).join(''),
  reverse:      t => [...t].reverse().join(''),
  strike:       t => [...t].join('\u0336') + '\u0336',
  underline:    t => [...t].join('\u0332') + '\u0332',
  oldeng:       t => [...t].map(c => {
    const i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c);
    return i >= 0 ? '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷'[i] : c;
  }).join(''),
  fullwidth:    t => [...t].map(c => {
    const code = c.codePointAt(0);
    if (code >= 33 && code <= 126) return String.fromCodePoint(code + 0xFF01 - 33);
    return c;
  }).join(''),
  wavy:         t => [...t].map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join(''),
  spaced:       t => [...t].join(' ')
};

const NAMES = Object.keys(STYLES);

module.exports = {
  command: 'stylegen',
  aliases: ['textstyle', 'fancytext2', 'allstyles'],
  category: 'creativetools',
  description: 'Generate text in all available font styles at once. Usage: stylegen Hello World',
  execute: async ({ text, reply }) => {
    if (!text) return reply(`✨ *Usage:* stylegen Hello World\n_Shows text in ${NAMES.length} styles_`);

    let out = `✨ *Text Styles* — "${text}"\n\n`;
    for (const name of NAMES) {
      try {
        out += `*${name}:* ${STYLES[name](text)}\n`;
      } catch {}
    }
    out += `\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
    reply(out);
  }
};
