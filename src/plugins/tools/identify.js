/* IDENTIFY.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'identify',
  aliases: ['whatisthis'],
  category: 'creativetools',
  description: 'Identify what is in an image using AI vision',
  execute: async ({ sock, msg, chatId, reply }) => {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg) return reply(`✘ ${h.toBoldItalic('Send or reply to an image')} ${h.demonEmoji()}`);
    try {
      await reply(`🧠 ${h.toBoldItalic('Analyzing image...')} ${h.demonEmoji()}`);
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const base64Image = imgBuffer.toString('base64');
      const response = await axios.post('https://text.pollinations.ai/openai', {
        model: 'openai',
        messages: [{ role: 'user', content: [{ type: 'text', text: 'Analyze this image in detail. Describe: 1) What is in the image, 2) Any text visible, 3) Colors and style, 4) Any notable details. Be concise but thorough.' }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }] }],
        max_tokens: 500
      }, { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
      const analysis = response.data?.choices?.[0]?.message?.content || 'Could not analyze image';
      return reply(`🧠 ${h.toBoldItalic('Image Analysis')} ${h.demonEmoji()}\n\n${analysis}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💀 ${h.toBoldItalic('Powered by Pollinations.ai Vision')}`);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Image analysis failed')} ${h.demonEmoji()}`);
    }
  }
};
