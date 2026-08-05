
module.exports = {
  command: 'bet',
  category: 'arena',
  description: 'Bet aura with someone',
  execute: async ({ sock, msg, args, sender, chatId, reply }) => {
    const h = require('../../lib/helpers');
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    if (!target.length) return reply('usage: .bet @user <amount>');
    const amount = parseInt(args[1]) || parseInt(args[0]);
    if (!amount || amount <= 0) return reply('usage: .bet @user <amount>');
    const betMsg = await sock.sendMessage(chatId, {
      text: '🎲 AURA BET\n\n@' + sender.split('@')[0] + ' challenges @' + target[0].split('@')[0] + ' for ' + amount + ' aura!\n\nReply *accept* to accept',
      mentions: [sender, target[0]]
    }, { quoted: msg });
    global.activeBets = global.activeBets || {};
    global.activeBets[betMsg.key.id] = { hostId: sender, targetId: target[0], amount, createdAt: Date.now() };
    setTimeout(() => { if (global.activeBets?.[betMsg.key.id]) delete global.activeBets[betMsg.key.id]; }, 5 * 60 * 1000);
  }
};