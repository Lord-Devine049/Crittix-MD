/*
 * FDROID.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['fdroid'],
  category: 'soultools',
  description: 'Search for open-source apps on F-Droid',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const query = args.join(' ').trim();
    if (!query) return reply('usage: .fdroid <app name>\nexample: .fdroid termux');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/tools/fdroidsearch?q=${encodeURIComponent(query)}`,
        { timeout: 15000 }
      );

      if (!data?.status || !data?.results?.length) {
        return reply(`❌ no F-Droid apps found for "${query}"`);
      }

      let txt = `📦 *F-Droid Search*\n🔍 _${query}_\n📊 Total: ${data.total_results}\n\n`;
      data.results.slice(0, 5).forEach((app, i) => {
        txt += `${i + 1}. *${app.name}*\n`;
        txt += `   📝 ${app.summary}\n`;
        txt += `   ⚖️ ${app.license}\n`;
        txt += `   🔗 ${app.link}\n\n`;
      });
      txt += '_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_';

      await sock.sendMessage(chatId, { text: txt }, { quoted: msg });

    } catch (e) {
      reply('❌ search failed — ' + e.message);
    }
  }
};
