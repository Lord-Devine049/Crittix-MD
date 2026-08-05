/* ALBUM.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const MB_BASE = 'https://musicbrainz.org/ws/2';
const MB_HEADERS = { 'User-Agent': 'CrittixMD/2.0 (whatsapp-bot)', 'Accept': 'application/json' };
module.exports = {
  command: 'album',
  category: 'soultools',
  description: 'Search for album info via MusicBrainz',
  execute: async ({ text, prefix, reply }) => {
    const query = text.replace(/^[^\s]+\s*/, '').trim();
    if (!query) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}album <name>\n\n${h.toBoldItalic('Example')}: ${prefix}album DAMN Kendrick Lamar`);
    try {
      await reply(`🔍 ${h.toBoldItalic('Searching album...')} ${h.demonEmoji()}`);
      const searchRes = await axios.get(`${MB_BASE}/release-group?query=${encodeURIComponent(query)}&limit=1&fmt=json`, { headers: MB_HEADERS, timeout: 15000 });
      const album = searchRes.data?.['release-groups']?.[0];
      if (!album) throw new Error('Album not found');
      const detailRes = await axios.get(`${MB_BASE}/release-group/${album.id}?inc=artist-credits+releases+tags&fmt=json`, { headers: MB_HEADERS, timeout: 15000 });
      const detail = detailRes.data;
      const artistName = detail['artist-credit']?.[0]?.artist?.name || 'N/A';
      const tags = (detail.tags || []).sort((a,b) => b.count - a.count).slice(0,4).map(t => t.name).join(', ') || 'N/A';
      let trackList = '';
      if (detail.releases?.[0]?.id) {
        try {
          const releaseRes = await axios.get(`${MB_BASE}/release/${detail.releases[0].id}?inc=recordings&fmt=json`, { headers: MB_HEADERS, timeout: 15000 });
          const tracks = releaseRes.data?.media?.[0]?.tracks || [];
          trackList = tracks.slice(0,8).map((t,i) => `${i+1}. ${t.title} (${t.length ? Math.floor(t.length/60000)+':'+String(Math.floor((t.length%60000)/1000)).padStart(2,'0') : '?'})`).join('\n');
          if (tracks.length > 8) trackList += `\n... +${tracks.length - 8} more`;
        } catch {}
      }
      let txt = `╔═══════════════════════════════╗\n║ 💿 𝐀𝐋𝐁𝐔𝐌 𝐈𝐍𝐅𝐎\n╚═══════════════════════════════╝\n\n`;
      txt += `💿 ${h.toBoldItalic('Album')}: ${detail.title}\n🎤 ${h.toBoldItalic('Artist')}: ${artistName}\n📅 ${h.toBoldItalic('Released')}: ${detail['first-release-date'] || 'N/A'}\n🎭 ${h.toBoldItalic('Type')}: ${detail['primary-type'] || 'N/A'}${detail['secondary-types']?.length ? ` (${detail['secondary-types'].join(', ')})` : ''}\n🎸 ${h.toBoldItalic('Tags')}: ${tags}\n📦 ${h.toBoldItalic('Editions')}: ${detail.releases?.length || 0}\n`;
      if (trackList) txt += `\n🎵 ${h.toBoldItalic('Tracklist')}:\n${trackList}\n`;
      txt += `\n💀 ${h.toBoldItalic('Powered by MusicBrainz')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Album not found')} ${h.demonEmoji()}\n\nTry: ${prefix}album DAMN Kendrick Lamar`);
    }
  }
};
