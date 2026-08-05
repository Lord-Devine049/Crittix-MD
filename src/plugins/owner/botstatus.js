/*
 * BOTSTATUS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h        = require('../../lib/helpers');
const bootTime = require('../../lib/boot-time');

module.exports = {
  command:['botstatus','bstatus'], category: 'voidsystem', description:'Full bot health report', ownerOnly:true,
  execute: async({ sock, reply, cfg }) => {
    try {
      const ram    = h.getRAMUsage();
      const uptime = bootTime.getRuntime();
      const groups = await sock.groupFetchAllParticipating().catch(()=>({}));
      const groupCount = Object.keys(groups).length;

      let txt = `╔═══════════════════════════════╗\n║ 🤖 *BOT STATUS*\n╚═══════════════════════════════╝\n\n`;
      txt    += `⏱️ Runtime: *${uptime}*\n`;
      txt    += `🧠 RAM: *${ram.used} MB / ${ram.total} MB*\n`;
      txt    += `💻 Platform: *${process.platform}*\n`;
      txt    += `⚡ Node: *${process.version}*\n`;
      txt    += `👥 Active groups: *${groupCount}*\n`;
      txt    += `🔧 Prefix: *${cfg.PREFIX || '.'}*\n`;
      txt    += `📦 Version: *${cfg.VERSION || '4.0.0'}*\n\n`;
      txt    += `么════════════════════════么`;
      reply(txt);
    } catch(e){ reply('failed — '+e.message); }
  }
};
