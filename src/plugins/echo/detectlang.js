/*
 * DETECTLANG.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['detectlang', 'langdetect'],
  category: 'soultools',
  description: 'Detect the language of any text',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const text = args.join(' ').trim();
    if (!text) return reply('usage: .detectlang <text>\nexample: .detectlang bonjour mon ami');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/tools/detectlanguage?text=${encodeURIComponent(text)}`,
        { timeout: 15000 }
      );

      if (!data?.status) return reply('❌ detection failed');

      await sock.sendMessage(chatId, {
        text:
          `🌍 *Language Detect*\n\n` +
          `📝 Text: _${data.text}_\n` +
          `🗣️ Language: *${data.detected_language}*\n` +
          `🔤 Code: ${data.language_code}\n` +
          `📊 Confidence: ${data.confidence}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });

    } catch (e) {
      reply('❌ detection failed — ' + e.message);
    }
  }
};
