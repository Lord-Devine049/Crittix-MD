/*
 * TOOLS-NEW1.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Commands: ip2location, vin, currencyhistory, stockprice, cryptoprice,
 *           gasprice, exchangerate, unitconv
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = [

  {
    command: 'ip2location',
    aliases: ['iploc', 'ipinfo2'],
    category: 'soultools',
    description: 'Look up an IP address — country, city, ISP. Usage: ip2location 8.8.8.8',
    execute: async ({ args, reply }) => {
      const ip = args[0];
      if (!ip) return reply(p.phrases.wrongUsage('provide an ip address. example! .ip2location 8.8.8.8'));
      try {
        const { data } = await axios.get(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,isp,org,lat,lon,timezone,query`, { timeout: 10000 });
        if (data.status !== 'success') return reply(p.phrases.error(`ip lookup failed. ${data.message || 'invalid ip'}.`));
        reply(
          `🌐 *IP2LOCATION*\n\n` +
          `📡 IP: *${data.query}*\n` +
          `🌍 Country: *${data.country}*\n` +
          `🏙️ City: *${data.city}*\n` +
          `📍 Region: *${data.regionName}*\n` +
          `🏢 ISP: *${data.isp}*\n` +
          `🏛️ Org: *${data.org}*\n` +
          `🕐 Timezone: *${data.timezone}*\n` +
          `📌 Coords: ${data.lat}, ${data.lon}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) {
        reply(p.phrases.error(`IP lookup crashed — ${e.message}. typical.`));
      }
    }
  },

  {
    command: 'vin',
    aliases: ['vindecode', 'vincheck'],
    category: 'soultools',
    description: 'Decode a vehicle VIN — make/model/year. Usage: vin 1HGBH41JXMN109186',
    execute: async ({ args, reply }) => {
      const vin = args[0]?.toUpperCase();
      if (!vin || vin.length !== 17) return reply(p.phrases.wrongUsage('provide the 17 character vehicle identification number. example! .vin 1HGCM82633A123456'));
      try {
        const { data } = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`, { timeout: 15000 });
        const r = data?.Results?.[0];
        if (!r || r.ErrorCode !== '0') return reply(p.phrases.error(`vin decode failed. ${r?.ErrorText || 'invalid vin'}.`));
        reply(
          `🚗 *VIN DECODER*\n\n` +
          `🔑 VIN: \`${vin}\`\n` +
          `🏭 Make: *${r.Make || 'N/A'}*\n` +
          `🚘 Model: *${r.Model || 'N/A'}*\n` +
          `📅 Year: *${r.ModelYear || 'N/A'}*\n` +
          `🛠️ Trim: *${r.Trim || 'N/A'}*\n` +
          `🔧 Engine: *${r.DisplacementL ? r.DisplacementL + 'L' : 'N/A'}*\n` +
          `⚙️ Transmission: *${r.TransmissionStyle || 'N/A'}*\n` +
          `🏳️ Country: *${r.PlantCountry || 'N/A'}*\n` +
          `🏭 Manufacturer: *${r.Manufacturer || 'N/A'}*\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) {
        reply(p.phrases.error(`VIN service is being sus — ${e.message}`));
      }
    }
  },

  {
    command: 'currencyhistory',
    aliases: ['fxhistory', 'ratehistory'],
    category: 'soultools',
    description: 'Show 7-day historical exchange rate for a currency pair. Usage: currencyhistory USD EUR',
    execute: async ({ args, reply }) => {
      const from = args[0]?.toUpperCase();
      const to = args[1]?.toUpperCase();
      if (!from || !to) return reply(p.phrases.wrongUsage('provide two currency codes. example! .currencyhistory usd eur'));
      try {
        const dates = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split('T')[0]);
        }
        const { data } = await axios.get(`https://api.frankfurter.app/${dates[0]}..${dates[6]}?from=${from}&to=${to}`, { timeout: 15000 });
        if (!data?.rates) return reply(p.phrases.notFound('no rate data found. check the currency pair.'));
        let txt = `📈 *CURRENCY HISTORY: ${from} → ${to}*\n\n`;
        for (const [date, rates] of Object.entries(data.rates)) {
          txt += `📅 ${date}: *${rates[to]?.toFixed(4) || 'N/A'}*\n`;
        }
        txt += `\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
        reply(txt);
      } catch (e) {
        reply(p.phrases.error(`rate history unavailable — ${e.message}`));
      }
    }
  },

  {
    command: 'stockprice',
    aliases: [ 'stonk'],
    category: 'soultools',
    description: 'Get current stock price for a ticker. Usage: stockprice AAPL',
    execute: async ({ args, reply }) => {
      const ticker = args[0]?.toUpperCase();
      if (!ticker) return reply(p.phrases.wrongUsage('provide the stock ticker symbol. example! .stockprice aapl'));
      try {
        const { data } = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return reply(p.phrases.error(`ticker "${ticker}" not found — try a real one`));
        const price = meta.regularMarketPrice;
        const prev = meta.previousClose;
        const change = price - prev;
        const pct = ((change / prev) * 100).toFixed(2);
        const arrow = change >= 0 ? '📈' : '📉';
        reply(
          `${arrow} *STOCK: ${ticker}*\n\n` +
          `💵 Price: *$${price?.toFixed(2)}*\n` +
          `📊 Change: *${change >= 0 ? '+' : ''}${change?.toFixed(2)} (${pct}%)*\n` +
          `📉 Prev Close: *$${prev?.toFixed(2)}*\n` +
          `📈 Day High: *$${meta.regularMarketDayHigh?.toFixed(2) || 'N/A'}*\n` +
          `📉 Day Low: *$${meta.regularMarketDayLow?.toFixed(2) || 'N/A'}*\n` +
          `💱 Currency: *${meta.currency || 'USD'}*\n` +
          `🏦 Exchange: *${meta.fullExchangeName || 'N/A'}*\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) {
        reply(p.phrases.error(`stock data failed — ${e.message}`));
      }
    }
  },


  {
    command: 'gasprice',
    aliases: ['fuelprice', 'petrolprice'],
    category: 'soultools',
    description: 'Get current gas/fuel prices for a country. Usage: gasprice Nigeria',
    execute: async ({ args, reply }) => {
      const country = args.join(' ');
      if (!country) return reply(p.phrases.wrongUsage('provide the country name. example! .gasprice nigeria'));
      try {
        const { data } = await axios.get(`https://api.collectapi.com/gasPrice/allCountries`, {
          timeout: 10000,
          headers: { 'content-type': 'application/json', 'authorization': 'apikey free' }
        });
        if (data?.results) {
          const match = data.results.find(c => c.name?.toLowerCase().includes(country.toLowerCase()));
          if (match) {
            return reply(
              `⛽ *GAS PRICE: ${match.name}*\n\n` +
              `💵 Price: *${match.gasoline || match.price || 'N/A'}*\n` +
              `🥤 Diesel: *${match.diesel || 'N/A'}*\n\n` +
              `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
            );
          }
        }
        // Fallback with static averages for common countries
        const staticPrices = {
          nigeria: 'NGN 617/L (petrol)', usa: '$3.50/gallon', uk: '£1.50/L',
          germany: '€1.75/L', india: '₹102/L', kenya: 'KES 194/L',
          ghana: 'GHS 15/L', 'south africa': 'ZAR 21/L'
        };
        const key = Object.keys(staticPrices).find(k => country.toLowerCase().includes(k));
        if (key) {
          return reply(`⛽ *GAS PRICE: ${country.toUpperCase()}*\n\n💵 Approx: *${staticPrices[key]}*\n\n⚠️ _Prices are estimates, not live data_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
        reply(p.phrases.error(`no fuel data for "${country}" — try a more common country name`));
      } catch (e) {
        reply(p.phrases.error(`fuel data failed — ${e.message}`));
      }
    }
  },

  {
    command: 'exchangerate',
    aliases: ['fx', 'convert2'],
    category: 'soultools',
    description: 'Convert amount between currencies. Usage: exchangerate 100 USD EUR',
    execute: async ({ args, reply }) => {
      const amount = parseFloat(args[0]);
      const from = args[1]?.toUpperCase();
      const to = args[2]?.toUpperCase();
      if (isNaN(amount) || !from || !to) return reply(p.phrases.wrongUsage('provide amount and two currency codes. example! .exchangerate 100 usd eur'));
      try {
        const { data } = await axios.get(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`, { timeout: 10000 });
        if (!data?.rates?.[to]) return reply(p.phrases.error('invalid currency pair — try real ISO codes like USD, EUR, NGN'));
        reply(
          `💱 *EXCHANGE RATE*\n\n` +
          `💰 ${amount} ${from} = *${data.rates[to].toFixed(4)} ${to}*\n` +
          `📅 Date: ${data.date}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) {
        reply(p.phrases.error(`exchange rate failed — ${e.message}`));
      }
    }
  },

  {
    command: 'unitconv',
    aliases: ['convert', 'uc'],
    category: 'soultools',
    description: 'Convert units. Usage: unitconv 10 km to miles | unitconv 100 kg to lbs | unitconv 37 C to F',
    execute: async ({ args, reply }) => {
      // Format: unitconv <value> <from_unit> to <to_unit>
      const raw = args.join(' ').toLowerCase();
      const match = raw.match(/^([\d.]+)\s+(\S+)\s+to\s+(\S+)$/);
      if (!match) return reply(p.phrases.wrongUsage('provide a value and two units. example! .unitconv 10 km to miles'));
      const [, valStr, from, to] = match;
      const val = parseFloat(valStr);
      const conversions = {
        // length
        km_miles: v => v * 0.621371, miles_km: v => v * 1.60934,
        km_m: v => v * 1000, m_km: v => v / 1000,
        m_ft: v => v * 3.28084, ft_m: v => v / 3.28084,
        m_cm: v => v * 100, cm_m: v => v / 100,
        ft_inches: v => v * 12, inches_ft: v => v / 12,
        miles_m: v => v * 1609.34, m_miles: v => v / 1609.34,
        // weight
        kg_lbs: v => v * 2.20462, lbs_kg: v => v / 2.20462,
        kg_g: v => v * 1000, g_kg: v => v / 1000,
        lbs_oz: v => v * 16, oz_lbs: v => v / 16,
        g_oz: v => v * 0.035274, oz_g: v => v / 0.035274,
        // volume
        liters_gallons: v => v * 0.264172, gallons_liters: v => v / 0.264172,
        ml_liters: v => v / 1000, liters_ml: v => v * 1000,
        liters_cups: v => v * 4.22675, cups_liters: v => v / 4.22675,
        // temperature
        c_f: v => (v * 9/5) + 32, f_c: v => (v - 32) * 5/9,
        c_k: v => v + 273.15, k_c: v => v - 273.15,
        f_k: v => (v - 32) * 5/9 + 273.15, k_f: v => (v - 273.15) * 9/5 + 32,
        // speed
        kmh_mph: v => v * 0.621371, mph_kmh: v => v * 1.60934,
        // data
        mb_gb: v => v / 1024, gb_mb: v => v * 1024,
        gb_tb: v => v / 1024, tb_gb: v => v * 1024,
        kb_mb: v => v / 1024, mb_kb: v => v * 1024,
      };
      const key = `${from}_${to}`;
      const fn = conversions[key];
      if (!fn) return reply(p.phrases.error(`no conversion for "${from}" to "${to}" — supported: length (km/miles/m/ft/cm/inches), weight (kg/lbs/g/oz), volume (liters/gallons/ml/cups), temp (C/F/K), speed (kmh/mph), data (kb/mb/gb/tb)`));
      const result = fn(val).toFixed(6).replace(/\.?0+$/, '');
      reply(
        `📐 *UNIT CONVERTER*\n\n` +
        `🔄 ${val} ${from.toUpperCase()} = *${result} ${to.toUpperCase()}*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }

];
