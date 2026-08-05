/*
 * EDUCATION-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: mathformula, physicsformula, periodictable, historytimeline,
 *           capitalcities, flagquiz2, countrycompare
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');

const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

const MATH_FORMULAS = {
  area: {
    circle: 'A = πr²',
    square: 'A = s²',
    rectangle: 'A = l × w',
    triangle: 'A = ½ × b × h',
    trapezoid: 'A = ½(a + b) × h',
    parallelogram: 'A = b × h',
    ellipse: 'A = π × a × b',
  },
  volume: {
    cube: 'V = s³',
    sphere: 'V = (4/3)πr³',
    cylinder: 'V = πr²h',
    cone: 'V = (1/3)πr²h',
    pyramid: 'V = (1/3) × base area × h',
  },
  algebra: {
    quadratic: 'x = (−b ± √(b²−4ac)) / 2a',
    slope: 'm = (y₂−y₁) / (x₂−x₁)',
    distance: 'd = √((x₂−x₁)² + (y₂−y₁)²)',
    midpoint: 'M = ((x₁+x₂)/2 , (y₁+y₂)/2)',
    exponent: 'aⁿ × aᵐ = aⁿ⁺ᵐ',
  },
  calculus: {
    derivative: "d/dx [xⁿ] = n·xⁿ⁻¹",
    integral: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C',
    'chain rule': "d/dx [f(g(x))] = f'(g(x)) · g'(x)",
    'product rule': "d/dx [u·v] = u'v + uv'",
    'quotient rule': "d/dx [u/v] = (u'v − uv') / v²",
  },
  trigonometry: {
    'sin': 'sin(θ) = opposite / hypotenuse',
    'cos': 'cos(θ) = adjacent / hypotenuse',
    'tan': 'tan(θ) = opposite / adjacent',
    'pythagorean': 'sin²θ + cos²θ = 1',
    'law of sines': 'a/sin(A) = b/sin(B) = c/sin(C)',
    'law of cosines': 'c² = a² + b² − 2ab·cos(C)',
  },
};

const PHYSICS_FORMULAS = {
  mechanics: {
    velocity: 'v = d/t',
    acceleration: 'a = (v−u)/t',
    force: 'F = ma',
    momentum: 'p = mv',
    kinetic_energy: 'KE = ½mv²',
    potential_energy: 'PE = mgh',
    work: 'W = Fd·cos(θ)',
    power: 'P = W/t',
    'newtons 2nd': 'F = ma',
  },
  gravity: {
    gravitational_force: 'F = G·m₁m₂/r²',
    free_fall: 'v = u + gt ; s = ut + ½gt²',
    escape_velocity: 'v_e = √(2GM/r)',
  },
  waves: {
    wave_speed: 'v = fλ',
    frequency: 'f = 1/T',
    doppler_effect: 'f\' = f·(v + v_o)/(v − v_s)',
  },
  electricity: {
    ohms_law: 'V = IR',
    power: 'P = VI = I²R = V²/R',
    capacitance: 'Q = CV',
    series_resistance: 'R_total = R₁ + R₂ + ...',
    parallel_resistance: '1/R_total = 1/R₁ + 1/R₂ + ...',
    coulombs_law: 'F = k·q₁q₂/r²',
  },
  thermodynamics: {
    heat: 'Q = mcΔT',
    ideal_gas: 'PV = nRT',
    entropy: 'ΔS = Q/T',
    'first law': 'ΔU = Q − W',
  },
  relativity: {
    mass_energy: 'E = mc²',
    time_dilation: 't\' = t / √(1 − v²/c²)',
    length_contraction: 'L = L₀ · √(1 − v²/c²)',
  },
};

const ELEMENTS = {
  1: { symbol: 'H', name: 'Hydrogen', mass: 1.008, group: 1, period: 1, type: 'Nonmetal' },
  2: { symbol: 'He', name: 'Helium', mass: 4.003, group: 18, period: 1, type: 'Noble Gas' },
  3: { symbol: 'Li', name: 'Lithium', mass: 6.941, group: 1, period: 2, type: 'Alkali Metal' },
  6: { symbol: 'C', name: 'Carbon', mass: 12.011, group: 14, period: 2, type: 'Nonmetal' },
  7: { symbol: 'N', name: 'Nitrogen', mass: 14.007, group: 15, period: 2, type: 'Nonmetal' },
  8: { symbol: 'O', name: 'Oxygen', mass: 15.999, group: 16, period: 2, type: 'Nonmetal' },
  11: { symbol: 'Na', name: 'Sodium', mass: 22.990, group: 1, period: 3, type: 'Alkali Metal' },
  12: { symbol: 'Mg', name: 'Magnesium', mass: 24.305, group: 2, period: 3, type: 'Alkaline Earth Metal' },
  13: { symbol: 'Al', name: 'Aluminium', mass: 26.982, group: 13, period: 3, type: 'Post-transition Metal' },
  14: { symbol: 'Si', name: 'Silicon', mass: 28.086, group: 14, period: 3, type: 'Metalloid' },
  17: { symbol: 'Cl', name: 'Chlorine', mass: 35.453, group: 17, period: 3, type: 'Halogen' },
  18: { symbol: 'Ar', name: 'Argon', mass: 39.948, group: 18, period: 3, type: 'Noble Gas' },
  19: { symbol: 'K', name: 'Potassium', mass: 39.098, group: 1, period: 4, type: 'Alkali Metal' },
  20: { symbol: 'Ca', name: 'Calcium', mass: 40.078, group: 2, period: 4, type: 'Alkaline Earth Metal' },
  26: { symbol: 'Fe', name: 'Iron', mass: 55.845, group: 8, period: 4, type: 'Transition Metal' },
  28: { symbol: 'Ni', name: 'Nickel', mass: 58.693, group: 10, period: 4, type: 'Transition Metal' },
  29: { symbol: 'Cu', name: 'Copper', mass: 63.546, group: 11, period: 4, type: 'Transition Metal' },
  30: { symbol: 'Zn', name: 'Zinc', mass: 65.38, group: 12, period: 4, type: 'Transition Metal' },
  35: { symbol: 'Br', name: 'Bromine', mass: 79.904, group: 17, period: 4, type: 'Halogen' },
  47: { symbol: 'Ag', name: 'Silver', mass: 107.868, group: 11, period: 5, type: 'Transition Metal' },
  50: { symbol: 'Sn', name: 'Tin', mass: 118.710, group: 14, period: 5, type: 'Post-transition Metal' },
  53: { symbol: 'I', name: 'Iodine', mass: 126.904, group: 17, period: 5, type: 'Halogen' },
  56: { symbol: 'Ba', name: 'Barium', mass: 137.327, group: 2, period: 6, type: 'Alkaline Earth Metal' },
  79: { symbol: 'Au', name: 'Gold', mass: 196.967, group: 11, period: 6, type: 'Transition Metal' },
  80: { symbol: 'Hg', name: 'Mercury', mass: 200.592, group: 12, period: 6, type: 'Transition Metal' },
  82: { symbol: 'Pb', name: 'Lead', mass: 207.2, group: 14, period: 6, type: 'Post-transition Metal' },
  92: { symbol: 'U', name: 'Uranium', mass: 238.029, group: 3, period: 7, type: 'Actinide' },
};

const HISTORY_EVENTS = [
  { year: '3000 BCE', event: 'Ancient Egypt begins building pyramids at Giza' },
  { year: '776 BCE', event: 'First Olympic Games held in ancient Greece' },
  { year: '44 BCE', event: 'Julius Caesar assassinated in Rome' },
  { year: '1066', event: 'Norman Conquest — Battle of Hastings, William I takes England' },
  { year: '1215', event: 'Magna Carta signed by King John of England' },
  { year: '1347', event: 'Black Death (bubonic plague) devastates Europe' },
  { year: '1440', event: 'Gutenberg invents the movable-type printing press' },
  { year: '1492', event: 'Columbus reaches the Americas' },
  { year: '1543', event: 'Copernicus publishes heliocentric model of the solar system' },
  { year: '1687', event: 'Newton publishes Principia Mathematica (laws of motion & gravity)' },
  { year: '1776', event: 'United States Declaration of Independence signed' },
  { year: '1789', event: 'French Revolution begins — Bastille stormed' },
  { year: '1815', event: 'Napoleon defeated at Battle of Waterloo' },
  { year: '1848', event: 'Marx & Engels publish The Communist Manifesto' },
  { year: '1865', event: 'American Civil War ends; Lincoln assassinated' },
  { year: '1869', event: 'Suez Canal opens in Egypt' },
  { year: '1879', event: 'Edison invents practical electric light bulb' },
  { year: '1903', event: 'Wright Brothers achieve first powered airplane flight' },
  { year: '1914', event: 'World War I begins after assassination of Archduke Franz Ferdinand' },
  { year: '1917', event: 'Russian Revolution — Bolsheviks seize power' },
  { year: '1929', event: 'Wall Street Crash triggers Great Depression' },
  { year: '1939', event: 'World War II begins with Germany invading Poland' },
  { year: '1945', event: 'WWII ends; atomic bombs dropped on Hiroshima & Nagasaki' },
  { year: '1948', event: 'State of Israel declared; Universal Declaration of Human Rights signed' },
  { year: '1953', event: 'DNA double-helix structure discovered by Watson & Crick' },
  { year: '1961', event: 'Yuri Gagarin becomes first human in space' },
  { year: '1969', event: 'Apollo 11 — Neil Armstrong walks on the Moon' },
  { year: '1989', event: 'Berlin Wall falls; Cold War ends' },
  { year: '1991', event: 'Soviet Union dissolves; World Wide Web invented by Berners-Lee' },
  { year: '2001', event: '9/11 attacks in the USA; War on Terror begins' },
  { year: '2008', event: 'Global financial crisis' },
  { year: '2020', event: 'COVID-19 pandemic declared; global lockdowns begin' },
];

const CAPITALS = {
  nigeria: { capital: 'Abuja', currency: 'Naira (NGN)', population: '220M+', region: 'West Africa' },
  usa: { capital: 'Washington D.C.', currency: 'US Dollar (USD)', population: '335M+', region: 'North America' },
  uk: { capital: 'London', currency: 'Pound Sterling (GBP)', population: '67M+', region: 'Europe' },
  france: { capital: 'Paris', currency: 'Euro (EUR)', population: '68M+', region: 'Europe' },
  germany: { capital: 'Berlin', currency: 'Euro (EUR)', population: '83M+', region: 'Europe' },
  china: { capital: 'Beijing', currency: 'Renminbi (CNY)', population: '1.4B+', region: 'East Asia' },
  japan: { capital: 'Tokyo', currency: 'Yen (JPY)', population: '125M+', region: 'East Asia' },
  india: { capital: 'New Delhi', currency: 'Rupee (INR)', population: '1.4B+', region: 'South Asia' },
  brazil: { capital: 'Brasília', currency: 'Real (BRL)', population: '215M+', region: 'South America' },
  russia: { capital: 'Moscow', currency: 'Ruble (RUB)', population: '145M+', region: 'Eastern Europe/Asia' },
  canada: { capital: 'Ottawa', currency: 'Canadian Dollar (CAD)', population: '38M+', region: 'North America' },
  australia: { capital: 'Canberra', currency: 'Australian Dollar (AUD)', population: '26M+', region: 'Oceania' },
  mexico: { capital: 'Mexico City', currency: 'Peso (MXN)', population: '130M+', region: 'North America' },
  southafrica: { capital: 'Pretoria / Cape Town / Bloemfontein', currency: 'Rand (ZAR)', population: '60M+', region: 'Southern Africa' },
  ghana: { capital: 'Accra', currency: 'Cedi (GHS)', population: '33M+', region: 'West Africa' },
  kenya: { capital: 'Nairobi', currency: 'Shilling (KES)', population: '55M+', region: 'East Africa' },
  egypt: { capital: 'Cairo', currency: 'Pound (EGP)', population: '105M+', region: 'North Africa' },
  italy: { capital: 'Rome', currency: 'Euro (EUR)', population: '60M+', region: 'Europe' },
  spain: { capital: 'Madrid', currency: 'Euro (EUR)', population: '47M+', region: 'Europe' },
  argentina: { capital: 'Buenos Aires', currency: 'Peso (ARS)', population: '46M+', region: 'South America' },
  saudi: { capital: 'Riyadh', currency: 'Riyal (SAR)', population: '35M+', region: 'Middle East' },
  uae: { capital: 'Abu Dhabi', currency: 'Dirham (AED)', population: '10M+', region: 'Middle East' },
  pakistan: { capital: 'Islamabad', currency: 'Rupee (PKR)', population: '230M+', region: 'South Asia' },
  indonesia: { capital: 'Jakarta', currency: 'Rupiah (IDR)', population: '275M+', region: 'Southeast Asia' },
  turkey: { capital: 'Ankara', currency: 'Lira (TRY)', population: '85M+', region: 'Middle East/Europe' },
  ethiopia: { capital: 'Addis Ababa', currency: 'Birr (ETB)', population: '125M+', region: 'East Africa' },
  senegal: { capital: 'Dakar', currency: 'CFA Franc (XOF)', population: '17M+', region: 'West Africa' },
  cameroon: { capital: 'Yaoundé', currency: 'CFA Franc (XAF)', population: '28M+', region: 'Central Africa' },
};

module.exports = [

  {
    command: 'mathformula',
    aliases: ['mathform', 'formula', 'maths'],
    category: 'soultools',
    description: 'Math formula lookup by category and topic. Usage: mathformula <category> [topic]',
    execute: async ({ args, reply }) => {
      const category = args[0]?.toLowerCase();
      const topic = args.slice(1).join(' ').toLowerCase();

      if (!category) {
        const cats = Object.keys(MATH_FORMULAS).join(', ');
        return reply(
          `╔════╗\n` +
          `  𓆘 *MATH FORMULAS*\n` +
          `╚════╝\n\n` +
          `📐 Available categories:\n${cats}\n\n` +
          `Usage: .mathformula <category> [topic]\nExample: .mathformula calculus derivative\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }

      const cat = MATH_FORMULAS[category];
      if (!cat) return reply(h.demonFail(`category not found. Try: ${Object.keys(MATH_FORMULAS).join(', ')}`));

      if (topic && cat[topic]) {
        return reply(
          `╔════╗\n` +
          `  𓆘 *MATH FORMULA*\n` +
          `╚════╝\n\n` +
          `📐 *${category.toUpperCase()} — ${topic}*\n\n` +
          `🔢 ${cat[topic]}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }

      const list = Object.entries(cat).map(([k, v]) => `• *${k}:* ${v}`).join('\n');
      reply(
        `╔════╗\n` +
        `  𓆘 *MATH: ${category.toUpperCase()}*\n` +
        `╚════╝\n\n` +
        `${list}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'physicsformula',
    aliases: ['physicsform', 'physics', 'phys'],
    category: 'soultools',
    description: 'Physics formula lookup by category. Usage: physicsformula <category> [topic]',
    execute: async ({ args, reply }) => {
      const category = args[0]?.toLowerCase();
      const topic = args.slice(1).join(' ').toLowerCase().replace(/ /g, '_');

      if (!category) {
        const cats = Object.keys(PHYSICS_FORMULAS).join(', ');
        return reply(
          `╔════╗\n` +
          `  𓆘 *PHYSICS FORMULAS*\n` +
          `╚════╝\n\n` +
          `⚡ Available categories:\n${cats}\n\n` +
          `Usage: .physicsformula <category> [topic]\nExample: .physicsformula electricity ohms_law\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }

      const cat = PHYSICS_FORMULAS[category];
      if (!cat) return reply(h.demonFail(`category not found. Try: ${Object.keys(PHYSICS_FORMULAS).join(', ')}`));

      if (topic && cat[topic]) {
        return reply(
          `╔════╗\n` +
          `  𓆘 *PHYSICS FORMULA*\n` +
          `╚════╝\n\n` +
          `⚡ *${category.toUpperCase()} — ${topic}*\n\n` +
          `🔢 ${cat[topic]}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }

      const list = Object.entries(cat).map(([k, v]) => `• *${k.replace(/_/g, ' ')}:* ${v}`).join('\n');
      reply(
        `╔════╗\n` +
        `  𓆘 *PHYSICS: ${category.toUpperCase()}*\n` +
        `╚════╝\n\n` +
        `${list}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'periodictable',
    aliases: ['element', 'chemelem', 'periodic'],
    category: 'soultools',
    description: 'Look up a periodic table element by symbol, name, or atomic number. Usage: periodictable <symbol|name|number>',
    execute: async ({ args, reply }) => {
      const query = args.join(' ').trim();
      if (!query) return reply(h.demonError('periodictable', 'periodictable <symbol | name | atomic number>\nExample: .periodictable Au | .periodictable gold | .periodictable 79'));

      let found = null;
      const num = parseInt(query);
      if (!isNaN(num)) {
        found = ELEMENTS[num] ? { ...ELEMENTS[num], number: num } : null;
      } else {
        for (const [n, el] of Object.entries(ELEMENTS)) {
          if (el.symbol.toLowerCase() === query.toLowerCase() || el.name.toLowerCase() === query.toLowerCase()) {
            found = { ...el, number: parseInt(n) };
            break;
          }
        }
      }

      if (!found) {
        return reply(h.demonFail(`element not found: *${query}*\nTry a symbol (Au, Fe), name (Gold), or atomic number (79)`));
      }

      reply(
        `╔════╗\n` +
        `  𓆘 *PERIODIC TABLE*\n` +
        `╚════╝\n\n` +
        `⚗️ *${found.name}* (${found.symbol})\n\n` +
        `🔢 Atomic Number: ${found.number}\n` +
        `⚖️ Atomic Mass: ${found.mass} u\n` +
        `🧪 Type: ${found.type}\n` +
        `📊 Group: ${found.group} | Period: ${found.period}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'historytimeline',
    aliases: ['history', 'timeline', 'historyevent'],
    category: 'soultools',
    description: 'Get random or filtered historical events. Usage: historytimeline [keyword]',
    execute: async ({ args, reply }) => {
      const keyword = args.join(' ').toLowerCase();

      let events;
      if (keyword) {
        events = HISTORY_EVENTS.filter(e =>
          e.event.toLowerCase().includes(keyword) || e.year.toLowerCase().includes(keyword)
        );
        if (!events.length) return reply(h.demonFail(`no events found matching: *${keyword}*`));
        events = events.slice(0, 8);
      } else {
        const start = Math.floor(Math.random() * Math.max(0, HISTORY_EVENTS.length - 8));
        events = HISTORY_EVENTS.slice(start, start + 8);
      }

      const text = events.map(e => `📅 *${e.year}*\n    ${e.event}`).join('\n\n');
      reply(
        `╔════╗\n` +
        `  𓆘 *HISTORY TIMELINE*\n` +
        `╚════╝\n\n` +
        (keyword ? `🔍 Showing results for: *${keyword}*\n\n` : `📖 *Random Events:*\n\n`) +
        `${text}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'capitalcities',
    aliases: ['capital', 'countrycapital', 'getcapital'],
    category: 'soultools',
    description: 'Get capital city and info for a country. Usage: capitalcities <country>',
    execute: async ({ args, reply }) => {
      const country = args.join(' ').toLowerCase().replace(/ /g, '');
      if (!country) return reply(h.demonError('capitalcities', 'capitalcities <country>\nExample: .capitalcities nigeria'));

      const info = CAPITALS[country];
      if (!info) {
        try {
          const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(args.join(' '))}?fields=name,capital,currencies,population,region`, { timeout: 10000 });
          const c = res.data?.[0];
          if (!c) return reply(h.demonFail(`country not found: *${args.join(' ')}*`));
          const cap = c.capital?.[0] || 'Unknown';
          const curr = Object.values(c.currencies || {})[0];
          const currStr = curr ? `${curr.name} (${curr.symbol || '?'})` : 'Unknown';
          return reply(
            `╔════╗\n` +
            `  𓆘 *CAPITAL CITIES*\n` +
            `╚════╝\n\n` +
            `🌍 *${c.name.common}*\n\n` +
            `🏛️ Capital: *${cap}*\n` +
            `💰 Currency: ${currStr}\n` +
            `👥 Population: ${c.population?.toLocaleString() || 'N/A'}\n` +
            `🗺️ Region: ${c.region || 'N/A'}\n\n` +
            `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
          );
        } catch {
          return reply(h.demonFail(`country not found: *${args.join(' ')}*\nTry: nigeria, usa, uk, ghana, india, china`));
        }
      }

      reply(
        `╔════╗\n` +
        `  𓆘 *CAPITAL CITIES*\n` +
        `╚════╝\n\n` +
        `🌍 *${args.map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}*\n\n` +
        `🏛️ Capital: *${info.capital}*\n` +
        `💰 Currency: ${info.currency}\n` +
        `👥 Population: ${info.population}\n` +
        `🗺️ Region: ${info.region}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },


  {
    command: 'countrycompare',
    aliases: ['comparecountry', 'countryvscore', 'compnation'],
    category: 'soultools',
    description: 'Compare two countries side by side. Usage: countrycompare <country1> vs <country2>',
    execute: async ({ args, reply }) => {
      const text = args.join(' ');
      const parts = text.toLowerCase().split(' vs ');
      if (parts.length < 2) return reply(h.demonError('countrycompare', 'countrycompare <country1> vs <country2>\nExample: .countrycompare nigeria vs ghana'));

      const [c1name, c2name] = parts.map(p => p.trim());

      const fetch = async (name) => {
        try {
          const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,capital,population,area,region,subregion,currencies,languages,flags`, { timeout: 12000 });
          return res.data?.[0] || null;
        } catch { return null; }
      };

      await reply(`🔍 Comparing *${c1name}* vs *${c2name}*...`);
      const [c1, c2] = await Promise.all([fetch(c1name), fetch(c2name)]);

      if (!c1) return reply(h.demonFail(`couldn't find country: *${c1name}*`));
      if (!c2) return reply(h.demonFail(`couldn't find country: *${c2name}*`));

      const fmt = (c) => {
        const curr = Object.values(c.currencies || {})[0];
        const lang = Object.values(c.languages || {})[0];
        return [
          `🏳️ *${c.name.common}* ${c.flags?.emoji || ''}`,
          `🏛️ Capital: ${c.capital?.[0] || 'N/A'}`,
          `👥 Population: ${c.population?.toLocaleString() || 'N/A'}`,
          `📐 Area: ${c.area?.toLocaleString() || 'N/A'} km²`,
          `🗺️ Region: ${c.region} — ${c.subregion || ''}`,
          `💰 Currency: ${curr ? `${curr.name} (${curr.symbol || '?'})` : 'N/A'}`,
          `🗣️ Language: ${lang || 'N/A'}`,
        ].join('\n');
      };

      const popWinner = c1.population > c2.population ? c1.name.common : c2.name.common;
      const areaWinner = c1.area > c2.area ? c1.name.common : c2.name.common;

      reply(
        `╔════╗\n` +
        `  𓆘 *COUNTRY COMPARISON*\n` +
        `╚════╝\n\n` +
        `${fmt(c1)}\n\n` +
        `━━━━━━ VS ━━━━━━\n\n` +
        `${fmt(c2)}\n\n` +
        `🏆 *Larger population:* ${popWinner}\n` +
        `🏆 *Larger area:* ${areaWinner}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

];
