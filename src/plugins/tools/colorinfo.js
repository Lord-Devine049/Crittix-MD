
const axios = require('axios');

module.exports = {
  command: 'colorinfo',
  aliases: ['color', 'hexcolor', 'colorpicker'],
  category: 'soultools',
  description: 'Get info about a color from hex code. Usage: colorinfo #FF5733',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    let hex = (args[0] || '').replace('#', '').trim().toLowerCase();
    if (!hex) return reply('🎨 *Usage:* colorinfo #FF5733\n_Or just the hex:_ colorinfo FF5733');
    if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(hex)) {
      return reply('❌ *Invalid hex color* • Use 3 or 6 hex characters\n_Example:_ colorinfo FF5733');
    }
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const l = (max + min) / 2;
    const s = max === min ? 0 : l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    const h = max === min ? 0 :
              max === r / 255 ? ((g - b) / 255 / (max - min) + (g < b ? 6 : 0)) * 60 :
              max === g / 255 ? ((b - r) / 255 / (max - min) + 2) * 60 :
              ((r - g) / 255 / (max - min) + 4) * 60;

    const imgUrl = `https://via.placeholder.com/400x200/${hex}/${hex}.png`;

    try {
      await sock.sendMessage(chatId, {
        image: { url: imgUrl },
        caption:
          `🎨 *Color Info*\n\n` +
          `🖌️ *Hex:* #${hex.toUpperCase()}\n` +
          `🔴 *RGB:* ${r}, ${g}, ${b}\n` +
          `🌈 *HSL:* ${Math.round(h)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%\n` +
          `💡 *Brightness:* ${Math.round((r * 299 + g * 587 + b * 114) / 1000)}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    } catch {
      reply(
        `🎨 *Color Info* — #${hex.toUpperCase()}\n\n` +
        `🔴 RGB: ${r}, ${g}, ${b}\n` +
        `🌈 HSL: ${Math.round(h)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }
};
