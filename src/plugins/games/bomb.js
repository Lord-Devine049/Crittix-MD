const p = require('../../lib/phrases');

module.exports = {
  command: 'bomb',
  aliases: ['spam', 'msgbomb'],
  category: 'forbiddenarts',
  description: 'Send a message multiple times (max 10). Usage: bomb 5 hello world',
  execute: async ({ sock, chatId, args, reply }) => {
    const count = parseInt(args[0]);
    const message = args.slice(1).join(' ');

    if (!count || isNaN(count) || count < 1) {
      return reply(p.phrases.wrongUsage('provide a count and your message. example! .bomb 5 hello. max is 10.'));
    }
    if (!message) return reply(p.phrases.wrongUsage('provide a count and your message. example! .bomb 5 hello'));

    const safe = Math.min(count, 10);

    for (let i = 0; i < safe; i++) {
      await sock.sendMessage(chatId, { text: message });
      await new Promise(r => setTimeout(r, 600));
    }
  }
};
