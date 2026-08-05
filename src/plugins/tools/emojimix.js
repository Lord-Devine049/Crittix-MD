/* EMOJIMIX.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
module.exports = {
  command: 'emojimix',
  category: 'creativetools',
  description: 'Mix two emojis together',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    if (args.length < 2) return reply(`✘ ${h.toBoldItalic('Provide two emojis')} ${h.demonEmoji()}\n\n${h.toBoldItalic('Example')}: .emojimix 😀 🔥`);
    const emoji1 = args[0], emoji2 = args[1];
    try {
      const response = await axios.get(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`, { timeout: 15000 });
      if (response.data.results?.length > 0) {
        const imageUrl = response.data.results[0].url;
        const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
        await sock.sendMessage(chatId, { sticker: Buffer.from(imgResponse.data) }, { quoted: msg });
      } else {
        return reply(`✘ ${h.toBoldItalic('Cannot mix these emojis')} ${h.demonEmoji()}`);
      }
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Failed miserably')} ${h.demonEmoji()}`);
    }
  }
};
