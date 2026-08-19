/*
 * CAPTCHA.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: captcha, captchatype, captchatimeout, captchastats
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (f) => path.join(process.cwd(), 'database', f);
const loadDB = (f) => { try { return fs.existsSync(DB(f)) ? JSON.parse(fs.readFileSync(DB(f),'utf8')) : {}; } catch { return {}; } };
const saveDB = (f, d) => { try { fs.ensureDirSync(path.dirname(DB(f))); fs.writeFileSync(DB(f), JSON.stringify(d,null,2)); } catch {} };

const pendingCaptchas = new Map(); // jid → { answer, groupId, timeoutHandle, type }

const genMathQ = () => {
  const ops = ['+','×','-'];
  const op = ops[Math.floor(Math.random()*ops.length)];
  let a = Math.floor(Math.random()*12)+1, b = Math.floor(Math.random()*12)+1;
  let answer, q;
  if (op === '+')  { answer = a + b; q = `${a} + ${b}`; }
  else if (op === '×') { answer = a * b; q = `${a} × ${b}`; }
  else              { if (a < b) [a,b] = [b,a]; answer = a - b; q = `${a} - ${b}`; }
  return { question: `What is *${q}*?`, answer: String(answer) };
};

const genEmojiQ = () => {
  const sets = [
    { q: 'Which emoji is a fruit? 🚗 🍎 🎸', answer: '🍎' },
    { q: 'Which emoji is an animal? 🌍 🐶 🎯', answer: '🐶' },
    { q: 'Which emoji is a vehicle? 🏠 🍕 🚀', answer: '🚀' },
    { q: 'Which emoji is weather? ⚽ ☀️ 🎭', answer: '☀️' },
    { q: 'Which emoji is food? 📱 🍔 🎸', answer: '🍔' },
  ];
  return sets[Math.floor(Math.random()*sets.length)];
};

const genTextQ = () => {
  const words = ['CRITTIX','NIGERIA','DIVINE','SAVAGE','FREEDOM'];
  const word = words[Math.floor(Math.random()*words.length)];
  return { question: `Type the word: *${word}* to enter`, answer: word };
};

const generateCaptcha = (type) => {
  if (type === 'emoji') return genEmojiQ();
  if (type === 'text') return genTextQ();
  return genMathQ();
};

// Export for use in message handler to validate captcha responses
const handleCaptchaResponse = async (sock, msg, chatId, sender) => {
  const pending = pendingCaptchas.get(sender);
  if (!pending || pending.groupId !== chatId) return false;
  const bodyText = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
  const db = loadDB('captcha.json');
  if (!db[chatId]) return false;
  const stats = db[chatId].stats || { passed: 0, failed: 0 };
  if (bodyText.toLowerCase() === pending.answer.toLowerCase()) {
    clearTimeout(pending.timeoutHandle);
    pendingCaptchas.delete(sender);
    stats.passed = (stats.passed || 0) + 1;
    db[chatId].stats = stats;
    saveDB('captcha.json', db);
    await sock.sendMessage(chatId, { text: `✅ @${sender.split('@')[0]} passed captcha. Welcome to the group.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`, mentions: [sender] });
    return true;
  }
  return false;
};

const triggerCaptchaForMember = async (sock, groupId, participantJid, db) => {
  if (!db[groupId]?.enabled) return;
  const type = db[groupId]?.type || 'math';
  const timeout = db[groupId]?.timeout || 60;
  const captcha = generateCaptcha(type);
  const num = participantJid.split('@')[0];
  const msg = `🔐 *CAPTCHA VERIFICATION*\n\n@${num}, solve this to join:\n\n*${captcha.question}*\n\nReply in the group with the answer. You have *${timeout} seconds*.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
  await sock.sendMessage(groupId, { text: msg, mentions: [participantJid] });
  const timeoutHandle = setTimeout(async () => {
    if (pendingCaptchas.has(participantJid)) {
      pendingCaptchas.delete(participantJid);
      try {
        await sock.groupParticipantsUpdate(groupId, [participantJid], 'remove');
        const stats = db[groupId]?.stats || {};
        stats.failed = (stats.failed || 0) + 1;
        db[groupId].stats = stats;
        saveDB('captcha.json', db);
        await sock.sendMessage(groupId, { text: `⏰ @${num} failed captcha (timeout). Removed.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`, mentions: [participantJid] });
      } catch {}
    }
  }, timeout * 1000);
  pendingCaptchas.set(participantJid, { answer: captcha.answer, groupId, timeoutHandle, type });
};

module.exports = [

  {
    command: 'captcha',
    aliases: ['captchatoggle', 'setcaptcha'],
    category: 'darkprotection',
    description: 'Toggle captcha verification for new members. adminOnly. Usage: .captcha on|off',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const db = loadDB('captcha.json');
      if (!db[chatId]) db[chatId] = { enabled: false, type: 'math', timeout: 60, stats: { passed: 0, failed: 0 } };
      const action = (args[0] || 'status').toLowerCase();
      if (action === 'on') {
        db[chatId].enabled = true;
        saveDB('captcha.json', db);
        return reply(`🔐 *Captcha: ON*\n\nNew members must solve a *${db[chatId].type}* puzzle within *${db[chatId].timeout}s* or get kicked.\n\n.captchatype math|emoji|text\n.captchatimeout <seconds>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'off') {
        db[chatId].enabled = false;
        saveDB('captcha.json', db);
        return reply(`🔐 *Captcha: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(`🔐 Captcha: *${db[chatId]?.enabled ? 'ON 🟢' : 'OFF 🔴'}*\nType: *${db[chatId]?.type || 'math'}*\nTimeout: *${db[chatId]?.timeout || 60}s*\n\n.captcha on | off`);
    }
  },

  {
    command: 'captchatype',
    aliases: ['setcaptchatype'],
    category: 'darkprotection',
    description: 'Set captcha type. adminOnly. Usage: .captchatype math|emoji|text',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const type = (args[0] || '').toLowerCase();
      if (!['math','emoji','text'].includes(type)) return reply(h.demonFail('Valid types: math, emoji, text\nUsage: .captchatype math'));
      const db = loadDB('captcha.json');
      if (!db[chatId]) db[chatId] = { enabled: false, timeout: 60, stats: { passed: 0, failed: 0 } };
      db[chatId].type = type;
      saveDB('captcha.json', db);
      reply(h.demonSuccess(`Captcha type set to *${type}*.\n\nExamples:\n- math: "What is 7 × 8?"\n- emoji: "Which emoji is a fruit?"\n- text: "Type the word: CRITTIX"`));
    }
  },

  {
    command: 'captchatimeout',
    aliases: ['setcaptchatimeout', 'captchatime'],
    category: 'darkprotection',
    description: 'Set captcha timeout in seconds (30-300). adminOnly. Usage: .captchatimeout 60',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const secs = parseInt(args[0]);
      if (isNaN(secs) || secs < 30 || secs > 300) return reply(h.demonFail('Timeout must be between 30 and 300 seconds.'));
      const db = loadDB('captcha.json');
      if (!db[chatId]) db[chatId] = { enabled: false, type: 'math', stats: { passed: 0, failed: 0 } };
      db[chatId].timeout = secs;
      saveDB('captcha.json', db);
      reply(h.demonSuccess(`Captcha timeout set to *${secs} seconds*. Solve fast or get kicked.`));
    }
  },

  {
    command: 'captchastats',
    aliases: ['captchalog', 'captcharesults'],
    category: 'darkprotection',
    description: 'Show captcha pass/fail stats for this group. adminOnly.',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const db = loadDB('captcha.json');
      const stats = db[chatId]?.stats || { passed: 0, failed: 0 };
      const total = (stats.passed || 0) + (stats.failed || 0);
      const rate = total ? ((stats.passed / total) * 100).toFixed(1) : '0.0';
      reply(
        `🔐 *CAPTCHA STATS*\n\n` +
        `✅ Passed: *${stats.passed || 0}*\n` +
        `❌ Failed/Kicked: *${stats.failed || 0}*\n` +
        `📊 Pass Rate: *${rate}%*\n\n` +
        `_${total ? `${total} total verification attempts` : 'No verifications yet'}_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }

];

module.exports.triggerCaptchaForMember = triggerCaptchaForMember;
module.exports.handleCaptchaResponse = handleCaptchaResponse;
module.exports.pendingCaptchas = pendingCaptchas;
