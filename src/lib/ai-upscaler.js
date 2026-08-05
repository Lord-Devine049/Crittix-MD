/*
 * AI-UPSCALER.JS - Crittix-MD
 * Created by: LORD DEVINE
 *
 * Real AI image enhancement for .enhance / .upscale. Tries providers in order:
 *   1. Replicate (Real-ESRGAN) — true super-resolution, most faithful to the original
 *   2. Google Gemini (Nano Banana / gemini-2.5-flash-image) — generative enhance+upscale
 * If neither key is set, hasAiUpscaler() returns false and callers should fall
 * back to the local Jimp-based sharpen/resize path.
 *
 * Keys (add either or both to config/<number>.json):
 *   REPLICATE_API_KEY — https://replicate.com/account/api-tokens
 *   GEMINI_API_KEY     — https://aistudio.google.com/app/apikey (free, no card needed)
 */
const axios = require('axios');
const Jimp = require('jimp');
const { getConfig } = require('./config');

const REAL_ESRGAN_VERSION = '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b';
const GEMINI_MODEL = 'gemini-2.5-flash-image';
const POLL_INTERVAL_MS = 1500;
const MAX_WAIT_MS = 90000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getKey(name) {
  const cfg = getConfig();
  return cfg[name] || process.env[name] || '';
}

function hasAiUpscaler() {
  return !!(getKey('REPLICATE_API_KEY') || getKey('GEMINI_API_KEY'));
}

// ---------- Replicate (Real-ESRGAN) ----------
async function replicateUpscale(buffer, scale, mimetype) {
  const apiKey = getKey('REPLICATE_API_KEY');
  if (!apiKey) throw new Error('REPLICATE_API_KEY not set');

  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;

  const create = await axios.post(
    'https://api.replicate.com/v1/predictions',
    { version: REAL_ESRGAN_VERSION, input: { image: dataUri, scale, face_enhance: false } },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Prefer: 'wait=30' },
      timeout: 40000
    }
  );

  let prediction = create.data;
  const getUrl = prediction?.urls?.get;
  if (!getUrl) throw new Error('Replicate did not return a prediction URL');

  const start = Date.now();
  while (!['succeeded', 'failed', 'canceled'].includes(prediction.status)) {
    if (Date.now() - start > MAX_WAIT_MS) throw new Error('Replicate upscale timed out');
    await sleep(POLL_INTERVAL_MS);
    const poll = await axios.get(getUrl, { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 });
    prediction = poll.data;
  }
  if (prediction.status !== 'succeeded') throw new Error(`Replicate upscale failed: ${prediction.error || prediction.status}`);

  const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!outputUrl) throw new Error('Replicate returned no output image');

  const imgRes = await axios.get(outputUrl, { responseType: 'arraybuffer', timeout: 30000 });
  return Buffer.from(imgRes.data);
}

// ---------- Google Gemini (Nano Banana) ----------
async function geminiUpscale(buffer, scale, mimetype, targetW, targetH) {
  const apiKey = getKey('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const prompt = 'Enhance this image: sharpen fine detail, reduce blur and noise, and increase clarity and resolution. ' +
    'Do not change the composition, subjects, colors, framing, or content in any way — this is a quality restoration, not a redesign.';

  const res = await axios.post(url, {
    contents: [{ parts: [
      { text: prompt },
      { inline_data: { mime_type: mimetype, data: buffer.toString('base64') } }
    ] }],
    generationConfig: { responseModalities: ['IMAGE'] }
  }, {
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    timeout: 45000
  });

  const parts = res.data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data || p.inline_data?.data);
  const b64 = imagePart?.inlineData?.data || imagePart?.inline_data?.data;
  if (!b64) throw new Error('Gemini returned no image');

  let outBuf = Buffer.from(b64, 'base64');

  // Nano Banana enhances quality but doesn't reliably hit an exact pixel target,
  // so give it a final resize pass to actually reach the requested resolution.
  if (targetW && targetH) {
    const img = await Jimp.read(outBuf);
    if (img.getWidth() < targetW || img.getHeight() < targetH) {
      img.resize(targetW, targetH, Jimp.RESIZE_BICUBIC);
      outBuf = await img.getBufferAsync(Jimp.MIME_JPEG);
    }
  }
  return outBuf;
}

/**
 * AI-upscale an image buffer, trying configured providers in order.
 * @param {Buffer} buffer - source image bytes
 * @param {number} scale - 2 or 4
 * @param {string} mimetype - source mimetype, defaults to image/jpeg
 * @returns {Promise<Buffer>} upscaled image bytes
 */
async function aiUpscaleImage(buffer, scale = 4, mimetype = 'image/jpeg') {
  const errors = [];

  if (getKey('REPLICATE_API_KEY')) {
    try {
      return await replicateUpscale(buffer, scale, mimetype);
    } catch (e) {
      errors.push(`Replicate: ${e.message}`);
    }
  }

  if (getKey('GEMINI_API_KEY')) {
    try {
      const probe = await Jimp.read(buffer);
      const targetW = probe.getWidth() * scale;
      const targetH = probe.getHeight() * scale;
      return await geminiUpscale(buffer, scale, mimetype, targetW, targetH);
    } catch (e) {
      errors.push(`Gemini: ${e.message}`);
    }
  }

  throw new Error(errors.length ? errors.join(' | ') : 'No AI upscaler configured');
}

module.exports = { aiUpscaleImage, hasAiUpscaler };
