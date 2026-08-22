/*
 * ABYSS-EFFECTS.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Category: darkcraft | Special visual effects via Prexzyvilla API
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


const ABYSS_EFFECTS = [
  { cmd: 'flagtext',        label: 'Flag Text',          emoji: '🏳️' },
  { cmd: 'flag3dtext',      label: '3D Flag Text',       emoji: '🚩' },
  { cmd: 'papercutstyle',   label: 'Paper Cut Style',    emoji: '✂️' },
  { cmd: 'watercolortext',  label: 'Watercolor Text',    emoji: '🖌️' },
  { cmd: 'effectclouds',    label: 'Cloud Effect Text',  emoji: '☁️' },
  { cmd: 'summerbeach',     label: 'Summer Beach Text',  emoji: '🏖️' },
  { cmd: 'luxurygold',      label: 'Luxury Gold Text',   emoji: '🥇' },
  { cmd: 'multicoloredneon',label: 'Multicolored Neon',  emoji: '🌈' },
  { cmd: 'sandsummer',      label: 'Sand Summer Text',   emoji: '⏳' },
  { cmd: 'style1917',       label: '1917 Style Text',    emoji: '🎖️' },
  { cmd: 'makingneon',      label: 'Making Neon',        emoji: '🌠' },
  { cmd: 'lighteffects',    label: 'Light Effects',      emoji: '💡' },
];

module.exports = ABYSS_EFFECTS.map(({ cmd, label, emoji }) => ({
  command: cmd,
  category: 'darkcraft',
  description: `Generate ${label} art. Usage: ${cmd} <your text>`,
  execute: async ({ sock, msg, chatId, text, args, prefix, reply }) => {
    const input = (text || args.join(' ')).trim();
    if (!input) {
      return reply(
        `╔═══════════════════════════════╗\n` +
        `║ ${emoji} 𝗗𝗔𝗥𝗞 𝗖𝗥𝗔𝗙𝗧 — ${label.toUpperCase()}\n` +
        `╚═══════════════════════════════╝\n\n` +
        `✘ ${h.toBoldItalic('Usage')}: ${prefix}${cmd} <text>\n` +
        `✘ ${h.toBoldItalic('Example')}: ${prefix}${cmd} Crittix MD\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
    await reply(`⏳ *Crafting ${label}...*`);
    try {
      const url = `https://prexzyapis.com/${cmd}?text=${encodeURIComponent(input)}`;
      await sock.sendMessage(chatId, {
        image: { url },
        caption:
          `${emoji} *${label.toUpperCase()}*\n\n` +
          `𝗧𝗲𝘅𝘁: ${input}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    } catch {
      reply(p.phrases.error(`${label} generation failed — API may be down`));
    }
  }
}));
