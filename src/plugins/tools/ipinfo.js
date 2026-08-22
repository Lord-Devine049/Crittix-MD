const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = {
  command: 'ipinfo',
  aliases: [],
  category: 'soultools',
  description: 'Look up geolocation info for an IP address. Usage: ipinfo 8.8.8.8',
  execute: async ({ args, reply }) => {
    const ip = (args[0] || '').trim();
    if (!ip) return reply(p.phrases.wrongUsage('provide an ip address. example! .ipinfo 8.8.8.8'));

    try {
      const res = await axios.get(`https://ipinfo.io/${ip}/json`);
      const d = res.data;
      if (d.error) return reply('❌ *IP not found*');

      reply(
        `🌐 *IP Info*\n\n` +
        `🔢 *IP:* ${d.ip}\n` +
        `🏢 *Org:* ${d.org || '—'}\n` +
        `🌍 *Country:* ${d.country || '—'}\n` +
        `🏙️ *City:* ${d.city || '—'}\n` +
        `🗺️ *Region:* ${d.region || '—'}\n` +
        `⏰ *Timezone:* ${d.timezone || '—'}\n` +
        `📍 *Coords:* ${d.loc || '—'}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    } catch {
      reply('❌ *IP lookup failed* • Try again later');
    }
  }
};
