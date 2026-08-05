/* IMAGEGEN.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
module.exports = {
  command: 'imagegen',
  aliases: ['imagine', 'genimage'],
  category: 'creativetools',
  description: 'Generate an AI image from a text prompt (Pollinations.ai, free)',
  execute: async ({ sock, msg, text, chatId, prefix, reply }) => {
    const prompt = text.replace(/^[^\s]+\s*/, '').trim();
    if (!prompt) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}imagegen <prompt>\n\n${h.toBoldItalic('Example')}: ${prefix}imagegen dark anime warrior with glowing red eyes`);
    try {
      await reply(`🎨 ${h.toBoldItalic('Generating image...')} ${h.demonEmoji()}\n\n📝 ${h.toBoldItalic('Prompt')}: ${prompt}`);
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&seed=${seed}&enhance=true`;
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 60000 });
      const imageBuffer = Buffer.from(imageResponse.data);
      await sock.sendMessage(chatId, { image: imageBuffer, caption: `🎨 ${h.toBoldItalic('AI Generated')} ${h.demonEmoji()}\n\n📝 ${h.toBoldItalic('Prompt')}: ${prompt}\n\n💀 ${h.toBoldItalic('Powered by Pollinations.ai')}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Image generation failed')} ${h.demonEmoji()}\n\nTry a simpler prompt or try again later`);
    }
  }
};
