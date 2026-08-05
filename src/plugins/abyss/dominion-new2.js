/*
 * DOMINION-NEW2.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Commands: bulkkick2, ghostmode2, antiraid2, backupadmins2, grouprolepreset,
 *           slowmodetimer, antilinkwhitelist, mutealltimer, warnexpiry,
 *           groupquarantine, announcementpin
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');

const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

module.exports = [

  {
    command: 'grouprolepreset',
    aliases: ['rolepreset', 'saveroleset'],
    category: 'abysscommands',
    description: 'Save/apply a named set of group settings for quick reapply. Usage: grouprolepreset save <name> | list | apply <name>',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply, isOwner, isSudo }) => {
      if (!isOwner && !isSudo) return reply(h.demonFail('owner/sudo only'));
      const presets = loadDB('role-presets.json');
      if (!presets[chatId]) presets[chatId] = {};
      const action = args[0]?.toLowerCase();
      const name = args[1];
      if (action === 'save') {
        if (!name) return reply(h.demonError('.grouprolepreset', '.grouprolepreset save <name>'));
        try {
          const meta = await sock.groupMetadata(chatId);
          presets[chatId][name] = {
            subject: meta.subject,
            announce: meta.announce,
            restrict: meta.restrict,
            memberCount: meta.participants.length,
            savedAt: Date.now()
          };
          saveDB('role-presets.json', presets);
          return reply(`✅ *PRESET SAVED: "${name}"*\n\nGroup settings captured for later reapplication.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } catch (e) { return reply(h.demonFail(`save failed — ${e.message}`)); }
      }
      if (action === 'list') {
        const keys = Object.keys(presets[chatId] || {});
        if (!keys.length) return reply(h.demonFail('no presets saved for this group yet.'));
        return reply(`📋 *SAVED PRESETS*\n\n${keys.map(k => `• ${k} (saved: ${new Date(presets[chatId][k].savedAt).toLocaleDateString()})`).join('\n')}\n\nApply: .grouprolepreset apply <name>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'apply') {
        if (!name || !presets[chatId][name]) return reply(h.demonFail(`preset "${name}" not found. Check .grouprolepreset list`));
        const p = presets[chatId][name];
        try {
          if (p.announce !== undefined) await sock.groupSettingUpdate(chatId, p.announce ? 'announcement' : 'not_announcement');
          return reply(`✅ *PRESET APPLIED: "${name}"*\n\nGroup settings restored from preset.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } catch (e) { return reply(h.demonFail(`apply failed — ${e.message}`)); }
      }
      reply(h.demonError('.grouprolepreset', '.grouprolepreset save <name> | list | apply <name>'));
    }
  },

  {
    command: 'slowmodetimer',
    aliases: ['timedslowmode', 'slowfor'],
    category: 'abysscommands',
    description: 'Enable slowmode for N minutes, then auto-disable. Usage: slowmodetimer <minutes>',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply, isOwner, isSudo }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender))
        return reply(h.demonFail('admins only'));
        if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
      const minutes = parseInt(args[0]);
      if (isNaN(minutes) || minutes < 1 || minutes > 1440) return reply(h.demonError('.slowmodetimer', '.slowmodetimer <minutes 1-1440>'));
      try {
        await sock.groupSettingUpdate(chatId, 'announcement');
        reply(`⏱️ *SLOWMODE TIMER*\n\nGroup locked for *${minutes} minute(s)*.\nAuto-unlocks after the timer.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        setTimeout(async () => {
          try {
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            await sock.sendMessage(chatId, { text: `✅ *SLOWMODE ENDED*\n\nTimer expired. Group is now open again.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` });
          } catch {}
        }, minutes * 60000);
      } catch (e) { reply(h.demonFail(`slowmode failed — ${e.message}`)); }
    }
  },

  {
    command: 'antilinkwhitelist',
    aliases: ['whitelistlink', 'allowdomain'],
    category: 'darkprotection',
    description: 'Whitelist specific domains so antilink doesn\'t flag them. Usage: antilinkwhitelist add <domain> | list | remove <domain>',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply, isOwner, isSudo }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender))
        return reply(h.demonFail('admins only'));
        if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
      const wlData = loadDB('link-whitelist.json');
      if (!wlData[chatId]) wlData[chatId] = [];
      const action = args[0]?.toLowerCase();
      const domain = args[1]?.toLowerCase();
      if (action === 'add') {
        if (!domain) return reply(h.demonError('.antilinkwhitelist', '.antilinkwhitelist add <domain.com>'));
        if (wlData[chatId].includes(domain)) return reply(h.demonFail(`"${domain}" is already whitelisted`));
        wlData[chatId].push(domain);
        saveDB('link-whitelist.json', wlData);
        return reply(`✅ *WHITELISTED*: ${domain}\n\nAntilink will no longer flag this domain.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'remove') {
        if (!domain) return reply(h.demonError('.antilinkwhitelist', '.antilinkwhitelist remove <domain.com>'));
        wlData[chatId] = wlData[chatId].filter(d => d !== domain);
        saveDB('link-whitelist.json', wlData);
        return reply(`🗑️ *REMOVED*: ${domain} from whitelist.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'list') {
        if (!wlData[chatId].length) return reply(`📋 No whitelisted domains for this group yet.\n\nAdd with: .antilinkwhitelist add <domain>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        return reply(`📋 *WHITELISTED DOMAINS*\n\n${wlData[chatId].map(d => `• ${d}`).join('\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(h.demonError('.antilinkwhitelist', '.antilinkwhitelist add <domain> | list | remove <domain>'));
    }
  },

  {
    command: 'mutealltimer',
    aliases: ['timedmute', 'mutefor'],
    category: 'abysscommands',
    description: 'Mute all for N minutes then auto-unmute. Usage: mutealltimer <minutes>',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply, isOwner, isSudo }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender))
        return reply(h.demonFail('admins only'));
        if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
      const minutes = parseInt(args[0]);
      if (isNaN(minutes) || minutes < 1 || minutes > 480) return reply(h.demonError('.mutealltimer', '.mutealltimer <minutes 1-480>'));
      try {
        await sock.groupSettingUpdate(chatId, 'announcement');
        reply(`🔇 *TIMED MUTE*\n\nAll members muted for *${minutes} minute(s)*.\nBot will auto-unmute after timer expires.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        setTimeout(async () => {
          try {
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            await sock.sendMessage(chatId, { text: `🔊 *AUTO-UNMUTED*\n\n${minutes}-minute mute expired. Members can speak again.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` });
          } catch {}
        }, minutes * 60000);
      } catch (e) { reply(h.demonFail(`mute timer failed — ${e.message}`)); }
    }
  },

  {
    command: 'warnexpiry',
    aliases: ['setexpiry', 'warnttl'],
    category: 'abysscommands',
    description: 'Set warnings to auto-expire after N days. Usage: warnexpiry <days> | warnexpiry off',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply, isOwner, isSudo }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender))
        return reply(h.demonFail('admins only'));
        if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
      const cfg = loadDB('warn-expiry.json');
      const input = args[0]?.toLowerCase();
      if (input === 'off') {
        delete cfg[chatId];
        saveDB('warn-expiry.json', cfg);
        return reply(`🔄 *WARN EXPIRY — OFF*\n\nWarnings in this group no longer expire. They're permanent until manually cleared.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const days = parseInt(input);
      if (isNaN(days) || days < 1) return reply(h.demonError('.warnexpiry', '.warnexpiry <days 1-365> | .warnexpiry off'));
      cfg[chatId] = { days, setAt: Date.now() };
      saveDB('warn-expiry.json', cfg);
      const warnData = loadDB('warnings.json');
      if (warnData[chatId]) {
        const cutoff = Date.now() - days * 86400000;
        for (const [jid, w] of Object.entries(warnData[chatId])) {
          if (w.lastWarned && w.lastWarned < cutoff) { warnData[chatId][jid].count = 0; warnData[chatId][jid].reasons = []; }
        }
        saveDB('warnings.json', warnData);
      }
      reply(`⏳ *WARN EXPIRY SET*\n\nWarnings older than *${days} day(s)* will auto-clear in this group.\nExisting expired warnings have been cleared.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'groupquarantine',
    aliases: ['quarantine', 'isolatemember'],
    category: 'abysscommands',
    description: 'Restrict a flagged member to read-only without removing. Usage: groupquarantine @user | groupquarantine lift @user',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, args, reply, isOwner, isSudo }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender))
        return reply(h.demonFail('admins only'));
        if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!mentioned) return reply(h.demonError('.groupquarantine', '.groupquarantine @user — or .groupquarantine lift @user to restore'));
      const action = args[0]?.toLowerCase();
      const num = mentioned.split('@')[0];
      const qData = loadDB('quarantine.json');
      if (!qData[chatId]) qData[chatId] = {};
      if (action === 'lift') {
        delete qData[chatId][mentioned];
        saveDB('quarantine.json', qData);
        return reply(`🔓 *QUARANTINE LIFTED*\n\n@${num} can now send messages again.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      qData[chatId][mentioned] = { since: Date.now(), by: sender };
      saveDB('quarantine.json', qData);
      await sock.sendMessage(chatId, {
        text: `🔒 *QUARANTINE ACTIVE*\n\n@${num} is now in read-only mode.\nMessages from this member will be auto-deleted by the bot until lifted.\n\nLift: .groupquarantine lift @${num}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
        mentions: [mentioned]
      }, { quoted: msg });
    }
  },

  {
    command: 'announcementpin',
    aliases: ['pinannounce', 'postandpin'],
    category: 'abysscommands',
    description: 'Post an announcement and auto-pin it. Usage: announcementpin <message>',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, args, reply, isOwner, isSudo }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender))
        return reply(h.demonFail('admins only'));
        if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
      const announcement = args.join(' ');
      if (!announcement) return reply(h.demonError('.announcementpin', '.announcementpin <your announcement text>'));
      try {
        const sent = await sock.sendMessage(chatId, {
          text: `📌 *ANNOUNCEMENT*\n\n${announcement}\n\n— Crittix Empire 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        });
        if (sent?.key) {
          try { await sock.sendMessage(chatId, { pin: sent.key, type: 1 }); }
          catch {}
        }
        reply(`✅ Announcement posted${sent?.key ? ' and pinned' : ''}.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(h.demonFail(`announcement failed — ${e.message}`)); }
    }
  }

];
