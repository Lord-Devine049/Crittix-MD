/* TTP.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: 'ttp',
  category: 'creativetools',
  description: 'Text to sticker (static)',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    if (!args.length) return reply(`✘ ${h.toBoldItalic('Provide text')} ${h.demonEmoji()}`);
    const textInput = args.join(' ');
    try {
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(512, 512);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const words = textInput.split(' ');
      let lines = [], currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > 480) { lines.push(currentLine); currentLine = word; }
        else currentLine = testLine;
      }
      lines.push(currentLine);
      const lineHeight = 60;
      const startY = 256 - ((lines.length - 1) * lineHeight / 2);
      lines.forEach((line, i) => ctx.fillText(line, 256, startY + (i * lineHeight)));
      await sock.sendMessage(chatId, { sticker: canvas.toBuffer('image/png') }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Failed - canvas module may not be installed')} ${h.demonEmoji()}`);
    }
  }
};
