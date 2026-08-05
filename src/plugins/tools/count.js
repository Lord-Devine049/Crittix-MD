/* COUNT.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: 'count',
  category: 'soultools',
  description: 'Count characters, words, and lines in text',
  execute: async ({ text, prefix, reply }) => {
    const input = text.replace(/^[^\s]+\s*/, '').trim();
    if (!input) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}count <text>`);
    const charCount = input.length;
    const charNoSpaces = input.replace(/\s/g, '').length;
    const wordCount = input.trim().split(/\s+/).filter(w => w).length;
    const lineCount = input.split('\n').length;
    const sentenceCount = input.split(/[.!?]+/).filter(s => s.trim()).length;
    return reply(`╔═══════════════════════════════╗\n║ 🔢 𝐓𝐄𝐗𝐓 𝐂𝐎𝐔𝐍𝐓𝐄𝐑\n╚═══════════════════════════════╝\n\n📝 𝗖𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿𝘀: ${charCount}\n✂️ 𝗖𝗵𝗮𝗿𝘀 (𝗻𝗼 𝘀𝗽𝗮𝗰𝗲𝘀): ${charNoSpaces}\n📖 𝗪𝗼𝗿𝗱𝘀: ${wordCount}\n📄 𝗟𝗶𝗻𝗲𝘀: ${lineCount}\n💬 𝗦𝗲𝗻𝘁𝗲𝗻𝗰𝗲𝘀: ${sentenceCount}`);
  }
};
