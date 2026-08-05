const fs = require('fs');
const path = require('path');

const WARNS_FILE = path.join(process.cwd(), 'database', 'warns.json');

function load() {
  try { return JSON.parse(fs.readFileSync(WARNS_FILE, 'utf8')); } catch { return {}; }
}

module.exports = {
  command: 'warns',
  aliases: ['checkwarns', 'warnlist', 'mywarns'],
  category: 'abysscommands',
  description: 'Check how many warns a user has. Mention or reply to check another user.',
  groupOnly: true,
  execute: async ({ msg, sender, chatId, reply }) => {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      sender;

    const data = load();
    const key = `${chatId}:${target}`;
    const count = data[key]?.count || 0;
    const history = data[key]?.reasons || [];
    const num = target.split('@')[0];

    let out =
      `⚠️ *Warn Record*\n\n` +
      `👤 +${num}\n` +
      `🔢 *Warns:* ${count}/3\n`;

    if (history.length) {
      out += `\n📋 *Reasons:*\n`;
      history.forEach((r, i) => { out += `${i + 1}. ${r}\n`; });
    }

    out += `\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
    reply(out, [target]);
  }
};
