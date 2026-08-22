
const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = {
  command: 'countryinfo',
  aliases: ['country', 'nationinfo'],
  category: 'soultools',
  description: 'Get info about a country. Usage: countryinfo Japan',
  execute: async ({ sock, msg, text, chatId, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the country name after the command. example! .countryinfo japan'));

    try {
      const res = await axios.get(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(text.trim())}?fullText=true`
      ).catch(() => axios.get(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(text.trim())}`
      ));

      const c = res.data?.[0];
      if (!c) return reply('❌ *Country not found*');

      const currencies = Object.values(c.currencies || {}).map(cur => `${cur.name} (${cur.symbol || ''})`).join(', ');
      const langs = Object.values(c.languages || {}).join(', ');
      const flag = c.flags?.png || c.flags?.svg;

      const caption =
        `🌍 *${c.name?.official || c.name?.common}*\n\n` +
        `🗺️ Common: ${c.name?.common}\n` +
        `🌐 Region: ${c.region} — ${c.subregion || '—'}\n` +
        `🏙️ Capital: ${(c.capital || []).join(', ') || '—'}\n` +
        `👥 Population: ${(c.population || 0).toLocaleString()}\n` +
        `📏 Area: ${(c.area || 0).toLocaleString()} km²\n` +
        `💰 Currency: ${currencies || '—'}\n` +
        `🗣️ Languages: ${langs || '—'}\n` +
        `📞 Dial: +${(c.idd?.root || '') + (c.idd?.suffixes?.[0] || '')}\n` +
        `🚗 Drive: ${c.car?.side === 'left' ? 'Left side ⬅️' : 'Right side ➡️'}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

      if (flag) {
        await sock.sendMessage(chatId, { image: { url: flag }, caption }, { quoted: msg });
      } else {
        reply(caption);
      }
    } catch {
      reply('❌ *Country lookup failed* • Check spelling and try again');
    }
  }
};
