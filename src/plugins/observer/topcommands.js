/* TOPCOMMANDS.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const observer = require('../../lib/observer');
module.exports = {
  command: 'topcommands',
  aliases: [],
  category: 'groupanalytics',
  description: 'Show the most used commands globally',
  execute: async ({ reply }) => {
    try {
      const topCmds = observer.getTopCommands(10);
      if (topCmds.length === 0) return reply(`📊 ${h.toBoldItalic('No command data yet')} ${h.demonEmoji()}`);
      const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
      let txt = `╔═══════════════════════════════╗\n║ 🎯 𝐓𝐎𝐏 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒\n╚═══════════════════════════════╝\n\n`;
      topCmds.forEach((cmd,i) => { txt += `${medals[i]} .${cmd.name} — ${cmd.count.toLocaleString()} uses\n`; });
      txt += `\n💀 ${h.toBoldItalic('All-time rankings')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Failed to load command stats')} ${h.demonEmoji()}`);
    }
  }
};
