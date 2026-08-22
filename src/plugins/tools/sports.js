/*
 * SPORTS.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: eplmatches, eplstandings, eplscorers, eplupcoming,
 *           laligamatches, laligastandings, laligascorers, laligaupcoming,
 *           bundesligamatches, bundesligastandings, bundesligascorers, bundesligaupcoming,
 *           serieamatches, serieastandings, serieascorers, serieaupcoming,
 *           ligue1matches, ligue1standings, ligue1scorers, ligue1upcoming,
 *           clmatches, clstandings, clscorers, clupcoming,
 *           eflmatches, eflstandings, eflscorers, eflupcoming,
 *           wcmatches, wcstandings, wcscorers, wcupcoming,
 *           wrestlingevents, wwenews, wweschedule
 * Uses football-data.org free tier — add FOOTBALL_DATA_KEY to .env
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


const FD_API = 'https://api.football-data.org/v4';
const FD_KEY = process.env.FOOTBALL_DATA_KEY || '';
const fdHeaders = { 'X-Auth-Token': FD_KEY };

const LEAGUES = {
  epl:        { id: 'PL',   name: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  laliga:     { id: 'PD',   name: 'La Liga 🇪🇸' },
  bundesliga: { id: 'BL1',  name: 'Bundesliga 🇩🇪' },
  seriea:     { id: 'SA',   name: 'Serie A 🇮🇹' },
  ligue1:     { id: 'FL1',  name: 'Ligue 1 🇫🇷' },
  cl:         { id: 'CL',   name: 'Champions League 🏆' },
  efl:        { id: 'ELC',  name: 'EFL Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  wc:         { id: 'WC',   name: 'World Cup 🌍' },
};

const noKeyMsg = () => `⚽ Sports commands require a *football-data.org* API key.\n\nSet *FOOTBALL_DATA_KEY* in your .env file (free tier available at football-data.org).\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

// ─── Shared fetch helpers ──────────────────────────────────────────────────

const fetchMatches = async (leagueCode) => {
  const r = await axios.get(`${FD_API}/competitions/${leagueCode}/matches?status=FINISHED&limit=5`, { headers: fdHeaders, timeout: 12000 });
  return r.data.matches?.slice(-5) || [];
};

const fetchStandings = async (leagueCode) => {
  const r = await axios.get(`${FD_API}/competitions/${leagueCode}/standings`, { headers: fdHeaders, timeout: 12000 });
  return r.data.standings?.[0]?.table || [];
};

const fetchScorers = async (leagueCode) => {
  const r = await axios.get(`${FD_API}/competitions/${leagueCode}/scorers?limit=10`, { headers: fdHeaders, timeout: 12000 });
  return r.data.scorers || [];
};

const fetchUpcoming = async (leagueCode) => {
  const r = await axios.get(`${FD_API}/competitions/${leagueCode}/matches?status=SCHEDULED&limit=5`, { headers: fdHeaders, timeout: 12000 });
  return r.data.matches?.slice(0, 5) || [];
};

// ─── Formatters ──────────────────────────────────────────────────────────

const fmtMatches = (matches, leagueName) => {
  if (!matches.length) return `⚽ *${leagueName}*\n\nNo recent matches found.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
  const lines = matches.map(m => {
    const home = m.homeTeam?.shortName || m.homeTeam?.name || '?';
    const away = m.awayTeam?.shortName || m.awayTeam?.name || '?';
    const hg = m.score?.fullTime?.home ?? '?';
    const ag = m.score?.fullTime?.away ?? '?';
    const date = m.utcDate ? new Date(m.utcDate).toLocaleDateString() : '';
    return `📅 ${date}\n⚽ *${home}* ${hg} - ${ag} *${away}*`;
  });
  return `⚽ *${leagueName} — RECENT RESULTS*\n\n${lines.join('\n\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
};

const fmtStandings = (table, leagueName) => {
  if (!table.length) return `📊 *${leagueName}*\n\nStandings unavailable.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
  const top10 = table.slice(0, 10);
  const lines = top10.map(t => {
    const pos = String(t.position).padStart(2, ' ');
    const name = (t.team?.shortName || t.team?.name || '?').padEnd(18, ' ').substring(0, 18);
    return `${pos}. ${name} ${t.playedGames}G  ${t.points}pts  GD${t.goalDifference >= 0 ? '+' : ''}${t.goalDifference}`;
  });
  return `📊 *${leagueName} — STANDINGS*\n\n\`\`\`${lines.join('\n')}\`\`\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
};

const fmtScorers = (scorers, leagueName) => {
  if (!scorers.length) return `🥅 *${leagueName}*\n\nTop scorers unavailable.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
  const lines = scorers.map((s, i) => {
    const name = s.player?.name || '?';
    const team = s.team?.shortName || s.team?.name || '?';
    return `${i + 1}. *${name}* (${team}) — ${s.goals} goals`;
  });
  return `🥅 *${leagueName} — TOP SCORERS*\n\n${lines.join('\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
};

const fmtUpcoming = (matches, leagueName) => {
  if (!matches.length) return `📅 *${leagueName}*\n\nNo upcoming fixtures found.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
  const lines = matches.map(m => {
    const home = m.homeTeam?.shortName || m.homeTeam?.name || '?';
    const away = m.awayTeam?.shortName || m.awayTeam?.name || '?';
    const date = m.utcDate ? new Date(m.utcDate).toLocaleString() : '?';
    return `📅 ${date}\n⚽ *${home}* vs *${away}*`;
  });
  return `📅 *${leagueName} — UPCOMING*\n\n${lines.join('\n\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
};

// ─── Generic executor builder ─────────────────────────────────────────────

const makeExecutor = (leagueKey, type) => async ({ reply }) => {
  if (!FD_KEY) return reply(noKeyMsg());
  const league = LEAGUES[leagueKey];
  try {
    let text;
    if (type === 'matches')    text = fmtMatches(await fetchMatches(league.id), league.name);
    if (type === 'standings')  text = fmtStandings(await fetchStandings(league.id), league.name);
    if (type === 'scorers')    text = fmtScorers(await fetchScorers(league.id), league.name);
    if (type === 'upcoming')   text = fmtUpcoming(await fetchUpcoming(league.id), league.name);
    reply(text);
  } catch (e) {
    reply(p.phrases.error(`Sports API failed: ${e.message}\nCheck your FOOTBALL_DATA_KEY and rate limits.`));
  }
};

// ─── Wrestling / WWE (RSS-based) ──────────────────────────────────────────

const fetchWWERSS = async () => {
  const cheerio = require('cheerio');
  const res = await axios.get('https://www.wwe.com/rss/news', { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(res.data, { xmlMode: true });
  const items = [];
  $('item').each((_, el) => {
    items.push({ title: $(el).find('title').text(), link: $(el).find('link').text(), date: $(el).find('pubDate').text() });
  });
  return items.slice(0, 5);
};

// ─── Command exports ──────────────────────────────────────────────────────

module.exports = [
  { command: 'eplmatches',          aliases: ['eplresults'],      category: 'verdict', description: 'EPL recent match results',          execute: makeExecutor('epl', 'matches')         },
  { command: 'eplstandings',        aliases: ['epltable'],         category: 'verdict', description: 'EPL standings table',               execute: makeExecutor('epl', 'standings')       },
  { command: 'eplscorers',          aliases: ['epltopscorers'],    category: 'verdict', description: 'EPL top scorers',                   execute: makeExecutor('epl', 'scorers')         },
  { command: 'eplupcoming',         aliases: ['eplfixtures'],      category: 'verdict', description: 'EPL upcoming fixtures',             execute: makeExecutor('epl', 'upcoming')        },

  { command: 'laligamatches',       aliases: ['laligaresults'],    category: 'verdict', description: 'La Liga recent results',            execute: makeExecutor('laliga', 'matches')      },
  { command: 'laligastandings',     aliases: ['laligatab'],        category: 'verdict', description: 'La Liga standings',                 execute: makeExecutor('laliga', 'standings')    },
  { command: 'laligascorers',       aliases: ['laligascorer'],     category: 'verdict', description: 'La Liga top scorers',               execute: makeExecutor('laliga', 'scorers')      },
  { command: 'laligaupcoming',      aliases: ['laligafixtures'],   category: 'verdict', description: 'La Liga upcoming fixtures',         execute: makeExecutor('laliga', 'upcoming')     },

  { command: 'bundesligamatches',   aliases: ['bunderesults'],     category: 'verdict', description: 'Bundesliga recent results',         execute: makeExecutor('bundesliga', 'matches')  },
  { command: 'bundesligastandings', aliases: ['bundesligatab'],    category: 'verdict', description: 'Bundesliga standings',              execute: makeExecutor('bundesliga', 'standings')},
  { command: 'bundesligascorers',   aliases: ['bundesligagoals'],  category: 'verdict', description: 'Bundesliga top scorers',            execute: makeExecutor('bundesliga', 'scorers')  },
  { command: 'bundesligaupcoming',  aliases: ['bundesfixtures'],   category: 'verdict', description: 'Bundesliga upcoming fixtures',      execute: makeExecutor('bundesliga', 'upcoming') },

  { command: 'serieamatches',       aliases: ['serieresults'],     category: 'verdict', description: 'Serie A recent results',            execute: makeExecutor('seriea', 'matches')      },
  { command: 'serieastandings',     aliases: ['serieatable'],      category: 'verdict', description: 'Serie A standings',                 execute: makeExecutor('seriea', 'standings')    },
  { command: 'serieascorers',       aliases: ['serieascorer'],     category: 'verdict', description: 'Serie A top scorers',               execute: makeExecutor('seriea', 'scorers')      },
  { command: 'serieaupcoming',      aliases: ['seriefixtures'],    category: 'verdict', description: 'Serie A upcoming fixtures',         execute: makeExecutor('seriea', 'upcoming')     },

  { command: 'ligue1matches',       aliases: ['ligue1results'],    category: 'verdict', description: 'Ligue 1 recent results',            execute: makeExecutor('ligue1', 'matches')      },
  { command: 'ligue1standings',     aliases: ['ligue1table'],      category: 'verdict', description: 'Ligue 1 standings',                 execute: makeExecutor('ligue1', 'standings')    },
  { command: 'ligue1scorers',       aliases: ['ligue1scorer'],     category: 'verdict', description: 'Ligue 1 top scorers',               execute: makeExecutor('ligue1', 'scorers')      },
  { command: 'ligue1upcoming',      aliases: ['ligue1fixtures'],   category: 'verdict', description: 'Ligue 1 upcoming fixtures',         execute: makeExecutor('ligue1', 'upcoming')     },

  { command: 'clmatches',           aliases: ['uclresults'],       category: 'verdict', description: 'Champions League recent results',   execute: makeExecutor('cl', 'matches')          },
  { command: 'clstandings',         aliases: ['ucltable'],         category: 'verdict', description: 'Champions League standings',        execute: makeExecutor('cl', 'standings')        },
  { command: 'clscorers',           aliases: ['uclscorers'],       category: 'verdict', description: 'Champions League top scorers',      execute: makeExecutor('cl', 'scorers')          },
  { command: 'clupcoming',          aliases: ['uclfixtures'],      category: 'verdict', description: 'Champions League upcoming',         execute: makeExecutor('cl', 'upcoming')         },

  { command: 'eflmatches',          aliases: ['championshipresults'],category: 'verdict',description: 'EFL Championship results',         execute: makeExecutor('efl', 'matches')         },
  { command: 'eflstandings',        aliases: ['championshiptable'], category: 'verdict', description: 'EFL Championship standings',       execute: makeExecutor('efl', 'standings')       },
  { command: 'eflscorers',          aliases: ['eflgoals'],         category: 'verdict', description: 'EFL Championship top scorers',      execute: makeExecutor('efl', 'scorers')         },
  { command: 'eflupcoming',         aliases: ['eflfixtures'],      category: 'verdict', description: 'EFL Championship upcoming',         execute: makeExecutor('efl', 'upcoming')        },

  { command: 'wcmatches',           aliases: ['worldcupresults'],  category: 'verdict', description: 'World Cup recent results',          execute: makeExecutor('wc', 'matches')          },
  { command: 'wcstandings',         aliases: ['worldcuptable'],    category: 'verdict', description: 'World Cup standings',               execute: makeExecutor('wc', 'standings')        },
  { command: 'wcscorers',           aliases: ['worldcupscorers'],  category: 'verdict', description: 'World Cup top scorers',             execute: makeExecutor('wc', 'scorers')          },
  { command: 'wcupcoming',          aliases: ['worldcupfixtures'], category: 'verdict', description: 'World Cup upcoming fixtures',       execute: makeExecutor('wc', 'upcoming')         },

  {
    command: 'wrestlingevents',
    aliases: ['wweevents', 'ppvevents'],
    category: 'verdict',
    description: 'Upcoming WWE/wrestling events',
    execute: async ({ reply }) => {
      try {
        const cheerio = require('cheerio');
        const res = await axios.get('https://www.wwe.com/shows', { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(res.data);
        const events = [];
        $('.DynamicCard--event, [class*="EventCard"], .event-card, article').each((_, el) => {
          const title = $(el).find('h2,h3,.title,.name').first().text().trim();
          const date = $(el).find('time,.date,.event-date').first().text().trim();
          if (title) events.push(`🎭 *${title}*${date ? `\n📅 ${date}` : ''}`);
        });
        if (!events.length) return reply(`🎭 *WWE EVENTS*\n\nCouldn't parse events. Visit wwe.com for latest shows.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        reply(`🎭 *WWE/WRESTLING EVENTS*\n\n${events.slice(0, 6).join('\n\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`Wrestling events fetch failed: ${e.message}`)); }
    }
  },

  {
    command: 'wwenews',
    aliases: ['wrestlingnews', 'wweupdates'],
    category: 'verdict',
    description: 'Latest WWE/wrestling news from RSS',
    execute: async ({ reply }) => {
      try {
        const items = await fetchWWERSS();
        if (!items.length) return reply(p.phrases.error('No WWE news found right now.'));
        const lines = items.map((n, i) => `${i+1}. *${n.title}*\n🔗 ${n.link}`);
        reply(`📰 *WWE NEWS*\n\n${lines.join('\n\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`WWE news fetch failed: ${e.message}`)); }
    }
  },

  {
    command: 'wweschedule',
    aliases: ['wwebroad', 'wwetvschedule'],
    category: 'verdict',
    description: 'WWE TV schedule (Raw/SmackDown/NXT)',
    execute: async ({ reply }) => {
      reply(
        `📺 *WWE TV SCHEDULE*\n\n` +
        `🔴 *RAW* — Mondays, Netflix (US) / various regional\n` +
        `🔵 *SmackDown* — Fridays, USA Network / various regional\n` +
        `🟡 *NXT* — Tuesdays, USA Network\n\n` +
        `📰 For latest show changes: wwe.com\n\n` +
        `💡 Use *.wwenews* for latest updates or *.wrestlingevents* for PPVs.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }
];
