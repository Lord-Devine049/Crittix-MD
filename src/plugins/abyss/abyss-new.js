/*
 * ABYSS-NEW.JS - Crittix-MD (DOMINION Commands)
 * Created by: LORD DIVINE
 * Commands: autoban, autowarn, scheduledmsg, scheduledkick, bulkkick,
 *           bulkpromote, massadd, ghostmode, lockdown, antiraid, antinuke,
 *           backupadmins, transferownership
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
    command: 'autoban',
    aliases: ['setautoban', 'banfilter'],
    category: 'darkprotection',
    description: 'Auto-ban users whose number matches a pattern. Usage: autoban on +1234 | autoban off | autoban list',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const bans = loadDB('autobans.json');
      if (!bans[chatId]) bans[chatId] = [];
      const action = args[0]?.toLowerCase();
      if (action === 'list') return reply(`🚫 *AUTOBAN LIST*\n\n${bans[chatId].join('\n') || 'none'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      if (action === 'clear') { bans[chatId] = []; saveDB('autobans.json', bans); return reply(p.phrases.success('autoban list cleared.')); }
      const pattern = args.slice(1).join(' ');
      if (!pattern) return reply(p.phrases.wrongUsage('provide a pattern to ban. example! .autoban +1234. or use .autoban clear. or .autoban list.'));
      bans[chatId].push(pattern);
      saveDB('autobans.json', bans);
      reply(p.phrases.success(`autoban pattern added: ${pattern}.`));
    }
  },

  {
    command: 'autowarn',
    aliases: ['setautowarn', 'warnfilter'],
    category: 'darkprotection',
    description: 'Auto-warn on keyword trigger. Usage: autowarn add <word> | autowarn list | autowarn clear',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const warns = loadDB('autowarns.json');
      if (!warns[chatId]) warns[chatId] = [];
      const action = args[0]?.toLowerCase();
      if (action === 'list') return reply(`⚠️ *AUTOWARN TRIGGERS*\n\n${warns[chatId].join(', ') || 'none'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      if (action === 'clear') { warns[chatId] = []; saveDB('autowarns.json', warns); return reply(p.phrases.success('autowarn list cleared.')); }
      if (action === 'add') {
        const word = args.slice(1).join(' ').toLowerCase();
        if (!word) return reply(p.phrases.wrongUsage('provide a keyword to warn on. example! .autowarn add badword'));
        warns[chatId].push(word);
        saveDB('autowarns.json', warns);
        return reply(p.phrases.success(`auto-warn trigger added: ${word}.`));
      }
      reply(p.phrases.wrongUsage('use .autowarn add your keyword. or .autowarn list. or .autowarn clear.'));
    }
  },

  {
    command: 'scheduledmsg',
    aliases: ['sendlater', 'schedmsg'],
    category: 'abysscommands',
    description: 'Schedule a one-time message. Usage: scheduledmsg 30m Hello group!',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const timeStr = args[0];
      const message = args.slice(1).join(' ');
      if (!timeStr || !message) return reply(p.phrases.wrongUsage('format it correctly. example! .scheduledmsg 30m reminder! meeting starting soon.'));
      const match = timeStr.match(/^(\d+)(m|h|s)$/);
      if (!match) return reply(p.phrases.error('invalid time format. use something like 10m or 1h.'));
      const ms = parseInt(match[1]) * (match[2] === 'h' ? 3600000 : match[2] === 'm' ? 60000 : 1000);
      if (ms > 24 * 3600000) return reply(p.phrases.error('max schedule time is 24 hours.'));
      reply(p.phrases.success(`message scheduled for ${timeStr}.`));
      setTimeout(async () => { try { await sock.sendMessage(chatId, { text: `📢 *SCHEDULED MESSAGE*\n\n${message}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }); } catch {} }, ms);
    }
  },

  {
    command: 'scheduledkick',
    aliases: ['kicklater', 'schedkick'],
    category: 'abysscommands',
    description: 'Schedule a user kick after a delay. Usage: scheduledkick @user 30m',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target = h.getTarget(msg, _gtP)?.[0];
      const timeStr = args.find(a => /^\d+(m|h|s)$/.test(a));
      if (!target || !timeStr) return reply(p.phrases.wrongUsage('tag someone and set a time. example! .scheduledkick @user 10m'));
      const match = timeStr.match(/^(\d+)(m|h|s)$/);
      const ms = parseInt(match[1]) * (match[2] === 'h' ? 3600000 : match[2] === 'm' ? 60000 : 1000);
      if (ms > 24 * 3600000) return reply(p.phrases.error('max time is 24 hours.'));
      const num = target.split('@')[0];
      reply(p.phrases.success(`@${num} will be kicked in ${timeStr}.`)\n\nCountdown running... 😈\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      setTimeout(async () => {
        try {
          await sock.sendMessage(chatId, { text: `⏰ *Scheduled kick!*\n\n@${num} — time's up. 💀`, mentions: [target] });
          await sock.groupParticipantsUpdate(chatId, [target], 'remove');
        } catch {}
      }, ms);
    }
  },

  {
    command: 'bulkkick',
    aliases: ['kickall2', 'multikick'],
    category: 'forbiddenarts',
    description: 'Kick multiple @mentioned users at once. Usage: bulkkick @user1 @user2 @user3',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const targets = h.getTarget(msg, _gtP);
      if (!targets?.length) return reply(p.phrases.wrongUsage('tag the people you want to kick. example! .bulkkick @user1 @user2 @user3'));
      const isBotAdmin = await h.isBotAdmin(sock, chatId);
      if (!isBotAdmin) return reply(p.phrases.adminOnly());
      try {
        await sock.groupParticipantsUpdate(chatId, targets, 'remove');
        reply(p.phrases.success(`kicked ${targets.length} user(s).`)\n\n${targets.map(t => `• @${t.split('@')[0]}`).join('\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`bulk kick failed — ${e.message}`)); }
    }
  },

  {
    command: 'bulkpromote',
    aliases: [ 'massadmin'],
    category: 'forbiddenarts',
    description: 'Promote multiple @mentioned users to admin. Usage: bulkpromote @user1 @user2',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const targets = h.getTarget(msg, _gtP);
      if (!targets?.length) return reply(p.phrases.wrongUsage('tag the people you want to promote. example! .bulkpromote @user1 @user2'));
      const isBotAdmin = await h.isBotAdmin(sock, chatId);
      if (!isBotAdmin) return reply(p.phrases.adminOnly());
      try {
        await sock.groupParticipantsUpdate(chatId, targets, 'promote');
        reply(p.phrases.success(`promoted ${targets.length} user(s) to admin.`)\n\n${targets.map(t => `• @${t.split('@')[0]}`).join('\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`bulk promote failed — ${e.message}`)); }
    }
  },

  {
    command: 'massadd',
    aliases: ['addmultiple', 'addnumbers'],
    category: 'forbiddenarts',
    description: 'Add multiple phone numbers to the group. Usage: massadd 2348001234567 2348001234568 2348001234569',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      const numbers = args.filter(a => /^\d{7,15}$/.test(a.replace(/\D/g, '')));
      if (!numbers.length) return reply(p.phrases.wrongUsage('provide numbers in international format without the plus sign. example! .massadd 2348012345678 2349012345678'));
      const isBotAdmin = await h.isBotAdmin(sock, chatId);
      if (!isBotAdmin) return reply(p.phrases.adminOnly());
      const jids = numbers.map(n => n.replace(/\D/g, '') + '@s.whatsapp.net');
      try {
        const result = await sock.groupParticipantsUpdate(chatId, jids.slice(0, 10), 'add'); // WhatsApp limits ~10 at once
        const added = result?.filter(r => r.status === '200').length || jids.length;
        reply(p.phrases.success("mass add complete."\n\nAttempted: ${jids.length}\nSucceeded: ~${added}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`mass add failed — ${e.message}`)); }
    }
  },

  {
    command: 'ghostmode',
    aliases: [ 'ghostadmin'],
    category: 'abysscommands',
    description: 'Toggle silent/ghost moderation mode (no notifs). Usage: ghostmode on | ghostmode off',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const ghostDB = loadDB('ghostmode.json');
      const action = args[0]?.toLowerCase();
      if (action === 'on') {
        ghostDB[chatId] = true;
        saveDB('ghostmode.json', ghostDB);
        return reply(`👻 *Ghost Mode: ON*\n\nBot will now moderate silently — no messages, just actions.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'off') {
        ghostDB[chatId] = false;
        saveDB('ghostmode.json', ghostDB);
        return reply(`👻 *Ghost Mode: OFF*\n\nBot is back to normal verbose moderation.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const status = ghostDB[chatId] ? 'ON' : 'OFF';
      reply(`👻 Ghost Mode is currently: *${status}*\n\nToggle: .ghostmode on | off\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'lockdown',
    aliases: ['fulllock'],
    category: 'abysscommands',
    description: 'Put group in admin-only mode (lockdown). Usage: lockdown on | lockdown off',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      const isBotAdmin = await h.isBotAdmin(sock, chatId);
      if (!isBotAdmin) return reply(p.phrases.adminOnly());
      const action = args[0]?.toLowerCase();
      if (action === 'on') {
        await sock.groupSettingUpdate(chatId, 'announcement');
        return reply(`🔒 *LOCKDOWN ACTIVE*\n\nOnly admins can send messages now.\nUse *.lockdown off* to restore.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'off') {
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        return reply(`🔓 *LOCKDOWN LIFTED*\n\nAll members can now send messages.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(p.phrases.wrongUsage('use .lockdown on to lock the group. or .lockdown off to unlock it.'));
    }
  },

  {
    command: 'antiraid',
    aliases: ['raidprotect', 'joinflood'],
    category: 'darkprotection',
    description: 'Toggle anti-raid mode (spike join detection). Usage: antiraid on | antiraid off | antiraid status',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const raidDB = loadDB('antiraid.json');
      const action = args[0]?.toLowerCase() || 'status';
      if (action === 'on') {
        raidDB[chatId] = { enabled: true, threshold: 5, window: 30000 };
        saveDB('antiraid.json', raidDB);
        return reply(`🛡️ *Anti-Raid: ON*\n\nAuto-remove enabled if 5+ members join in 30 seconds.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'off') {
        raidDB[chatId] = { enabled: false };
        saveDB('antiraid.json', raidDB);
        return reply(`🛡️ *Anti-Raid: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const status = raidDB[chatId]?.enabled ? 'ON 🟢' : 'OFF 🔴';
      reply(`🛡️ *Anti-Raid Status: ${status}*\n\nToggle: .antiraid on | off\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'antinuke',
    aliases: ['nukeprot', 'adminprotect'],
    category: 'darkprotection',
    description: 'Detect mass kick/demote and auto-revert. Usage: antinuke on | antinuke off',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const nukeDB = loadDB('antinuke.json');
      const action = args[0]?.toLowerCase() || 'status';
      if (action === 'on') {
        nukeDB[chatId] = true;
        saveDB('antinuke.json', nukeDB);
        return reply(`☢️ *Anti-Nuke: ON*\n\nIf any admin mass-demotes/kicks 3+ members rapidly, they'll be demoted automatically.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'off') {
        nukeDB[chatId] = false;
        saveDB('antinuke.json', nukeDB);
        return reply(`☢️ *Anti-Nuke: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(`☢️ Anti-Nuke: *${nukeDB[chatId] ? 'ON' : 'OFF'}*\n\n.antinuke on | off`);
    }
  },

  {
    command: 'backupadmins',
    aliases: ['saveadmins'],
    category: 'abysscommands',
    description: 'Save/restore group admin list. Usage: backupadmins save | backupadmins restore | backupadmins list',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const adminsDB = loadDB('adminbackups.json');
      const action = args[0]?.toLowerCase() || 'list';
      if (action === 'save') {
        const meta = await sock.groupMetadata(chatId);
        const admins = meta.participants.filter(m => m.admin).map(m => m.id);
        adminsDB[chatId] = admins;
        saveDB('adminbackups.json', adminsDB);
        return reply(p.phrases.success("admin list saved."\n\n${admins.length} admin(s) backed up.\n${admins.map(a => `• @${a.split('@')[0]}`).join('\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'restore') {
        const admins = adminsDB[chatId];
        if (!admins?.length) return reply(p.phrases.adminOnly());
        const isBotAdmin = await h.isBotAdmin(sock, chatId);
        if (!isBotAdmin) return reply(p.phrases.adminOnly());
        await sock.groupParticipantsUpdate(chatId, admins, 'promote');
        return reply(p.phrases.success("admin list restored."\n\n${admins.length} user(s) promoted to admin.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const admins = adminsDB[chatId] || [];
      reply(`👑 *SAVED ADMIN LIST*\n\n${admins.length ? admins.map(a => `• @${a.split('@')[0]}`).join('\n') : 'No backup found'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'transferownership',
    aliases: ['transferown', 'changeowner'],
    category: 'abysscommands',
    description: 'Transfer bot ownership in this group to another admin. Usage: transferownership @user',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.error('only the owner can transfer ownership'));
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target = h.getTarget(msg, _gtP)?.[0];
      if (!target) return reply(p.phrases.wrongUsage('tag the person you want to make owner. example! .transferownership @user'));
      const num = target.split('@')[0];
      try {
        await sock.groupParticipantsUpdate(chatId, [target], 'promote');
        const transferDB = loadDB('grouptransfer.json');
        transferDB[chatId] = { newOwner: target, timestamp: Date.now() };
        saveDB('grouptransfer.json', transferDB);
        await sock.sendMessage(chatId, {
          text: `👑 *OWNERSHIP TRANSFERRED*\n\nNew group owner: @${num}\n\nAll hail the new boss. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: [target]
        }, { quoted: msg });
      } catch (e) { reply(p.phrases.error(`transfer failed — ${e.message}`)); }
    }
  }

];
