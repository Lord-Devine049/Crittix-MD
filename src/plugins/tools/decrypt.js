/* DECRYPT.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: 'decrypt',
  category: 'soultools',
  description: 'Decrypt XOR-encrypted text',
  execute: async ({ args, prefix, reply }) => {
    const decKey = args[0];
    const decText = args.slice(1).join(' ');
    if (!decKey || !decText) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}decrypt <key> <encrypted text>\n\n${h.toBoldItalic('Example')}: ${prefix}decrypt mykey SGVsbG8=`);
    try {
      const xorDecrypt = (encoded, key) => {
        const bytes = Buffer.from(encoded, 'base64');
        return Array.from(bytes).map((byte, i) => String.fromCharCode(byte ^ key.charCodeAt(i % key.length))).join('');
      };
      const decrypted = xorDecrypt(decText, decKey);
      return reply(`╔═══════════════════════════════╗\n║ 🔓 𝐃𝐄𝐂𝐑𝐘𝐏𝐓𝐄𝐃\n╚═══════════════════════════════╝\n\n🔑 𝗞𝗲𝘆: ${decKey}\n\n📝 𝗗𝗲𝗰𝗿𝘆𝗽𝘁𝗲𝗱:\n${decrypted}`);
    } catch (e) {
      return reply(`✘ ${h.toBoldItalic('Decryption failed - wrong key or invalid text')} ${h.demonEmoji()}`);
    }
  }
};
