/*
 * WEBSS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
module.exports = {
  command: ['webss', 'screenshot'],
  category: 'soultools',
  description: 'Take a screenshot of any website',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const url = args[0];
    if (!url || !url.startsWith('http')) {
      return reply('usage: .webss <url>\nexample: .webss https://google.com');
    }

    await reply('📸 taking screenshot...');

    try {
      await sock.sendMessage(chatId, {
        image: { url: `https://prexzyapis.com/ssweb/webss?url=${encodeURIComponent(url)}` },
        caption: `📸 *Screenshot*\n🔗 ${url}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    } catch (e) {
      reply('❌ screenshot failed — ' + e.message);
    }
  }
};
