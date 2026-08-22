/*
 * TOVID.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h  = require('../../lib/helpers');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const WebP   = require('node-webpmux');
const { execFile, spawn } = require('child_process');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const Crypto = require('crypto');
const p = require('../../lib/phrases');


const FFMPEG = 'ffmpeg';

const tryDirectConvert = (webpPath, mp4Path) =>
  new Promise((resolve, reject) => {
    execFile(FFMPEG, [
      '-y',
      '-i', webpPath,
      '-vf', "scale='trunc(iw/2)*2:trunc(ih/2)*2'",
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-movflags', 'faststart',
      '-preset', 'fast',
      '-crf', '28',
      '-an',
      mp4Path
    ], { timeout: 30000 }, (err, _stdout, stderr) => {
      if (err) reject(new Error((stderr || err.message).slice(-300)));
      else resolve();
    });
  });

const tryRawVideoConvert = async (buf, mp4Path) => {
  await WebP.Image.initLib();
  const img = new WebP.Image();
  await img.load(buf);

  if (!img.hasAnim || !img.frames || img.frames.length === 0)
    throw new Error('Sticker has no animation frames.');

  const frameCount = img.frames.length;
  const width      = img.width;
  const height     = img.height;
  const avgDelay   = img.frames.reduce((s, f) => s + (f.delay || 100), 0) / frameCount;
  const fps        = Math.min(Math.max(Math.round(1000 / avgDelay), 1), 30);

  return new Promise(async (resolve, reject) => {
    const proc = spawn(FFMPEG, [
      '-y',
      '-f', 'rawvideo',
      '-vcodec', 'rawvideo',
      '-s', `${width}x${height}`,
      '-pix_fmt', 'rgba',
      '-r', String(fps),
      '-i', 'pipe:0',
      '-vf', "scale='trunc(iw/2)*2:trunc(ih/2)*2'",
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-movflags', 'faststart',
      '-preset', 'fast',
      '-crf', '28',
      '-an',
      mp4Path
    ]);

    let stderrBuf = '';
    proc.stderr.on('data', d => { stderrBuf += d.toString(); });
    proc.on('error', reject);
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg (rawvideo) exited ${code}: ${stderrBuf.slice(-200)}`));
    });

    try {
      for (let i = 0; i < frameCount; i++) {
        const rgba = await img.getFrameData(i);
        await new Promise((res, rej) => {
          const ok = proc.stdin.write(rgba);
          if (ok) return res();
          proc.stdin.once('drain', res);
          proc.stdin.once('error', rej);
        });
      }
      proc.stdin.end();
    } catch (e) {
      proc.kill();
      reject(e);
    }
  });
};

module.exports = {
  command: ['tovid'],
  category: 'shadowutilities',
  description: 'Convert animated sticker to MP4 video',
  execute: async ({ sock, msg, chatId, cfg, prefix, reply }) => {

    const quoted   = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const stickMsg = quoted?.stickerMessage || msg.message?.stickerMessage;

    if (!stickMsg)
      return reply(p.phrases.wrongUsage('reply to an animated sticker to convert it to a video.'));

    await sock.sendMessage(chatId, { react: { text: '🎬', key: msg.key } }).catch(() => {});

    const uid      = Crypto.randomBytes(4).toString('hex');
    const tmpDir   = os.tmpdir();
    const webpPath = path.join(tmpDir, `crittix_stk_${uid}.webp`);
    const mp4Path  = path.join(tmpDir, `crittix_vid_${uid}.mp4`);

    try {
      // Download sticker
      const stream = await downloadContentFromMessage(stickMsg, 'sticker');
      let buf = Buffer.from([]);
      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
      if (!buf || buf.length === 0)
        return reply(p.phrases.error('Failed to download sticker. It may have expired.'));

      fs.writeFileSync(webpPath, buf);

      // Stage 1: direct ffmpeg conversion
      let stage1Worked = false;
      try {
        await tryDirectConvert(webpPath, mp4Path);
        if (fs.existsSync(mp4Path) && fs.statSync(mp4Path).size > 0)
          stage1Worked = true;
      } catch (_) {}

      // Stage 2: rawvideo fallback
      if (!stage1Worked) {
        if (fs.existsSync(mp4Path)) fs.unlinkSync(mp4Path);
        await tryRawVideoConvert(buf, mp4Path);
      }

      if (!fs.existsSync(mp4Path) || fs.statSync(mp4Path).size === 0)
        return reply(p.phrases.error('Conversion produced an empty file. Make sure the sticker is animated.'));

      const vidBuf = fs.readFileSync(mp4Path);
      await sock.sendMessage(chatId, {
        video: vidBuf,
        mimetype: 'video/mp4',
        caption: '🎬 *Converted to MP4*'
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } }).catch(() => {});

    } catch (e) {
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } }).catch(() => {});
      reply(p.phrases.error('conversion failed. ' + e.message.slice(0, 200)));
    } finally {
      try { if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath); } catch (_) {}
      try { if (fs.existsSync(mp4Path))  fs.unlinkSync(mp4Path);  } catch (_) {}
    }
  }
};
