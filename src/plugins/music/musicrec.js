/* MUSICREC.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
module.exports = {
  command: 'musicrec',
  aliases: ['recommend','musicsuggest'],
  category: 'soultools',
  description: 'AI-powered music recommendations based on mood or genre',
  execute: async ({ text, prefix, reply }) => {
    const query = text.replace(/^[^\s]+\s*/, '').trim();
    if (!query) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}musicrec <mood/genre/artist>\n\n${h.toBoldItalic('Examples')}:\n${prefix}musicrec sad heartbreak\n${prefix}musicrec hype workout\n${prefix}musicrec like Drake\n${prefix}musicrec afrobeats party`);
    try {
      await reply(`🧠 ${h.toBoldItalic('Generating music recommendations...')} ${h.demonEmoji()}`);
      const response = await axios.post('https://text.pollinations.ai/openai', {
        model: 'openai',
        messages: [
          { role: 'system', content: 'You are a music recommendation expert. When given a mood, genre, or artist preference, recommend exactly 8 songs. Format each as: "Song Title - Artist Name". Be specific with real songs. Include a mix of popular and hidden gems. Keep your response ONLY to the numbered list, no other text.' },
          { role: 'user', content: `Recommend 8 songs for: ${query}` }
        ],
        max_tokens: 400
      }, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 });
      const aiRecs = response.data?.choices?.[0]?.message?.content || '';
      if (!aiRecs) throw new Error('No recommendations generated');
      let txt = `╔═══════════════════════════════╗\n║ 🎵 𝐌𝐔𝐒𝐈𝐂 𝐑𝐄𝐂𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `🎯 ${h.toBoldItalic('Based on')}: ${query}\n\n${aiRecs.trim()}\n\n💀 ${h.toBoldItalic('Powered by Pollinations AI')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Recommendation failed')} ${h.demonEmoji()}\n\nTry again!`);
    }
  }
};
