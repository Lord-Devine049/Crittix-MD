/* ARTIST.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const MB_BASE = 'https://musicbrainz.org/ws/2';
const MB_HEADERS = { 'User-Agent': 'CrittixMD/2.0 (whatsapp-bot)', 'Accept': 'application/json' };
module.exports = {
  command: 'artist',
  category: 'soultools',
  description: 'Search for an artist info via MusicBrainz',
  execute: async ({ text, prefix, reply }) => {
    const query = text.replace(/^[^\s]+\s*/, '').trim();
    if (!query) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}artist <name>\n\n${h.toBoldItalic('Example')}: ${prefix}artist Drake`);
    try {
      await reply(`🔍 ${h.toBoldItalic('Searching artist...')} ${h.demonEmoji()}`);
      const searchRes = await axios.get(`${MB_BASE}/artist?query=${encodeURIComponent(query)}&limit=1&fmt=json`, { headers: MB_HEADERS, timeout: 15000 });
      const artist = searchRes.data?.artists?.[0];
      if (!artist) throw new Error('Artist not found');
      const detailRes = await axios.get(`${MB_BASE}/artist/${artist.id}?inc=release-groups+tags&fmt=json`, { headers: MB_HEADERS, timeout: 15000 });
      const detail = detailRes.data;
      const genres = (detail.tags || []).sort((a,b) => b.count - a.count).slice(0,4).map(t => t.name).join(', ') || 'N/A';
      const albums = (detail['release-groups'] || []).filter(r => r['primary-type'] === 'Album').slice(0,5).map(r => `• ${r.title} (${r['first-release-date']?.split('-')[0] || '?'})`).join('\n') || 'N/A';
      const country = detail.country || detail.area?.name || 'N/A';
      const lifespan = detail['life-span'];
      const activeStr = lifespan?.begin ? `${lifespan.begin} → ${lifespan.ended ? lifespan.end || '?' : 'Present'}` : 'N/A';
      let txt = `╔═══════════════════════════════╗\n║ 🎤 𝐀𝐑𝐓𝐈𝐒𝐓 𝐈𝐍𝐅𝐎\n╚═══════════════════════════════╝\n\n`;
      txt += `🎤 ${h.toBoldItalic('Name')}: ${detail.name}\n🌍 ${h.toBoldItalic('Country')}: ${country}\n🎭 ${h.toBoldItalic('Type')}: ${detail.type || 'N/A'}\n📅 ${h.toBoldItalic('Active')}: ${activeStr}\n🎸 ${h.toBoldItalic('Genres')}: ${genres}\n\n💿 ${h.toBoldItalic('Top Albums')}:\n${albums}\n\n💀 ${h.toBoldItalic('Powered by MusicBrainz')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Artist not found')} ${h.demonEmoji()}\n\nTry a different spelling`);
    }
  }
};
