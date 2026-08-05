const h = require('../../lib/helpers');
const bootTime = require('../../lib/boot-time');

module.exports = {
  command: ['runtime'],
  aliases: ['uptime'],
  category: 'soultools',
  description: 'Show bot runtime / uptime',
  execute: async ({ reply }) => {
    const uptime = bootTime.getRuntime();
    const ram    = h.getRAMUsage();
    reply(
      `⏱️ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗥𝘂𝗻𝘁𝗶𝗺𝗲*\n\n` +
      `🕒 Uptime: *${uptime}*\n` +
      `🧠 RAM: *${ram.used} MB*\n` +
      `💻 Platform: *${process.platform}*\n` +
      `⚡ Node: *${process.version}*`
    );
  }
};
