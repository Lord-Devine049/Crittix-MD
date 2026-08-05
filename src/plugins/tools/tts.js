/*
 * TTS.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Ported from Axis XMD
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const h = require('../../lib/helpers');

const CHUNK_LIMIT = 190; // Google Translate TTS silently truncates past ~200 chars
const tmpFile = (ext) => path.join('/tmp', `tts_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
const cleanUp = (...files) => files.forEach((f) => { try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch {} });

const runFfmpeg = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, { timeout: 60000 }, (err, _stdout, stderr) => err ? reject(new Error(stderr?.slice(-300) || err.message)) : resolve());
});

// split on sentence/word boundaries so we never cut a word in half
function splitText(text, limit) {
  const chunks = [];
  let remaining = text.trim();
  while (remaining.length > limit) {
    let cut = remaining.lastIndexOf(' ', limit);
    if (cut <= 0) cut = limit;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function fetchTtsChunk(chunk, lang) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 20000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Referer: 'https://translate.google.com/'
    }
  });
  return Buffer.from(res.data);
}

module.exports = {
  command: ['tts'],
  aliases: ['speak'],
  category: 'soultools',
  description: 'Convert text to speech',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(h.demonError('.tts', '.tts <text>'));

    const lang = (args[0] && /^[a-z]{2}(-[A-Z]{2})?$/.test(args[0]) && text.slice(args[0].length).trim())
      ? args[0]
      : 'en';
    const spokenText = lang !== 'en' ? text.slice(args[0].length).trim() : text;

    const chunks = splitText(spokenText || text, CHUNK_LIMIT);
    const partFiles = [];
    let outFile;

    try {
      await sock.sendMessage(chatId, { react: { text: '🔊', key: msg.key } }).catch(() => {});

      // fetch and save each chunk as its own mp3
      for (let i = 0; i < chunks.length; i++) {
        const buf = await fetchTtsChunk(chunks[i], lang);
        if (!buf?.length) throw new Error('Empty response from Google TTS');
        const p = tmpFile(`_${i}.mp3`);
        fs.writeFileSync(p, buf);
        partFiles.push(p);
      }

      if (partFiles.length === 1) {
        outFile = partFiles[0];
      } else {
        // stitch multi-chunk speech into a single mp3 with ffmpeg concat
        const listFile = tmpFile('.txt');
        fs.writeFileSync(listFile, partFiles.map((p) => `file '${p}'`).join('\n'));
        outFile = tmpFile('.mp3');
        await runFfmpeg(`ffmpeg -y -f concat -safe 0 -i ${listFile} -c copy ${outFile}`);
        cleanUp(listFile);
      }

      const audioBuf = fs.readFileSync(outFile);

      // Send as a regular (non-ptt) audio message with a fileName — this is what
      // gives WhatsApp clients a visible download/save option. ptt voice notes
      // don't expose a save-to-device action on most clients.
      await sock.sendMessage(chatId, {
        audio: audioBuf,
        mimetype: 'audio/mpeg',
        fileName: 'tts.mp3',
        ptt: false
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } }).catch(() => {});
    } catch (e) {
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } }).catch(() => {});
      reply(h.demonFail('TTS failed. Google TTS may be blocked — try again in a bit.'));
    } finally {
      cleanUp(...partFiles, outFile);
    }
  }
};
