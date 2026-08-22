/*
 * STATS.JS — Crittix-MD
 * Unified stats command. Replaces: rank, messagecount, mystats, activity,
 * groupstats, topcommands, topusers, observer-new, observer-new2,
 * engagementscore, retentionrate, peakhours, inactivealert, listinactive,
 * commandheatmap, weeklyreport, activitygraph, streak, topgroups.
 *
 * Usage:
 *   .stats           → your personal stats
 *   .stats group     → this group's stats
 *   .stats top       → top users + top commands
 *   .stats admin     → admin analytics (admin only)
 *   .stats groups    → top groups the bot is in (owner only)
 */
'use strict';

const h        = require('../../lib/helpers');
const observer = require('../../lib/observer');
const fs       = require('fs-extra');
const path     = require('path');
const p = require('../../lib/phrases');


const DB_DIR  = path.join(process.cwd(), 'database');
const loadDB  = (f) => { try { const p = path.join(DB_DIR, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {}; } catch { return {}; } };

// ── Rank titles ───────────────────────────────────────────
const RANK_TITLES = [
  [25000, '☠️ CRITTIX LEGEND'],
  [8000,  '👿 DEMON LORD'],
  [3000,  '😈 SHADOW PRINCE'],
  [1200,  '💀 DARK KNIGHT'],
  [500,   '🔥 FLAME WARRIOR'],
  [150,   '⚔️ WARRIOR'],
  [50,    '🗡️ FIGHTER'],
  [0,     '🌑 NEWCOMER'],
];
const getRankTitle = (msgs) => (RANK_TITLES.find(([t]) => msgs >= t) || [0, '🌑 NEWCOMER'])[1];

// ── Alias → subcommand routing ────────────────────────────
const CMD_MAP = {
  // personal
  rank: 'me', mystats: 'me', messagecount: 'me', msgcount: 'me', messages: 'me',
  activity: 'me', streak: 'me', engagementscore: 'me', engagescore: 'me', myscore: 'me',
  // group
  groupstats: 'group', weeklyreport: 'group', activitygraph: 'group',
  actgraph: 'group', messagegraph: 'group', reportweek: 'group', weekreport: 'group',
  // top lists
  topusers: 'top', topcommands: 'top', commandheatmap: 'top', cmdheatmap: 'top',
  // top groups (owner)
  topgroups: 'groups', activestgroups: 'groups', bestgroups: 'groups',
  // admin analytics
  retentionrate: 'admin', retention: 'admin', memberretain: 'admin',
  peakhours: 'admin', busyhours: 'admin', activehours: 'admin',
  inactivealert: 'admin', ghostlist: 'admin',
  listinactive: 'admin', kickinactive: 'admin',
};

const MEDALS = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
const medal  = (i) => MEDALS[i] || `${i+1}.`;

module.exports = {
  command: 'stats',
  aliases: Object.keys(CMD_MAP),
  category: 'voidsystem',
  description: 'All-in-one stats hub. Subcommands: me, group, top, admin, groups',

  execute: async ({ sock, msg, args, command, sender, senderNumber, chatId,
                    isGroupMsg, groupMetadata, isOwner: ownerBool, isSudo, reply }) => {

    const name    = msg.pushName || senderNumber;
    const groupId = isGroupMsg ? (groupMetadata?.id || chatId) : null;

    // Determine subcommand — alias takes priority, then explicit arg, then default
    let sub = CMD_MAP[command] || (args[0] || 'me').toLowerCase();

    // ══════════════════════════════════════════════════════
    // PERSONAL STATS  —  .stats  /  .stats me
    // ══════════════════════════════════════════════════════
    if (sub === 'me') {
      const userData  = observer.getUserStats(sender);
      const rankInfo  = observer.getRank(sender, groupId);
      const levelInfo = observer.getLevel(sender);
      const actData   = observer.getActivity(sender);
      const msgs      = userData?.messages  || 0;
      const cmds      = userData?.commands  || 0;
      const streak    = userData?.streak    || 1;
      const topCmd    = userData?.topCommand;
      const peakHour  = actData?.peakHour   ?? -1;
      const rankTitle = getRankTitle(msgs);

      // Engagement score
      const actDB    = loadDB('activity.json');
      const actPts   = actDB[chatId]?.[sender] || 0;
      const xpRaw    = (() => { try { return require('../../lib/global-xp').getXP(sender); } catch { return 0; } })();
      const xp       = (typeof xpRaw === 'object' && xpRaw !== null) ? (xpRaw.xp || 0) : (Number(xpRaw) || 0);
      const balRaw   = (() => { try { return require('../../lib/vault').getBalance(sender)?.balance || 0; } catch { return 0; } })();
      const bal      = Number(balRaw) || 0;
      const score    = Math.round(actPts * 2 + xp * 1.5 + Math.min(bal / 100, 200));
      const rating   = score > 500 ? 'LEGEND 🌟' : score > 200 ? 'ACTIVE 🔥' : score > 50 ? 'REGULAR 👍' : 'GHOST 👻';

      let txt = `╔═══════════════════════════════╗\n║ 📊 𝐘𝐎𝐔𝐑 𝐒𝐓𝐀𝐓𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `👤 *${name}*\n`;
      txt += `${rankTitle}\n\n`;
      txt += `💬 Messages: *${msgs.toLocaleString()}*\n`;
      txt += `⌨️ Commands: *${cmds.toLocaleString()}*\n`;
      txt += `🔥 Streak: *${streak} day${streak !== 1 ? 's' : ''}*\n`;
      if (topCmd) txt += `🎯 Top cmd: *.${topCmd.name}* (${topCmd.count}×)\n`;
      if (peakHour >= 0) txt += `⏰ Most active: *${String(peakHour).padStart(2, '0')}:00*\n`;
      txt += `\n📈 Level ${levelInfo.level} [${levelInfo.progressBar}]\n`;
      txt += `${msgs.toLocaleString()} / ${levelInfo.nextLevel.toLocaleString()} msgs to next\n`;
      if (rankInfo?.rank) txt += `\n🏆 Rank: *#${rankInfo.rank}* of ${rankInfo.total}\n`;
      txt += `\n🎖️ Engagement: *${rating}* (${score} pts)\n`;
      if (userData?.memberSince) txt += `📅 Since: ${userData.memberSince}\n`;
      txt += `\n💀 _Keep grinding to rank up_ 🩸`;
      return reply(txt);
    }

    // ══════════════════════════════════════════════════════
    // GROUP STATS  —  .stats group
    // ══════════════════════════════════════════════════════
    if (sub === 'group') {
      if (!isGroupMsg) return reply(p.phrases.error('Group only.'));
      const stats       = observer.getGroupStats(groupId);
      const memberCount = groupMetadata?.participants?.length || 0;
      const isAdmin     = await h.isSenderAdmin(sock, chatId, sender).catch(() => false);

      const actDB    = loadDB('activity.json');
      const groupAct = actDB[chatId] || {};
      const active   = Object.keys(groupAct).filter(j => groupAct[j] > 0).length;
      const rate     = memberCount > 0 ? ((active / memberCount) * 100).toFixed(1) : 0;
      const health   = Number(rate) > 70 ? '✅ Healthy' : Number(rate) > 40 ? '⚠️ Moderate' : '🔴 Poor';

      let txt = `╔═══════════════════════════════╗\n║ 📊 𝐆𝐑𝐎𝐔𝐏 𝐒𝐓𝐀𝐓𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `👥 *${groupMetadata?.subject || 'Unknown'}*\n`;
      txt += `👤 Members: *${memberCount}*\n`;
      txt += `💬 Messages tracked: *${(stats?.messages || 0).toLocaleString()}*\n`;
      txt += `⌨️ Commands used: *${(stats?.commands || 0).toLocaleString()}*\n`;

      const topUsers = Array.isArray(stats?.topUsers) ? stats.topUsers : [];
      if (topUsers.length) {
        txt += `\n🔥 *Most Active:*\n`;
        topUsers.forEach(([jid, count], i) => {
          txt += `${medal(i)} @${jid.split('@')[0]} — ${count.toLocaleString()} msgs\n`;
        });
      }

      if (isAdmin || ownerBool || isSudo) {
        txt += `\n📈 *Retention:* ${rate}% — ${health}\n`;
        txt += `(${active} active / ${memberCount} total)\n`;
      }

      txt += `\n💀 _Observer stats_ 🩸`;
      const mentions = topUsers.map(([jid]) => jid);
      if (mentions.length) return sock.sendMessage(chatId, { text: txt, mentions }, { quoted: msg });
      return reply(txt);
    }

    // ══════════════════════════════════════════════════════
    // TOP LISTS  —  .stats top
    // ══════════════════════════════════════════════════════
    if (sub === 'top') {
      const topUsers = observer.getTopUsers(groupId, 10);
      const topCmds  = observer.getTopCommands(10);

      let txt = `╔═══════════════════════════════╗\n║ 🏆 𝐓𝐎𝐏 𝐋𝐈𝐒𝐓𝐒\n╚═══════════════════════════════╝\n`;

      if (topUsers.length) {
        txt += `\n*${isGroupMsg ? '👥 Top Users (This Group)' : '🌐 Top Users (Global)'}:*\n`;
        topUsers.forEach((u, i) => {
          const n = u.pushName || u.jid.split('@')[0];
          txt += `${medal(i)} @${u.jid.split('@')[0]} — ${u.count.toLocaleString()} msgs\n`;
        });
      } else {
        txt += `\n📊 No user data yet — send some messages!\n`;
      }

      if (topCmds.length) {
        txt += `\n*🎯 Top Commands (All-time):*\n`;
        topCmds.forEach((cmd, i) => {
          txt += `${medal(i)} .${cmd.name} — ${cmd.count.toLocaleString()} uses\n`;
        });
      } else {
        txt += `\n📊 No command data yet.\n`;
      }

      txt += `\n💀 _All-time rankings_ 🩸`;
      const mentions = topUsers.map(u => u.jid);
      if (mentions.length) return sock.sendMessage(chatId, { text: txt, mentions }, { quoted: msg });
      return reply(txt);
    }

    // ══════════════════════════════════════════════════════
    // TOP GROUPS  —  .stats groups  (owner only)
    // ══════════════════════════════════════════════════════
    if (sub === 'groups') {
      if (!ownerBool && !isSudo) return reply(p.phrases.error('Owner only.'));

      // Read observer.json directly — has real group names and message counts
      let obsDB = {};
      try { obsDB = JSON.parse(fs.readFileSync(path.join(DB_DIR, 'observer.json'), 'utf8')); } catch {}

      const groups = Object.entries(obsDB.groups || {})
        .sort((a, b) => b[1].messages - a[1].messages)
        .slice(0, 10);

      if (!groups.length) return reply(p.phrases.error('No group data yet.'));

      let txt = `╔═══════════════════════════════╗\n║ 🌐 𝐓𝐎𝐏 𝐆𝐑𝐎𝐔𝐏𝐒\n╚═══════════════════════════════╝\n\n`;
      for (let i = 0; i < groups.length; i++) {
        const [gid, g] = groups[i];
        let members = '?';
        try {
          const meta = await sock.groupMetadata(gid);
          members = meta.participants.length;
          if (meta.subject) g.name = meta.subject; // refresh name live
        } catch {}
        txt += `${medal(i)} *${g.name || gid.split('@')[0]}* — ${(g.messages || 0).toLocaleString()} msgs (${members} members)\n`;
      }
      txt += `\n💀 _Bot group rankings_ 🩸`;
      return reply(txt);
    }

    // ══════════════════════════════════════════════════════
    // ADMIN ANALYTICS  —  .stats admin  (admins only)
    // ══════════════════════════════════════════════════════
    if (sub === 'admin') {
      if (!isGroupMsg) return reply(p.phrases.error('Group only.'));
      const isAdmin = await h.isSenderAdmin(sock, chatId, sender).catch(() => false);
      if (!isAdmin) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());

      let meta;
      try { meta = await sock.groupMetadata(chatId); } catch { return reply(p.phrases.error('Could not fetch group info.')); }

      const total    = meta.participants.length;
      const actDB    = loadDB('activity.json');
      const groupAct = actDB[chatId] || {};
      const active   = Object.keys(groupAct).filter(j => groupAct[j] > 0).length;
      const rate     = total > 0 ? ((active / total) * 100).toFixed(1) : 0;
      const health   = Number(rate) > 70 ? '✅ Healthy' : Number(rate) > 40 ? '⚠️ Moderate' : '🔴 Poor';

      // Peak hours from peakhours.json
      const hoursDB    = loadDB('peakhours.json');
      const groupHours = hoursDB[chatId] || {};
      const hourEntries = Object.entries(groupHours).sort((a, b) => b[1] - a[1]).slice(0, 5);

      // Inactive members
      const inactive = meta.participants.filter(m => {
        const jid = m.id;
        return !groupAct[jid] || groupAct[jid] === 0;
      });

      let txt = `╔═══════════════════════════════╗\n║ 🔐 𝐀𝐃𝐌𝐈𝐍 𝐀𝐍𝐀𝐋𝐘𝐓𝐈𝐂𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `👥 *${meta.subject}*\n`;
      txt += `👤 Members: ${total}\n\n`;

      txt += `📈 *Retention*\n`;
      txt += `${active}/${total} active (${rate}%) — ${health}\n\n`;

      if (hourEntries.length) {
        const maxHr = hourEntries[0][1] || 1;
        txt += `⏰ *Peak Hours*\n`;
        for (const [hr, count] of hourEntries) {
          const bars = Math.max(1, Math.round((count / maxHr) * 8));
          txt += `${String(hr).padStart(2, '0')}:00 ${'█'.repeat(bars)} ${count}\n`;
        }
        txt += '\n';
      } else {
        txt += `⏰ *Peak Hours:* No data yet\n\n`;
      }

      if (inactive.length) {
        txt += `👻 *Inactive Members (${inactive.length})*\n`;
        txt += inactive.slice(0, 12).map((m, i) => `${i + 1}. @${m.id.split('@')[0]}`).join('\n');
        if (inactive.length > 12) txt += `\n...+${inactive.length - 12} more`;
        txt += '\n\nKick with *.kickinactive*';
      } else {
        txt += `✅ No inactive members!`;
      }

      txt += `\n\n💀 _Admin eyes only_ 🩸`;
      return reply(txt);
    }

    // ══════════════════════════════════════════════════════
    // HELP  —  unknown subcommand
    // ══════════════════════════════════════════════════════
    return reply(
      `╔═══════════════════════════════╗\n║ 📊 𝐒𝐓𝐀𝐓𝐒 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒\n╚═══════════════════════════════╝\n\n` +
      `*.stats*         — your personal stats\n` +
      `*.stats group*   — group stats + top users\n` +
      `*.stats top*     — top users & commands\n` +
      `*.stats admin*   — admin analytics (admins only)\n` +
      `*.stats groups*  — top groups bot is in (owner)\n\n` +
      `_Old commands (rank, mystats, topusers, groupstats, etc.) all route here automatically._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
    );
  }
};
