/*
 * STORY.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['story', 'aistory'],
  category: 'creativetools',
  description: 'Generate a story using AI. Usage: .story <prompt>',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const text = args.join(' ').trim();
    if (!text) return reply('usage: .story <prompt>\nexample: .story a dragon protecting a magical crystal');

    await reply('📖 generating story...');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/ai/advanced?text=${encodeURIComponent(text)}&mode=&length=&creative=`,
        { timeout: 40000 }
      );

      if (!data?.status || !data?.data?.story) return reply('❌ story generation failed');

      const story = data.data.story.replace(/\\n/g, '\n');

      await sock.sendMessage(chatId, {
        text:
          `📖 *AI Story*\n\n` +
          `${story}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });

    } catch (e) {
      reply('❌ generation failed — ' + e.message);
    }
  }
};
