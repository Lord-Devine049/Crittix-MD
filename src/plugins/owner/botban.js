/*
 * BOTBAN.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: ban, unban, banlist
 * Bot-wide ban system — banned users get auto-kicked from any group the bot is in
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB_FILE = 'bot-banlist.json';
const DB = () => path.join(process.cwd(), 'database', DB_FILE);
const loadBans = () => { try { return fs.existsSync(DB()) ? JSON.parse(fs.readFileSync(DB(), 'utf8')) : { banned: {} }; } catch { return { banned: {} }; } };
const saveBans = (data) => { try { fs.ensureDirSync(path.dirname(DB())); fs.writeFileSync(DB(), JSON.stringify(data, null, 2)); } catch {} };

module.exports = [

  {
    command: 'ban',
    aliases: ['gban', 'botban'],
    category: 'voidsystem',
    description: 'Bot-wide ban a user (auto-kicked from all groups bot is in). ownerOnly. Usage: .ban @user [reason]',
    ownerOnly: true,
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
      const targetJid = mentioned || quoted;
      if (!targetJid) return reply(p.phrases.wrongUsage('tag or reply to the user you want to ban. optionally add a reason. example! .ban @user spamming'));

      const num = targetJid.split('@')[0];
      const reason = args.slice(mentioned ? 1 : 0).join(' ') || 'No reason given. You know what you did.';
      const data = loadBans();

      if (data.banned[targetJid]) return reply(p.phrases.error(`@${num} is already bot-banned. Already done.`));

      data.banned[targetJid] = { reason, bannedAt: Date.now(), bannedBy: msg.key?.participant || msg.key?.remoteJid };
      saveBans(data);

      // Attempt to kick from all common groups
      let kicked = 0;
      try {
        const groups = Object.keys(await sock.groupFetchAllParticipating() || {});
        for (const g of groups) {
          try {
            const meta = await sock.groupMetadata(g);
            const inGroup = meta.participants.find(p => p.id === targetJid);
            if (inGroup) {
              await sock.groupParticipantsUpdate(g, [targetJid], 'remove');
              kicked++;
              await h.sleep(300);
            }
          } catch {}
        }
      } catch {}

      reply(
        `🔨 *BOT-WIDE BAN EXECUTED*\n\n` +
        `👤 User: @${num}\n` +
        `📝 Reason: ${reason}\n` +
        `💀 Kicked from: ${kicked} group(s)\n\n` +
        `They are no longer welcome anywhere I operate.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'unban',
    aliases: ['gunban', 'botunban'],
    category: 'voidsystem',
    description: 'Remove a user from the bot-wide ban list. ownerOnly. Usage: .unban @user',
    ownerOnly: true,
    execute: async ({ msg, args, reply }) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const targetJid = mentioned || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
      if (!targetJid) return reply(p.phrases.wrongUsage('tag the user you want to unban. example! .unban @user'));

      const num = targetJid.split('@')[0];
      const data = loadBans();

      if (!data.banned[targetJid]) return reply(p.phrases.error(`@${num} isn't bot-banned. Check your list.`));

      delete data.banned[targetJid];
      saveBans(data);
      reply(p.phrases.success(`@${num} unbanned.`));
    }
  },

  {
    command: 'banlist',
    aliases: ['botbanlist', 'gbanlist'],
    category: 'voidsystem',
    description: 'View all bot-wide banned users. ownerOnly.',
    ownerOnly: true,
    execute: async ({ reply }) => {
      const data = loadBans();
      const entries = Object.entries(data.banned || {});
      if (!entries.length) return reply(`🔨 *BOT BAN LIST*\n\nEmpty. You're running a charity here.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);

      const list = entries.map(([jid, info], i) => {
        const num = jid.split('@')[0];
        const date = new Date(info.bannedAt).toLocaleDateString();
        return `${i + 1}. @${num}\n   📝 ${info.reason}\n   📅 ${date}`;
      }).join('\n\n');

      reply(`🔨 *BOT BAN LIST (${entries.length})*\n\n${list}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }

];
