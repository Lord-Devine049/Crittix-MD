/* SONGQUIZ.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const MB_BASE = 'https://musicbrainz.org/ws/2';
const MB_HEADERS = { 'User-Agent': 'CrittixMD/2.0 (whatsapp-bot)', 'Accept': 'application/json' };
if (!global.songQuizStore) global.songQuizStore = {};
module.exports = {
  command: 'songquiz',
  category: 'soultools',
  description: 'Guess the song from a hint — .songquiz | .songquiz answer <guess> | .songquiz skip',
  execute: async ({ sock, args, sender, senderNumber, chatId, prefix, reply }) => {
    const subCmd = args[0]?.toLowerCase();
    if (subCmd === 'answer' || subCmd === 'guess') {
      const guess = args.slice(1).join(' ').toLowerCase().trim();
      const quiz = global.songQuizStore[chatId];
      if (!quiz) return reply(`✘ ${h.toBoldItalic('No active quiz')} ${h.demonEmoji()}\n\nStart one with ${prefix}songquiz`);
      const correct = quiz.title.toLowerCase();
      const isCorrect = guess === correct || (correct.includes(guess) && guess.length > 3);
      if (isCorrect) {
        delete global.songQuizStore[chatId];
        return sock.sendMessage(chatId, { text: `🎉 ${h.toBoldItalic('CORRECT!')} ${h.demonEmoji()}\n\n@${senderNumber} ${h.toBoldItalic('got it right!')}\n\n🎵 ${h.toBoldItalic('Song')}: ${quiz.title}\n🎤 ${h.toBoldItalic('Artist')}: ${quiz.artist}`, mentions: [sender] });
      } else {
        quiz.attempts = (quiz.attempts || 0) + 1;
        if (quiz.attempts >= 3) {
          delete global.songQuizStore[chatId];
          return reply(`💀 ${h.toBoldItalic('Nobody got it!')} ${h.demonEmoji()}\n\n🎵 ${h.toBoldItalic('Answer')}: ${quiz.title}\n🎤 ${h.toBoldItalic('Artist')}: ${quiz.artist}`);
        } else {
          return reply(`❌ ${h.toBoldItalic('Wrong!')} ${h.demonEmoji()} (${3 - quiz.attempts} attempts left)\n\n💡 ${h.toBoldItalic('Hint')}: ${quiz.hint}`);
        }
      }
    }
    if (subCmd === 'skip') {
      const quiz = global.songQuizStore[chatId];
      if (!quiz) return reply(`✘ ${h.toBoldItalic('No active quiz to skip')} ${h.demonEmoji()}`);
      delete global.songQuizStore[chatId];
      return reply(`⏭️ ${h.toBoldItalic('Skipped!')} ${h.demonEmoji()}\n\n🎵 ${h.toBoldItalic('Answer was')}: ${quiz.title}\n🎤 ${h.toBoldItalic('Artist')}: ${quiz.artist}`);
    }
    try {
      const offset = Math.floor(Math.random() * 100);
      const res = await axios.get(`${MB_BASE}/recording?query=*&limit=1&offset=${offset}&fmt=json`, { headers: MB_HEADERS, timeout: 15000 });
      const recordings = res.data?.recordings || [];
      const rec = recordings.find(r => r.title && r['artist-credit']?.[0]?.artist?.name);
      if (!rec) throw new Error('No recording found');
      const title = rec.title;
      const artist = rec['artist-credit']?.[0]?.artist?.name || 'Unknown';
      const hint = title.split(' ').map(word => { if (word.length <= 2) return word; return word[0] + '_'.repeat(word.length - 2) + word[word.length - 1]; }).join(' ');
      global.songQuizStore[chatId] = { title, artist, hint, attempts: 0 };
      setTimeout(() => { if (global.songQuizStore[chatId]?.title === title) delete global.songQuizStore[chatId]; }, 120000);
      return reply(`🎵 ${h.toBoldItalic('SONG QUIZ!')} ${h.demonEmoji()}\n\n🤔 ${h.toBoldItalic('Guess the song title:')}\n\n💡 ${h.toBoldItalic('Hint')}: ${hint}\n\n⌨️ ${h.toBoldItalic('Reply with')}: ${prefix}songquiz answer <your guess>\n⏭️ ${h.toBoldItalic('Give up')}: ${prefix}songquiz skip\n\n⏰ ${h.toBoldItalic('Expires in 2 minutes')}`);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Failed to start quiz')} ${h.demonEmoji()}\n\nTry again!`);
    }
  }
};
