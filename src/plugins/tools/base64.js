module.exports = {
  command: 'base64',
  aliases: ['b64', 'encode64', 'decode64'],
  category: 'soultools',
  description: 'Encode or decode base64 text. Usage: base64 encode Hello | base64 decode SGVsbG8=',
  execute: async ({ args, text, reply }) => {
    const mode = (args[0] || '').toLowerCase();
    const input = args.slice(1).join(' ');

    if (!mode || !input) {
      return reply(
        `🔐 *Base64 Tool*\n\n` +
        `📌 *Encode:* base64 encode Hello World\n` +
        `📌 *Decode:* base64 decode SGVsbG8gV29ybGQ=\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }

    try {
      if (mode === 'encode') {
        const encoded = Buffer.from(input, 'utf8').toString('base64');
        reply(
          `🔐 *Base64 Encode*\n\n` +
          `📥 Input: ${input}\n` +
          `📤 Output:\n\`${encoded}\`\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } else if (mode === 'decode') {
        const decoded = Buffer.from(input, 'base64').toString('utf8');
        reply(
          `🔓 *Base64 Decode*\n\n` +
          `📥 Input: ${input.substring(0, 60)}...\n` +
          `📤 Output:\n${decoded}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } else {
        reply('❌ *Use:* base64 encode [text] | base64 decode [base64]');
      }
    } catch {
      reply('❌ *Failed* • Invalid input for the selected mode');
    }
  }
};
