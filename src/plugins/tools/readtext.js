/* READTEXT.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'readtext',
  aliases: ['ocr'],
  category: 'soultools',
  description: 'Extract text from an image using OCR',
  execute: async ({ sock, msg, chatId, reply }) => {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg) return reply(`✘ ${h.toBoldItalic('Send or reply to an image with text')} ${h.demonEmoji()}`);
    try {
      await reply(`🔍 ${h.toBoldItalic('Reading text from image...')} ${h.demonEmoji()}`);
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }
      const OCR_KEY = process.env.OCR_SPACE_KEY || 'helloworld';
      const base64Image = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('base64Image', base64Image);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');
      const response = await axios.post('https://api.ocr.space/parse/image', formData, { headers: { 'apikey': OCR_KEY, ...formData.getHeaders() }, timeout: 30000 });
      const result = response.data;
      if (result.IsErroredOnProcessing) throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed');
      const extractedText = result.ParsedResults?.[0]?.ParsedText?.trim();
      if (!extractedText) return reply(`✘ ${h.toBoldItalic('No text found in image')} ${h.demonEmoji()}`);
      return reply(`📖 ${h.toBoldItalic('Text Extracted!')} ${h.demonEmoji()}\n\n${extractedText}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💀 ${h.toBoldItalic('Powered by OCR.space')}`);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('OCR failed')} ${h.demonEmoji()}\n\n${err.message}`);
    }
  }
};
