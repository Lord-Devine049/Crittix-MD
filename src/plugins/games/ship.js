module.exports = {
  command: 'ship',
  category: 'arena',
  description: 'Ship two users',
  execute: async ({ sock, msg, chatId, reply }) => {
    const h = require('../../lib/helpers');
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const targets = h.getTarget(msg, _gtP);
    if (targets.length < 2) return reply('tag two people — .ship @user1 @user2');
    const n1  = targets[0].split('@')[0];
    const n2  = targets[1].split('@')[0];
    const seed  = [...(n1 + n2)].reduce((a, c) => a + c.charCodeAt(0), 0);
    const score = (seed % 91) + 10;
    const bar   = '❤️'.repeat(Math.round(score / 10)) + '🖤'.repeat(10 - Math.round(score / 10));
    const msgs  = [
      score + '% — ' + n1 + ' & ' + n2 + ' are actually scary compatible, somebody confess already',
      score + '% — ' + n1 + ' & ' + n2 + ' would argue every day but never leave each other',
      score + '% — ' + n1 + ' & ' + n2 + ' have zero chemistry, not happening',
      score + '% — ' + n1 + ' & ' + n2 + ' give off situationship energy',
      score + '% — ' + n1 + ' & ' + n2 + ' are soulmates and neither of them knows it yet',
    ];
    await sock.sendMessage(chatId, {
      text: '💘 SHIP\n\n@' + n1 + ' + @' + n2 + '\n\n' + bar + '\n' + msgs[seed % msgs.length],
      mentions: targets
    }, { quoted: msg });
  }
};