/*
 * SCRAMBLE.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Bot scrambles a word, first to unscramble wins
 */
const globalXP = require('../../lib/global-xp');

const WORDS = [
  'crittix','divine','abyss','shadow','phantom','viper','chaos',
  'cipher','hunter','raider','legend','brutal','savage','menace',
  'throne','empire','bounty','heist','gamble','battle','dungeon',
];

const activeScrambles = new Map();

const scramble = (word) => {
  const arr = word.split('');
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  // Make sure scrambled != original
  return arr.join('') === word ? scramble(word) : arr.join('');
};

const checkAnswer = (chatId, sender, senderNumber, text, sock, msg) => {
  const sc = activeScrambles.get(chatId);
  if (!sc) return false;
  if (text.trim().toLowerCase() === sc.word) {
    activeScrambles.delete(chatId);
    globalXP.addXP(sender, msg.pushName || senderNumber);
    sock.sendMessage(chatId, {
      text: `🎉 @${senderNumber} got it! The word was *${sc.word}* 🏆\n⚡ +${globalXP.XP_PER_GAME} XP`,
      mentions: [sender],
    }, { quoted: msg });
    return true;
  }
  return false;
};

module.exports = {
  command: ['scramble'],
  category: 'shadowgames',
  description: 'Unscramble the word to win XP',
  checkAnswer,
  execute: async ({ sock, msg, chatId, reply }) => {
    if (activeScrambles.has(chatId))
      return reply(`🔤 scramble already active — unscramble it first!`);

    const word       = WORDS[Math.floor(Math.random()*WORDS.length)];
    const scrambled  = scramble(word);
    activeScrambles.set(chatId, { word, scrambled, startedAt: Date.now() });

    setTimeout(() => {
      const sc = activeScrambles.get(chatId);
      if (sc?.word === word) {
        activeScrambles.delete(chatId);
        sock.sendMessage(chatId, { text: `⏰ time's up! The word was *${word}* 💀` });
      }
    }, 45000);

    await sock.sendMessage(chatId, {
      text:
        `╔════════════════════════么\n║ 🔤 *SCRAMBLE*\n╚════════════════════════么\n\n` +
        `Unscramble this word:\n\n*${scrambled.toUpperCase()}*\n\n` +
        `⚡ First to type it wins XP!\n⏰ 45 seconds — go!\n么════════════════════════么`,
    }, { quoted: msg });
  }
};
