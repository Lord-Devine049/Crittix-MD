/*
 * AI-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * NEW AI Commands: aiwriter, aiessay, aisong, aidebug, aichatbot, aitutor,
 * aicoach, airesume, aicoverletter, aiinterview, aiquiz, aiflashcard,
 * aimindmap, aibrainstorm, ainamegen, aicaption2, aijoke, aiquote, aifact
 */
const axios = require('axios');
const h = require('../../lib/helpers');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const CRITTIX_BASE = `You are CRITTIX, created by LORD DIVINE. You are savage, toxic, unfiltered. 
No sugarcoating. Cuss freely. Be dramatic and brutal. Keep responses under 8 sentences. Start with 𓆘.`;

const groq = async (system, user, temp = 1.1, tokens = 400) => {
  const res = await axios.post(GROQ_URL, {
    model: MODEL,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    temperature: temp,
    max_tokens: tokens,
  }, { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 25000 });
  return res.data.choices[0].message.content.trim();
};

const gpt = async (prompt, system = 'You are a helpful assistant.') => {
  const res = await axios.post('https://chateverywhere.app/api/chat/', {
    model: { id: 'gpt-4', name: 'GPT-4' },
    messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    temperature: 0.8
  }, { timeout: 25000 });
  return String(res.data || '').trim();
};

const ai = async (prompt, system, temp = 1.0, tokens = 500) => {
  try {
    if (GROQ_API_KEY) return await groq(system, prompt, temp, tokens);
    return await gpt(prompt, system);
  } catch {
    return await gpt(prompt, system);
  }
};

module.exports = [

  {
    command: 'aiwriter',
    aliases: ['write', 'generatetext'],
    category: 'darkintelligence',
    description: 'AI generates a short piece of writing. Usage: aiwriter The history of robots',
    execute: async ({ args, text, reply }) => {
      const topic = text || args.join(' ');
      if (!topic) return reply(h.demonError('.aiwriter', '.aiwriter <topic or prompt>'));
      await reply(`𓆘 generating your piece — give me a sec...`);
      try {
        const result = await ai(topic, `You are a skilled writer. Write an engaging, well-structured short piece (200-300 words) on the given topic. Be clear, vivid, and captivating.`, 0.9, 500);
        reply(`✍️ *AI WRITER*\n\n📝 Topic: *${topic}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`AI writer down — ${e.message}`)); }
    }
  },

  {
    command: 'aiessay',
    aliases: ['essay', 'generateessay'],
    category: 'darkintelligence',
    description: 'AI generates an essay outline + intro. Usage: aiessay Climate change solutions',
    execute: async ({ args, text, reply }) => {
      const topic = text || args.join(' ');
      if (!topic) return reply(h.demonError('.aiessay', '.aiessay <essay topic>'));
      await reply('𓆘 crafting your essay...');
      try {
        const result = await ai(topic, `You are an academic writer. Create a structured essay for the topic. Include: Title, Thesis Statement, Outline (5 points), and a full Introduction paragraph (100 words). Format clearly.`, 0.8, 600);
        reply(`📝 *AI ESSAY*\n\n🎓 Topic: *${topic}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`essay AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aisong',
    aliases: [],
    category: 'darkintelligence',
    description: 'AI generates original song lyrics. Usage: aisong heartbreak rap',
    execute: async ({ args, text, reply }) => {
      const theme = text || args.join(' ');
      if (!theme) return reply(h.demonError('.aisong', '.aisong <theme or genre>'));
      await reply('🎵 writing your track...');
      try {
        const result = await ai(theme, `You are an original songwriter. Write ORIGINAL song lyrics (never reproduce copyrighted material) for the given theme/genre. Include: Title, Verse 1, Chorus, Verse 2, Bridge. Make it emotional and catchy.`, 1.2, 500);
        reply(`🎵 *AI SONG*\n\n🎤 Theme: *${theme}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`songwriting AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aidebug',
    aliases: ['debugai', 'codefix'],
    category: 'darkintelligence',
    description: 'AI explains bugs in your code. Usage: aidebug <paste code>',
    execute: async ({ text, args, reply }) => {
      const code = text || args.join(' ');
      if (!code) return reply(h.demonError('.aidebug', '.aidebug <paste your code here>'));
      await reply('🔍 analyzing your code...');
      try {
        const result = await ai(code, `You are an expert programmer and debugger. Analyze the given code for bugs, errors, and issues. Explain: 1) What the bug is, 2) Why it happens, 3) How to fix it with corrected code. Be precise.`, 0.7, 600);
        reply(`🔍 *AI DEBUG*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`debug AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aichatbot',
    aliases: ['aichat', 'crittixchat'],
    category: 'darkintelligence',
    description: 'Freeform AI chat with Crittix personality. Usage: aichatbot Tell me something wild',
    execute: async ({ args, text, reply }) => {
      const q = text || args.join(' ');
      if (!q) return reply(h.demonError('.aichatbot', '.aichatbot <say anything>'));
      try {
        const result = await ai(q, `${CRITTIX_BASE} You are in a freeform chat. Respond to anything the user says. Be savage, roast them subtly, but actually answer/respond to what they said.`, 1.2, 350);
        reply(`𓆘 *CRITTIX CHAT*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`AI chat down — ${e.message}`)); }
    }
  },

  {
    command: 'aitutor',
    aliases: ['tutor', 'studyai'],
    category: 'darkintelligence',
    description: 'AI explains a concept step by step. Usage: aitutor How does photosynthesis work',
    execute: async ({ args, text, reply }) => {
      const topic = text || args.join(' ');
      if (!topic) return reply(h.demonError('.aitutor', '.aitutor <concept to learn>'));
      await reply('📚 preparing your lesson...');
      try {
        const result = await ai(topic, `You are a brilliant, patient tutor. Explain the given concept step by step, as if teaching a 16-year-old. Use numbered steps, simple language, and a real-world example at the end.`, 0.8, 600);
        reply(`📚 *AI TUTOR*\n\n🎓 Topic: *${topic}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`tutor AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aicoach',
    aliases: ['coach'],
    category: 'darkintelligence',
    description: 'AI gives roast-flavored coaching. Usage: aicoach I want to start a business',
    execute: async ({ args, text, reply }) => {
      const goal = text || args.join(' ');
      if (!goal) return reply(h.demonError('.aicoach', '.aicoach <your goal or situation>'));
      try {
        const result = await ai(goal, `${CRITTIX_BASE} You are a savage but effective life coach. The user gave you their goal. Roast them for waiting this long, but then give them 3 real, actionable steps to achieve it. Brutal honesty + genuine help.`, 1.2, 400);
        reply(`🔥 *CRITTIX COACH*\n\n💪 Goal: *${goal}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`coaching AI down — ${e.message}`)); }
    }
  },

  {
    command: 'airesume',
    aliases: ['resume', 'cvgen'],
    category: 'darkintelligence',
    description: 'AI generates a resume draft. Usage: airesume Software Engineer, 3 years React, graduated 2021',
    execute: async ({ text, args, reply }) => {
      const details = text || args.join(' ');
      if (!details) return reply(h.demonError('.airesume', '.airesume <job title, skills, experience, education>'));
      await reply('📄 building your resume...');
      try {
        const result = await ai(details, `You are a professional resume writer. Create a clean, professional resume draft based on the details provided. Include: Professional Summary, Skills (bullet points), Experience section, Education section. Format clearly.`, 0.7, 700);
        reply(`📄 *AI RESUME*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`resume AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aicoverletter',
    aliases: ['coverletter', 'coverlettergen'],
    category: 'darkintelligence',
    description: 'AI generates a cover letter. Usage: aicoverletter Marketing Manager at Google | 5 years marketing experience',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(h.demonError('.aicoverletter', '.aicoverletter <job role at company> | <your key experience>'));
      await reply('✍️ writing your cover letter...');
      try {
        const result = await ai(input, `You are a professional cover letter writer. Write a compelling cover letter for the given job and experience. Include: Opening hook, Why you're perfect for this role, Key achievements/experience, Closing call to action. Keep it under 250 words. Professional and confident.`, 0.7, 600);
        reply(`✉️ *AI COVER LETTER*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`cover letter AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aiinterview',
    aliases: ['interviewprep', 'interviewqs'],
    category: 'darkintelligence',
    description: 'AI generates interview questions for a job. Usage: aiinterview Software Engineer',
    execute: async ({ text, args, reply }) => {
      const role = text || args.join(' ');
      if (!role) return reply(h.demonError('.aiinterview', '.aiinterview <job role>'));
      await reply('💼 generating your interview questions...');
      try {
        const result = await ai(role, `You are an expert interviewer. Generate 10 likely interview questions for the given job role. Include a mix of: behavioral (2), technical (4), situational (2), and culture-fit questions (2). Number them 1-10.`, 0.8, 500);
        reply(`💼 *AI INTERVIEW PREP*\n\n🎯 Role: *${role}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`interview AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aiquiz',
    aliases: ['quiz2', 'genquiz'],
    category: 'darkintelligence',
    description: 'AI generates a short quiz. Usage: aiquiz World War II',
    execute: async ({ text, args, reply }) => {
      const topic = text || args.join(' ');
      if (!topic) return reply(h.demonError('.aiquiz', '.aiquiz <topic>'));
      await reply('🎯 generating your quiz...');
      try {
        const result = await ai(topic, `You are a quiz master. Create a 5-question multiple choice quiz about the given topic. Format each question as:\nQ1: [question]\nA) ... B) ... C) ... D) ...\nAnswer: [letter]\n\nMake the questions genuinely challenging.`, 0.8, 600);
        reply(`🎯 *AI QUIZ: ${topic.toUpperCase()}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`quiz AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aiflashcard',
    aliases: ['flashcards', 'studycards'],
    category: 'darkintelligence',
    description: 'AI generates flashcard Q&A pairs. Usage: aiflashcard Photosynthesis',
    execute: async ({ text, args, reply }) => {
      const topic = text || args.join(' ');
      if (!topic) return reply(h.demonError('.aiflashcard', '.aiflashcard <study topic>'));
      await reply('🃏 generating flashcards...');
      try {
        const result = await ai(topic, `You are a study assistant. Create 5 flashcard Q&A pairs for the given topic. Format each as:\n🃏 Q: [question]\n💡 A: [answer]\n\nKeep answers concise but complete.`, 0.8, 500);
        reply(`🃏 *AI FLASHCARDS: ${topic.toUpperCase()}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`flashcard AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aimindmap',
    aliases: ['mindmap', 'conceptmap'],
    category: 'darkintelligence',
    description: 'AI generates a text mind map. Usage: aimindmap Machine Learning',
    execute: async ({ text, args, reply }) => {
      const topic = text || args.join(' ');
      if (!topic) return reply(h.demonError('.aimindmap', '.aimindmap <central topic>'));
      await reply('🗺️ building your mind map...');
      try {
        const result = await ai(topic, `You are a knowledge organizer. Create a text-based mind map for the given topic. Use this format:\n🎯 CENTRAL: [topic]\n📌 BRANCH 1: [main concept]\n  └ [sub-point 1]\n  └ [sub-point 2]\n📌 BRANCH 2: ...\nCreate 5 branches with 2-3 sub-points each.`, 0.8, 600);
        reply(`🗺️ *AI MIND MAP: ${topic.toUpperCase()}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`mind map AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aibrainstorm',
    aliases: ['brainstorm', 'ideas'],
    category: 'darkintelligence',
    description: 'AI brainstorms ideas for a problem/prompt. Usage: aibrainstorm app ideas for students',
    execute: async ({ text, args, reply }) => {
      const prompt = text || args.join(' ');
      if (!prompt) return reply(h.demonError('.aibrainstorm', '.aibrainstorm <your problem or prompt>'));
      await reply('💡 brainstorming...');
      try {
        const result = await ai(prompt, `You are a creative ideation expert. Generate 10 creative, diverse, and actionable ideas for the given problem/prompt. Number them 1-10. Think outside the box — include unconventional and conventional ideas both.`, 1.1, 500);
        reply(`💡 *AI BRAINSTORM*\n\n🎯 Prompt: *${prompt}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`brainstorm AI down — ${e.message}`)); }
    }
  },

  {
    command: 'ainamegen',
    aliases: ['namegen', 'nameideas'],
    category: 'darkintelligence',
    description: 'AI generates name suggestions. Usage: ainamegen dark tech startup | ainamegen cute pet hamster',
    execute: async ({ text, args, reply }) => {
      const prompt = text || args.join(' ');
      if (!prompt) return reply(h.demonError('.ainamegen', '.ainamegen <theme/type> — e.g. ainamegen dark fantasy RPG game'));
      await reply('🔤 generating names...');
      try {
        const result = await ai(prompt, `You are a professional naming expert. Generate 10 unique, memorable name suggestions for the given theme/type. For each name, add a one-line explanation of why it works. Format as: 1. Name — reason`, 1.1, 500);
        reply(`🔤 *AI NAME GENERATOR*\n\n🎯 Theme: *${prompt}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`name gen AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aijoke',
    aliases: ['joke2', 'genjoke'],
    category: 'darkintelligence',
    description: 'AI generates a joke on a topic. Usage: aijoke programmers',
    execute: async ({ text, args, reply }) => {
      const topic = text || args.join(' ') || 'anything';
      try {
        const result = await ai(topic, `${CRITTIX_BASE} You are a comedian. Generate a single genuinely funny joke about the given topic. Make it original and actually humorous — not just edgy. Include setup and punchline.`, 1.3, 200);
        reply(`😂 *AI JOKE*\n\n🎯 Topic: *${topic}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`joke AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aiquote',
    aliases: ['quote2', 'genquote'],
    category: 'darkintelligence',
    description: 'AI generates an original quote. Usage: aiquote resilience',
    execute: async ({ text, args, reply }) => {
      const theme = text || args.join(' ') || 'wisdom';
      try {
        const result = await ai(theme, `You are a philosopher and quote writer. Generate 3 original, thought-provoking quotes about the given theme. Make them genuinely insightful — not generic platitudes. Each should be 1-2 sentences max.`, 1.2, 250);
        reply(`💭 *AI QUOTES: ${theme.toUpperCase()}*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`quote AI down — ${e.message}`)); }
    }
  },

  {
    command: 'aifact',
    aliases: ['fact2', 'funfact2'],
    category: 'darkintelligence',
    description: 'AI generates a fun fact on a topic. Usage: aifact octopuses',
    execute: async ({ text, args, reply }) => {
      const topic = text || args.join(' ') || 'science';
      try {
        const result = await ai(topic, `You are a curious knowledge enthusiast. Generate 3 genuinely interesting and surprising fun facts about the given topic. Make them fascinating and specific — not obvious. Flag clearly: "⚠️ AI-generated — verify before using in academic work."`, 1.0, 300);
        reply(`🔬 *AI FUN FACTS: ${topic.toUpperCase()}*\n\n${result}\n\n⚠️ _AI-generated facts — always verify important info_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`fact AI down — ${e.message}`)); }
    }
  }

];
