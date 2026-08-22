const axios = require('axios');
const { getConfig } = require('../../lib/config');
const p = require('../../lib/phrases');


const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function groqChat(prompt, system = null, temperature = 0.7) {
  const cfg = getConfig();
  const apiKey = cfg.GROQ_API_KEY || process.env.GROQ_API_KEY || '';
  if (!apiKey) throw new Error('GROQ_API_KEY not set in config.json');

  const messages = system
    ? [{ role: 'system', content: system }, { role: 'user', content: prompt }]
    : [{ role: 'user', content: prompt }];

  const res = await axios.post(GROQ_BASE, {
    model: GROQ_MODEL,
    messages,
    temperature,
    max_tokens: 1024
  }, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 20000
  });

  return res.data?.choices?.[0]?.message?.content?.trim() || '';
}

async function pollinationsAI(prompt, system = null, model = null) {
  const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
  const res = await axios.get(url, {
    timeout: 20000,
    params: {
      ...(system ? { system } : {}),
      ...(model ? { model } : {})
    }
  });
  const out = String(res.data || '').trim();
  if (!out) throw new Error('Empty pollinations response');
  return out;
}

// GPT (pollinations' OpenAI-compatible "openai" model) as its own provider
async function gptAI(prompt, system = null) {
  return pollinationsAI(prompt, system, 'openai');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Retry a provider call a couple of times with backoff before giving up on it —
// most "AI fails sometimes" reports are transient timeouts, not hard failures.
async function withRetry(fn, attempts = 2) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await sleep(600 * (i + 1));
    }
  }
  throw lastErr;
}

// Try Groq -> GPT (pollinations openai) -> plain pollinations, each with a retry,
// before finally giving up. This is what backs .metaai / .gemini / .qwen etc.
async function askAI(prompt, system = null) {
  const providers = [
    () => groqChat(prompt, system),
    () => gptAI(prompt, system),
    () => pollinationsAI(prompt, system)
  ];
  let lastErr;
  for (const provider of providers) {
    try {
      const result = await withRetry(provider, 2);
      if (result) return result;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('All AI providers failed');
}

module.exports = [
  {
    command: 'metaai',
    aliases: ['meta', 'metabot'],
    category: 'darkintelligence',
    description: 'Chat with AI (Groq/Llama). Usage: metaai your question',
    execute: async ({ text, chatId, sock, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type your question after the command. example! .metaai what is quantum physics'));
      try {
        const answer = await askAI(text, 'You are a helpful, friendly AI assistant named Crittix. Answer concisely and accurately.');
        if (!answer) return reply('⚠️ *No response from AI*');
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
          await sock.sendMessage(chatId, { text: (i === 0 ? '🤖 *Crittix AI*\n\n' : '') + chunks[i] });
        }
      } catch (e) {
        reply('⚠️ *AI unavailable* • ' + e.message);
      }
    }
  },
  {
    command: 'gpt',
    aliases: ['chatgpt', 'gpt4'],
    category: 'darkintelligence',
    description: 'Chat with GPT. Usage: gpt your question',
    execute: async ({ text, chatId, sock, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type your question after the command. example! .gpt explain neural networks'));
      try {
        const system = 'You are a helpful, friendly AI assistant named Crittix. Answer concisely and accurately.';
        let answer;
        try {
          answer = await withRetry(() => gptAI(text, system), 2);
        } catch {
          answer = await askAI(text, system); // falls back through groq/pollinations too
        }
        if (!answer) return reply('⚠️ *No response from GPT*');
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
          await sock.sendMessage(chatId, { text: (i === 0 ? '🤖 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 GPT*\n\n' : '') + chunks[i] });
        }
      } catch (e) {
        reply('⚠️ *GPT unavailable* • ' + e.message);
      }
    }
  },
  {
    command: 'gemini',
    aliases: ['geminibot', 'geminiask'],
    category: 'darkintelligence',
    description: 'Chat with AI. Usage: gemini your question',
    execute: async ({ text, chatId, sock, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type your question after the command. example! .gemini what is the speed of light'));
      try {
        const answer = await askAI(text);
        if (!answer) return reply('⚠️ *No response*');
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
          await sock.sendMessage(chatId, { text: (i === 0 ? '♊ *Crittix AI*\n\n' : '') + chunks[i] });
        }
      } catch (e) {
        reply('⚠️ *AI unavailable* • ' + e.message);
      }
    }
  },
  {
    command: 'codeai',
    aliases: ['aicode', 'codegen', 'codebot'],
    category: 'darkintelligence',
    description: 'Generate code with AI. Usage: codeai write a Python web scraper',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('describe the code you want written. example! .codeai write a python function to sort a list'));
      try {
        const result = await askAI(text, 'You are an expert coding assistant. Provide clean, well-commented, working code only. Be concise.');
        reply(`👨‍💻 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 Code AI*\n\n${result}`);
      } catch (e) {
        reply('⚠️ *Code AI unavailable* • ' + e.message);
      }
    }
  },
  {
    command: 'triviaai',
    aliases: ['aitrivia', 'smartquiz'],
    category: 'darkintelligence',
    description: 'Get an AI-generated trivia question with answers',
    execute: async ({ reply }) => {
      try {
        const result = await askAI(
          'Give me a random trivia question with 4 options A-D. Format:\nQuestion: ...\n\nA) ...\nB) ...\nC) ...\nD) ...\n\n✅ Answer: ...'
        );
        reply(`🎲 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 Trivia AI*\n\n${result}`);
      } catch (e) {
        reply('⚠️ *Trivia machine unavailable* • ' + e.message);
      }
    }
  },
  {
    command: 'storyai',
    aliases: ['aistory', 'makestory'],
    category: 'darkintelligence',
    description: 'Generate a short AI story. Usage: storyai a dog who became a king',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('give me a story prompt. example! .storyai a brave dog in space'));
      try {
        const result = await askAI(`Write a short, engaging story (max 400 words) about: ${text}`);
        reply(`📖 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 Story AI*\n\n${result}`);
      } catch (e) {
        reply('❌ *Story generator unavailable* • ' + e.message);
      }
    }
  },
  {
    command: 'photoai',
    aliases: ['aiart', 'aiimage'],
    category: 'darkintelligence',
    description: 'Generate an AI image. Usage: photoai a cat wearing sunglasses',
    execute: async ({ sock, msg, text, chatId, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('describe what you want generated. example! .photoai a dragon flying over a city at sunset'));
      try {
        await reply('🎨 *Generating image...*');
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 99999)}`;
        await sock.sendMessage(chatId, {
          image: { url },
          caption: `🎨 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 AI Art*\n\n📝 ${text}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch {
        reply('❌ *AI art generation failed* • Try again later');
      }
    }
  },
  {
    command: 'qwen',
    aliases: ['qwenai', 'qwenbot'],
    category: 'darkintelligence',
    description: 'Chat with AI. Usage: qwen your question',
    execute: async ({ text, chatId, sock, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type your question after the command. example! .qwen how do vaccines work'));
      try {
        const answer = await askAI(text);
        if (!answer) return reply('⚠️ *No response*');
        const chunks = answer.match(/[\s\S]{1,3000}/g) || [answer];
        for (let i = 0; i < chunks.length; i++) {
          await sock.sendMessage(chatId, { text: (i === 0 ? '🤖 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 AI*\n\n' : '') + chunks[i] });
        }
      } catch (e) {
        reply('⚠️ *AI unavailable* • ' + e.message);
      }
    }
  }
];
