/*
 * GEOIP.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['geoip', 'iplookup'],
  category: 'soultools',
  description: 'Get geolocation info for any IP address',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const ip = args[0]?.trim();
    if (!ip) return reply('usage: .geoip <ip address>\nexample: .geoip 8.8.8.8');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/tools/geoip?ip=${encodeURIComponent(ip)}`,
        { timeout: 15000 }
      );

      if (!data?.status) return reply('❌ IP lookup failed');

      const d = data.data || data;
      await sock.sendMessage(chatId, {
        text:
          `🌐 *GeoIP Lookup*\n\n` +
          `📡 IP: *${ip}*\n` +
          `🌍 Country: ${d.country || d.country_name || 'N/A'}\n` +
          `🏙️ City: ${d.city || 'N/A'}\n` +
          `📍 Region: ${d.region || 'N/A'}\n` +
          `🏢 ISP: ${d.isp || d.org || 'N/A'}\n` +
          `🕐 Timezone: ${d.timezone || 'N/A'}\n` +
          `📌 Lat/Lon: ${d.lat || 'N/A'} / ${d.lon || 'N/A'}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });

    } catch (e) {
      reply('❌ lookup failed — ' + e.message);
    }
  }
};
