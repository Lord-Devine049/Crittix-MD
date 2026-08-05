'use strict';
const observer = require('../../lib/observer');
module.exports = {
  command: 'mystats',
  category: 'groupanalytics',
  description: 'Your bot usage stats',
  execute: async ({ sock, msg, sender, senderNumber, chatId, reply }) => {
    try {
      const stats = observer.getUserStats(sender);
      if (!stats) return reply('no stats yet — send some messages first');
      reply('📊 MY STATS\n\n👤 @' + senderNumber + '\n💬 Messages: ' + (stats.messages || 0) + '\n⚡ Commands: ' + (stats.commands || 0) + '\n🏆 Top cmd: ' + (stats.topCommand || 'none'));
    } catch (e) { reply('failed — ' + e.message); }
  }
};