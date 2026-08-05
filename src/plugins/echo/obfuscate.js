/*
 * OBFUSCATE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

const LEVELS = {
  low:     'https://prexzyapis.com/tools/obflow?code=',
  high:    'https://prexzyapis.com/tools/obfhigh?code=',
  extreme: 'https://prexzyapis.com/tools/obfextreme?code='
};

module.exports = {
  command: ['obfuscate', 'obf'],
  category: 'soultools',
  description: 'Obfuscate JavaScript code. Usage: .obf <low|high|extreme> <code>',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const level = args[0]?.toLowerCase();
    const code  = args.slice(1).join(' ').trim();

    if (!level || !LEVELS[level] || !code) {
      return reply('usage: .obf <low|high|extreme> <your js code>\nexample: .obf high console.log("hello")');
    }

    await reply(`🔒 obfuscating at *${level}* level...`);

    try {
      const { data } = await axios.get(
        `${LEVELS[level]}${encodeURIComponent(code)}&encoding=`,
        { timeout: 20000 }
      );

      if (!data?.status || !data?.result) return reply('❌ obfuscation failed');

      const info =
        `🔒 *JS Obfuscator — ${level.toUpperCase()}*\n\n` +
        `📏 Original: ${data.original_length} chars\n` +
        `📦 Obfuscated: ${data.obfuscated_length} chars\n` +
        `📊 Ratio: ${data.compression_ratio}\n\n`;

      // result may be very long — send as document if huge
      const result = data.result;
      if (result.length > 3000) {
        await sock.sendMessage(chatId, {
          document: Buffer.from(result, 'utf-8'),
          fileName: `obfuscated_${level}.js`,
          mimetype: 'application/javascript',
          caption: info + '_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, {
          text: info + '```' + result + '```\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
        }, { quoted: msg });
      }
    } catch (e) {
      reply('❌ obfuscation failed — ' + e.message);
    }
  }
};
