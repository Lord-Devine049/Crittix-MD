/*
 * NSFW.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = [
  {
    command: ['nsfw'],
    category: 'soultools',
    description: 'Random NSFW image',
    execute: async ({ sock, msg, chatId, reply }) => {
      try {
        await sock.sendMessage(chatId, {
          image: { url: 'https://prexzyapis.com/random/anhnsfw' },
          caption: '🔞 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗡𝗦𝗙𝗪*'
        }, { quoted: msg });
      } catch (e) {
        reply('❌ failed to fetch image — ' + e.message);
      }
    }
  },
  {
    command: ['nsfwvid'],
    category: 'soultools',
    description: 'Random NSFW video clip',
    execute: async ({ sock, msg, chatId, reply }) => {
      try {
        await sock.sendMessage(chatId, {
          video: { url: 'https://prexzyapis.com/random/anhvideonsfw' },
          caption: '🔞 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗡𝗦𝗙𝗪*'
        }, { quoted: msg });
      } catch (e) {
        reply('❌ failed to fetch video — ' + e.message);
      }
    }
  }
];