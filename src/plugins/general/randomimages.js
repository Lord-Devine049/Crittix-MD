/*
 * RANDOMIMAGES.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

const imageMap = {
  aipic:          { url: 'https://prexzyapis.com/random/aipic',          caption: '🤖 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗔𝗜 𝗣𝗶𝗰*' },
  bluearchive:    { url: 'https://prexzyapis.com/random/bluearchive',     caption: '📘 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗕𝗹𝘂𝗲 𝗔𝗿𝗰𝗵𝗶𝘃𝗲*' },
  boypic:         { url: 'https://prexzyapis.com/random/boypic',          caption: '👦 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗕𝗼𝘆 𝗣𝗶𝗰*' },
  carimage:       { url: 'https://prexzyapis.com/random/carimage',        caption: '🏎️ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗖𝗮𝗿*' },
  randomgirl:     { url: 'https://prexzyapis.com/random/randomgirl',      caption: '👧 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗥𝗮𝗻𝗱𝗼𝗺 𝗚𝗶𝗿𝗹*' },
  hijabgirl:      { url: 'https://prexzyapis.com/random/hijabgirl',       caption: '🧕 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗛𝗶𝗷𝗮𝗯 𝗚𝗶𝗿𝗹*' },
  indonesiagirl:  { url: 'https://prexzyapis.com/random/indonesiagirl',   caption: '🇮🇩 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗜𝗻𝗱𝗼𝗻𝗲𝘀𝗶𝗮 𝗚𝗶𝗿𝗹*' },
  japangirl:      { url: 'https://prexzyapis.com/random/japangirl',       caption: '🇯🇵 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗝𝗮𝗽𝗮𝗻 𝗚𝗶𝗿𝗹*' },
  koreangirl:     { url: 'https://prexzyapis.com/random/koreangirl',      caption: '🇰🇷 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗞𝗼𝗿𝗲𝗮𝗻 𝗚𝗶𝗿𝗹*' },
  malaysiagirl:   { url: 'https://prexzyapis.com/random/malaysiagirl',    caption: '🇲🇾 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗮𝗹𝗮𝘆𝘀𝗶𝗮 𝗚𝗶𝗿𝗹*' },
  profilepic:     { url: 'https://prexzyapis.com/random/profilepictures', caption: '🖼️ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗣𝗶𝗰*' },
};

module.exports = {
  command: ['aipic', 'boypic', 'carimage', 'randomgirl',
            'hijabgirl', 'indonesiagirl', 'japangirl', 'koreangirl',
            'malaysiagirl', 'profilepic'],
  aliases: ['hijab-girl', 'random-girl', 'korea-girl', 'japan-girl', 'indonesia-girl', 'malaysia-girl', 'profile-pictures'],
  category: 'soultools',
  description: 'Random image by category',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = (command || 'randomgirl')
      .toLowerCase()
      .replace(/-/g, '');

    const img = imageMap[cmd] || imageMap['randomgirl'];

    try {
      await sock.sendMessage(chatId, {
        image: { url: img.url },
        caption: img.caption
      }, { quoted: msg });
    } catch {
      reply(h.demonFail('Image fetch failed. Try again.'));
    }
  }
};
