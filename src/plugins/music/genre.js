/* GENRE.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const MB_BASE = 'https://musicbrainz.org/ws/2';
const MB_HEADERS = { 'User-Agent': 'CrittixMD/2.0 (whatsapp-bot)', 'Accept': 'application/json' };
const GENRE_DESCRIPTIONS = {
  'hip hop': 'A genre born in the Bronx, NYC in the 1970s. Characterized by rhythmic speech (rapping), DJing, breakdancing and graffiti art.',
  'pop': 'Popular music designed for mass appeal. Typically features catchy melodies, simple chord progressions and a verse-chorus structure.',
  'rock': 'Guitar-driven music that evolved from rock and roll in the 1950s. Known for electric guitars, bass, and drums.',
  'jazz': 'Originating in New Orleans in the early 20th century. Known for improvisation, swing rhythms and complex harmonies.',
  'r&b': 'Rhythm and Blues — a genre combining jazz, gospel, and blues that emerged in the 1940s African American communities.',
  'electronic': 'Music produced primarily with electronic instruments and technology. Includes EDM, techno, house, and more.',
  'afrobeats': 'A West African genre blending traditional African rhythms with jazz, soul and funk. Popularized globally by artists like Burna Boy.',
  'reggae': 'A Jamaican genre characterized by offbeat rhythms, bass-heavy sound and themes of love, unity and resistance.',
  'country': 'American folk music originating in the rural South. Features acoustic instruments, storytelling lyrics, and themes of home.',
  'classical': 'Art music rooted in Western traditions from roughly the 11th century to present. Known for complex compositions and orchestral arrangements.',
};
module.exports = {
  command: 'genre',
  category: 'soultools',
  description: 'Search for info about a music genre',
  execute: async ({ text, prefix, reply }) => {
    const query = text.replace(/^[^\s]+\s*/, '').trim().toLowerCase();
    if (!query) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}genre <name>\n\n${h.toBoldItalic('Example')}: ${prefix}genre hip hop`);
    try {
      const [artistRes, releaseRes] = await Promise.all([
        axios.get(`${MB_BASE}/artist?query=tag:${encodeURIComponent(query)}&limit=5&fmt=json`, { headers: MB_HEADERS, timeout: 15000 }),
        axios.get(`${MB_BASE}/release-group?query=tag:${encodeURIComponent(query)}&limit=5&fmt=json`, { headers: MB_HEADERS, timeout: 15000 })
      ]);
      const artists = artistRes.data?.artists || [];
      const releases = releaseRes.data?.['release-groups'] || [];
      const desc = Object.entries(GENRE_DESCRIPTIONS).find(([k]) => query.includes(k) || k.includes(query))?.[1]
        || `${query.charAt(0).toUpperCase() + query.slice(1)} is a music genre with a rich history of artists and recordings worldwide.`;
      let txt = `╔═══════════════════════════════╗\n║ 🎸 𝐆𝐄𝐍𝐑𝐄 𝐈𝐍𝐅𝐎\n╚═══════════════════════════════╝\n\n`;
      txt += `🎵 ${h.toBoldItalic(query.toUpperCase())}\n\n📖 ${desc}\n`;
      if (artists.length > 0) { txt += `\n🎤 ${h.toBoldItalic('Artists in this genre')}:\n`; artists.slice(0,5).forEach(a => { txt += `• ${a.name}${a.country ? ` (${a.country})` : ''}\n`; }); }
      if (releases.length > 0) { txt += `\n💿 ${h.toBoldItalic('Notable releases')}:\n`; releases.slice(0,5).forEach(r => { const artist = r['artist-credit']?.[0]?.artist?.name || ''; txt += `• ${r.title}${artist ? ` — ${artist}` : ''}\n`; }); }
      txt += `\n💀 ${h.toBoldItalic('Powered by MusicBrainz')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Genre search failed')} ${h.demonEmoji()}`);
    }
  }
};
