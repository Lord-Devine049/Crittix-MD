
const crittixAura = require('../../lib/crittix-aura');
module.exports = {
  command: 'duel',
  category: 'arena',
  description: 'Challenge user to aura duel',
  execute: async ({ sock, msg, args, sender, chatId, reply }) => {
    const h = require('../../lib/helpers');
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    if (!target.length) return reply('usage: .duel @user');
    const opponent = target[0];
    if (opponent === sender) return reply("you can't duel yourself");
    const winner = Math.random() > 0.5 ? sender : opponent;
    const loser  = winner === sender ? opponent : sender;
    const prize  = Math.floor(Math.random() * 50) + 10;
    try {
      crittixAura.farmAura(winner, prize);
    } catch (_) {}
    await sock.sendMessage(chatId, {
      text: '⚔️ DUEL RESULT\n\n🏆 Winner: @' + winner.split('@')[0] + ' (+' + prize + ' aura)\n💀 Loser: @' + loser.split('@')[0] + ' (-' + prize + ' aura)',
      mentions: [sender, opponent]
    }, { quoted: msg });
  }
};