/*
 * GROUP-NEW2.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: groupwelcomecard, groupleaderboard2, groupmood, groupwarnings,
 *           groupbirthday, groupvote, groupactivitybadge
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

module.exports = [

  {
    command: 'groupwelcomecard',
    aliases: ['welcomecard', 'joincard'],
    category: 'abysscommands',
    description: 'Generate a text welcome card for a new member. Usage: groupwelcomecard @user',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!mentioned) return reply(h.demonError('.groupwelcomecard', '.groupwelcomecard @newmember'));
      try {
        const meta = await sock.groupMetadata(chatId);
        const num = mentioned.split('@')[0];
        const groupName = meta.subject || 'Crittix Empire';
        const memberCount = meta.participants?.length || '?';
        await sock.sendMessage(chatId, {
          text:
            `╔══════════════════════════么\n` +
            `║   🎉 *WELCOME TO ${groupName.toUpperCase()}*\n` +
            `╚══════════════════════════么\n\n` +
            `👤 New Member: @${num}\n` +
            `👥 You are member *#${memberCount}*\n\n` +
            `📋 Read the group rules\n` +
            `🤝 Respect every member\n` +
            `🔥 Stay active or get purged\n\n` +
            `Welcome to the family. Don't be a liability. 😤\n\n` +
            `么══════════════════════════么\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: [mentioned]
        }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`couldn't generate welcome card — ${e.message}`)); }
    }
  },

  {
    command: 'groupmood',
    aliases: ['grpmood', 'moodvote'],
    category: 'abysscommands',
    description: 'Vote on the group\'s current mood. Usage: groupmood <emoji/word> | groupmood results',
    groupOnly: true,
    execute: async ({ chatId, sender, senderNumber, args, reply }) => {
      const moods = loadDB('group-mood.json');
      if (!moods[chatId]) moods[chatId] = { votes: {}, tally: {} };
      const action = args[0]?.toLowerCase();
      if (action === 'results') {
        const tally = moods[chatId].tally;
        if (!Object.keys(tally).length) return reply(h.demonFail('no mood votes yet. Be the first.'));
        const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
        const lines = sorted.map(([mood, count]) => `${mood}: ${count} vote(s)`).join('\n');
        return reply(`🌡️ *GROUP MOOD RESULTS*\n\n${lines}\n\nThe vibes have spoken. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const mood = args.join(' ').slice(0, 20) || '😐';
      const prevVote = moods[chatId].votes[sender];
      if (prevVote) moods[chatId].tally[prevVote] = Math.max(0, (moods[chatId].tally[prevVote] || 0) - 1);
      moods[chatId].votes[sender] = mood;
      moods[chatId].tally[mood] = (moods[chatId].tally[mood] || 0) + 1;
      saveDB('group-mood.json', moods);
      const total = Object.values(moods[chatId].votes).length;
      reply(`🌡️ *MOOD VOTE*\n\n@${senderNumber} set mood: *${mood}*\nTotal voters: ${total}\n\nSee results: .groupmood results\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'groupwarnings',
    aliases: ['allwarns', 'grpwarnings'],
    category: 'abysscommands',
    description: 'Show all active warnings issued in this group. Usage: groupwarnings',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, sender, reply, isOwner, isSudo }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender))
        return reply(p.phrases.adminOnly());
        if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const warns = loadDB('warnings.json');
      const groupWarns = warns[chatId] || {};
      const entries = Object.entries(groupWarns).filter(([, w]) => w.count > 0);
      if (!entries.length) return reply(`✅ *CLEAN SLATE*\n\nNo active warnings in this group. Rare. Enjoy it.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      const lines = entries.map(([jid, w]) => {
        const num = jid.split('@')[0];
        const reasons = (w.reasons || []).slice(-2).join(', ');
        return `• @${num} — *${w.count} warning(s)* | ${reasons || 'no reason logged'}`;
      }).join('\n');
      reply(`⚠️ *GROUP WARNINGS REPORT*\n\n${lines}\n\n${entries.length} member(s) flagged. Handle accordingly. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'birthdayreg',
    aliases: ['setbday', 'grpbday'],
    category: 'abysscommands',
    description: 'Register your birthday for a group shoutout. Usage: groupbirthday set DD/MM | groupbirthday check',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, senderNumber, args, reply }) => {
      const bdayData = loadDB('group-birthdays.json');
      if (!bdayData[chatId]) bdayData[chatId] = {};
      const action = args[0]?.toLowerCase();
      if (action === 'check') {
        const today = new Date();
        const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
        const todayBdays = Object.entries(bdayData[chatId]).filter(([, d]) => d === todayStr);
        if (!todayBdays.length) return reply(`🎂 No birthdays today in this group.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        const mentions = todayBdays.map(([jid]) => jid);
        const names = todayBdays.map(([jid]) => `@${jid.split('@')[0]}`).join(', ');
        return sock.sendMessage(chatId, {
          text: `🎂 *HAPPY BIRTHDAY!*\n\n${names} 🎉\n\nCrittix Empire celebrates you today. Stay legendary. 👑\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions
        }, { quoted: msg });
      }
      const dateStr = args[0] || args.join('/');
      const match = dateStr?.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
      if (!match) return reply(h.demonError('.groupbirthday', '.groupbirthday set DD/MM — e.g. groupbirthday 25/12'));
      const day = parseInt(match[1]), month = parseInt(match[2]);
      if (day < 1 || day > 31 || month < 1 || month > 12) return reply(h.demonFail('invalid date. Try again with a real day/month.'));
      bdayData[chatId][sender] = `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}`;
      saveDB('group-birthdays.json', bdayData);
      reply(`🎂 *BIRTHDAY REGISTERED*\n\n@${senderNumber}'s birthday: *${bdayData[chatId][sender]}*\nCrittix will shout you out on the day. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'groupvote',
    aliases: ['grpvote', 'yesnopoll'],
    category: 'abysscommands',
    description: 'Admin starts a yes/no vote with live tally. Usage: groupvote start <question> | groupvote yes/no | groupvote results',
    groupOnly: true,
    execute: async ({ chatId, sender, senderNumber, args, reply, isOwner, isSudo, sock }) => {
      const votes = loadDB('group-vote.json');
      if (!votes[chatId]) votes[chatId] = null;
      const action = args[0]?.toLowerCase();
      if (action === 'start') {
        if (!await h.isSenderAdmin(sock, chatId, sender))
          return reply(p.phrases.adminOnly());
          if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
        const question = args.slice(1).join(' ');
        if (!question) return reply(h.demonError('.groupvote', '.groupvote start <question>'));
        votes[chatId] = { question, yes: [], no: [], started: Date.now() };
        saveDB('group-vote.json', votes);
        return reply(`🗳️ *GROUP VOTE STARTED*\n\n❓ "${question}"\n\nVote with: *.groupvote yes* or *.groupvote no*\nResults: *.groupvote results*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const vote = votes[chatId];
      if (!vote) return reply(p.phrases.adminOnly());
      if (action === 'results') {
        const total = vote.yes.length + vote.no.length;
        const yPct = total ? Math.round((vote.yes.length / total) * 100) : 0;
        const nPct = 100 - yPct;
        return reply(`📊 *VOTE RESULTS*\n\n❓ "${vote.question}"\n\n✅ Yes: ${vote.yes.length} (${yPct}%)\n❌ No: ${vote.no.length} (${nPct}%)\nTotal: ${total}\n\n${yPct > nPct ? '✅ YES wins' : yPct < nPct ? '❌ NO wins' : '🤝 TIE'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'yes' || action === 'no') {
        vote.yes = vote.yes.filter(j => j !== sender);
        vote.no = vote.no.filter(j => j !== sender);
        vote[action].push(sender);
        saveDB('group-vote.json', votes);
        return reply(`✅ @${senderNumber} voted *${action.toUpperCase()}*\nTotal: ✅ ${vote.yes.length} | ❌ ${vote.no.length}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(h.demonError('.groupvote', '.groupvote start <question> | yes | no | results'));
    }
  },

  {
    command: 'groupactivitybadge',
    aliases: ['activitybadge', 'weeklybadge'],
    category: 'abysscommands',
    description: 'Award cosmetic badge to the most active member of the week. Usage: groupactivitybadge',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply, isOwner, isSudo }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender))
        return reply(p.phrases.adminOnly());
        if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const actData = loadDB('activity.json');
      const groupData = actData[chatId] || {};
      const now = Date.now();
      const weekAgo = now - 604800000;
      const entries = Object.entries(groupData)
        .map(([jid, d]) => ({ jid, num: jid.split('@')[0], weekMsgs: d.weeklyMessages || d.messages || 0 }))
        .filter(e => e.weekMsgs > 0)
        .sort((a, b) => b.weekMsgs - a.weekMsgs);
      if (!entries.length) return reply(h.demonFail('no activity data to award badges from'));
      const winner = entries[0];
      const badgeData = loadDB('activity-badges.json');
      if (!badgeData[winner.jid]) badgeData[winner.jid] = { badges: [] };
      badgeData[winner.jid].badges.push({ badge: '🏅 Most Active', week: new Date().toISOString().slice(0, 10) });
      saveDB('activity-badges.json', badgeData);
      await sock.sendMessage(chatId, {
        text: `🏅 *WEEKLY ACTIVITY BADGE*\n\n🏆 Most Active Member: @${winner.num}\n📊 Messages this week: ${winner.weekMsgs}\n\nThey kept this group breathing. Respect the grind. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
        mentions: [winner.jid]
      }, { quoted: msg });
    }
  }

];
