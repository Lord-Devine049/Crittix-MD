/*
 * GENLYRICS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['genlyrics', 'makelyrics'],
  category: 'soultools',
  description: 'Generate song lyrics from a prompt using AI',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const prompt = args.join(' ').trim();
    if (!prompt) return reply('usage: .genlyrics <prompt>\nexample: .genlyrics a big tree');

    await reply('🎶 generating lyrics...');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/ai/genlyrics?prompt=${encodeURIComponent(prompt)}`,
        { timeout: 30000 }
      );

      if (!data?.status || !data?.lyrics) return reply('❌ failed to generate lyrics');

      const lyrics = data.lyrics.replace(/\\n/g, '\n');

      await sock.sendMessage(chatId, {
        text:
          `🎵 *AI Generated Lyrics*\n` +
          `📝 Prompt: _${data.prompt}_\n\n` +
          `${lyrics}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });

    } catch (e) {
      reply('❌ generation failed — ' + e.message);
    }
  }
};
