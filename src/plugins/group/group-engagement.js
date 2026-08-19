/*
 * GROUP-ENGAGEMENT.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: gannounce, groupcountdown, groupmilestone, groupdaily, groupstreak,
 *           groupchallenge, grouptrivia, groupword, groupmeme, grouphighlight
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (f) => path.join(process.cwd(), 'database', f);
const loadDB = (f) => { try { return fs.existsSync(DB(f)) ? JSON.parse(fs.readFileSync(DB(f),'utf8')) : {}; } catch { return {}; } };
const saveDB = (f, d) => { try { fs.ensureDirSync(path.dirname(DB(f))); fs.writeFileSync(DB(f), JSON.stringify(d,null,2)); } catch {} };

const TRIVIA_QUESTIONS = [
  { q: 'What element has the symbol Au?', a: ['gold', 'au'] },
  { q: 'How many sides does a hexagon have?', a: ['6', 'six'] },
  { q: 'What is the capital of Japan?', a: ['tokyo'] },
  { q: 'What year did World War 2 end?', a: ['1945'] },
  { q: 'How many planets are in our solar system?', a: ['8', 'eight'] },
  { q: 'What is the largest ocean on Earth?', a: ['pacific'] },
  { q: 'Who painted the Mona Lisa?', a: ['da vinci', 'leonardo da vinci', 'leonardo'] },
  { q: 'What is the fastest land animal?', a: ['cheetah'] },
  { q: 'How many bones are in the adult human body?', a: ['206'] },
  { q: 'What gas do plants absorb from the atmosphere?', a: ['carbon dioxide', 'co2'] },
];

const WORDS_OF_DAY = [
  { word: 'Ephemeral', def: 'Lasting for a very short time.', example: 'The ephemeral beauty of cherry blossoms makes them precious.' },
  { word: 'Serendipity', def: 'Finding something good without looking for it.', example: 'Meeting my best friend was pure serendipity.' },
  { word: 'Sycophant', def: 'A person who acts obsequiously to gain favour.', example: 'The boss was surrounded by sycophants.' },
  { word: 'Tenacious', def: 'Holding firm; not giving up easily.', example: 'Her tenacious spirit carried her through hardship.' },
  { word: 'Verbose', def: 'Using more words than needed; wordy.', example: 'His verbose emails wasted everyone\'s time.' },
  { word: 'Cacophony', def: 'A harsh, discordant mixture of sounds.', example: 'The marketplace was a cacophony of vendors.' },
  { word: 'Insidious', def: 'Proceeding in a subtle way but with harmful effect.', example: 'The insidious spread of misinformation is dangerous.' },
];

const activeTrivias = new Map(); // chatId → { question, answer, expires }

module.exports = [

  {
    command: 'gannounce',
    aliases: ['groupcast', 'groupnotice'],
    category: 'groupanalytics',
    description: 'Send a styled announcement card to the group. adminOnly. Usage: .gannounce <message>',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, text, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const announcement = text || args.join(' ');
      if (!announcement) return reply(h.demonError('.gannounce', '.gannounce <your announcement text>'));
      const meta = await sock.groupMetadata(chatId).catch(() => ({ subject: 'Group' }));
      await sock.sendMessage(chatId, {
        text: `📢 *ANNOUNCEMENT — ${meta.subject || 'Group'}*\n${'─'.repeat(30)}\n\n${announcement}\n\n${'─'.repeat(30)}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  },

  {
    command: 'groupcountdown',
    aliases: ['countdown', 'setevent'],
    category: 'groupanalytics',
    description: 'Set a group countdown to an event. Usage: .groupcountdown <event name> | <YYYY-MM-DD>',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, text, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      if (!text || !text.includes('|')) return reply(h.demonError('.groupcountdown', '.groupcountdown <event> | <YYYY-MM-DD>'));
      const [eventName, dateStr] = text.split('|').map(s => s.trim());
      const target = new Date(dateStr);
      if (isNaN(target.getTime())) return reply(h.demonFail('Invalid date. Use format: YYYY-MM-DD'));
      const now = new Date();
      const diff = target - now;
      if (diff < 0) return reply(h.demonFail('That date is in the past. Time travel not supported.'));
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const db = loadDB('groupcountdowns.json');
      db[chatId] = { event: eventName, target: target.toISOString(), createdAt: now.toISOString() };
      saveDB('groupcountdowns.json', db);
      await sock.sendMessage(chatId, {
        text: `⏳ *COUNTDOWN SET*\n\n🎯 Event: *${eventName}*\n📅 Date: *${dateStr}*\n⏰ Time remaining: *${days}d ${hrs}h ${mins}m*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  },

  {
    command: 'groupmilestone',
    aliases: ['milestone', 'groupachievement'],
    category: 'groupanalytics',
    description: 'Celebrate a group member milestone. adminOnly. Usage: .groupmilestone',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      try {
        const meta = await sock.groupMetadata(chatId);
        const count = meta.participants.length;
        const milestones = [50, 100, 200, 500, 1000, 2000, 5000];
        const nearest = milestones.find(m => m >= count) || count;
        const banners = ['🎊','🎉','🥳','🔥','💥','👑','⚡'];
        const b = banners[Math.floor(Math.random() * banners.length)];
        await sock.sendMessage(chatId, {
          text: `${b} *GROUP MILESTONE* ${b}\n\n` +
                `*${meta.subject}* now has *${count} members!*\n\n` +
                `${count >= nearest ? `🏆 We've hit the *${nearest}* milestone!` : `📈 ${nearest - count} members away from *${nearest}!*`}\n\n` +
                `Thanks to every legend in this group 🙏\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Milestone failed: ${e.message}`)); }
    }
  },

  {
    command: 'groupdaily',
    aliases: ['dailydigest', 'groupsummary'],
    category: 'groupanalytics',
    description: 'Post a group daily digest. Usage: .groupdaily',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, reply }) => {
      try {
        const meta = await sock.groupMetadata(chatId);
        const db = loadDB('activity.json');
        const groupActivity = db[chatId] || {};
        const topUsers = Object.entries(groupActivity)
          .sort(([,a],[,b]) => (b.messages||0) - (a.messages||0))
          .slice(0, 3)
          .map(([jid, info], i) => `${i+1}. @${jid.split('@')[0]} — ${info.messages||0} msgs`);
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        await sock.sendMessage(chatId, {
          text: `📊 *DAILY GROUP DIGEST*\n📅 ${today}\n\n` +
                `👥 Members: *${meta.participants.length}*\n\n` +
                `🏆 *Top Active Members:*\n${topUsers.length ? topUsers.join('\n') : 'No activity tracked yet'}\n\n` +
                `💡 Keep the energy up!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Daily digest failed: ${e.message}`)); }
    }
  },

  {
    command: 'groupstreak',
    aliases: ['chatstreak', 'groupactivestreak'],
    category: 'groupanalytics',
    description: 'Show how many consecutive days the group has been active. Usage: .groupstreak',
    groupOnly: true,
    execute: async ({ chatId, reply }) => {
      const db = loadDB('groupstreaks.json');
      const streak = db[chatId];
      if (!streak) {
        const now = new Date().toISOString().split('T')[0];
        const newStreak = { current: 1, best: 1, lastActive: now };
        db[chatId] = newStreak;
        saveDB('groupstreaks.json', db);
        return reply(`🔥 *GROUP STREAK*\n\nStreak started today!\n\nCurrent: *1 day* 🔥\nBest: *1 day* 🏆\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const flame = streak.current >= 7 ? '🔥🔥🔥' : streak.current >= 3 ? '🔥🔥' : '🔥';
      reply(`${flame} *GROUP STREAK*\n\nCurrent: *${streak.current} day(s)* ${flame}\nBest: *${streak.best} day(s)* 🏆\nLast Active: ${streak.lastActive}\n\n${streak.current >= 7 ? 'LEGENDARY streak! This group is on fire!' : 'Keep it going!'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'groupchallenge',
    aliases: ['gchallenge', 'setgroupchallenge'],
    category: 'groupanalytics',
    description: 'Post a group challenge that members can respond to. adminOnly. Usage: .groupchallenge <challenge text>',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, text, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const challenge = text || args.join(' ');
      if (!challenge) return reply(h.demonError('.groupchallenge', '.groupchallenge <challenge text>'));
      const db = loadDB('groupchallenges.json');
      db[chatId] = { challenge, startedAt: Date.now(), responses: [], postedBy: sender };
      saveDB('groupchallenges.json', db);
      await sock.sendMessage(chatId, {
        text: `🏆 *GROUP CHALLENGE*\n\n"${challenge}"\n\nRespond in the group — best response wins bragging rights.\nChallenge closes in 24h.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  },

  {
    command: 'grouptrivia',
    aliases: ['livequiz', 'quicktrivia'],
    category: 'groupanalytics',
    description: 'Start a live group trivia question — first correct answer wins. Usage: .grouptrivia',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, reply }) => {
      if (activeTrivias.has(chatId)) return reply(h.demonFail('A trivia question is already active! Answer it first.'));
      const q = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
      const expires = Date.now() + 30000;
      activeTrivias.set(chatId, { ...q, expires });
      setTimeout(() => {
        if (activeTrivias.get(chatId)?.expires === expires) {
          activeTrivias.delete(chatId);
          sock.sendMessage(chatId, { text: `⏰ *Trivia expired!*\nThe answer was: *${q.a[0]}*\nNobody got it. Absolute clowns.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` });
        }
      }, 30000);
      await sock.sendMessage(chatId, {
        text: `🧠 *LIVE TRIVIA*\n\n❓ ${q.q}\n\nFirst correct answer wins! You have *30 seconds*.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  },

  {
    command: 'groupword',
    aliases: ['wordofday', 'groupwotd'],
    category: 'groupanalytics',
    description: 'Post the word of the day with definition. Usage: .groupword',
    execute: async ({ sock, msg, chatId, reply }) => {
      const entry = WORDS_OF_DAY[new Date().getDate() % WORDS_OF_DAY.length];
      await sock.sendMessage(chatId, {
        text: `📚 *WORD OF THE DAY*\n\n🔤 *${entry.word}*\n\n📖 Definition: ${entry.def}\n\n💬 Example: _"${entry.example}"_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  },

  {
    command: 'groupmeme',
    aliases: ['randommeme', 'grouppost'],
    category: 'groupanalytics',
    description: 'Fetch and post a random meme to the group. Usage: .groupmeme',
    execute: async ({ sock, msg, chatId, reply }) => {
      try {
        const subs = ['memes','dankmemes','me_irl'];
        const sub = subs[Math.floor(Math.random()*subs.length)];
        const res = await axios.get(`https://www.reddit.com/r/${sub}/random.json?limit=1`, {
          headers: { 'User-Agent': 'CrittixMD/1.0' }, timeout: 10000
        });
        const post = res.data?.[0]?.data?.children?.[0]?.data;
        if (!post || !post.url || post.is_video) return reply(h.demonFail('No meme found. Reddit had a moment.'));
        await sock.sendMessage(chatId, {
          image: { url: post.url },
          caption: `😂 *${post.title}*\n\n🔗 r/${sub}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Meme fetch failed: ${e.message}`)); }
    }
  },

  {
    command: 'grouphighlight',
    aliases: ['pinnedweekly', 'weeklyhighlight'],
    category: 'groupanalytics',
    description: 'Pin a highlight message for the weekly summary (admin). Usage: .grouphighlight (reply to message)',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;
      if (!quoted) return reply(h.demonFail('Reply to the message you want to highlight first.'));
      const db = loadDB('grouphighlights.json');
      if (!db[chatId]) db[chatId] = { highlights: [], week: getCurrentWeek() };
      const weekNow = getCurrentWeek();
      if (db[chatId].week !== weekNow) { db[chatId] = { highlights: [], week: weekNow }; }
      if (db[chatId].highlights.length >= 5) return reply(h.demonFail('Max 5 highlights per week. Remove one first or wait for next week.'));
      const text = quoted.conversation || quoted.extendedTextMessage?.text || '[media message]';
      db[chatId].highlights.push({ text: text.substring(0, 200), by: ctx.participant?.split('@')[0], at: Date.now() });
      saveDB('grouphighlights.json', db);
      const count = db[chatId].highlights.length;
      reply(h.demonSuccess(`Highlight #${count}/5 saved for this week's summary.\n\nUse .grouphighlight to add more (max 5).`));
    }
  }

];

// Expose trivia map so message handler can check answers
module.exports.activeTrivias = activeTrivias;

function getCurrentWeek() {
  const d = new Date(); const onejan = new Date(d.getFullYear(),0,1);
  return `${d.getFullYear()}-W${Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7)}`;
}
