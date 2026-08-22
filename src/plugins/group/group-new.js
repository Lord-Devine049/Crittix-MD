/*
 * GROUP-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: groupbio, groupbanner, groupschedule, grouppoll2, groupquiz,
 *           groupevent, groupreminder, groupexport, groupbackup, groupclone,
 *           groupranking, grouptheme
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

module.exports = [

  {
    command: 'groupbio',
    aliases: ['gbio', 'setgroupbio'],
    category: 'abysscommands',
    description: 'Set or view the group bio/description. Usage: groupbio set <text> | groupbio show',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, args, text, reply }) => {
      const action = args[0]?.toLowerCase() || 'show';
      const bios = loadDB('groupbios.json');
      if (action === 'show') {
        const bio = bios[chatId] || '_(No group bio set)_';
        return reply(`📋 *GROUP BIO*\n\n${bio}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'set') {
        if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
        if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
        const bio = args.slice(1).join(' ') || text?.replace(/^set\s+/i, '');
        if (!bio) return reply(p.phrases.wrongUsage('type the bio text after the command. example! .groupbio set the realest group alive.'));
        bios[chatId] = bio;
        saveDB('groupbios.json', bios);
        // Also try to set WhatsApp group description
        try {
          await sock.groupUpdateDescription(chatId, bio.substring(0, 512));
        } catch {}
        return reply(p.phrases.success('group bio updated.'));
      }
      reply(p.phrases.wrongUsage('use .groupbio set your text here. or .groupbio show to display the current bio.'));
    }
  },

  {
    command: 'groupbanner',
    aliases: ['gbanner', 'groupheader'],
    category: 'abysscommands',
    description: 'Generate and set a group banner image. Usage: groupbanner <group name>',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, args, text, reply }) => {
      const name = text || args.join(' ');
      if (!name) return reply(p.phrases.wrongUsage('provide the group name after the command. example! .groupbanner night raiders.'));
      try {
        const { createCanvas } = require('canvas');
        const width = 800, height = 200;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const colors = [['#0f3460','#e94560'],['#1a1a2e','#16213e'],['#533483','#e94560'],['#06b6d4','#0f3460']];
        const [c1, c2] = colors[Math.floor(Math.random() * colors.length)];
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, c1); grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(24, Math.floor(350/name.length))}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name.substring(0, 30).toUpperCase(), width / 2, height / 2 - 10);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '14px Arial';
        ctx.fillText('𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗', width / 2, height / 2 + 25);
        const buf = canvas.toBuffer('image/png');
        const tmpPath = path.join(process.cwd(), 'tmp', `gbanner_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, buf);
        await sock.sendMessage(chatId, { image: { url: tmpPath }, caption: `🎨 *Group Banner: ${name}*\n\nAdmin can set this as group icon.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(p.phrases.error(`banner generation failed — ${e.message}`)); }
    }
  },

  {
    command: 'groupschedule',
    aliases: ['gschedule', 'setschedule'],
    category: 'abysscommands',
    description: 'Set a recurring scheduled group message. Usage: groupschedule set 09:00 Good morning! | groupschedule list | groupschedule clear',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const schedules = loadDB('groupschedules.json');
      if (!schedules[chatId]) schedules[chatId] = [];
      const action = args[0]?.toLowerCase();
      if (action === 'set') {
        const time = args[1];
        const message = args.slice(2).join(' ');
        if (!time || !message) return reply(p.phrases.wrongUsage('format it correctly. example! .groupschedule set 09:00 good morning everyone.'));
        schedules[chatId].push({ time, message, created: Date.now() });
        saveDB('groupschedules.json', schedules);
        return reply(p.phrases.success(`schedule set for ${time}.`));
      }
      if (action === 'list') {
        const list = schedules[chatId];
        if (!list.length) return reply(p.phrases.notFound('no schedules set for this group yet.'));
        return reply(`📅 *SCHEDULED MESSAGES*\n\n${list.map((s, i) => `${i+1}. ⏰ ${s.time} — "${s.message}"`).join('\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'clear') {
        schedules[chatId] = [];
        saveDB('groupschedules.json', schedules);
        return reply(p.phrases.success('all schedules cleared.'));
      }
      reply(p.phrases.wrongUsage('use .groupschedule set HH:MM your message. or list to view. or clear to remove all.'));
    }
  },

  {
    command: 'groupquiz',
    aliases: ['gquiz', 'groupqna'],
    category: 'abysscommands',
    description: 'Start a quick quiz session in a group. Usage: groupquiz start | groupquiz answer <ans>',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, args, prefix, reply }) => {
      const quizzes = loadDB('groupquiz.json');
      const action = args[0]?.toLowerCase() || 'start';
      const questions = [
        { q:'What is the capital of Nigeria?', a:'abuja', hint:'It\'s not Lagos' },
        { q:'How many continents are there?', a:'7', hint:'Count them on a globe' },
        { q:'What is 15% of 200?', a:'30', hint:'Math time' },
        { q:'In what year was WhatsApp founded?', a:'2009', hint:'Over a decade ago' },
        { q:'What gas do plants absorb from air?', a:'carbon dioxide', hint:'CO2' },
        { q:'How many sides does a hexagon have?', a:'6', hint:'Six pack hint' },
        { q:'What is the largest planet in our solar system?', a:'jupiter', hint:'Big boy energy' },
        { q:'Who created CrittixMD?', a:'lord divine', hint:'The legend himself' },
      ];
      if (action === 'start') {
        if (quizzes[chatId]?.active) return reply(p.phrases.alreadyEnabled('quiz already active. answer it first.'));
        const q = questions[Math.floor(Math.random() * questions.length)];
        quizzes[chatId] = { active: true, question: q.q, answer: q.a, hint: q.hint, started: Date.now() };
        saveDB('groupquiz.json', quizzes);
        return reply(`🎯 *GROUP QUIZ*\n\n❓ ${q.q}\n\n📝 Answer with: ${prefix}groupquiz answer <your answer>\n⏰ You have 30 seconds!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'hint') {
        const quiz = quizzes[chatId];
        if (!quiz?.active) return reply(p.phrases.notFound('no active quiz running right now.'));
        return reply(`💡 Hint: ${quiz.hint}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'answer' || action === 'ans') {
        const quiz = quizzes[chatId];
        if (!quiz?.active) return reply(p.phrases.notFound('no active quiz. start one first.'));
        if (Date.now() - quiz.started > 30000) { delete quizzes[chatId]; saveDB('groupquiz.json', quizzes); return reply(`⏰ Time's up! Answer was: *${quiz.answer}*`); }
        const guess = args.slice(1).join(' ').toLowerCase().trim();
        if (guess === quiz.answer || quiz.answer.includes(guess) || guess.includes(quiz.answer)) {
          delete quizzes[chatId]; saveDB('groupquiz.json', quizzes);
          return reply(p.phrases.success(`correct! @${sender.split('@')[0]} got it.`)\n\n${quiz.question}\n📝 Answer: *${quiz.answer}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
        return reply(`❌ Wrong — try again. Hint: ${prefix}groupquiz hint`);
      }
      reply(p.phrases.wrongUsage('use .groupquiz start to begin. .groupquiz answer your answer to respond. .groupquiz hint for a clue.'));
    }
  },

  {
    command: 'groupevent',
    aliases: ['event', 'createevent'],
    category: 'abysscommands',
    description: 'Create a group event with RSVP. Usage: groupevent "Game Night" 2024-12-25 20:00',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, senderNumber, args, reply }) => {
      const events = loadDB('groupevents.json');
      if (!events[chatId]) events[chatId] = [];
      const name = args[0];
      const date = args[1];
      const time = args[2];
      if (!name || !date) return reply(p.phrases.wrongUsage('format it correctly. example! .groupevent "game night" 2025-12-25 20:00'));
      const event = { name, date, time: time || 'TBD', created_by: senderNumber, rsvp: [senderNumber], id: Date.now() };
      events[chatId].push(event);
      saveDB('groupevents.json', events);
      await sock.sendMessage(chatId, {
        text: `📅 *EVENT: ${name}*\n\n📆 Date: *${date}*\n⏰ Time: *${time || 'TBD'}*\n👤 Organizer: @${senderNumber}\n\n✅ RSVP'd: 1\n\nReply *.rsvp yes* or *.rsvp no* to respond.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
        mentions: [sender]
      }, { quoted: msg });
    }
  },

  {
    command: 'groupreminder',
    aliases: [ 'setreminder'],
    category: 'abysscommands',
    description: 'Set a one-time group reminder. Usage: groupreminder 30m Team meeting | groupreminder 2h Lunch break',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const timeStr = args[0];
      const message = args.slice(1).join(' ');
      if (!timeStr || !message) return reply(p.phrases.wrongUsage('format it correctly. example! .groupreminder 30m team meeting starts soon.'));
      const match = timeStr.match(/^(\d+)(m|h|s)$/);
      if (!match) return reply(p.phrases.error('invalid time format — use like 30m, 1h, 2h'));
      const ms = parseInt(match[1]) * (match[2] === 'h' ? 3600000 : match[2] === 'm' ? 60000 : 1000);
      if (ms > 24 * 3600000) return reply(p.phrases.error('max reminder time is 24 hours'));
      reply(`⏰ *Reminder set!*\n\nI'll notify the group in *${timeStr}*\n📝 Message: "${message}"\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      setTimeout(async () => {
        try {
          await sock.sendMessage(chatId, { text: `⏰ *REMINDER*\n\n${message}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` });
        } catch {}
      }, ms);
    }
  },

  {
    command: 'groupexport',
    aliases: ['exportmembers', 'memberlist'],
    category: 'abysscommands',
    description: 'Export group member list as a document. Usage: groupexport',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      try {
        const meta = await sock.groupMetadata(chatId);
        const members = meta.participants;
        const text = `GROUP: ${meta.subject}\nMEMBERS: ${members.length}\nExported: ${new Date().toISOString()}\n\n` +
          members.map((m, i) => {
            const num = m.id.split('@')[0];
            const role = m.admin === 'superadmin' ? 'Owner' : m.admin === 'admin' ? 'Admin' : 'Member';
            return `${i+1}. +${num} [${role}]`;
          }).join('\n');
        const tmpPath = path.join(process.cwd(), 'tmp', `members_${Date.now()}.txt`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, text);
        await sock.sendMessage(chatId, {
          document: { url: tmpPath },
          mimetype: 'text/plain',
          fileName: `${meta.subject}_members.txt`,
          caption: `📋 *Member List Exported*\n\n👥 ${members.length} members\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(p.phrases.error(`export failed — ${e.message}`)); }
    }
  },

  {
    command: 'groupbackup',
    aliases: ['backupgroup', 'savegroup'],
    category: 'abysscommands',
    description: 'Backup group settings and info. Usage: groupbackup',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      try {
        const meta = await sock.groupMetadata(chatId);
        const backup = {
          name: meta.subject,
          description: meta.desc,
          members: meta.participants.map(m => ({ id: m.id, admin: m.admin || null })),
          settings: { announce: meta.announce, restrict: meta.restrict },
          backed_up_at: new Date().toISOString()
        };
        const backups = loadDB('groupbackups.json');
        backups[chatId] = backup;
        saveDB('groupbackups.json', backups);
        reply(
          `💾 *GROUP BACKUP SAVED*\n\n` +
          `📌 Name: *${backup.name}*\n` +
          `👥 Members: ${backup.members.length}\n` +
          `📝 Description: ${backup.description ? '✅' : '❌ None'}\n` +
          `📅 Saved: ${backup.backed_up_at}\n\n` +
          `Restore with: *.groupclone* (settings only)\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(p.phrases.error(`backup failed — ${e.message}`)); }
    }
  },

  {
    command: 'groupclone',
    aliases: ['restoregroup', 'clonesettings'],
    category: 'abysscommands',
    description: 'Restore group name/description from last backup. Usage: groupclone',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const backups = loadDB('groupbackups.json');
      const backup = backups[chatId];
      if (!backup) return reply(p.phrases.error('no backup found for this group — run .groupbackup first'));
      try {
        await sock.groupUpdateSubject(chatId, backup.name);
        if (backup.description) await sock.groupUpdateDescription(chatId, backup.description);
        reply(p.phrases.success('group settings restored.'));
      } catch (e) { reply(p.phrases.error(`restore failed — ${e.message}`)); }
    }
  },

  {
    command: 'groupranking',
    aliases: [ 'topmembers'],
    category: 'abysscommands',
    description: 'Show top active members in the group by XP/activity. Usage: groupranking',
    groupOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        const globalXP = require('../../lib/global-xp');
        const meta = await sock.groupMetadata(chatId);
        const members = meta.participants;
        const ranked = members
          .map(m => ({ jid: m.id, xp: globalXP.getXP(m.id) || 0, num: m.id.split('@')[0] }))
          .filter(m => m.xp > 0)
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 10);
        if (!ranked.length) return reply(p.phrases.error('no XP data for this group yet — use bot commands to earn XP'));
        const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
        const txt = ranked.map((m, i) => `${medals[i]} @${m.num} — ${m.xp} XP`).join('\n');
        reply(`📊 *GROUP RANKING*\n\n${txt}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`ranking failed — ${e.message}`)); }
    }
  },

  {
    command: 'grouptheme',
    aliases: ['gtheme', 'settheme'],
    category: 'abysscommands',
    description: 'Set a cosmetic theme for group bot messages. Usage: grouptheme dark | grouptheme light | grouptheme list',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const themes = {
        dark: { name:'Dark Void', preview:'🌑 Dark background, red accents, savage tone' },
        light: { name:'Angel Mode', preview:'☀️ Light feel, soft colors, chill vibe' },
        fire: { name:'Hellfire', preview:'🔥 Aggressive fire theme, max demon energy' },
        ocean: { name:'Deep Ocean', preview:'🌊 Blue tones, calm but powerful' },
        royal: { name:'Royal Purple', preview:'👑 Purple/gold, Lord Crittix approved' },
      };
      const theme = args[0]?.toLowerCase();
      if (!theme || theme === 'list') {
        return reply(`🎨 *GROUP THEMES*\n\n${Object.entries(themes).map(([k,v]) => `• *${k}* — ${v.preview}`).join('\n')}\n\nSet: .grouptheme <name>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (!themes[theme]) return reply(p.phrases.error(`unknown theme — .grouptheme list`));
      const themeDB = loadDB('groupthemes.json');
      themeDB[chatId] = theme;
      saveDB('groupthemes.json', themeDB);
      reply(`🎨 *Theme set: ${themes[theme].name}*\n\n${themes[theme].preview}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }

];
