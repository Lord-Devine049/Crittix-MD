module.exports = {
  command: 'binary',
  aliases: ['bin', 'tobinary', 'frombinary'],
  category: 'soultools',
  description: 'Convert text to/from binary. Usage: binary encode Hello | binary decode 01001000...',
  execute: async ({ args, reply }) => {
    const mode = (args[0] || '').toLowerCase();
    const input = args.slice(1).join(' ');

    if (!mode || !input) {
      return reply(
        `💻 *Binary Converter*\n\n` +
        `📌 *Encode:* binary encode Hello\n` +
        `📌 *Decode:* binary decode 01001000 01100101\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }

    try {
      if (mode === 'encode') {
        const bin = [...input].map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        reply(
          `💻 *Text → Binary*\n\n` +
          `📥 ${input}\n\n` +
          `📤 \`${bin}\`\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } else if (mode === 'decode') {
        const text = input.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
        reply(
          `💻 *Binary → Text*\n\n` +
          `📥 ${input.substring(0, 60)}...\n\n` +
          `📤 ${text}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } else {
        reply('❌ *Use:* binary encode [text] | binary decode [bits]');
      }
    } catch {
      reply('❌ *Conversion failed* • Check your input');
    }
  }
};
