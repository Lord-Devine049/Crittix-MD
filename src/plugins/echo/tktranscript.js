/*
 * TKTRANSCRIPT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['tktranscript', 'tktrans'],
  category: 'soultools',
  description: 'Get transcript/subtitles from a TikTok video',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.includes('tiktok')) {
      return reply('usage: .tktrans <tiktok url>');
    }

    await reply('📝 fetching transcript...');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/tools/tiktoktranscript?url=${encodeURIComponent(url)}`,
        { timeout: 30000 }
      );

      if (!data?.status || !data?.transcript) return reply('❌ no transcript found for this video');

      const transcript = data.transcript.slice(0, 3500);

      await sock.sendMessage(chatId, {
        text:
          `📝 *TikTok Transcript*\n\n` +
          `${transcript}${data.transcript.length > 3500 ? '\n\n_...truncated_' : ''}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });

    } catch (e) {
      reply('❌ transcript failed — ' + e.message);
    }
  }
};
