/*
 * ALIVE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['alive', 'status'],
  aliases: ['botinfo'],
  category: 'soultools',
  description: 'Check if the bot is alive',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const ram = h.getRAMUsage();
    const uptime = h.formatUptime(process.uptime() * 1000);

    reply(
      `☠️ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗 — 𝗔𝗹𝗶𝘃𝗲*\n\n` +
      `💀 Status: *Online*\n` +
      `⏱️ Uptime: *${uptime}*\n` +
      `🧠 RAM: *${ram.used} MB*\n` +
      `⚡ Prefix: *${prefix}*\n\n` +
      `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗 is breathing and ready to destroy._`
    );
  }
};
