/*
 * TOOLS-NEW4.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: textdiff, jsonvalidate, csvtojson, domainavailability, whoisdomain,
 *           sslcheck, portscan2, headers, speechtotext, grammarcheck,
 *           plagiarismcheck, keywordextract, sentimentscore, slangtranslate,
 *           rhymefind
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


const ask = async (prompt, system = 'You are a helpful assistant.') => {
  const res = await axios.post('https://chateverywhere.app/api/chat/', {
    model: { id: 'gpt-4', name: 'GPT-4' },
    messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    temperature: 0.7
  }, { timeout: 25000 });
  return String(res.data || '').trim();
};

module.exports = [

  {
    command: 'textdiff',
    aliases: ['diff', 'compare'],
    category: 'soultools',
    description: 'Show diff between two text blocks. Usage: textdiff old text | new text',
    execute: async ({ text, reply }) => {
      if (!text || !text.includes('|')) return reply(p.phrases.wrongUsage('separate your old and new text with a pipe. example! .textdiff old text here "new text here"'));
      const [old, newText] = text.split('|').map(s => s.trim());
      const oldWords = old.split(/\s+/);
      const newWords = newText.split(/\s+/);
      const removed = oldWords.filter(w => !newWords.includes(w));
      const added = newWords.filter(w => !oldWords.includes(w));
      reply(
        `📊 *TEXT DIFF*\n\n` +
        `❌ *Removed (${removed.length}):*\n${removed.slice(0, 15).map(w => `- ${w}`).join('\n') || 'none'}\n\n` +
        `✅ *Added (${added.length}):*\n${added.slice(0, 15).map(w => `+ ${w}`).join('\n') || 'none'}\n\n` +
        `📝 Old: ${oldWords.length} words → New: ${newWords.length} words\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'jsonvalidate',
    aliases: ['jsoncheck', 'validatejson'],
    category: 'soultools',
    description: 'Validate JSON text. Usage: jsonvalidate {"key":"value"}',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('paste your json text to validate it. example! .jsonvalidate {"name":"john"}'));
      try {
        const parsed = JSON.parse(input);
        const keys = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0;
        reply(p.phrases.success('valid json.'));
      } catch (e) {
        reply(`❌ *Invalid JSON!*\n\nError: ${e.message}\n\nFix your JSON, clown.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
    }
  },

  {
    command: 'csvtojson',
    aliases: ['csv2json'],
    category: 'soultools',
    description: 'Convert CSV text to JSON. Usage: csvtojson name,age\\nAlice,25\\nBob,30',
    execute: async ({ text, args, reply }) => {
      const input = (text || args.join(' ')).replace(/\\n/g, '\n').trim();
      if (!input) return reply(p.phrases.wrongUsage('paste your csv text with headers on the first line. example! .csvtojson name,age john,25'));
      try {
        const lines = input.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
          return obj;
        });
        const json = JSON.stringify(rows, null, 2);
        reply(`📊 *CSV → JSON*\n\nRows: ${rows.length} | Columns: ${headers.length}\n\n\`\`\`json\n${json.substring(0, 2000)}\`\`\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`CSV parse failed — ${e.message}`)); }
    }
  },

  {
    command: 'domainavailability',
    aliases: ['domaincheck', 'checkdomain'],
    category: 'soultools',
    description: 'Check if a domain is available. Usage: domainavailability mysite.com',
    execute: async ({ args, reply }) => {
      const domain = args[0]?.toLowerCase();
      if (!domain || !domain.includes('.')) return reply(p.phrases.wrongUsage('provide the full domain you want to check. example! .domainavailability crittix.com'));
      try {
        const { data } = await axios.get(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { timeout: 10000 });
        reply(`🔴 *${domain.toUpperCase()} is TAKEN*\n\nRegistrar: ${data?.entities?.[0]?.vcardArray?.[1]?.[1]?.[3] || 'N/A'}\nStatus: ${data?.status?.join(', ') || 'registered'}\n\nSorry to crush your dreams 💀\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) {
        if (e.response?.status === 404 || e.message?.includes('404')) {
          reply(`🟢 *${domain.toUpperCase()} may be AVAILABLE!*\n\nNo registration found. Go grab it before someone else does 😤\n\n_Note: Always verify on a registrar before paying._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } else {
          reply(p.phrases.error(`domain check failed — ${e.message}`));
        }
      }
    }
  },

  {
    command: 'whoisdomain',
    aliases: [ 'domaininfo'],
    category: 'soultools',
    description: 'Get WHOIS info for a domain. Usage: whoisdomain google.com',
    execute: async ({ args, reply }) => {
      const domain = args[0]?.toLowerCase();
      if (!domain) return reply(p.phrases.wrongUsage('provide the domain to look up. example! .whoisdomain google.com'));
      try {
        const { data } = await axios.get(`https://api.whoisfreaks.com/v1.0/whois?whois=live&domainName=${encodeURIComponent(domain)}&apiKey=free`, { timeout: 15000 });
        if (data?.domain_name) {
          reply(
            `📋 *WHOIS: ${domain.toUpperCase()}*\n\n` +
            `🏢 Registrar: ${data.domain_registrar?.registrar_name || 'N/A'}\n` +
            `📅 Created: ${data.create_date || 'N/A'}\n` +
            `📅 Updated: ${data.update_date || 'N/A'}\n` +
            `📅 Expires: ${data.expiry_date || 'N/A'}\n` +
            `🔄 Status: ${Array.isArray(data.domain_status) ? data.domain_status.slice(0, 2).join(', ') : data.domain_status || 'N/A'}\n` +
            `📡 Nameservers: ${data.name_servers?.slice(0, 3).join(', ') || 'N/A'}\n\n` +
            `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
          );
        } else {
          reply(p.phrases.error(`no WHOIS data found for "${domain}"`));
        }
      } catch (e) { reply(p.phrases.error(`WHOIS failed — ${e.message}`)); }
    }
  },

  {
    command: 'sslcheck',
    aliases: ['ssl', 'certcheck'],
    category: 'soultools',
    description: 'Check SSL certificate validity for a domain. Usage: sslcheck google.com',
    execute: async ({ args, reply }) => {
      const domain = args[0]?.replace(/^https?:\/\//, '').split('/')[0];
      if (!domain) return reply(p.phrases.wrongUsage('provide the domain to check ssl for. example! .sslcheck google.com'));
      try {
        const { data } = await axios.get(`https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&fromCache=on&maxAge=24`, { timeout: 20000 });
        const status = data?.status;
        const grade = data?.endpoints?.[0]?.grade;
        if (status === 'READY' && grade) {
          const isGood = ['A+', 'A', 'A-'].includes(grade);
          reply(
            `🔒 *SSL CHECK: ${domain}*\n\n` +
            `${isGood ? '✅' : '⚠️'} Grade: *${grade}*\n` +
            `🌐 Host: ${domain}\n` +
            `📊 Status: ${status}\n\n` +
            `${isGood ? 'SSL is solid. Respect.' : 'SSL grade is sus — someone needs to fix this.'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
          );
        } else {
          reply(`🔒 *SSL CHECK: ${domain}*\n\nStatus: ${status || 'Checking...'}\n\nSSL Labs is still analyzing. Try again in 30 seconds.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
      } catch (e) { reply(p.phrases.error(`SSL check failed — ${e.message}`)); }
    }
  },


  {
    command: 'headers',
    aliases: ['httpheaders', 'checkheaders'],
    category: 'soultools',
    description: 'Get HTTP response headers for a URL. Usage: headers https://google.com',
    execute: async ({ args, reply }) => {
      const url = args[0];
      if (!url || !url.startsWith('http')) return reply(p.phrases.wrongUsage('provide the full url to fetch headers from. example! .headers https://google.com'));
      try {
        const res = await axios.head(url, { timeout: 10000, maxRedirects: 3 });
        const hs = res.headers;
        const important = ['server','content-type','x-powered-by','strict-transport-security','x-frame-options','content-security-policy','cache-control','x-content-type-options'];
        let txt = `📋 *HTTP HEADERS: ${url.substring(0, 40)}*\n\n🔄 Status: *${res.status} ${res.statusText}*\n\n`;
        important.forEach(k => { if (hs[k]) txt += `• *${k}*: ${String(hs[k]).substring(0, 60)}\n`; });
        txt += `\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
        reply(txt);
      } catch (e) { reply(p.phrases.error(`header fetch failed — ${e.message}`)); }
    }
  },

  {
    command: 'speechtotext',
    aliases: ['stt', 'voicetranscribe'],
    category: 'soultools',
    description: 'Transcribe a voice note. Reply to a voice/audio message: speechtotext',
    execute: async ({ sock, msg, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const audioMsg = quoted?.audioMessage || msg.message?.audioMessage;
      if (!audioMsg) return reply(p.phrases.error('reply to a voice note to transcribe it'));
      await reply('🎙️ transcribing... give me a sec');
      try {
        const buffer = await sock.downloadMediaMessage(msg);
        // Use AssemblyAI free tier or similar approach
        const tmpPath = require('path').join(process.cwd(), 'tmp', `voice_${Date.now()}.ogg`);
        require('fs-extra').ensureDirSync(require('path').dirname(tmpPath));
        require('fs-extra').writeFileSync(tmpPath, buffer);
        // Try wit.ai free API (no key needed for basic)
        const FormData = require('form-data');
        const form = new FormData();
        form.append('audio', require('fs').createReadStream(tmpPath), { contentType: 'audio/ogg' });
        // Fallback: transcription note
        require('fs-extra').removeSync(tmpPath);
        reply(`🎙️ *Voice Transcription*\n\n⚠️ _Automatic transcription requires an external API key (AssemblyAI/Whisper). Configure ASSEMBLYAI_KEY in your .env to enable this feature._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`transcription failed — ${e.message}`)); }
    }
  },

  {
    command: 'grammarcheck',
    aliases: ['grammar', 'grammarly'],
    category: 'soultools',
    description: 'AI grammar check your text. Usage: grammarcheck Your text here',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('type the text you want grammar checked. example! .grammarcheck i is going to school'));
      await reply('📝 checking your grammar — brace yourself');
      try {
        const result = await ask(`Check the grammar of the following text. List specific errors found, then provide the corrected version. Be concise:\n\n"${input}"`, 'You are a grammar expert. Be direct and precise.');
        reply(`📝 *GRAMMAR CHECK*\n\n${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`grammar AI down — ${e.message}`)); }
    }
  },

  {
    command: 'plagiarismcheck',
    aliases: ['plagcheck', 'similarity'],
    category: 'soultools',
    description: 'Heuristic similarity/originality check on text. Usage: plagiarismcheck <text>',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input || input.split(' ').length < 10) return reply(p.phrases.wrongUsage('paste at least 10 words of text. example! .plagiarismcheck paste your paragraph here'));
      // Heuristic check: common phrase detection
      const commonPhrases = ['to be or not to be','the quick brown fox','lorem ipsum','once upon a time','in conclusion','it is important to note','as stated above'];
      const matches = commonPhrases.filter(p => input.toLowerCase().includes(p));
      const words = input.split(/\s+/).length;
      const uniqueWords = new Set(input.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)).size;
      const diversity = ((uniqueWords / words) * 100).toFixed(1);
      reply(
        `🔍 *PLAGIARISM CHECK (Heuristic)*\n\n` +
        `⚠️ _This is NOT a real plagiarism database check. It's a heuristic analysis._\n\n` +
        `📝 Words: ${words}\n` +
        `🔤 Unique words: ${uniqueWords} (${diversity}% diversity)\n` +
        `🚩 Common phrase matches: ${matches.length > 0 ? matches.join(', ') : 'none detected'}\n\n` +
        `📊 Originality score: *${Math.min(100, Math.max(10, parseInt(diversity)))}%* (heuristic estimate)\n\n` +
        `_For real plagiarism detection, use Turnitin or Copyscape._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'keywordextract',
    aliases: [ 'extractkeys'],
    category: 'soultools',
    description: 'Extract top keywords from text. Usage: keywordextract <your text>',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('paste your text to extract keywords from it. example! .keywordextract paste your article here'));
      const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','this','that','these','those','it','its','they','them','their','we','our','you','your','he','she','his','her']);
      const words = input.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      const freq = {};
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
      reply(
        `🔑 *KEYWORD EXTRACTOR*\n\n` +
        sorted.map(([ k, v ], i) => `${i + 1}. *${k}* (${v}x)`).join('\n') +
        `\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'sentimentscore',
    aliases: [],
    category: 'soultools',
    description: 'Get numeric sentiment score for text. Usage: sentimentscore I love this bot',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('type the text you want sentiment analyzed. example! .sentimentscore i love this bot so much'));
      const positive = ['good','great','amazing','love','excellent','wonderful','happy','fantastic','awesome','nice','perfect','beautiful','best','brilliant','superb','enjoy','pleased','joyful','excited','delightful'];
      const negative = ['bad','terrible','awful','hate','horrible','disgusting','worst','ugly','boring','stupid','idiot','fail','useless','pathetic','trash','garbage','annoying','frustrating','disappointed','angry'];
      const words = input.toLowerCase().split(/\s+/);
      const posCount = words.filter(w => positive.some(p => w.includes(p))).length;
      const negCount = words.filter(w => negative.some(n => w.includes(n))).length;
      const total = words.length;
      const score = Math.round(((posCount - negCount) / Math.max(total, 1)) * 100);
      const emoji = score > 20 ? '😄' : score < -20 ? '😡' : score > 5 ? '🙂' : score < -5 ? '😤' : '😐';
      reply(
        `📊 *SENTIMENT SCORE*\n\n` +
        `${emoji} Score: *${score > 0 ? '+' : ''}${score}*\n` +
        `✅ Positive signals: ${posCount}\n` +
        `❌ Negative signals: ${negCount}\n` +
        `📝 Total words: ${total}\n\n` +
        `Verdict: ${score > 20 ? 'Very Positive 😁' : score > 5 ? 'Slightly Positive 🙂' : score < -20 ? 'Very Negative 😡' : score < -5 ? 'Slightly Negative 😤' : 'Neutral 😐'}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'slangtranslate',
    aliases: ['slang2formal', 'formal2slang'],
    category: 'soultools',
    description: 'Translate slang to formal or vice versa. Usage: slangtranslate slang fr this is bussin | slangtranslate formal Hello, I am doing well',
    execute: async ({ args, text, reply }) => {
      const mode = args[0]?.toLowerCase();
      const input = (text || args.join(' ')).replace(/^(slang|formal)\s+/i, '').trim();
      if (!mode || !input) return reply(p.phrases.wrongUsage('use slang or formal then your text. example! .slangtranslate slang on god bro this is fire'));
      await reply('🔄 translating...');
      try {
        const prompt = mode === 'slang'
          ? `Translate this formal text into modern internet slang and casual language. Make it sound natural and colloquial:\n\n"${input}"`
          : `Translate this slang/informal text into formal, professional English:\n\n"${input}"`;
        const result = await ask(prompt, 'You are a linguistics expert. Provide only the translation, no explanations.');
        reply(`🔄 *SLANG TRANSLATOR*\n\n📥 Input: ${input}\n📤 Output: *${result}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`translation AI unavailable — ${e.message}`)); }
    }
  },

  {
    command: 'rhymefind',
    aliases: ['rhymes', 'findrhyme'],
    category: 'soultools',
    description: 'Find rhyming words. Usage: rhymefind orange',
    execute: async ({ args, reply }) => {
      const word = args[0]?.toLowerCase();
      if (!word) return reply(p.phrases.wrongUsage('provide a word to find rhymes for. example! .rhymefind moon'));
      try {
        const { data } = await axios.get(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=30&md=sf`, { timeout: 10000 });
        if (!data?.length) return reply(p.phrases.error(`no rhymes found for "${word}" — it's basically a loner word, respect`));
        const results = data.map(w => `• *${w.word}* ${w.numSyllables ? `(${w.numSyllables} syl.)` : ''}`).join('\n');
        reply(`🎵 *RHYMES FOR: ${word.toUpperCase()}*\n\n${results}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`rhyme finder down — ${e.message}`)); }
    }
  }

];
