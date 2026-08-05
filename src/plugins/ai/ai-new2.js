/*
 * AI-NEW2.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: aiquizgen, aicaption3, aiproofread, aisummarytone, aiplotgen,
 *           aicharactergen, ailyricsgen, aipoemgen, airiddle, aitranslateformal,
 *           aiexcuse, aiapology, aicomeback, aipickup2
 */
const axios = require('axios');
const h     = require('../../lib/helpers');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.3-70b-versatile';

const ai = async (system, user, temp = 1.2, tokens = 400) => {
  const res = await axios.post(GROQ_URL, {
    model: MODEL,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    temperature: temp,
    max_tokens: tokens,
  }, {
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    timeout: 20000,
  });
  return res.data.choices[0].message.content.trim();
};

const CRITTIX_BASE = `You are CRITTIX, created by LORD DEVINE. You are savage, witty, confident — Crittix Empire vibes. Never robotic or generic. Keep responses tight and impactful.`;

module.exports = [

  {
    command: 'aiquizgen',
    aliases: ['aigenquiz', 'aicreateq'],
    category: 'darkintelligence',
    description: 'AI generates a 3-5 question quiz on a topic. Usage: aiquizgen <topic>',
    execute: async ({ args, reply }) => {
      const topic = args.join(' ');
      if (!topic) return reply(h.demonError('.aiquizgen', '.aiquizgen <topic>'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Generate a 3-5 question quiz on the given topic. Number each question. Include 4 answer options (A/B/C/D) and mark the correct answer at the end with "Answers:" section.`,
          `Quiz topic: "${topic}"`, 0.8, 600
        );
        reply(`🧠 *AI QUIZ — ${topic.toUpperCase()}*\n\n${ans}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`quiz gen failed — ${e.message}`)); }
    }
  },

  {
    command: 'aiproofread',
    aliases: ['proofread', 'aigrammar2'],
    category: 'darkintelligence',
    description: 'AI proofreads and corrects your text. Usage: aiproofread <text>',
    execute: async ({ args, text, msg, reply }) => {
      const input = args.join(' ') || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
      if (!input) return reply(h.demonError('.aiproofread', '.aiproofread <text to proofread> or reply to a message'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Proofread the given text. Fix all typos, grammar errors, and unclear phrasing. Return the corrected version first, then briefly list the key changes made. Be direct.`,
          input, 0.3, 500
        );
        reply(`✅ *AI PROOFREAD*\n\n${ans}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`proofread failed — ${e.message}`)); }
    }
  },

  {
    command: 'aisummarytone',
    aliases: ['summarytone', 'tonedsummary'],
    category: 'darkintelligence',
    description: 'Summarize text in a chosen tone (funny/formal/savage). Usage: aisummarytone <tone> | <text>',
    execute: async ({ args, text, reply }) => {
      const parts = text.split('|');
      const tone = parts[0]?.trim() || 'funny';
      const input = parts[1]?.trim() || args.slice(1).join(' ');
      if (!input) return reply(h.demonError('.aisummarytone', '.aisummarytone funny | <your text to summarize>'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Summarize the given text in a *${tone}* tone. Keep it under 5 sentences. If savage, make it harsh but clever. If formal, make it business-ready.`,
          input, 1.2, 350
        );
        reply(`📝 *AI SUMMARY (${tone.toUpperCase()} TONE)*\n\n${ans}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`summary failed — ${e.message}`)); }
    }
  },

  {
    command: 'aiplotgen',
    aliases: ['plotgen', 'storyline'],
    category: 'darkintelligence',
    description: 'AI generates a short story plot for a given genre. Usage: aiplotgen <genre>',
    execute: async ({ args, reply }) => {
      const genre = args.join(' ') || 'thriller';
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Generate an original short story plot premise for the given genre. Include: protagonist, conflict, twist, and stakes. Keep it under 8 sentences. Make it gripping.`,
          `Genre: "${genre}"`, 1.3, 400
        );
        reply(`🎬 *AI PLOT — ${genre.toUpperCase()}*\n\n${ans}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`plot gen failed — ${e.message}`)); }
    }
  },

  {
    command: 'aicharactergen',
    aliases: ['chargen', 'aifictional'],
    category: 'darkintelligence',
    description: 'AI generates a fictional character profile. Usage: aicharactergen <genre>',
    execute: async ({ args, reply }) => {
      const genre = args.join(' ') || 'fantasy';
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Create an original fictional character for a "${genre}" story. Include: name, age, appearance, personality, backstory, special ability/skill, and fatal flaw. Make them complex, not generic.`,
          `Genre: "${genre}"`, 1.2, 500
        );
        reply(`🧬 *AI CHARACTER — ${genre.toUpperCase()}*\n\n${ans}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`character gen failed — ${e.message}`)); }
    }
  },

  {
    command: 'ailyricsgen',
    aliases: ['lyricsgen', 'ailyrics'],
    category: 'darkintelligence',
    description: 'AI generates ORIGINAL song lyrics on a theme. Usage: ailyricsgen <theme>',
    execute: async ({ args, reply }) => {
      const theme = args.join(' ') || 'rising up';
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Write ORIGINAL song lyrics (never reproduce existing copyrighted songs) on the given theme. Include verse, chorus, bridge structure. Label each section. Make it memorable and emotionally resonant.`,
          `Song theme: "${theme}"`, 1.4, 600
        );
        reply(`🎵 *AI LYRICS — "${theme}"*\n\n${ans}\n\n⚠️ 100% original — not affiliated with any existing song.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`lyrics gen failed — ${e.message}`)); }
    }
  },

  {
    command: 'aipoemgen',
    aliases: ['poemgen', 'aipoem'],
    category: 'darkintelligence',
    description: 'AI generates an original poem on a theme. Usage: aipoemgen <theme>',
    execute: async ({ args, reply }) => {
      const theme = args.join(' ') || 'the night';
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Write an original poem on the given theme. Use vivid imagery and a clear structure (rhymed or free verse, your call). Make it emotional and punchy. Max 16 lines.`,
          `Poem theme: "${theme}"`, 1.4, 400
        );
        reply(`🌹 *AI POEM — "${theme}"*\n\n${ans}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`poem gen failed — ${e.message}`)); }
    }
  },

  {
    command: 'airiddle',
    aliases: ['airiddles', 'generateriddle'],
    category: 'darkintelligence',
    description: 'AI generates a brand-new riddle. Usage: airiddle',
    execute: async ({ reply }) => {
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Create a brand-new, original riddle. Do NOT use any famous existing riddles. Format: Riddle text first, then "||Answer: [answer]||" on a new line. Make it clever but not impossible.`,
          'Generate a fresh original riddle', 1.4, 200
        );
        reply(`🤔 *AI RIDDLE*\n\n${ans}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`riddle gen failed — ${e.message}`)); }
    }
  },

  {
    command: 'aitranslateformal',
    aliases: ['formalise', 'makeformal'],
    category: 'darkintelligence',
    description: 'Translate informal text to business-formal. Usage: aitranslateformal <text>',
    execute: async ({ args, msg, reply }) => {
      const input = args.join(' ') || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
      if (!input) return reply(h.demonError('.aitranslateformal', '.aitranslateformal <informal text> or reply to a message'));
      try {
        const ans = await ai(
          `You are a professional business writing assistant. Rewrite the given informal text into polished, business-formal language. Maintain the original meaning but elevate the tone entirely. No slang.`,
          input, 0.4, 300
        );
        reply(`👔 *FORMAL TRANSLATION*\n\n*Original:* ${input}\n\n*Formal:* ${ans}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`translation failed — ${e.message}`)); }
    }
  },

  {
    command: 'aiexcuse',
    aliases: ['excuseme', 'makeexcuse'],
    category: 'darkintelligence',
    description: 'AI generates a ridiculous excuse for your situation. Usage: aiexcuse <situation>',
    execute: async ({ args, reply }) => {
      const situation = args.join(' ') || 'being late';
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Generate a hilariously over-the-top excuse for the given situation. Make it dramatic, barely believable, and Crittix-flavored. One paragraph max.`,
          `Situation: "${situation}"`, 1.5, 250
        );
        reply(`😅 *AI EXCUSE*\n\nSituation: *${situation}*\n\n"${ans}"\n\nYou're welcome. Use at your own risk. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`excuse gen failed — ${e.message}`)); }
    }
  },

  {
    command: 'aiapology',
    aliases: ['makeapology', 'sorrybot'],
    category: 'darkintelligence',
    description: 'AI generates a flavor "apology" for a mishap (for fun). Usage: aiapology <what you did>',
    execute: async ({ args, reply }) => {
      const mishap = args.join(' ') || 'forgetting someone\'s birthday';
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Generate a dramatically over-the-top apology for the given mishap. Make it theatrical, a tiny bit roast-flavored, and clearly for entertainment. Label it as a flavor apology. Max 5 sentences.`,
          `Mishap: "${mishap}"`, 1.4, 250
        );
        reply(`🙏 *AI APOLOGY* (flavor only, clearly not real)\n\nFor: *${mishap}*\n\n"${ans}"\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`apology gen failed — ${e.message}`)); }
    }
  },

  {
    command: 'aicomeback',
    aliases: ['comeback', 'roastback'],
    category: 'darkintelligence',
    description: 'AI generates a witty comeback for an insult. Usage: aicomeback <the insult you received>',
    execute: async ({ args, reply }) => {
      const insult = args.join(' ');
      if (!insult) return reply(h.demonError('.aicomeback', '.aicomeback <what they said to you>'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Generate 3 increasingly savage comeback lines for the given insult. Number them 1-3. Make them witty, cutting, and undeniably Crittix-flavored. No slurs, just sharp wit.`,
          `The insult: "${insult}"`, 1.5, 300
        );
        reply(`⚔️ *AI COMEBACK*\n\nThey said: "${insult}"\n\nFire back with:\n${ans}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`comeback gen failed — ${e.message}`)); }
    }
  },

];
