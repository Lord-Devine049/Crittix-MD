const p = require('../../lib/phrases');

/*
 * ANIMEGEN.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
module.exports = {
  command: ['animegen'],
  category: 'soultools',
  description: 'Generate an anime-style image from a prompt',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const prompt = args.join(' ').trim();
    if (!prompt) return reply(p.phrases.wrongUsage('provide a prompt after the command. example! .animegen itachi uchiha'));

    await reply('🎨 generating anime image...');

    try {
      const url = `https://prexzyapis.com/ai/anime?prompt=${encodeURIComponent(prompt)}&negative_prompt=`;

      await sock.sendMessage(chatId, {
        image: { url },
        caption: `🎌 *Anime Gen*\n📝 _${prompt}_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    } catch (e) {
      reply('❌ generation failed — ' + e.message);
    }
  }
};
