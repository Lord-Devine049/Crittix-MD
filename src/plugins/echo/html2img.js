const p = require('../../lib/phrases');

/*
 * HTML2IMG.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
module.exports = {
  command: ['html2img', 'htmlimg'],
  category: 'soultools',
  description: 'Convert HTML code to an image',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const html = args.join(' ').trim();
    if (!html) return reply(p.phrases.wrongUsage('paste your html code after the command. example! .html2img <h1>hello world</h1>'));

    await reply('🖼️ converting HTML to image...');

    try {
      const url = `https://prexzyapis.com/tools/html2img?html=${encodeURIComponent(html)}&width=&height=&format=`;

      await sock.sendMessage(chatId, {
        image: { url },
        caption: '🖼️ *HTML to Image*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_'
      }, { quoted: msg });

    } catch (e) {
      reply('❌ conversion failed — ' + e.message);
    }
  }
};
