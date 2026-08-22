/* UPSCALE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const Jimp = require('jimp');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { aiUpscaleImage, hasAiUpscaler } = require('../../lib/ai-upscaler');
const p = require('../../lib/phrases');


module.exports = {
  command: 'upscale',
  category: 'creativetools',
  description: 'Upscale an image 2x or 4x',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const scaleFactor = args[0]?.toLowerCase() === '4x' ? 4 : 2;
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
    if (!imageMsg) return reply(p.phrases.wrongUsage('send or reply to an image. optional scale level 2x or 4x. example! .upscale 2x'));
    try {
      await reply(`🔍 ${h.toBoldItalic(`Upscaling ${scaleFactor}x...`)} ${h.demonEmoji()}`);
      let imgBuffer;
      if (msg.message?.imageMessage) imgBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else { const stream = await downloadContentFromMessage(imageMsg, 'image'); imgBuffer = Buffer.from([]); for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk]); }

      let result, origW, origH, newW, newH, ai = false;

      if (hasAiUpscaler()) {
        try {
          const probe = await Jimp.read(imgBuffer);
          origW = probe.getWidth(); origH = probe.getHeight();
          result = await aiUpscaleImage(imgBuffer, scaleFactor, 'image/jpeg');
          const out = await Jimp.read(result);
          newW = out.getWidth(); newH = out.getHeight();
          ai = true;
        } catch {
          result = null; // fall through to local upscale below
        }
      }

      if (!result) {
        const image = await Jimp.read(imgBuffer);
        origW = image.getWidth(); origH = image.getHeight();
        newW = Math.min(origW * scaleFactor, 3840);
        newH = Math.min(origH * scaleFactor, 3840);
        image.resize(newW, newH, Jimp.RESIZE_BICUBIC);
        // sharpen + normalize so the upscale reads as enhanced, not just stretched
        image.convolute([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]).normalize().contrast(0.06).quality(95);
        result = await image.getBufferAsync(Jimp.MIME_JPEG);
      }

      await sock.sendMessage(chatId, { image: result, caption: `🔍 ${h.toBoldItalic(`${ai ? 'AI Upscaled' : 'Upscaled'} ${scaleFactor}x`)} ${h.demonEmoji()}\n\n📐 ${h.toBoldItalic('Size')}: ${origW}x${origH} → ${newW}x${newH}`, mimetype: 'image/jpeg' }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Upscale failed')} ${h.demonEmoji()}`);
    }
  }
};
