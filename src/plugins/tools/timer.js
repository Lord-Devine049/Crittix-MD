/* TIMER.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');

module.exports = {
  command: 'timer',
  category: 'soultools',
  description: 'Set a countdown timer that pings you when done',
  execute: async ({ sock, msg, args, sender, senderNumber, chatId, prefix, reply }) => {
    const timerArg = args[0]?.toLowerCase();
    const timerLabel = args.slice(1).join(' ') || 'Timer';
    if (!timerArg) return reply(p.phrases.wrongUsage('provide a time and a label. example! .timer 30s check food. max is 1 hour.'));
    let ms = 0;
    if (timerArg.endsWith('s')) ms = parseInt(timerArg) * 1000;
    else if (timerArg.endsWith('m')) ms = parseInt(timerArg) * 60 * 1000;
    else if (timerArg.endsWith('h')) ms = parseInt(timerArg) * 60 * 60 * 1000;
    else if (!isNaN(parseInt(timerArg))) ms = parseInt(timerArg) * 1000;
    if (!ms || ms < 1000) return reply(`✘ ${h.toBoldItalic('Invalid time format')} ${h.demonEmoji()}\n\nUse: 30s, 5m, 1h`);
    if (ms > 3600000) return reply(`✘ ${h.toBoldItalic('Max timer is 1 hour')} ${h.demonEmoji()}`);
    const endTime = new Date(Date.now() + ms).toLocaleTimeString();
    await reply(`⏱️ ${h.toBoldItalic('Timer Set!')} ${h.demonEmoji()}\n\n⏰ ${h.toBoldItalic('Duration')}: ${timerArg}\n📝 ${h.toBoldItalic('Label')}: ${timerLabel}\n🕐 ${h.toBoldItalic('Ends at')}: ${endTime}\n\n💀 ${h.toBoldItalic("I'll ping you when it's done!")}`);
    setTimeout(async () => {
      try {
        await sock.sendMessage(chatId, { text: `⏰ ${h.toBoldItalic('TIMER DONE!')} ${h.demonEmoji()}\n\n@${senderNumber} ⏱️ ${h.toBoldItalic(timerArg)} ${h.toBoldItalic('timer finished!')}\n\n📝 ${h.toBoldItalic('Label')}: ${timerLabel}`, mentions: [sender] });
      } catch (e) {}
    }, ms);
  }
};
