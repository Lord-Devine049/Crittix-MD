/*
 * HTMLENCRYPT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['htmlencrypt', 'htmlenc'],
  category: 'soultools',
  description: 'Encrypt and obfuscate HTML code',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const html = args.join(' ').trim();
    if (!html) return reply('usage: .htmlenc <html code>');

    await reply('🔐 encrypting HTML...');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/tools/htmlecnc?html=${encodeURIComponent(html)}&level=`,
        { timeout: 20000 }
      );

      if (!data?.status || !data?.encrypted_html) return reply('❌ encryption failed');

      const info =
        `🔐 *HTML Encryptor*\n\n` +
        `📏 Original: ${data.original_html_length} chars\n` +
        `📦 Encrypted: ${data.encrypted_html_length} chars\n` +
        `🔒 Level: ${data.encryption_level}\n` +
        `📊 Ratio: ${data.compression_ratio}\n\n`;

      await sock.sendMessage(chatId, {
        document: Buffer.from(data.encrypted_html, 'utf-8'),
        fileName: 'encrypted.html',
        mimetype: 'text/html',
        caption: info + '_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
      }, { quoted: msg });

    } catch (e) {
      reply('❌ encryption failed — ' + e.message);
    }
  }
};
