/*
 * QUIZ.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = [
  {
    command: ['quiz', 'quizguess'],
    category: 'soultools',
    description: 'Get a random guess quiz question. Usage: .quiz <level 1-9>',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const level = args[0] || '1';

      try {
        const { data } = await axios.get(
          `https://prexzyapis.com/game/quizguess?level=${level}`,
          { timeout: 15000 }
        );

        if (!data?.status || !data?.data?.length) return reply('❌ failed to get quiz question');

        const q = data.data[0];
        const choices = q.choices || q.options || [];

        let txt =
          `🧠 *Guess Quiz*\n` +
          `📊 Level: ${q.level}\n\n` +
          `❓ *${q.question}*\n\n`;

        if (choices.length) {
          choices.forEach((c, i) => {
            txt += `${String.fromCharCode(65 + i)}. ${c}\n`;
          });
        }

        txt += '\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_';

        await sock.sendMessage(chatId, { text: txt }, { quoted: msg });

      } catch (e) {
        reply('❌ quiz failed — ' + e.message);
      }
    }
  },
  {
    command: ['quizcats', 'quizcategories'],
    category: 'soultools',
    description: 'Get all available quiz categories',
    execute: async ({ sock, msg, chatId, reply }) => {
      try {
        const { data } = await axios.get(
          'https://prexzyapis.com/game/quizcategories',
          { timeout: 15000 }
        );

        if (!data?.status || !data?.data?.length) return reply('❌ failed to fetch categories');

        let txt = `📚 *Quiz Categories*\n\n`;
        data.data.forEach((c, i) => {
          txt += `${i + 1}. *${c.title}* — ${c.levels} levels\n`;
        });
        txt += '\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_';

        await sock.sendMessage(chatId, { text: txt }, { quoted: msg });

      } catch (e) {
        reply('❌ failed — ' + e.message);
      }
    }
  }
];
