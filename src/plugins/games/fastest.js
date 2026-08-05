/*
 * FASTEST.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Bot sends a random word/number — first to type it exactly wins
 */
const globalXP = require('../../lib/global-xp');

const WORDS = ['crittix','divine','raider','viper','shadow','cipher','chaos','throne',
  'bounty','heist','menace','legend','brutal','abyss','empire'];

const activeRounds = new Map();

const checkAnswer = (chatId, sender, senderNumber, text, sock, msg) => {
  const r = activeRounds.get(chatId);
  if (!r) return false;
  if (text.trim() === r.target) {
    const elapsed = ((Date.now()-r.startedAt)/1000).toFixed(2);
    activeRounds.delete(chatId);
    globalXP.addXP(sender, msg.pushName || senderNumber);
    sock.sendMessage(chatId, {
      text: `⚡ @${senderNumber} got it in *${elapsed}s*! 🏆\n+${globalXP.XP_PER_GAME} XP`,
      mentions: [sender],
    }, { quoted: msg });
    return true;
  }
  return false;
};

module.exports = {
  command: ['fastest', 'fast'],
  category: 'arena',
  description: 'First to type the word/number wins XP',
  groupOnly: true,
  checkAnswer,
  execute: async ({ sock, msg, chatId, reply }) => {
    if (activeRounds.has(chatId))
      return reply(`⚡ round already running!`);

    // Random word or number
    const isNum  = Math.random() > 0.5;
    const target = isNum
      ? String(Math.floor(Math.random() * 9000) + 1000)
      : WORDS[Math.floor(Math.random()*WORDS.length)];

    activeRounds.set(chatId, { target, startedAt: Date.now() });
    setTimeout(() => {
      if (activeRounds.has(chatId)) {
        activeRounds.delete(chatId);
        sock.sendMessage(chatId, { text: `💀 nobody typed *${target}* in time` });
      }
    }, 30000);

    // 3 second delay so it's fair
    await reply(`⚡ *FASTEST FINGERS*\n\nGet ready...`);
    await new Promise(r => setTimeout(r, 3000));
    await sock.sendMessage(chatId, {
      text: `👇 TYPE THIS NOW:\n\n*${target}*`,
    });
  }
};
