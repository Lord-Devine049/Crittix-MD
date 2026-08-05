/* ATTP.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
module.exports = {
  command: 'attp',
  category: 'creativetools',
  description: 'Animated text to sticker',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    if (!args.length) return reply(`✘ ${h.toBoldItalic('Provide text')} ${h.demonEmoji()}`);
    const textInput = args.join(' ');
    let stickerBuffer = null;
    const apis = [
      `https://api.lolhuman.xyz/api/attp?apikey=GataDios&text=${encodeURIComponent(textInput)}`,
      `https://api.neoxr.my.id/api/attp?text=${encodeURIComponent(textInput)}`,
      `https://api.zahirr.eu.org/maker/attp?text=${encodeURIComponent(textInput)}`
    ];
    for (const url of apis) {
      try {
        const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
        const buf = Buffer.from(res.data);
        if (buf.length > 100) { stickerBuffer = buf; break; }
      } catch {}
    }
    if (stickerBuffer) {
      await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
    } else {
      return reply(`✘ ${h.toBoldItalic('All ATTP APIs unavailable. Try .ttp instead')} ${h.demonEmoji()}`);
    }
  }
};
