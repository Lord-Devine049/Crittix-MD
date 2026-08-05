/*
 * SAY.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const axios = require('axios');

module.exports = {
  command: 'say',
  aliases: [],
  category: 'soultools',
  description: 'Convert text to speech',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, chatId, reply }) => {

    const txt = args.join(' ');
    if (!txt) return reply(h.demonError('.say', '.say <message>'));

    try {
      const res = await axios.get(
        `https://prexzyapis.com/tts/tts-en?text=${encodeURIComponent(txt)}`,
        { responseType: 'arraybuffer' }
      );

      await sock.sendMessage(chatId, {
        audio: Buffer.from(res.data),
        mimetype: 'audio/mpeg',
        ptt: true  // sends as voice note; set false for audio file
      }, { quoted: msg });

    } catch (e) {
      reply('⚠️ *TTS failed* • Could not generate audio');
    }
  }
};