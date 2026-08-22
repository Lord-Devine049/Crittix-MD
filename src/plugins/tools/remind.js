/*
 * REMIND.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Bot DMs you a reminder after X minutes/hours
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['remind', 'reminder'],
  category: 'soultools',
  description: 'Set a reminder — bot DMs you after X minutes/hours',
  execute: async ({ sock, msg, sender, args, reply }) => {
    // Usage: .remind 30m check the oven
    //        .remind 2h team meeting
    const timeArg = args[0];
    const message = args.slice(1).join(' ');

    if (!timeArg || !message)
      return reply(p.phrases.wrongUsage('provide a time and message. example! .remind 30m take your meds.'));

    let ms = 0;
    if (timeArg.endsWith('m')) ms = parseInt(timeArg) * 60 * 1000;
    else if (timeArg.endsWith('h')) ms = parseInt(timeArg) * 60 * 60 * 1000;
    else if (timeArg.endsWith('s')) ms = parseInt(timeArg) * 1000;
    else return reply(`😑 use format like *30m* (minutes), *2h* (hours), *30s* (seconds)`);

    if (!ms || ms <= 0 || ms > 24*60*60*1000)
      return reply(`😑 reminder must be between 1 second and 24 hours`);

    const timeStr = timeArg.endsWith('h')
      ? `${parseInt(timeArg)} hour${parseInt(timeArg)>1?'s':''}`
      : timeArg.endsWith('m')
      ? `${parseInt(timeArg)} minute${parseInt(timeArg)>1?'s':''}`
      : `${parseInt(timeArg)} second${parseInt(timeArg)>1?'s':''}`;

    reply(`⏰ Reminder set — I'll DM you in *${timeStr}*`);

    setTimeout(async () => {
      try {
        await sock.sendMessage(sender, {
          text:
            `╔════════════════════════么\n║ ⏰ *REMINDER*\n╚════════════════════════么\n\n` +
            `🔔 ${message}\n\n` +
            `么════════════════════════么`
        });
      } catch(_) {}
    }, ms);
  }
};
