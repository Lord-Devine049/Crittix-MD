/*
 * GFX-FORGE.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Category: darkcraft | Dual-text GFX generation via NexOracle API
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


const GFX_STYLES = [
  { cmd: 'gfx',   label: 'GFX Style 1',  emoji: '🎨' },
  { cmd: 'gfx2',  label: 'GFX Style 2',  emoji: '🌑' },
  { cmd: 'gfx3',  label: 'GFX Style 3',  emoji: '💀' },
  { cmd: 'gfx4',  label: 'GFX Style 4',  emoji: '🔥' },
  { cmd: 'gfx5',  label: 'GFX Style 5',  emoji: '⚡' },
  { cmd: 'gfx6',  label: 'GFX Style 6',  emoji: '🌌' },
  { cmd: 'gfx7',  label: 'GFX Style 7',  emoji: '💎' },
  { cmd: 'gfx8',  label: 'GFX Style 8',  emoji: '🩸' },
  { cmd: 'gfx9',  label: 'GFX Style 9',  emoji: '👁️' },
  { cmd: 'gfx10', label: 'GFX Style 10', emoji: '🕷️' },
  { cmd: 'gfx11', label: 'GFX Style 11', emoji: '🌀' },
  { cmd: 'gfx12', label: 'GFX Style 12', emoji: '☠️' },
];

module.exports = GFX_STYLES.map(({ cmd, label, emoji }) => ({
  command: cmd,
  category: 'darkcraft',
  description: `Generate ${label} graphic. Usage: ${cmd} text1 | text2`,
  execute: async ({ sock, msg, chatId, text, prefix, reply }) => {
    if (!text || !text.includes('|')) {
      return reply(
        `╔═══════════════════════════════╗\n` +
        `║ ${emoji} 𝗗𝗔𝗥𝗞 𝗖𝗥𝗔𝗙𝗧 — ${label.toUpperCase()}\n` +
        `╚═══════════════════════════════╝\n\n` +
        `✘ ${h.toBoldItalic('Usage')}: ${prefix}${cmd} text1 | text2\n` +
        `✘ ${h.toBoldItalic('Example')}: ${prefix}${cmd} Crittix | MD\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
    const [text1, text2] = text.split('|').map(v => v.trim());
    if (!text1 || !text2) {
      return reply(p.phrases.error(`both sides required — use: ${prefix}${cmd} text1 | text2`));
    }
    await reply(`⏳ *Forging ${label}...*`);
    try {
      const apiUrl =
        `https://api.nexoracle.com/image-creating/${cmd}` +
        `?apikey=d0634e61e8789b051e` +
        `&text1=${encodeURIComponent(text1)}` +
        `&text2=${encodeURIComponent(text2)}`;
      await sock.sendMessage(chatId, {
        image: { url: apiUrl },
        caption:
          `${emoji} *${label.toUpperCase()}*\n\n` +
          `𝗧𝗲𝘅𝘁: ${text1} | ${text2}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    } catch {
      reply(p.phrases.error(`${label} generation failed — API may be down`));
    }
  }
}));
