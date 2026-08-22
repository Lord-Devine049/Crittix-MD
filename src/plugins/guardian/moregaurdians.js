
const db = require('../../lib/db');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = [
  {
    command: 'anticapital',
    aliases: ['noshout', 'nocaps'],
    category: 'darkprotection',
    description: 'Toggle anti-all-caps in group — anticapital on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ chatId, args, prefix, reply }) => {
      if (!global.antiCaps) global.antiCaps = {};
      const arg = (args[0] || '').toLowerCase();
      if (!arg) {
        const cur = global.antiCaps[chatId] ? '🟢 ON' : '🔴 OFF';
        return reply(`🔇 *Anti-Caps*\n\nCurrent: ${cur}\n\nUsage:\n• ${prefix}anticapital on\n• ${prefix}anticapital off`);
      }
      if (arg !== 'on' && arg !== 'off') return reply(p.phrases.wrongUsage('use .anticapital on or .anticapital off. nothing else.'));
      const state = arg === 'on';
      global.antiCaps[chatId] = state;
      reply(`${state ? '🔇' : '🔊'} *Anti-Caps ${state ? 'ENABLED' : 'DISABLED'}*\n\n${state ? 'ALL CAPS messages will be deleted.' : 'Caps messages are allowed.'}`);
    }
  },
  {
    command: 'antisticker',
    aliases: ['nosticker', 'blocksticker'],
    category: 'darkprotection',
    description: 'Toggle anti-sticker mode in group — antisticker on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ chatId, args, prefix, reply }) => {
      if (!global.antiSticker) global.antiSticker = {};
      const arg = (args[0] || '').toLowerCase();
      if (!arg) {
        const cur = global.antiSticker[chatId] ? '🟢 ON' : '🔴 OFF';
        return reply(`🎭 *Anti-Sticker*\n\nCurrent: ${cur}\n\nUsage:\n• ${prefix}antisticker on\n• ${prefix}antisticker off`);
      }
      if (arg !== 'on' && arg !== 'off') return reply(p.phrases.wrongUsage('use .antisticker on or .antisticker off. nothing else.'));
      const state = arg === 'on';
      global.antiSticker[chatId] = state;
      reply(`${state ? '🚫' : '✅'} *Anti-Sticker ${state ? 'ENABLED' : 'DISABLED'}*\n\n${state ? 'Stickers will be deleted.' : 'Stickers are allowed.'}`);
    }
  },
  {
    command: 'antiemoji',
    aliases: ['noemoji', 'blockemoji'],
    category: 'darkprotection',
    description: 'Toggle anti-emoji-only messages in group — antiemoji on/off',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ chatId, args, prefix, reply }) => {
      if (!global.antiEmoji) global.antiEmoji = {};
      const arg = (args[0] || '').toLowerCase();
      if (!arg) {
        const cur = global.antiEmoji[chatId] ? '🟢 ON' : '🔴 OFF';
        return reply(`🚫 *Anti-Emoji-Only*\n\nCurrent: ${cur}\n\nUsage:\n• ${prefix}antiemoji on\n• ${prefix}antiemoji off`);
      }
      if (arg !== 'on' && arg !== 'off') return reply(p.phrases.wrongUsage('use .antiemoji on or .antiemoji off. nothing else.'));
      const state = arg === 'on';
      global.antiEmoji[chatId] = state;
      reply(`${state ? '🚫' : '✅'} *Anti-Emoji-Only ${state ? 'ENABLED' : 'DISABLED'}*\n\n${state ? 'Emoji-only messages will be deleted.' : 'Emoji-only messages allowed.'}`);
    }
  },
  {
    command: 'guardianstatus',
    aliases: ['gcguard', 'checkguardian'],
    category: 'darkprotection',
    description: 'Show all guardian settings for the group',
    groupOnly: true,
    execute: async ({ chatId, reply }) => {
      const g = (map, id) => (map && map[id]) ? '🟢 ON' : '🔴 OFF';
      const d = (feat) => db.getAnti(chatId, feat) ? '🟢 ON' : '🔴 OFF';
      reply(
        `🛡️ *Guardian Status*\n\n` +
        `🔗 AntiLink: ${d('antilink')}\n` +
        `🤖 AntiBot: ${d('antibot')}\n` +
        `📢 AntiSpam: ${d('antispam')}\n` +
        `🤬 AntiSwear: ${d('antiswear')}\n` +
        `🏷️ AntiTagAll: ${d('antitagall')}\n` +
        `📤 AntiForward: ${d('antiforward')}\n` +
        `📣 AntiStatusMention: ${d('antistatusmention')}\n` +
        `🔤 AntiCaps: ${g(global.antiCaps, chatId)}\n` +
        `🎭 AntiSticker: ${g(global.antiSticker, chatId)}\n` +
        `😀 AntiEmoji-Only: ${g(global.antiEmoji, chatId)}\n\n` +
        `_Use commands to toggle each setting_`
      );
    }
  },
  {
    command: 'slowmode',
    aliases: ['cooldown', 'msgcooldown'],
    category: 'darkprotection',
    description: 'Set message cooldown. Usage: slowmode 30s / 2m / 1h — or "slowmode off"',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ args, chatId, prefix, reply }) => {
      if (!global.slowMode) global.slowMode = {};
      if (!global.slowModeLast) global.slowModeLast = {};

      const raw = (args[0] || '').toLowerCase();

      if (!raw) {
        const cur = global.slowMode[chatId];
        const curStr = cur ? `${cur / 1000}s` : 'OFF';
        return reply(
          `🐌 *Slow Mode*\n\nCurrent: *${curStr}*\n\n` +
          `📌 *Usage:*\n` +
          `▸ ${prefix}slowmode 30s  — 30 seconds\n` +
          `▸ ${prefix}slowmode 2m   — 2 minutes\n` +
          `▸ ${prefix}slowmode 1h   — 1 hour\n` +
          `▸ ${prefix}slowmode off  — disable`
        );
      }

      if (raw === 'off' || raw === '0') {
        delete global.slowMode[chatId];
        return reply(p.phrases.success('slow mode disabled.'));
      }

      // Parse shorthand: 30s, 2m, 1h — or plain number (seconds)
      let ms = null;
      const match = raw.match(/^(\d+)(s|m|h)?$/);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2] || 's';
        if (unit === 's') ms = val * 1000;
        else if (unit === 'm') ms = val * 60000;
        else if (unit === 'h') ms = val * 3600000;
      }

      if (!ms || ms <= 0) return reply(`❌ *Invalid format*\n\nUse: ${prefix}slowmode 30s / 2m / 1h`);

      global.slowMode[chatId] = ms;
      const label = raw.endsWith('s') || raw.endsWith('m') || raw.endsWith('h') ? raw : `${raw}s`;
      reply(`🐌 *Slow Mode: ${label}*\n\nUsers must wait ${label} between messages.`);
    }
  },
  {
    command: 'maxwarns',
    aliases: ['setwarnlimit', 'warnlimit'],
    category: 'darkprotection',
    description: 'Set max warns before kick. Usage: maxwarns 3',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ args, chatId, reply }) => {
      const max = parseInt(args[0]);
      if (isNaN(max) || max < 1 || max > 20) return reply(p.phrases.wrongUsage('provide a number between 1 and 20. example! .maxwarns 3'));
      if (!global.maxWarns) global.maxWarns = {};
      global.maxWarns[chatId] = max;
      reply(`⚠️ *Warn Limit Set: ${max}*\n\nMembers will be kicked after ${max} warnings.`);
    }
  },
];
