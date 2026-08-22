const p = require('../../lib/phrases');

/*
 * MEME.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
module.exports = [
  {
    command: ['spongebob', 'spongeb'],
    category: 'soultools',
    description: 'Generate a SpongeBob "How dare you" meme',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const text = args.join(' ').trim();
      if (!text) return reply(p.phrases.wrongUsage('type the text you want spongebobbed. example! .spongebob i am the greatest'));

      try {
        await sock.sendMessage(chatId, {
          image: { url: `https://prexzyapis.com/imagecreator/spongebob?text=${encodeURIComponent(text)}` },
          caption: `🧽 *SpongeBob Meme*\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) {
        reply('❌ meme failed — ' + e.message);
      }
    }
  }
];
