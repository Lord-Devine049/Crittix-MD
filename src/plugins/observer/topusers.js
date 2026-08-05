const observer = require('../../lib/observer');
module.exports = {
  command: 'topusers',
  category: 'groupanalytics',
  description: 'Most active users',
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      const top = observer.getTopUsers(null, 10);
      if (!top?.length) return reply('no data yet');
      const mentions = top.map(u => u.jid.replace(/:\d+@/, '@'));
      await sock.sendMessage(chatId, {
        text: '🏆 Top Users:\n\n' + top.map((u, i) => (i + 1) + '. @' + u.jid.split('@')[0] + ' — ' + u.count + ' msgs').join('\n'),
        mentions
      }, { quoted: msg });
    } catch (e) { reply('failed — ' + e.message); }
  }
};