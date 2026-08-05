module.exports = {
  command: 'bomb',
  aliases: ['spam', 'msgbomb'],
  category: 'forbiddenarts',
  description: 'Send a message multiple times (max 10). Usage: bomb 5 hello world',
  execute: async ({ sock, chatId, args, reply }) => {
    const count = parseInt(args[0]);
    const message = args.slice(1).join(' ');

    if (!count || isNaN(count) || count < 1) {
      return reply('💣 *Usage:* bomb 5 your message here\n_Max: 10 messages_');
    }
    if (!message) return reply('💣 *Usage:* bomb 5 message text');

    const safe = Math.min(count, 10);

    for (let i = 0; i < safe; i++) {
      await sock.sendMessage(chatId, { text: message });
      await new Promise(r => setTimeout(r, 600));
    }
  }
};
