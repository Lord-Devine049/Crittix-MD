const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = [
  {
    command: 'whoisip',
    aliases: ['iplookup2', 'ipwhois'],
    category: 'soultools',
    description: 'Full WHOIS lookup for an IP address. Usage: whoisip 8.8.8.8',
    execute: async ({ args, reply }) => {
      const ip = args[0];
      if (!ip) return reply(p.phrases.wrongUsage('provide an ip address. example! .whoisip 8.8.8.8'));
      try {
        const r = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, { timeout: 8000 });
        if (r.data.status !== 'success') return reply(`❌ *IP lookup failed:* ${r.data.message}`);
        const d = r.data;
        reply(
          `🌐 *IP WHOIS: ${d.query}*\n\n` +
          `🌍 Country: ${d.country} (${d.countryCode})\n` +
          `🏙️ City: ${d.city}, ${d.regionName}\n` +
          `📮 ZIP: ${d.zip}\n` +
          `📡 ISP: ${d.isp}\n` +
          `🏢 Org: ${d.org}\n` +
          `🔖 AS: ${d.as}\n` +
          `🕐 Timezone: ${d.timezone}\n` +
          `📍 Coords: ${d.lat}, ${d.lon}`
        );
      } catch(e) { reply(`❌ *IP lookup failed:* ${e.message}`); }
    }
  },
  {
    command: 'dns',
    aliases: ['dnslookup', 'checkdns'],
    category: 'soultools',
    description: 'DNS lookup for a domain. Usage: dns google.com',
    execute: async ({ args, reply }) => {
      const domain = args[0];
      if (!domain) return reply(p.phrases.wrongUsage('provide a domain name. example! .dns google.com'));
      try {
        const r = await axios.get(`https://dns.google/resolve?name=${domain}&type=A`, { timeout: 8000 });
        const answers = r.data.Answer || [];
        if (!answers.length) return reply(`❌ *No DNS records found for ${domain}*`);
        const records = answers.slice(0,10).map(a => `• ${a.type === 1 ? 'A' : a.type === 28 ? 'AAAA' : 'CNAME'}: \`${a.data}\` (TTL: ${a.TTL}s)`).join('\n');
        reply(`🌐 *DNS Lookup: ${domain}*\n\n${records}`);
      } catch(e) { reply(`❌ *DNS lookup failed:* ${e.message}`); }
    }
  },
  {
    command: 'port',
    aliases: ['checkport'],
    category: 'soultools',
    description: 'Check if a port is commonly used. Usage: port 443',
    execute: async ({ args, reply }) => {
      const portNum = parseInt(args[0]);
      if (!portNum) return reply(p.phrases.wrongUsage('provide a port number. example! .port 443'));
      const wellKnown = {
        20:'FTP Data', 21:'FTP Control', 22:'SSH', 23:'Telnet', 25:'SMTP',
        53:'DNS', 80:'HTTP', 110:'POP3', 143:'IMAP', 443:'HTTPS',
        465:'SMTPS', 587:'SMTP (Auth)', 993:'IMAPS', 995:'POP3S',
        3306:'MySQL', 5432:'PostgreSQL', 6379:'Redis', 27017:'MongoDB',
        8080:'HTTP Alt', 8443:'HTTPS Alt', 3000:'Node.js Dev', 5000:'Flask/Dev'
      };
      const name = wellKnown[portNum] || 'Unknown/Custom';
      const isPrivileged = portNum < 1024;
      const range = portNum < 1024 ? 'Well-Known (0-1023)' : portNum < 49152 ? 'Registered (1024-49151)' : 'Dynamic/Private (49152-65535)';
      reply(
        `🔌 *Port ${portNum}*\n\n` +
        `🏷️ Service: *${name}*\n` +
        `📊 Range: ${range}\n` +
        `🔐 Privileged: ${isPrivileged ? 'Yes (requires root)' : 'No'}\n\n` +
        `_Run a real port scan at: portchecker.co_`
      );
    }
  },
  {
    command: 'urlcheck',
    aliases: ['safeurl', 'checklink'],
    category: 'soultools',
    description: 'Check if a URL is safe. Usage: urlcheck https://example.com',
    execute: async ({ args, reply }) => {
      const url = args[0];
      if (!url || !url.startsWith('http')) return reply(p.phrases.wrongUsage('provide the full url to check. example! .urlcheck https://example.com'));
      try {
        const hostname = new URL(url).hostname;
        const blacklist = ['bit.ly','tinyurl.com','rebrand.ly']; // basic check
        const isSuspicious = blacklist.some(b => hostname.includes(b));
        const isHttps = url.startsWith('https');
        reply(
          `🔗 *URL Check*\n\n` +
          `🌐 Domain: ${hostname}\n` +
          `🔒 HTTPS: ${isHttps ? '✅ Yes' : '❌ No — Not encrypted'}\n` +
          `⚠️ Shortener: ${isSuspicious ? '🟡 Yes (verify before clicking)' : '✅ No'}\n\n` +
          `_For full scan: virustotal.com_`
        );
      } catch { reply('❌ *Invalid URL format*'); }
    }
  },
  {
    command: 'myfullip',
    aliases: ['myipinfo', 'whatismyip'],
    category: 'soultools',
    description: 'Get bot\'s current IP and location info',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://ipapi.co/json/', { timeout: 8000 });
        const d = r.data;
        reply(
          `🌐 *Bot IP Info*\n\n` +
          `📡 IP: \`${d.ip}\`\n` +
          `🌍 Country: ${d.country_name} (${d.country_code})\n` +
          `🏙️ City: ${d.city}\n` +
          `🌐 ISP: ${d.org}\n` +
          `🕐 Timezone: ${d.timezone}\n` +
          `⏰ UTC Offset: ${d.utc_offset}`
        );
      } catch { reply('⚠️ *IP info unavailable*'); }
    }
  },
  {
    command: 'httpstatus',
    aliases: ['statuscode', 'httpcode'],
    category: 'soultools',
    description: 'Explain an HTTP status code. Usage: httpstatus 404',
    execute: async ({ args, reply }) => {
      const code = parseInt(args[0]);
      const codes = {
        200:'OK — Request successful',201:'Created — Resource created',204:'No Content — Success, no body',
        301:'Moved Permanently — Redirect permanent',302:'Found — Redirect temporary',304:'Not Modified — Cache valid',
        400:'Bad Request — Invalid syntax',401:'Unauthorized — Auth required',403:'Forbidden — Access denied',
        404:'Not Found — Resource doesn\'t exist',405:'Method Not Allowed',408:'Request Timeout',
        429:'Too Many Requests — Rate limited',500:'Internal Server Error',502:'Bad Gateway',
        503:'Service Unavailable',504:'Gateway Timeout',
      };
      if (!code) return reply(p.phrases.wrongUsage('provide an http status code. example! .httpstatus 404'));
      const desc = codes[code];
      if (!desc) return reply(`❓ *HTTP ${code}* — Unknown or rarely used status code`);
      const cat = code < 200 ? 'Informational' : code < 300 ? 'Success ✅' : code < 400 ? 'Redirection 🔄' : code < 500 ? 'Client Error ❌' : 'Server Error 🔥';
      reply(`🔢 *HTTP ${code}*\n\n📋 ${desc}\n🏷️ Category: ${cat}`);
    }
  },
  {
    command: 'domain',
    aliases: [],
    category: 'soultools',
    description: 'Get info about a domain. Usage: domain google.com',
    execute: async ({ args, reply }) => {
      const domain = args[0];
      if (!domain) return reply(p.phrases.wrongUsage('provide the domain name. example! .domain google.com'));
      try {
        const r = await axios.get(`https://api.domainsdb.info/v1/domains/search?domain=${domain}&limit=1`, { timeout: 8000 });
        const d = r.data.domains?.[0];
        if (!d) return reply(`❌ *No info found for ${domain}*`);
        reply(
          `🌐 *Domain Info: ${d.domain}*\n\n` +
          `📅 Created: ${d.create_date ? new Date(d.create_date).toDateString() : 'Unknown'}\n` +
          `🔄 Updated: ${d.update_date ? new Date(d.update_date).toDateString() : 'Unknown'}\n` +
          `🏳️ Country: ${d.country || 'Unknown'}\n` +
          `🏢 Registrar: ${d.registrar || 'Unknown'}`
        );
      } catch(e) { reply(`❌ *Domain lookup failed:* ${e.message}`); }
    }
  },
  {
    command: 'useragent',
    aliases: ['myua', 'whatbrowser'],
    category: 'soultools',
    description: 'Get a random user agent string',
    execute: async ({ reply }) => {
      const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ];
      const ua = agents[Math.floor(Math.random()*agents.length)];
      reply(`🌐 *Random User Agent:*\n\n\`${ua}\``);
    }
  },
  {
    command: 'jsonfmt',
    aliases: ['jsonformat', 'formatjson'],
    category: 'soultools',
    description: 'Format/pretty-print JSON. Usage: jsonfmt {"key":"value"}',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('paste your json text after the command. example! .jsonfmt {"name":"john","age":30}'));
      try {
        const parsed = JSON.parse(text);
        const pretty = JSON.stringify(parsed, null, 2);
        reply(`📋 *Formatted JSON:*\n\n\`\`\`json\n${pretty}\n\`\`\``);
      } catch(e) { reply(`❌ *Invalid JSON:* ${e.message}`); }
    }
  },
  {
    command: 'base58',
    aliases: ['tobase58', 'b58encode'],
    category: 'soultools',
    description: 'Encode text to Base58. Usage: base58 hello',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the text to encode in base58. example! .base58 hello world'));
      const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      const bytes = Buffer.from(text, 'utf8');
      let num = BigInt('0x' + bytes.toString('hex'));
      let result = '';
      while (num > 0n) {
        result = ALPHABET[Number(num % 58n)] + result;
        num = num / 58n;
      }
      for (const byte of bytes) {
        if (byte !== 0) break;
        result = '1' + result;
      }
      reply(`🔡 *Base58 Encoded:*\n\n\`${result}\``);
    }
  },
];
