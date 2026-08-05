/*
 * TYPERACE.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Typing speed race — whoever types the sentence first wins XP
 */
const globalXP = require('../../lib/global-xp');
const h        = require('../../lib/helpers');

const SENTENCES = [
  'the night raiders never sleep and neither do i',
  'crittix was built to destroy your entire bloodline',
  'lord devine created the most dangerous bot alive',
  'your aura is so low it went underground',
  'type faster before i lose interest in your existence',
  'the darkness consumes all who dare challenge crittix',
  'you think you can beat me with those slow fingers',
  'night raiders empire stands above all other clans',
  'your vault is empty just like your ambitions',
  'press harder on the keys like your life depends on it',
];

const activeRaces = new Map(); // chatId -> { sentence, startedAt, winner }

// expose for devine.js to hook answers
const checkAnswer = (chatId, sender, senderNumber, text, sock, msg) => {
  const race = activeRaces.get(chatId);
  if (!race || race.winner) return false;
  if (text.trim().toLowerCase() === race.sentence.toLowerCase()) {
    race.winner = sender;
    const elapsed = ((Date.now() - race.startedAt) / 1000).toFixed(2);
    activeRaces.delete(chatId);
    globalXP.addXP(sender, msg.pushName || senderNumber);
    sock.sendMessage(chatId, {
      text:
        `╔════════════════════════么\n║ ⌨️ *TYPERACE WON*\n╚════════════════════════么\n\n` +
        `🏆 @${senderNumber} finished in *${elapsed}s*!\n` +
        `⚡ +${globalXP.XP_PER_GAME} XP awarded\n么════════════════════════么`,
      mentions: [sender],
    }, { quoted: msg });
    return true;
  }
  return false;
};

module.exports = {
  command: ['typerace', 'tr'],
  category: 'shadowgames',
  description: 'Typing speed race — first to type the sentence wins',
  groupOnly: true,
  checkAnswer, // exported for devine.js hook
  execute: async ({ sock, msg, chatId, reply }) => {
    if (activeRaces.has(chatId))
      return reply(`⌨️ race already running — type the sentence!`);

    const sentence = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    activeRaces.set(chatId, { sentence, startedAt: Date.now(), winner: null });

    // Auto-expire after 60s
    setTimeout(() => {
      if (activeRaces.has(chatId) && !activeRaces.get(chatId).winner) {
        activeRaces.delete(chatId);
        sock.sendMessage(chatId, { text: `⌨️ typerace expired — nobody typed it in time 💀` });
      }
    }, 60000);

    await sock.sendMessage(chatId, {
      text:
        `╔════════════════════════么\n║ ⌨️ *TYPERACE*\n╚════════════════════════么\n\n` +
        `Type this sentence EXACTLY:\n\n` +
        `*"${sentence}"*\n\n` +
        `⚡ First to type it wins XP!\n⏰ 60 seconds — go!\n么════════════════════════么`,
    }, { quoted: msg });
  }
};
