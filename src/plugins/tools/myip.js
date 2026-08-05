/*
 * MYIP.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const http = require('http');
const h = require('../../lib/helpers');

module.exports = {
  command: ['myip', 'getip'],
  category: 'soultools',
  description: 'Get bot server IP address',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    try {
      const ip = await new Promise((resolve, reject) => {
        http.get({ host: 'api.ipify.org', port: 80, path: '/' }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data.trim()));
        }).on('error', reject);
      });

      reply(`🌐 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗜𝗣*\n\n\`${ip}\``);
    } catch {
      reply(h.demonFail('Failed to fetch IP address'));
    }
  }
};
