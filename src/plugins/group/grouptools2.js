const h = require('../../lib/helpers');
const db = require('../../lib/db');
const p = require('../../lib/phrases');


module.exports = [
  {
    command: 'gcsettings',
    aliases: ['groupsettings', 'gsets'],
    category: 'abysscommands',
    description: 'Display full group settings and configuration',
    groupOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        const meta = await sock.groupMetadata(chatId);
        const admins = meta.participants.filter(p => p.admin).map(p => `+${p.id.split('@')[0]}`);
        const settings = meta.announce ? '🔇 Announcement (admins only)' : '🔊 Open (everyone can message)';
        const linked = meta.linkedParent ? '✅ Linked to community' : '❌ Standalone group';
        reply(
          `╔════════════════════════么\n` +
          `║ ⚙️ *Group Settings*\n` +
          `╠════════════════════════么\n` +
          `║ 📛 Name: *${meta.subject}*\n` +
          `║ 👥 Members: *${meta.participants.length}*\n` +
          `║ 👑 Admins: *${admins.length}*\n` +
          `║ 💬 Messaging: *${settings}*\n` +
          `║ 🔗 Community: *${linked}*\n` +
          `║ 📅 Created: *${new Date(meta.creation * 1000).toLocaleDateString()}*\n` +
          `╚════════════════════════么`
        );
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'admincount',
    aliases: ['countadmins', 'howmanyadmins'],
    category: 'abysscommands',
    description: 'Count how many admins are in the group',
    groupOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        const meta = await sock.groupMetadata(chatId);
        const admins = meta.participants.filter(p => p.admin);
        const superAdmins = meta.participants.filter(p => p.admin === 'superadmin');
        reply(
          `👑 *Admin Count*\n\n` +
          `🏆 Super Admin(s): *${superAdmins.length}*\n` +
          `⭐ Admins: *${admins.length - superAdmins.length}*\n` +
          `📊 Total Admins: *${admins.length}*\n` +
          `👥 Total Members: *${meta.participants.length}*`
        );
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'membercount',
    aliases: ['countmembers', 'membernum'],
    category: 'abysscommands',
    description: 'Show precise member count with breakdown',
    groupOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        const meta = await sock.groupMetadata(chatId);
        const admins = meta.participants.filter(p => p.admin).length;
        const regular = meta.participants.length - admins;
        reply(
          `👥 *${meta.subject} — Members*\n\n` +
          `👑 Admins: *${admins}*\n` +
          `👤 Regular: *${regular}*\n` +
          `📊 *Total: ${meta.participants.length}*`
        );
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'groupage',
    aliases: ['gcage', 'groupbirthday'],
    category: 'abysscommands',
    description: 'Show how old this group is',
    groupOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        const meta = await sock.groupMetadata(chatId);
        const created = meta.creation * 1000;
        const now = Date.now();
        const diff = now - created;
        const days = Math.floor(diff / 86400000);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        const birthday = new Date(created).toDateString();
        reply(
          `🎂 *Group Age*\n\n` +
          `📛 *${meta.subject}*\n` +
          `📅 Created: *${birthday}*\n` +
          `⏳ Age: *${years}y ${months % 12}m ${days % 30}d*\n` +
          `(${days} days old)`
        );
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'setannounce',
    aliases: ['announce2', 'groupannounce'],
    category: 'abysscommands',
    description: 'Set announcement mode (only admins can message)',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        await sock.groupSettingUpdate(chatId, 'announcement');
        reply('🔇 *Announcement mode ON*\n\nOnly admins can send messages now.');
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'opengroup',
    aliases: ['unannounce', 'groupopen'],
    category: 'abysscommands',
    description: 'Open group for everyone to message',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        reply('🔊 *Group opened*\n\nEveryone can send messages now.');
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'lockedit',
    aliases: ['lockeditinfo', 'noeditnfo'],
    category: 'abysscommands',
    description: 'Lock group info editing to admins only',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        await sock.groupSettingUpdate(chatId, 'locked');
        reply('🔒 *Group info locked*\n\nOnly admins can edit group info now.');
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'unlockedit',
    aliases: ['unlockeditinfo', 'alloweditnfo'],
    category: 'abysscommands',
    description: 'Allow everyone to edit group info',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        await sock.groupSettingUpdate(chatId, 'unlocked');
        reply('🔓 *Group info unlocked*\n\nEveryone can edit group info now.');
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'setrules',
    aliases: ['grouprules', 'setrule'],
    category: 'abysscommands',
    description: 'Set group rules. Usage: setrules Rule 1 | Rule 2 | Rule 3',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ text, chatId, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('separate your rules with pipes. example! .setrules no spam "respect everyone" english only.'));
      const rules = text.split('|').map((r,i) => `${i+1}. ${r.trim()}`);
      const stored = rules.join('\n');
      // Store in global for this session
      if (!global.groupRules) global.groupRules = {};
      global.groupRules[chatId] = stored;
      reply(`📜 *Group Rules Set!*\n\n${stored}\n\n_Use .getrules to display them_`);
    }
  },
  {
    command: 'getrules',
    aliases: ['rules', 'showrules'],
    category: 'abysscommands',
    description: 'Display the group rules',
    groupOnly: true,
    execute: async ({ chatId, reply }) => {
      if (!global.groupRules || !global.groupRules[chatId]) {
        return reply('📜 *No rules set*\n\n_Admins can set rules with .setrules_');
      }
      reply(`📜 *Group Rules*\n\n${global.groupRules[chatId]}`);
    }
  },
  {
    command: 'warnreset',
    aliases: ['resetallwarns', 'clearwarns'],
    category: 'abysscommands',
    description: 'Reset ALL member warns in the group',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        const meta = await sock.groupMetadata(chatId);
        let cleared = 0;
        for (const p of meta.participants) {
          try { db.resetWarns(chatId, p.id); cleared++; } catch(_) {}
        }
        reply(`🗑️ *All warns cleared*\n\nReset warns for ${cleared} members.`);
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'invitelink',
    aliases: ['getinvite', 'gclink3'],
    category: 'abysscommands',
    description: 'Get the group invite link',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        const code = await sock.groupInviteCode(chatId);
        reply(`🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}`);
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'muteall',
    aliases: ['silencegroup', 'quietgroup'],
    category: 'forbiddenarts',
    description: 'Mute group — only admins can send messages',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        await sock.groupSettingUpdate(chatId, 'announcement');
        reply('🔇 *Group muted*\n\nOnly admins can send messages now. Use .unmuteall to reverse.');
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'unmuteall',
    aliases: ['unsilencegroup', 'openall'],
    category: 'forbiddenarts',
    description: 'Unmute group — everyone can message again',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, reply }) => {
      try {
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        reply('🔊 *Group unmuted*\n\nEveryone can send messages now.');
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'pinmsg',
    aliases: ['pin', 'pinmessage'],
    category: 'abysscommands',
    description: 'Pin the replied-to message',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, msg, reply }) => {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const quotedId = ctx?.stanzaId;
      const participant = ctx?.participant || ctx?.remoteJid;
      if (!quotedId) return reply('📌 *Reply to a message to pin it*');
      try {
        // Baileys pin message API
        await sock.sendMessage(chatId, {
          pin: {
            key: {
              remoteJid: chatId,
              id: quotedId,
              participant: participant || undefined
            },
            type: 1,   // 1 = pin, 2 = unpin
            time: 604800  // 7 days (max WhatsApp allows)
          }
        });
        reply('📌 *Message pinned successfully*');
      } catch (e) {
        reply(`❌ *Failed to pin message* • ${e.message}\n\n_Make sure the bot is admin_`);
      }
    }
  },
];
