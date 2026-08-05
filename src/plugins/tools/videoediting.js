/*
 * VIDEOEDITING.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: crop, trim, merge, rotate2, volvideo
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const h = require('../../lib/helpers');

const tmpFile = (ext) => path.join('/tmp', `vided_${Date.now()}_${Math.random().toString(36).substr(2,5)}${ext}`);
const cleanUp = (...files) => files.forEach(f => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} });

const downloadQuotedVideo = async (sock, msg, chatId, reply) => {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  const quoted = ctx?.quotedMessage;
  if (!quoted) { reply(h.demonFail('Reply to a video message first, genius.')); return null; }
  const qType = Object.keys(quoted)[0];
  if (!qType.toLowerCase().includes('video')) { reply(h.demonFail('That\'s not a video. Reply to a video.')); return null; }
  const quotedMsg = { key: { remoteJid: chatId, id: ctx.stanzaId, participant: ctx.participant }, message: quoted };
  const buffer = await sock.downloadMediaMessage(quotedMsg);
  if (!buffer) { reply(h.demonFail('Failed to download the video. Try again.')); return null; }
  const input = tmpFile('.mp4');
  fs.writeFileSync(input, buffer);
  return input;
};

const runFfmpeg = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, { timeout: 120000 }, (err) => err ? reject(err) : resolve());
});

module.exports = [

  {
    command: 'crop',
    aliases: ['videocrop', 'cropvid'],
    category: 'creativetools',
    description: 'Crop a video to given dimensions. Reply to video: .crop 640x360 or .crop 1:1',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      if (!args[0]) return reply(h.demonError('.crop', '.crop <WxH or ratio> — e.g. .crop 640x360 or .crop 16:9', 'Reply to a video'));
      const input = await downloadQuotedVideo(sock, msg, chatId, reply);
      if (!input) return;
      const output = tmpFile('.mp4');
      try {
        await reply('✂️ *Cropping video... hold tight.*');
        let filter;
        if (args[0].includes(':')) {
          const [wr, hr] = args[0].split(':').map(Number);
          filter = `crop=min(iw\\,ih*${wr}/${hr}):min(ih\\,iw*${hr}/${wr})`;
        } else {
          const [w, h2] = args[0].toLowerCase().split('x').map(Number);
          if (!w || !h2) { cleanUp(input); return reply(h.demonFail('Invalid format. Use 640x360 or 16:9')); }
          filter = `crop=${w}:${h2}`;
        }
        await runFfmpeg(`ffmpeg -y -i ${input} -vf "${filter}" -c:a copy ${output}`);
        const result = fs.readFileSync(output);
        await sock.sendMessage(chatId, { video: result, caption: `✂️ *Cropped* — ${args[0]}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Crop failed: ${e.message}`)); }
      finally { cleanUp(input, output); }
    }
  },

  {
    command: 'trim',
    aliases: ['trimvideo', 'cutvideo'],
    category: 'creativetools',
    description: 'Trim a video. Reply to video: .trim 0:10 0:30 (start end)',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      if (!args[1]) return reply(h.demonError('.trim', '.trim <start> <end> — e.g. .trim 0:05 0:30', 'Reply to a video'));
      const input = await downloadQuotedVideo(sock, msg, chatId, reply);
      if (!input) return;
      const output = tmpFile('.mp4');
      try {
        await reply('✂️ *Trimming video...*');
        const start = args[0];
        const end = args[1];
        await runFfmpeg(`ffmpeg -y -i ${input} -ss ${start} -to ${end} -c copy ${output}`);
        const result = fs.readFileSync(output);
        await sock.sendMessage(chatId, { video: result, caption: `✂️ *Trimmed* — ${start} → ${end}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Trim failed: ${e.message}`)); }
      finally { cleanUp(input, output); }
    }
  },

  {
    command: 'merge',
    aliases: ['mergevideos', 'joinvideo'],
    category: 'creativetools',
    description: 'Merge a replied video with the one you attach. Reply to first video and attach second: .merge',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const input1 = await downloadQuotedVideo(sock, msg, chatId, reply);
      if (!input1) return;
      const videoMsg = msg.message?.videoMessage;
      if (!videoMsg) { cleanUp(input1); return reply(h.demonFail('Send the second video along with the .merge command (reply to first vid, attach second).')); }
      const input2 = tmpFile('.mp4');
      const listFile = tmpFile('.txt');
      const output = tmpFile('.mp4');
      try {
        await reply('🎬 *Merging videos... this might take a sec.*');
        const buf2 = await sock.downloadMediaMessage(msg);
        fs.writeFileSync(input2, buf2);
        fs.writeFileSync(listFile, `file '${input1}'\nfile '${input2}'\n`);
        await runFfmpeg(`ffmpeg -y -f concat -safe 0 -i ${listFile} -c copy ${output}`);
        const result = fs.readFileSync(output);
        await sock.sendMessage(chatId, { video: result, caption: `🎬 *Merged!* Two clips, one fire video.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Merge failed: ${e.message}`)); }
      finally { cleanUp(input1, input2, listFile, output); }
    }
  },


  {
    command: 'volvideo',
    aliases: ['videovol', 'vidvolume'],
    category: 'creativetools',
    description: 'Adjust video audio volume. Reply to video: .volvideo 2.0 (1.0=normal, 2.0=double)',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const vol = parseFloat(args[0]);
      if (isNaN(vol) || vol <= 0 || vol > 10) return reply(h.demonFail('Volume must be between 0.1 and 10. Try: .volvideo 2.0'));
      const input = await downloadQuotedVideo(sock, msg, chatId, reply);
      if (!input) return;
      const output = tmpFile('.mp4');
      try {
        await reply(`🔊 *Adjusting volume to ${vol}x...*`);
        await runFfmpeg(`ffmpeg -y -i ${input} -af "volume=${vol}" -c:v copy ${output}`);
        const result = fs.readFileSync(output);
        await sock.sendMessage(chatId, { video: result, caption: `🔊 *Volume: ${vol}x*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Volume adjust failed: ${e.message}`)); }
      finally { cleanUp(input, output); }
    }
  }

];
