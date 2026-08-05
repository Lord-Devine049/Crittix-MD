const h = require('../../lib/helpers');

module.exports = {
  command: ['genpass', 'password'],
  aliases: ['passgen'],
  category: 'soultools',
  description: 'Generate a secure random password',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const length = parseInt(args[0]) || 16;

    if (length < 4 || length > 64)
      return reply(h.demonError('.genpass', '.genpass <length 4-64>'));

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let pass = '';
    for (let i = 0; i < length; i++)
      pass += chars.charAt(Math.floor(Math.random() * chars.length));

    reply(
      `🔑 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗣𝗮𝘀𝘀𝗚𝗲𝗻*\n\n` +
      `Length: ${length}\n\n` +
      `\`\`\`${pass}\`\`\`\n\n` +
      `_Keep this safe. Never share it._`
    );
  }
};
