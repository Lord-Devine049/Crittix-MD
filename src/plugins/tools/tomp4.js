const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'tomp4',
  aliases: ['audiotomp4', 'mp4'],
  category: 'darkweb',
  description: 'Convert a replied audio file to MP4 video',
  execute: async ({ sock, msg, chatId, reply }) => {
    const quoted = msg.quoted;
    if (!quoted) return reply('🎵 *Reply to an audio file* with tomp4');

    const mime = (quoted.msg || quoted).mimetype || '';
    if (!/audio/.test(mime)) return reply('❌ *Reply to an audio file*');

    try {
      await reply('⏳ *Converting to MP4...*');

      const buffer = await quoted.download();
      const tmpIn = path.join('/tmp', `audio_${Date.now()}.mp3`);
      const tmpOut = path.join('/tmp', `video_${Date.now()}.mp4`);

      fs.writeFileSync(tmpIn, buffer);

      await new Promise((resolve, reject) => {
        exec(
          `ffmpeg -loop 1 -i https://i.imgur.com/A9hGFEg.jpg -i "${tmpIn}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${tmpOut}"`,
          { timeout: 60000 },
          (err) => { err ? reject(err) : resolve(); }
        );
      });

      await sock.sendMessage(chatId, {
        video: fs.readFileSync(tmpOut),
        mimetype: 'video/mp4',
        caption: '🎵 *Audio converted to MP4*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
      }, { quoted: msg });

      fs.unlinkSync(tmpIn);
      fs.unlinkSync(tmpOut);
    } catch (e) {
      reply(`❌ *Conversion failed* • ${e.message}`);
    }
  }
};
