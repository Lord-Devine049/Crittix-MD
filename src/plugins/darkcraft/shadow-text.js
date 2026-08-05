/*
 * SHADOW-TEXT.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Category: darkcraft | Text effect art via Prexzyvilla API
 */
const h = require('../../lib/helpers');

const TEXT_EFFECTS = [
  { cmd: 'glitchtext',     label: 'Glitch Text',    emoji: '⚡' },
  { cmd: 'writetext',      label: 'Write Text',      emoji: '✍️' },
  { cmd: 'advancedglow',   label: 'Advanced Glow',   emoji: '💡' },
  { cmd: 'typographytext', label: 'Typography',       emoji: '🖋️' },
  { cmd: 'pixelglitch',    label: 'Pixel Glitch',    emoji: '🧩' },
  { cmd: 'neonglitch',     label: 'Neon Glitch',     emoji: '💥' },
  { cmd: 'glowingtext',    label: 'Glowing Text',    emoji: '💫' },
  { cmd: 'underwatertext', label: 'Underwater Text', emoji: '🌊' },
  { cmd: 'deletingtext',   label: 'Deleting Text',   emoji: '🩶' },
  { cmd: 'gradienttext',   label: 'Gradient Text',   emoji: '🌈' },
];

module.exports = TEXT_EFFECTS.map(({ cmd, label, emoji }) => ({
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
      reply(h.demonFail(`${label} generation failed — API may be down`));
    }
  }
}));
