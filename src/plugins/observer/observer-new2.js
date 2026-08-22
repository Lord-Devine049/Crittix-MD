/*
 * OBSERVER-NEW2.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Commands: commandheatmap
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };

module.exports = [

  {
    command: 'commandheatmap',
    aliases: ['cmdheatmap', 'heatmaplive'],
    category: 'groupanalytics',
    description: 'Show which commands are used most in this group over the past week. Usage: commandheatmap',
    groupOnly: true,
    execute: async ({ chatId, reply }) => {
      const cmdLog = loadDB('command-log.json');
      const groupLog = cmdLog[chatId] || {};
      const now = Date.now();
      const weekAgo = now - 604800000;
      const tallied = {};
      for (const [cmd, entries] of Object.entries(groupLog)) {
        if (!Array.isArray(entries)) { tallied[cmd] = (tallied[cmd] || 0) + (entries || 0); continue; }
        const recent = entries.filter(ts => ts > weekAgo).length;
        if (recent > 0) tallied[cmd] = recent;
      }
      if (!Object.keys(tallied).length) return reply(p.phrases.error('no command usage data for this group in the past week. Use some commands first.'));
      const sorted = Object.entries(tallied).sort((a, b) => b[1] - a[1]).slice(0, 15);
      const max = sorted[0][1];
      const bar = (count) => {
        const filled = Math.round((count / max) * 10);
        return '█'.repeat(filled) + '░'.repeat(10 - filled);
      };
      const lines = sorted.map(([cmd, count], i) => `${String(i + 1).padStart(2, ' ')}. .${cmd.padEnd(18)} ${bar(count)} ${count}`).join('\n');
      reply(`🔥 *COMMAND HEATMAP — This Group (7 days)*\n\n\`\`\`\n${lines}\`\`\`\n\nThese are the moves your group lives by. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }

];
