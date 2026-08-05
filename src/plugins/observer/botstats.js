/*
 * BOTSTATS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'botstats',
  category: 'groupanalytics',
  description: 'Bot system stats',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const os = require('os');
    const uptime = process.uptime();
    const h_ = Math.floor(uptime/3600), m_ = Math.floor((uptime%3600)/60), s_ = Math.floor(uptime%60);
    const ram = process.memoryUsage();
    const used = Math.round(ram.heapUsed/1024/1024);
    reply('📊 BOT STATS\n\n🤖 Bot: ' + cfg.BOT_NAME + '\n⏱️ Uptime: ' + h_ + 'h ' + m_ + 'm ' + s_ + 's\n💾 RAM: ' + used + 'MB\n💻 OS: ' + os.platform() + '\n🔧 Node: ' + process.version);
  }
};
