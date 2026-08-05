/*
 * TEXTMEDIA.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
module.exports = [
  {
    command: ['txt2img', 'textimage'],
    category: 'soultools',
    description: 'Convert text to a styled image',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const text = args.join(' ').trim();
      if (!text) return reply('usage: .txt2img <text>\nexample: .txt2img Hello World');

      try {
        await sock.sendMessage(chatId, {
          image: {
            url: `https://prexzyapis.com/imagecreator/image?text=${encodeURIComponent(text)}&background=&color=&emojiStyle=`
          },
          caption: `🖼️ *Text to Image*\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) {
        reply('❌ failed — ' + e.message);
      }
    }
  },
  {
    command: ['txt2mp4', 'textvideo'],
    category: 'soultools',
    description: 'Convert text to an animated MP4 video',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const text = args.join(' ').trim();
      if (!text) return reply('usage: .txt2mp4 <text>\nexample: .txt2mp4 Welcome to Crittix');

      await reply('🎬 creating video...');

      try {
        await sock.sendMessage(chatId, {
          video: {
            url: `https://prexzyapis.com/imagecreator/mp4?text=${encodeURIComponent(text)}&background=&color=&emojiStyle=&delay=&endDelay=&width=&height=`
          },
          caption: `🎬 *Text to MP4*\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) {
        reply('❌ failed — ' + e.message);
      }
    }
  }
];
