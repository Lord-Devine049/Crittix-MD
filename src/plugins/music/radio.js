/* RADIO.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
module.exports = {
  command: 'radio',
  category: 'soultools',
  description: 'Search live radio stations by genre or name',
  execute: async ({ text, prefix, reply }) => {
    const query = text.replace(/^[^\s]+\s*/, '').trim();
    if (!query) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}radio <genre or station name>\n\n${h.toBoldItalic('Examples')}:\n${prefix}radio hip hop\n${prefix}radio jazz\n${prefix}radio BBC Radio`);
    try {
      await reply(`📻 ${h.toBoldItalic('Searching radio stations...')} ${h.demonEmoji()}`);
      const baseUrl = 'https://de1.api.radio-browser.info/json/stations';
      const opts = { headers: { 'User-Agent': 'CrittixMD/2.0' }, timeout: 15000 };
      let res = await axios.get(`${baseUrl}/search?name=${encodeURIComponent(query)}&limit=5&hidebroken=true&order=votes&reverse=true`, opts);
      let stations = res.data || [];
      if (stations.length === 0) {
        const tagRes = await axios.get(`${baseUrl}/bytag/${encodeURIComponent(query)}?limit=5&hidebroken=true&order=votes&reverse=true`, opts);
        stations = tagRes.data || [];
      }
      if (stations.length === 0) return reply(`✘ ${h.toBoldItalic('No stations found for')} "${query}" ${h.demonEmoji()}`);
      const station = stations[0];
      const tags = station.tags?.split(',').slice(0,3).join(', ') || 'N/A';
      const bitrate = station.bitrate ? `${station.bitrate} kbps` : 'N/A';
      let txt = `╔═══════════════════════════════╗\n║ 📻 𝐋𝐈𝐕𝐄 𝐑𝐀𝐃𝐈𝐎\n╚═══════════════════════════════╝\n\n`;
      txt += `📻 ${h.toBoldItalic('Station')}: ${station.name}\n🌍 ${h.toBoldItalic('Country')}: ${station.country || 'N/A'}\n🎵 ${h.toBoldItalic('Genre')}: ${tags}\n🔊 ${h.toBoldItalic('Bitrate')}: ${bitrate}\n\n🔗 ${h.toBoldItalic('Stream URL')}:\n${station.url_resolved || station.url}\n`;
      if (stations.length > 1) {
        txt += `\n📋 ${h.toBoldItalic('Other stations found')}:\n`;
        stations.slice(1,4).forEach(s => { txt += `• ${s.name} (${s.country || '?'})\n`; });
      }
      txt += `\n💀 ${h.toBoldItalic('Powered by radio-browser.info')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Radio search failed')} ${h.demonEmoji()}`);
    }
  }
};
