/*
 * ENHANCE.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Reply to an image or video with .enhance (aliases: hd, 4k, quality) to
 * sharpen, denoise and upscale it, capped at true 4K (3840x2160).
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const Jimp = require('jimp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const h = require('../../lib/helpers');
const { aiUpscaleImage, hasAiUpscaler } = require('../../lib/ai-upscaler');

const MAX_DIM = 3840;          // 4K UHD long-edge cap
const MAX_VIDEO_SECONDS = 60;  // guard against huge/expensive jobs

const tmpFile = (ext) => path.join('/tmp', `enhance_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
const cleanUp = (...files) => files.forEach((f) => { try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch {} });

const runFfmpeg = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, { timeout: 180000, maxBuffer: 1024 * 1024 * 20 }, (err, _stdout, stderr) => {
    if (err) return reject(new Error(stderr?.slice(-300) || err.message));
    resolve();
  });
});

// Light unsharp-mask kernel — brings back edge detail that gets lost on upscale
const SHARPEN_KERNEL = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0]
];

async function downloadBuffer(mediaMsg, type) {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  let buf = Buffer.from([]);
  for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
  return buf;
}

function scaledDims(w, h2, requestedScale) {
  let newW = Math.round(w * requestedScale);
  let newH = Math.round(h2 * requestedScale);
  if (newW > MAX_DIM || newH > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / newW, MAX_DIM / newH);
    newW = Math.round(newW * ratio);
    newH = Math.round(newH * ratio);
  }
  return { newW, newH };
}

async function enhanceImageLocal(buf) {
  const image = await Jimp.read(buf);
  const origW = image.getWidth();
  const origH = image.getHeight();

  // Pick scale automatically: small images get pushed harder, already-big ones
  // just get cleaned up and capped at 4K.
  const longEdge = Math.max(origW, origH);
  let scale = longEdge < 800 ? 4 : longEdge < 1600 ? 3 : longEdge < 2500 ? 2 : 1;
  const { newW, newH } = scaledDims(origW, origH, scale);

  if (newW !== origW || newH !== origH) {
    image.resize(newW, newH, Jimp.RESIZE_BICUBIC);
  }

  image
    .convolute(SHARPEN_KERNEL)
    .normalize()
    .contrast(0.08)
    .quality(95);

  const result = await image.getBufferAsync(Jimp.MIME_JPEG);
  return { result, origW, origH, newW, newH, ai: false };
}

async function enhanceImage(buf) {
  if (!hasAiUpscaler()) return enhanceImageLocal(buf);

  try {
    const dims = await Jimp.read(buf);
    const origW = dims.getWidth();
    const origH = dims.getHeight();
    const longEdge = Math.max(origW, origH);
    const scale = longEdge * 4 > MAX_DIM ? (longEdge * 2 > MAX_DIM ? 1 : 2) : 4;

    if (scale === 1) return enhanceImageLocal(buf); // already at/near 4K, AI upscale would be a no-op

    const result = await aiUpscaleImage(buf, scale, 'image/jpeg');
    const out = await Jimp.read(result);
    return { result, origW, origH, newW: out.getWidth(), newH: out.getHeight(), ai: true };
  } catch (e) {
    // AI provider hiccup (rate limit, network, etc.) — don't fail the command, just degrade
    return enhanceImageLocal(buf);
  }
}

async function enhanceVideo(buf, vidMsg, reply) {
  if (vidMsg?.seconds && vidMsg.seconds > MAX_VIDEO_SECONDS) {
    throw new Error(`Video too long: ${vidMsg.seconds}s — max ${MAX_VIDEO_SECONDS}s for enhancing`);
  }
  const input = tmpFile('.mp4');
  const output = tmpFile('.mp4');
  fs.writeFileSync(input, buf);
  try {
    // scale up to 4K (keeps aspect ratio, only ever upscales) + light sharpen/denoise
    const filter = `scale='min(${MAX_DIM},iw*2)':'min(${MAX_DIM},ih*2)':force_original_aspect_ratio=decrease:flags=lanczos,hqdn3d=1.5:1.5:6:6,unsharp=5:5:0.8:5:5:0.0`;
    await runFfmpeg(`ffmpeg -y -i ${input} -vf "${filter}" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a copy ${output}`);
    return fs.readFileSync(output);
  } finally {
    cleanUp(input, output);
  }
}

module.exports = {
  command: ['enhance'],
  aliases: ['hd', '4k', 'quality', 'upscale4k'],
  category: 'creativetools',
  description: 'Enhance quality of an image/video and upscale it (up to 4K)',
  execute: async ({ sock, msg, chatId, prefix, reply }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
    const vidMsg = quoted?.videoMessage || msg.message?.videoMessage;

    if (!imgMsg && !vidMsg) {
      return reply(h.demonError(`${prefix}enhance`, `Send or reply to an image/video with ${prefix}enhance`, `Aliases: ${prefix}hd, ${prefix}4k, ${prefix}quality`));
    }

    await sock.sendMessage(chatId, { react: { text: '🔎', key: msg.key } }).catch(() => {});

    try {
      if (imgMsg) {
        await reply(`🔎 ${h.toBoldItalic('Enhancing image quality (up to 4K)...')} ${h.demonEmoji()}`);
        const buf = await downloadBuffer(imgMsg, 'image');
        if (!buf?.length) return reply(h.demonFail('Failed to download image'));
        const { result, origW, origH, newW, newH, ai } = await enhanceImage(buf);
        await sock.sendMessage(chatId, {
          image: result,
          mimetype: 'image/jpeg',
          caption: `🔎 ${h.toBoldItalic(ai ? 'AI Enhanced' : 'Enhanced')} ${h.demonEmoji()}\n\n📐 ${h.toBoldItalic('Resolution')}: ${origW}x${origH} → ${newW}x${newH}`
        }, { quoted: msg });
      } else {
        await reply(`🔎 ${h.toBoldItalic('Enhancing video quality (up to 4K)... this may take a moment')} ${h.demonEmoji()}`);
        const buf = await downloadBuffer(vidMsg, 'video');
        if (!buf?.length) return reply(h.demonFail('Failed to download video'));
        const result = await enhanceVideo(buf, vidMsg, reply);
        await sock.sendMessage(chatId, {
          video: result,
          mimetype: 'video/mp4',
          caption: `🔎 ${h.toBoldItalic('Enhanced to 4K')} ${h.demonEmoji()}`
        }, { quoted: msg });
      }
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } }).catch(() => {});
    } catch (e) {
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } }).catch(() => {});
      reply(h.demonFail(`Enhance failed: ${e.message}`));
    }
  }
};
