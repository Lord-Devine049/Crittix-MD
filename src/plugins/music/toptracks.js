/* TOPTRACKS.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const MB_BASE = 'https://musicbrainz.org/ws/2';
const MB_HEADERS = { 'User-Agent': 'CrittixMD/2.0 (whatsapp-bot)', 'Accept': 'application/json' };
module.exports = {
  command: 'toptracks',
  aliases: ['tracks'],
  category: 'soultools',
  description: 'Get top tracks by an artist via MusicBrainz',
  execute: async ({ text, prefix, reply }) => {
    const query = text.replace(/^[^\s]+\s*/, '').trim();
    if (!query) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}toptracks <artist>\n\n${h.toBoldItalic('Example')}: ${prefix}toptracks Kendrick Lamar`);
    try {
      await reply(`🔍 ${h.toBoldItalic('Finding top tracks...')} ${h.demonEmoji()}`);
      const artistRes = await axios.get(`${MB_BASE}/artist?query=${encodeURIComponent(query)}&limit=1&fmt=json`, { headers: MB_HEADERS, timeout: 15000 });
      const artist = artistRes.data?.artists?.[0];
      if (!artist) throw new Error('Artist not found');
      const recordingsRes = await axios.get(`${MB_BASE}/recording?query=artist:${encodeURIComponent(artist.name)}&limit=15&fmt=json`, { headers: MB_HEADERS, timeout: 15000 });
      const recordings = recordingsRes.data?.recordings || [];
      if (recordings.length === 0) throw new Error('No tracks found');
      const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
      let txt = `╔═══════════════════════════════╗\n║ 🎵 𝐓𝐎𝐏 𝐓𝐑𝐀𝐂𝐊𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `🎤 ${h.toBoldItalic(artist.name)}\n\n`;
      recordings.slice(0,10).forEach((rec,i) => {
        const duration = rec.length ? `${Math.floor(rec.length/60000)}:${String(Math.floor((rec.length%60000)/1000)).padStart(2,'0')}` : '?:??';
        txt += `${medals[i]} ${rec.title} (${duration})\n`;
      });
      txt += `\n💀 ${h.toBoldItalic('Powered by MusicBrainz')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Could not find tracks')} ${h.demonEmoji()}`);
    }
  }
};
