const downloader = require('../../lib/downloader');

module.exports = {
  command: ['apk'],
  category: 'darkweb',
  description: 'Search and download an APK by app name',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const appName = args.join(' ').trim();
    if (!appName) return reply('usage: .apk <app name>\nexample: .apk whatsapp');

    await reply('🔍 searching for APK...');

    try {
      const result = await downloader.apkDL(appName);

      if (!result?.downloadUrl) return reply('❌ APK not found or download link unavailable.');

      const caption =
        `📦 *${result.name}*\n` +
        `🆔 Package: ${result.package}\n` +
        `🔖 Version: ${result.version}\n\n` +
        `🔗 Download link:\n${result.downloadUrl}`;

      // send icon if available, otherwise just text
      if (result.icon) {
        await sock.sendMessage(chatId, {
          image: { url: result.icon },
          caption
        }, { quoted: msg });
      } else {
        await reply(caption);
      }
    } catch (e) {
      reply('❌ APK download failed — ' + e.message);
    }
  }
};
