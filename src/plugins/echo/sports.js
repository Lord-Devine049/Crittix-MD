/*
 * SPORTS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

const SPORTS = {
  football:    'https://prexzyapis.com/sports/football',
  basketball:  'https://prexzyapis.com/sports/basketball',
  othersports: 'https://prexzyapis.com/sports/othersports'
};

async function fetchMatches(type) {
  const { data } = await axios.get(SPORTS[type], { timeout: 15000 });
  return data;
}

function formatMatches(matches, sport) {
  if (!matches?.length) return `No live ${sport} matches right now.`;
  return matches.slice(0, 5).map((m, i) => {
    const home = m.homeTeam?.name || m.home || 'Home';
    const away = m.awayTeam?.name || m.away || 'Away';
    const score = m.score || m.result || 'vs';
    const status = m.status || m.state || '';
    return `${i + 1}. *${home}* ${score} *${away}*\n   ⏱️ ${status}`;
  }).join('\n\n');
}

module.exports = [
  {
    command: ['football', 'livefootball'],
    category: 'verdict',
    description: 'Get live football scores and matches',
    execute: async ({ sock, msg, chatId, reply }) => {
      await reply('⚽ fetching live football...');
      try {
        const data = await fetchMatches('football');
        if (!data?.status) return reply('❌ failed to fetch matches');
        const matches = data?.data?.matches || [];
        await sock.sendMessage(chatId, {
          text: `⚽ *Football Live*\n\n${formatMatches(matches, 'football')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) { reply('❌ failed — ' + e.message); }
    }
  },
  {
    command: ['basketball', 'livebasketball'],
    category: 'verdict',
    description: 'Get live basketball scores and matches',
    execute: async ({ sock, msg, chatId, reply }) => {
      await reply('🏀 fetching live basketball...');
      try {
        const data = await fetchMatches('basketball');
        if (!data?.status) return reply('❌ failed to fetch matches');
        const matches = data?.data?.matches || [];
        await sock.sendMessage(chatId, {
          text: `🏀 *Basketball Live*\n\n${formatMatches(matches, 'basketball')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) { reply('❌ failed — ' + e.message); }
    }
  },
  {
    command: ['othersports', 'livesports'],
    category: 'verdict',
    description: 'Get live scores for other sports',
    execute: async ({ sock, msg, chatId, reply }) => {
      await reply('🏅 fetching live sports...');
      try {
        const data = await fetchMatches('othersports');
        if (!data?.status) return reply('❌ failed to fetch matches');
        const matches = data?.data?.matches || [];
        await sock.sendMessage(chatId, {
          text: `🏅 *Other Sports Live*\n\n${formatMatches(matches, 'other sports')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) { reply('❌ failed — ' + e.message); }
    }
  }
];
