/*
 * TRIVIA.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'trivia',
  category: 'arena',
  description: 'Get a trivia question',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const axios = require('axios');
    try {
      const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', { timeout: 8000 });
      const q = res.data.results[0];
      if (!q) return reply(h.demonFail('Could not fetch trivia'));
      const decode = s => s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'");
      const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random()-0.5).map(decode);
      reply('🎯 TRIVIA (' + decode(q.category) + ')\n\n❓ ' + decode(q.question) + '\n\n' + answers.map((a,i) => (i+1) + '. ' + a).join('\n') + '\n\n_Spoiler: ||' + decode(q.correct_answer) + '||_');
    } catch(e) { reply(h.demonFail('Trivia API error')); }
  }
};
