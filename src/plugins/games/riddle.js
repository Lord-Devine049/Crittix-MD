/*
 * RIDDLE.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Bot sends a riddle — first to answer wins XP + coins
 */
const vault    = require('../../lib/vault');
const globalXP = require('../../lib/global-xp');

const RIDDLES = [
  { q: 'I speak without a mouth and hear without ears. I have no body but come alive with the wind. What am I?', a: 'echo' },
  { q: 'The more you take, the more you leave behind. What am I?', a: 'footsteps' },
  { q: 'I have cities but no houses live there. I have mountains but no trees grow. I have water but no fish swim. What am I?', a: 'map' },
  { q: "I'm light as a feather but the strongest man can't hold me for more than 5 minutes. What am I?", a: 'breath' },
  { q: 'What has keys but no locks, space but no room, and you can enter but can\'t go inside?', a: 'keyboard' },
  { q: 'I have hands but cannot clap. What am I?', a: 'clock' },
  { q: 'What gets wetter the more it dries?', a: 'towel' },
  { q: 'I run but have no legs. I have a mouth but never talk. What am I?', a: 'river' },
  { q: 'What can travel around the world while staying in a corner?', a: 'stamp' },
  { q: 'I have teeth but cannot bite. What am I?', a: 'comb' },
  { q: 'What has one eye but cannot see?', a: 'needle' },
  { q: 'The more there is, the less you see. What am I?', a: 'darkness' },
];

const PRIZE = 150;
const activeRiddles = new Map();

const checkAnswer = (chatId, sender, senderNumber, text, sock, msg) => {
  const r = activeRiddles.get(chatId);
  if (!r) return false;
  if (text.trim().toLowerCase() === r.answer) {
    activeRiddles.delete(chatId);
    vault.updateBalance(sender, PRIZE, 0);
    globalXP.addXP(sender, msg.pushName || senderNumber);
    sock.sendMessage(chatId, {
      text:
        `🎉 *@${senderNumber} got it!*\n\n` +
        `✅ Answer: *${r.answer}*\n` +
        `💰 Reward: 🪙 ${PRIZE}\n` +
        `⚡ +${globalXP.XP_PER_GAME} XP`,
      mentions: [sender],
    }, { quoted: msg });
    return true;
  }
  return false;
};

module.exports = {
  command: ['riddle'],
  category: 'arena',
  description: 'Answer the riddle to win coins + XP',
  checkAnswer,
  execute: async ({ sock, msg, chatId, reply }) => {
    if (activeRiddles.has(chatId))
      return reply(`🧩 riddle already active — answer it first!`);

    const riddle = RIDDLES[Math.floor(Math.random()*RIDDLES.length)];
    activeRiddles.set(chatId, { answer: riddle.a, startedAt: Date.now() });

    setTimeout(() => {
      const r = activeRiddles.get(chatId);
      if (r?.answer === riddle.a) {
        activeRiddles.delete(chatId);
        sock.sendMessage(chatId, { text: `⏰ time's up! Answer was *${riddle.a}* 💀` });
      }
    }, 60000);

    await sock.sendMessage(chatId, {
      text:
        `╔════════════════════════么\n║ 🧩 *RIDDLE*\n╚════════════════════════么\n\n` +
        `${riddle.q}\n\n` +
        `🏆 Prize: 🪙 ${PRIZE} + ⚡ XP\n⏰ 60 seconds — first correct answer wins!\n么════════════════════════么`,
    }, { quoted: msg });
  }
};
