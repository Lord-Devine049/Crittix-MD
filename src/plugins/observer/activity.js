/* ACTIVITY.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const observer = require('../../lib/observer');
module.exports = {
  command: 'activity',
  category: 'groupanalytics',
  description: 'Show your activity summary (hourly activity chart)',
  execute: async ({ msg, sender, senderNumber, reply }) => {
    try {
      const name = msg.pushName || senderNumber;
      const activityData = observer.getActivity(sender);
      if (!activityData) return reply(`✘ ${h.toBoldItalic('No activity data yet')} ${h.demonEmoji()}\n\nSend some messages first!`);
      const hours = activityData.hours || new Array(24).fill(0);
      const maxMsgs = Math.max(...hours, 1);
      const peakHour = activityData.peakHour;
      let txt = `╔═══════════════════════════════╗\n║ 📈 𝐀𝐂𝐓𝐈𝐕𝐈𝐓𝐘\n╚═══════════════════════════════╝\n\n`;
      txt += `👤 ${h.toBoldItalic(name)}\n🔥 ${h.toBoldItalic('Streak')}: ${activityData.streak || 1} days\n\n`;
      txt += `📊 ${h.toBoldItalic('Top Active Hours')}:\n`;
      const peakHours = hours.map((c,i) => ({h:i,c})).sort((a,b) => b.c - a.c).slice(0,5);
      peakHours.forEach(({h: hr, c}) => {
        const barLen = Math.round((c / maxMsgs) * 8);
        const bar = '█'.repeat(barLen) + '░'.repeat(8 - barLen);
        txt += `${String(hr).padStart(2,'0')}:00 ${bar} ${c}\n`;
      });
      txt += `\n⏰ ${h.toBoldItalic('Peak Hour')}: ${peakHour}:00\n`;
      txt += `📊 ${h.toBoldItalic('Total Tracked')}: ${hours.reduce((a,b) => a+b, 0)} messages\n`;
      txt += `\n💀 ${h.toBoldItalic('Keep being active')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) { return reply(`✘ ${h.toBoldItalic('Failed to load activity')} ${h.demonEmoji()}`); }
  }
};
