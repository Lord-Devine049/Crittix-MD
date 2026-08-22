const fs = require('fs');
const path = require('path');
const p = require('../../lib/phrases');


const SETTINGS_FILE = path.join(process.cwd(), 'database', 'antibeg.json');

function load() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); } catch { return {}; }
}
function save(data) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  command: 'antibeg',
  aliases: ['antibegging', 'nobeg'],
  category: 'darkprotection',
  description: 'Toggle anti-beg protection (deletes begging messages). Usage: antibeg on/off',
  groupOnly: true,
  adminOnly: true,
  execute: async ({ args, chatId, reply }) => {
    const data = load();
    const arg = (args[0] || '').toLowerCase();

    if (!arg) {
      const status = data[chatId]?.enabled ? 'ON ✅' : 'OFF ❌';
      return reply(
        `🙅 *Anti-Beg*\n\n` +
        `⚙️ Status: ${status}\n\n` +
        `📌 *Usage:*\n▸ antibeg on\n▸ antibeg off\n\n` +
        `_Deletes messages with begging phrases like "please send", "can I get", etc._\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }

    if (arg === 'on') {
      data[chatId] = { enabled: true };
      save(data);
      reply(p.phrases.success('anti-beg enabled. begging messages will be deleted.'));
    } else if (arg === 'off') {
      data[chatId] = { enabled: false };
      save(data);
      reply('❌ *Anti-Beg disabled*');
    } else {
      reply('❌ *Use:* antibeg on | antibeg off');
    }
  }
};
