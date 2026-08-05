/*
 * VOID-LOGOS.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Category: darkcraft | Logo & style art via Prexzyvilla API
 */
const h = require('../../lib/helpers');

const LOGO_STYLES = [
  { cmd: 'logomaker',     label: 'Logo Maker',       emoji: '🐻' },
  { cmd: 'blackpinklogo', label: 'Blackpink Logo',   emoji: '💖' },
  { cmd: 'blackpinkstyle',label: 'Blackpink Style',  emoji: '🎀' },
  { cmd: 'cartoonstyle',  label: 'Cartoon Style',    emoji: '🎨' },
  { cmd: 'galaxystyle',   label: 'Galaxy Style Logo', emoji: '🪐' },
  { cmd: 'galaxywallpaper',label:'Galaxy Wallpaper',  emoji: '🌌' },
  { cmd: 'royaltext',     label: 'Royal Text',       emoji: '👑' },
  { cmd: 'freecreate',    label: '3D Hologram Text', emoji: '🧊' },
];

module.exports = LOGO_STYLES.map(({ cmd, label, emoji }) => ({
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
    await reply(`⏳ *Forging ${label}...*`);
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
