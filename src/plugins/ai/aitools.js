const axios = require('axios');
const p = require('../../lib/phrases');


const CHAT_API = 'https://chateverywhere.app/api/chat/';

async function ask(prompt, system = null) {
  const messages = system
    ? [{ role: 'system', content: system }, { role: 'user', content: prompt }]
    : [{ role: 'user', content: prompt }];
  const res = await axios.post(CHAT_API, {
    model: { id: 'gpt-4', name: 'GPT-4' },
    messages,
    temperature: 0.7
  }, { timeout: 30000 });
  return String(res.data || '').trim();
}

module.exports = [
  {
    command: 'spellcheck',
    aliases: ['spelfix'],
    category: 'darkintelligence',
    description: 'AI spell and grammar checker. Usage: spellcheck your text',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want spell checked. example! .spellcheck i cant beleive it wroked'));
      try {
        const result = await ask(
          `Correct the spelling and grammar of the following text. Show the corrected version and briefly list the changes made:\n\n"${text}"`,
          'You are a precise grammar and spelling corrector. Be concise.'
        );
        reply(`📝 *Spell Check*\n\n${result}`);
      } catch { reply('⚠️ *Spell check unavailable right now*'); }
    }
  },
  {
    command: 'summarize',
    aliases: ['tldr', 'summary'],
    category: 'darkintelligence',
    description: 'AI summarize long text. Usage: summarize your long text',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('paste the text you want summarized. example! .summarize paste your long article here'));
      try {
        const result = await ask(
          `Summarize the following in 3-5 bullet points. Keep it short and clear:\n\n"${text}"`,
          'You are a concise summarizer. Use bullet points.'
        );
        reply(`📄 *Summary*\n\n${result}`);
      } catch { reply('⚠️ *Summary AI unavailable right now*'); }
    }
  },
  {
    command: 'paraphrase',
    aliases: ['rephrase', 'reword'],
    category: 'darkintelligence',
    description: 'AI rephrase text in a different style. Usage: paraphrase your text',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want paraphrased. example! .paraphrase paste your sentence here'));
      try {
        const result = await ask(
          `Rewrite the following text in a fresh, clear, and engaging way. Keep the meaning identical:\n\n"${text}"`,
          'You are a professional editor who rewrites text naturally.'
        );
        reply(`✏️ *Paraphrased*\n\n${result}`);
      } catch { reply('⚠️ *Paraphrase AI down*'); }
    }
  },
  {
    command: 'explain',
    aliases: ['whatis', 'define2'],
    category: 'darkintelligence',
    description: 'AI explain a concept simply. Usage: explain quantum entanglement',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type what you want explained. example! .explain how does a black hole work'));
      try {
        const result = await ask(
          `Explain "${text}" in simple terms as if explaining to a 15-year-old. Keep it under 200 words.`,
          'You are a great teacher who explains complex things simply.'
        );
        reply(`🔍 *Explain: ${text}*\n\n${result}`);
      } catch { reply('⚠️ *Explanation AI unavailable*'); }
    }
  },
  {
    command: 'keywords',
    aliases: ['extractkeywords', 'keyphrase'],
    category: 'darkintelligence',
    description: 'Extract keywords from text. Usage: keywords your paragraph here',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('paste your text to extract keywords. example! .keywords paste your article here'));
      try {
        const result = await ask(
          `Extract the 8-10 most important keywords and key phrases from this text. Return them as a comma-separated list:\n\n"${text}"`,
          'You are a text analysis expert.'
        );
        reply(`🔑 *Keywords:*\n\n${result}`);
      } catch { reply('⚠️ *Keywords AI unavailable*'); }
    }
  },
  {
    command: 'sentiment',
    aliases: ['mood', 'feelingcheck'],
    category: 'darkintelligence',
    description: 'Analyze the sentiment of text. Usage: sentiment I love this!',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text you want sentiment analyzed. example! .sentiment i love this bot so much!'));
      try {
        const result = await ask(
          `Analyze the sentiment of this text and classify it as Positive, Negative, or Neutral. Give a confidence percentage and brief explanation:\n\n"${text}"`,
          'You are a sentiment analysis expert. Be concise and precise.'
        );
        reply(`😊 *Sentiment Analysis*\n\n"${text.slice(0,80)}${text.length>80?'...':''}"\n\n${result}`);
      } catch { reply('⚠️ *Sentiment AI unavailable*'); }
    }
  },
  {
    command: 'titlegen',
    aliases: ['generatetitle', 'headlinegen'],
    category: 'darkintelligence',
    description: 'Generate catchy titles for your content. Usage: titlegen article about AI',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('describe the content you need a title for. example! .titlegen blog post about healthy eating habits'));
      try {
        const result = await ask(
          `Generate 5 catchy, engaging titles for content about: "${text}". Make them interesting and clickable.`,
          'You are a creative copywriter specializing in headlines.'
        );
        reply(`✍️ *Title Ideas for "${text}":*\n\n${result}`);
      } catch { reply('⚠️ *Title generator unavailable*'); }
    }
  },
  {
    command: 'captiongen',
    aliases: ['generatecaption', 'capgen'],
    category: 'darkintelligence',
    description: 'Generate social media captions. Usage: captiongen beach sunset selfie',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('describe your photo. example! .captiongen my gym workout photo'));
      try {
        const result = await ask(
          `Write 3 creative social media captions for a post about: "${text}". Include relevant emojis. One casual, one inspirational, one funny.`,
          'You are a social media content creator.'
        );
        reply(`📸 *Caption Ideas:*\n\n${result}`);
      } catch { reply('⚠️ *Caption AI unavailable*'); }
    }
  },
  {
    command: 'hashtaggen',
    aliases: ['hashtags', 'generatehashtags'],
    category: 'darkintelligence',
    description: 'Generate hashtags for social media. Usage: hashtaggen fitness motivation',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('describe your content to generate hashtags. example! .hashtaggen travel photography nigeria'));
      try {
        const result = await ask(
          `Generate 15-20 relevant, trending hashtags for social media content about: "${text}". Mix popular and niche tags.`,
          'You are a social media expert who knows trending hashtags.'
        );
        reply(`#️⃣ *Hashtags for "${text}":*\n\n${result}`);
      } catch { reply('⚠️ *Hashtag AI unavailable*'); }
    }
  },
  {
    command: 'emailgen',
    aliases: ['writeemail', 'draftemail'],
    category: 'darkintelligence',
    description: 'AI write a professional email. Usage: emailgen request meeting with boss',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('describe the email you want written. example! .emailgen request a day off from work'));
      try {
        const result = await ask(
          `Write a professional, polite email for the following purpose: "${text}". Include subject line, greeting, body, and sign-off.`,
          'You are a professional business communication expert.'
        );
        reply(`📧 *Email Draft:*\n\n${result}`);
      } catch { reply('⚠️ *Email writer unavailable*'); }
    }
  },
  {
    command: 'nameai',
    aliases: [ 'generatename'],
    category: 'darkintelligence',
    description: 'AI generate name suggestions. Usage: nameai dark fantasy bot',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('describe what you need names for. example! .nameai cool gaming clan names'));
      try {
        const result = await ask(
          `Generate 8 creative, unique name suggestions for: "${text}". Make them memorable and original.`,
          'You are a creative naming expert.'
        );
        reply(`🏷️ *Name Suggestions for "${text}":*\n\n${result}`);
      } catch { reply('⚠️ *Name AI unavailable*'); }
    }
  },
  {
    command: 'debateai',
    aliases: [ 'argueboth'],
    category: 'darkintelligence',
    description: 'AI argues both sides of a topic. Usage: debateai social media is harmful',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('provide the debate topic. example! .debateai should school be year round'));
      try {
        const result = await ask(
          `Present both sides of the following debate topic in 2-3 points each:\n\nTopic: "${text}"\n\nFormat:\n🟢 FOR:\n...\n\n🔴 AGAINST:\n...`,
          'You are an impartial debate coach who presents balanced arguments.'
        );
        reply(`⚖️ *Debate: "${text}"*\n\n${result}`);
      } catch { reply('⚠️ *Debate AI unavailable*'); }
    }
  },
  {
    command: 'characterai',
    aliases: ['roleplay', 'actlike'],
    category: 'darkintelligence',
    description: 'AI roleplay as a character. Usage: characterai Sherlock Holmes',
    execute: async ({ args, text, reply }) => {
      const character = args[0] ? args.join(' ') : null;
      if (!character) return reply(p.phrases.wrongUsage('provide the character name. example! .characterai yoda. then ask them anything.'));
      try {
        const result = await ask(
          `Respond as ${character} would respond to someone asking "Tell me something wise about life." Stay fully in character.`,
          `You are ${character}. Fully embody this character's speech patterns, personality, and mannerisms.`
        );
        reply(`🎭 *${character} says:*\n\n${result}`);
      } catch { reply('⚠️ *Character AI unavailable*'); }
    }
  },
  {
    command: 'recipegen',
    aliases: ['cookfor', 'whattocook'],
    category: 'darkintelligence',
    description: 'AI generate a recipe from ingredients. Usage: recipegen chicken tomato garlic',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('list the ingredients you have. example! .recipegen eggs cheese onion'));
      try {
        const result = await ask(
          `Create a simple recipe using these ingredients: ${text}. Include: dish name, prep time, ingredients with amounts, and step-by-step instructions.`,
          'You are a creative chef who makes simple, delicious recipes.'
        );
        reply(`🍳 *Recipe:*\n\n${result}`);
      } catch { reply('⚠️ *Recipe AI unavailable*'); }
    }
  },
];
