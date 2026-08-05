const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'tomp3',
  aliases: ['videotomp3', 'extractaudio'],
  category: 'darkweb',
  description: 'Convert a replied video or audio file to MP3',
  execute: async ({ sock, msg, chatId, reply }) => {
    const quoted = msg.quoted;
    if (!quoted) return reply('🎵 *Reply to a video or audio file* with tomp3');

    const mime = (quoted.msg || quoted).mimetype || '';
    if (!/video|audio/.test(mime)) return reply('❌ *Reply to a video or audio file*');

    try {
      await reply('⏳ *Converting to MP3...*');

      const buffer = await quoted.download();
      const ext = /video/.test(mime) ? 'mp4' : 'mp3';
      const tmpIn = path.join('/tmp', `input_${Date.now()}.${ext}`);
      const tmpOut = path.join('/tmp', `output_${Date.now()}.mp3`);

      fs.writeFileSync(tmpIn, buffer);

      await new Promise((resolve, reject) => {
        exec(
          `ffmpeg -i "${tmpIn}" -vn -acodec libmp3lame -q:a 2 "${tmpOut}"`,
          { timeout: 60000 },
          (err) => { err ? reject(err) : resolve(); }
        );
      });

      await sock.sendMessage(chatId, {
        audio: fs.readFileSync(tmpOut),
        mimetype: 'audio/mpeg',
        ptt: false,
        caption: '🎵 *Converted to MP3*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
      }, { quoted: msg });

      fs.unlinkSync(tmpIn);
      fs.unlinkSync(tmpOut);
    } catch (e) {
      reply(`❌ *Conversion failed* • ${e.message}`);
    }
  }
};
