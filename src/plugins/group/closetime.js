if (!global.scheduledTimers) global.scheduledTimers = {};

// Accepts: "10m", "2h", "30s", "1d" — or old two-word form value+unit
function parseDelay(value, unit) {
  if (!value) return null;
  const str = String(value).toLowerCase();
  // Shorthand: 10m / 2h / 30s / 1d
  const short = str.match(/^(\d+)(s|m|h|d)$/);
  if (short) {
    const v = parseInt(short[1]);
    const u = short[2];
    const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return v * map[u];
  }
  // Plain number (seconds)
  const plain = str.match(/^(\d+)$/);
  if (plain && !unit) return parseInt(plain[1]) * 1000;
  // Legacy two-word: value + unit word
  const v = Number(value);
  if (!v || isNaN(v)) return null;
  const wordMap = { second: 1000, seconds: 1000, minute: 60000, minutes: 60000, hour: 3600000, hours: 3600000, day: 86400000, days: 86400000 };
  return wordMap[unit?.toLowerCase()] ? v * wordMap[unit.toLowerCase()] : null;
}

function formatDelay(args) {
  const str = String(args[0] || '').toLowerCase();
  if (/^\d+(s|m|h|d)$/.test(str) || /^\d+$/.test(str)) return str.endsWith('s') || str.endsWith('m') || str.endsWith('h') || str.endsWith('d') ? str : `${str}s`;
  return `${args[0]} ${args[1]}`;
}

module.exports = [
  {
    command: 'closetime',
    aliases: ['groupclose', 'closegroup', 'scheduleclose'],
    category: 'abysscommands',
    description: 'Close group after a delay. Usage: closetime 10 minute',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, args, reply }) => {
      const delay = parseDelay(args[0], args[1]);
      if (!delay) {
        return reply(
          `⏰ *closetime* [duration]\n` +
`_Examples:_ closetime 10m | closetime 2h | closetime 30s\n` +
`_Or legacy:_ closetime 10 minute`
        );
      }

      const label = formatDelay(args);
      if (global.scheduledTimers[`close:${chatId}`]) {
        clearTimeout(global.scheduledTimers[`close:${chatId}`]);
      }

      global.scheduledTimers[`close:${chatId}`] = setTimeout(async () => {
        try {
          await sock.groupSettingUpdate(chatId, 'announcement');
          await sock.sendMessage(chatId, {
            text: `*Group closed*\nOnly the strong can send messages now.`
          });
        } catch {}
      }, delay);

      reply(`⏳ *Group will close in ${label}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },
  {
    command: 'opentime',
    aliases: [ 'scheduleopen'],
    category: 'abysscommands',
    description: 'Open group after a delay. Usage: opentime 5 minute',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ sock, chatId, args, reply }) => {
      const delay = parseDelay(args[0], args[1]);
      if (!delay) {
        return reply(
          `⏰ *opentime* [duration]\n` +
`_Examples:_ opentime 5m | opentime 1h | opentime 30s\n` +
`_Or legacy:_ opentime 5 minute`
        );
      }

      const label = formatDelay(args);
      if (global.scheduledTimers[`open:${chatId}`]) {
        clearTimeout(global.scheduledTimers[`open:${chatId}`]);
      }

      global.scheduledTimers[`open:${chatId}`] = setTimeout(async () => {
        try {
          await sock.groupSettingUpdate(chatId, 'not_announcement');
          await sock.sendMessage(chatId, {
            text: `🔓 *Group opened*\nEveryone can send messages now.`
          });
        } catch {}
      }, delay);

      reply(`⏳ *Group will open in ${label}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }
];
