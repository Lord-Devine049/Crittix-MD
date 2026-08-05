/*
 * AURA-CMDS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const crittixAura = require('../../lib/crittix-aura');
const globalXP    = require('../../lib/global-xp');

module.exports = [
  {
    command: 'registeraura',
    aliases: ['regatura', 'joinaura'],
    category: 'arena',
    description: 'Register for the aura system',
    execute: async ({ sender, senderNumber, reply }) => {
      try {
        const result = crittixAura.registerUser(sender, senderNumber);
        if (!result.success && result.reason === 'already_registered')
          return reply(`😑 you're already registered\n\nuse *.myaura* to check your stats`);

        let text = `╔════════════════════════么\n║ ⚡ *AURA REGISTERED*\n╚════════════════════════么\n\n`;
        text    += `👤 @${senderNumber}\n⚡ Starting Aura: *0*\n🏆 Rank: *🥉 Novice*\n\n`;
        text    += `use *.farmaura* every 24h to earn aura\n么════════════════════════么`;
        reply(text);
      } catch (e) { reply('failed — ' + e.message); }
    }
  },

  {
    command: 'farmaura',
    aliases: ['farm'],
    category: 'arena',
    description: 'Farm aura once every 24 hours',
    execute: async ({ sender, senderNumber, reply }) => {
      try {
        const result = crittixAura.farmAura(sender, senderNumber);
        if (!result.success && result.reason === 'not_registered')
          return reply(`😑 you're not registered\n\nuse *.registeraura* first`);
        if (!result.success && result.reason === 'cooldown')
          return reply(`⏳ you already farmed today\n\ncome back in *${result.hours}h ${result.minutes}m*`);

        globalXP.addXP(sender, msg.pushName || senderNumber);
        const rank = crittixAura.getRank(result.newTotal);

        let text = `╔════════════════════════么\n║ 🌾 *AURA FARMED*\n╚════════════════════════么\n\n`;
        text    += `👤 @${senderNumber}\n✅ Earned: *+${result.reward} aura*\n`;
        text    += `⚡ Total: *${result.newTotal}*\n🏆 Rank: *${rank.title}*\n`;
        text    += `📊 Progress: [${rank.bar}] ${rank.progress}%\n\n`;
        text    += `come back in *24h* to farm again\n么════════════════════════么`;
        reply(text);
      } catch (e) { reply('failed — ' + e.message); }
    }
  }
];
