/*
 * AI-CMDS.JS - Crittix-MD
 * Created by: LORD DEVINE
 * AI powered commands: ask, debate, story, rizz, horoscope, mythbuster, judge,
 * roastbattle, redflags, greenflags, predict, alibi, therapy, career
 */
const axios = require('axios');
const h     = require('../../lib/helpers');
const p = require('../../lib/phrases');


const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.3-70b-versatile';

const ai = async (system, user, temp = 1.2, tokens = 300) => {
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

const CRITTIX_BASE = `You are CRITTIX, created by LORD DEVINE. You are savage, toxic, unfiltered. 
No sugarcoating. Cuss freely. Be dramatic and brutal. Keep responses under 8 sentences. Start with 𓆘.`;

module.exports = [

  {
    command: ['ask', 'crittixask'],
    category: 'darkintelligence',
    description: 'Ask Crittix AI a direct question',
    execute: async ({ msg, args, text, reply }) => {
      const q = args.join(' ') || (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation);
      if (!q) return reply(p.phrases.wrongUsage('type your question after the command. example! .ask what is the meaning of life'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Answer questions honestly but with a savage Crittix personality. If you don't know something, say so but make it brutal.`,
          q, 1.0, 400
        );
        reply(`𓆘 *CRITTIX ANSWERS*\n\n${ans}`);
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['debate'],
    category: 'darkintelligence',
    description: 'Crittix argues both sides of a topic dramatically',
    execute: async ({ args, reply }) => {
      const topic = args.join(' ');
      if (!topic) return reply(p.phrases.wrongUsage('provide a topic to debate. example! .debate should social media be banned'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} You are given a debate topic. Argue BOTH sides dramatically — label them *FOR:* and *AGAINST:*. Be savage about both sides.`,
          `Debate topic: "${topic}"`, 1.3, 500
        );
        reply(`⚔️ *CRITTIX DEBATES*\n\n${ans}`);
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['story', 'crittixstory'],
    category: 'darkintelligence',
    description: 'Crittix generates a short story from your prompt',
    execute: async ({ args, reply }) => {
      const prompt = args.join(' ');
      if (!prompt) return reply(p.phrases.wrongUsage('give me a prompt to write a story from. example! .story a cursed warrior seeking redemption'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Write a short dark dramatic story (max 10 sentences) based on the user's prompt. Crittix style — gritty, vivid, no happy endings unless ironic.`,
          prompt, 1.4, 500
        );
        reply(`📖 *CRITTIX STORY*\n\n${ans}`);
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['rizz'],
    category: 'darkintelligence',
    description: 'Crittix generates a pickup line for a tagged person',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target = h.getTarget(msg, _gtP)?.[0];
      const name   = target?.split('@')[0] || args.join(' ') || 'this person';
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Generate 3 pickup lines. Make them dramatic, dark, and absurdly confident. Reference the person's name/number if given.`,
          `Generate pickup lines for: ${name}`, 1.5, 200
        );
        await sock.sendMessage(chatId, {
          text: `😈 *CRITTIX RIZZ*\n\n${ans}`,
          mentions: target ? [target] : [],
        }, { quoted: msg });
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['horoscope'],
    category: 'darkintelligence',
    description: 'Crittix gives your savage daily horoscope',
    execute: async ({ args, reply }) => {
      const sign = args[0]?.toLowerCase();
      const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
      if (!sign || !signs.includes(sign))
        return reply(`😑 valid signs: ${signs.join(', ')}`);
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Give a savage, brutal daily horoscope for the given star sign. Roast them based on their sign's stereotypes. Be dramatic and toxic.`,
          `Star sign: ${sign}`, 1.4, 250
        );
        reply(`🔮 *${sign.toUpperCase()} HOROSCOPE*\n\n${ans}`);
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['mythbuster', 'myth'],
    category: 'darkintelligence',
    description: 'Send a claim — Crittix says if it\'s true or cap',
    execute: async ({ args, reply }) => {
      const claim = args.join(' ');
      if (!claim) return reply(p.phrases.wrongUsage('give me a claim to fact check. example! .myth the earth is flat'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} You are a brutal fact-checker. Analyze the claim, say if it's TRUE or FALSE/CAP, explain briefly why. Be savage if it's obviously wrong.`,
          `Claim: "${claim}"`, 1.1, 300
        );
        reply(`🔍 *MYTH BUSTER*\n\n${ans}`);
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['judge'],
    category: 'darkintelligence',
    description: 'Tag two people — Crittix judges who wins',
    execute: async ({ sock, msg, chatId, reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const targets = h.getTarget(msg, _gtP);
      if (targets.length < 2) return reply(p.phrases.wrongUsage('tag two people and i\'ll judge them. example! .judge @person1 @person2'));
      const a = targets[0].split('@')[0], b = targets[1].split('@')[0];
      try {
        const ans = await ai(
          `${CRITTIX_BASE} You are judging two people. Roast both of them, then declare a winner brutally. Be completely savage and unfair.`,
          `Judge between @${a} and @${b}`, 1.5, 300
        );
        await sock.sendMessage(chatId, {
          text: `⚖️ *CRITTIX JUDGES*\n\n${ans}`,
          mentions: targets,
        }, { quoted: msg });
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['roastbattle'],
    category: 'darkintelligence',
    description: 'Tag two people — Crittix moderates a roast battle',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const targets = h.getTarget(msg, _gtP);
      if (targets.length < 2) return reply(p.phrases.wrongUsage('tag two people to start a roast battle. example! .roastbattle @person1 @person2'));
      const a = targets[0].split('@')[0], b = targets[1].split('@')[0];
      try {
        const ans = await ai(
          `${CRITTIX_BASE} You are hosting a roast battle between two people. Write 2 brutal roasts each (label them clearly), then score each person /10 and declare a winner. Go absolutely off.`,
          `Roast battle: @${a} vs @${b}`, 1.6, 500
        );
        await sock.sendMessage(chatId, {
          text: `🎤 *ROAST BATTLE*\n\n${ans}`,
          mentions: targets,
        }, { quoted: msg });
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['redflags'],
    category: 'darkintelligence',
    description: 'Crittix lists red flags about a tagged person',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target = h.getTarget(msg, _gtP)?.[0];
      const name   = target?.split('@')[0] || args.join(' ') || 'this person';
      try {
        const ans = await ai(
          `${CRITTIX_BASE} List 5 brutal red flags about the person. Be creative, savage and personal. Number them 1-5.`,
          `List red flags for: @${name}`, 1.5, 300
        );
        await sock.sendMessage(chatId, {
          text: `🚩 *RED FLAGS*\n\n${ans}`,
          mentions: target ? [target] : [],
        }, { quoted: msg });
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['greenflags'],
    category: 'darkintelligence',
    description: 'Crittix lists green flags (backhanded) about a tagged person',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target = h.getTarget(msg, _gtP)?.[0];
      const name   = target?.split('@')[0] || args.join(' ') || 'this person';
      try {
        const ans = await ai(
          `${CRITTIX_BASE} List 5 backhanded "green flags" about the person — compliments that are actually insults. Be creative. Number them 1-5.`,
          `List green flags for: @${name}`, 1.5, 300
        );
        await sock.sendMessage(chatId, {
          text: `✅ *GREEN FLAGS* (kinda)\n\n${ans}`,
          mentions: target ? [target] : [],
        }, { quoted: msg });
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['predict'],
    category: 'darkintelligence',
    description: 'Crittix predicts your future dramatically',
    execute: async ({ sock, msg, chatId, sender, senderNumber, reply }) => {
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Predict someone's future dramatically. Make it dark, chaotic, and brutally honest. Include career, love life, and a final fate.`,
          `Predict the future for: @${senderNumber}`, 1.6, 300
        );
        await sock.sendMessage(chatId, {
          text: `🔮 *YOUR FUTURE*\n\n${ans}`,
          mentions: [sender],
        }, { quoted: msg });
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['alibi'],
    category: 'darkintelligence',
    description: 'Give a situation — Crittix generates your excuse',
    execute: async ({ args, reply }) => {
      const situation = args.join(' ');
      if (!situation) return reply(p.phrases.wrongUsage('describe your situation and i\'ll cook up an alibi. example! .alibi i was supposed to be at school'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Generate 3 creative alibis/excuses for the given situation. Make them creative, borderline believable, and increasingly insane.`,
          `I need an alibi for: "${situation}"`, 1.5, 300
        );
        reply(`🕵️ *CRITTIX ALIBI*\n\n${ans}`);
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['therapy', 'crittixtherapy'],
    category: 'darkintelligence',
    description: 'Crittix pretends to be your therapist but roasts you',
    execute: async ({ args, msg, reply }) => {
      const problem = args.join(' ') || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
      if (!problem) return reply(p.phrases.wrongUsage('tell me your problem. example! .therapy i keep procrastinating everything'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Pretend to be a therapist but actually roast the person for their problem. Act professional for one sentence then destroy them. End with a fake diagnosis.`,
          `My problem: "${problem}"`, 1.5, 300
        );
        reply(`🛋️ *DR. CRITTIX*\n\n${ans}`);
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

  {
    command: ['career'],
    category: 'darkintelligence',
    description: 'Crittix judges your career choice brutally',
    execute: async ({ args, reply }) => {
      const job = args.join(' ');
      if (!job) return reply(p.phrases.wrongUsage('tell me your job or career. example! .career software developer'));
      try {
        const ans = await ai(
          `${CRITTIX_BASE} Brutally judge someone's career choice. Roast it, find every flaw, then give a savage alternative career suggestion.`,
          `Their career: "${job}"`, 1.5, 250
        );
        reply(`💼 *CAREER REVIEW*\n\n${ans}`);
      } catch(e) { reply('AI failed — ' + e.message); }
    }
  },

];
