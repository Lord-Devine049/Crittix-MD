/*
 * UTILS.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Utility commands: qrcode, note, countdown, cal, timezone, encrypt/decrypt
 */
const h    = require('../../lib/helpers');
const fs   = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


// ── Notes store ──────────────────────────────────────
const NOTES_PATH = path.join(process.cwd(), 'database', 'notes.json');
const loadNotes  = () => { try { return fs.existsSync(NOTES_PATH) ? JSON.parse(fs.readFileSync(NOTES_PATH,'utf8')) : {}; } catch(_) { return {}; } };
const saveNotes  = d => { try { fs.ensureDirSync(path.dirname(NOTES_PATH)); fs.writeFileSync(NOTES_PATH,JSON.stringify(d,null,2)); } catch(_) {} };

// ── Simple XOR encrypt (not crypto, just fun) ────────
const xorCipher = (text, key = 'CRITTIX') => {
  return Buffer.from(text.split('').map((c,i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('')).toString('base64');
};
const xorDecipher = (b64, key = 'CRITTIX') => {
  try {
    const text = Buffer.from(b64, 'base64').toString();
    return text.split('').map((c,i) =>
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
  } catch(_) { return null; }
};

module.exports = [

  {
    command: ['note', 'savenote'],
    category: 'soultools',
    description: 'Save a note with a keyword — retrieve later',
    execute: async ({ sender, chatId, args, reply }) => {
      const notes = loadNotes();
      if (!notes[chatId]) notes[chatId] = {};
      const action = args[0]?.toLowerCase();

      if (action === 'list') {
        const keys = Object.keys(notes[chatId] || {});
        if (!keys.length) return reply(`📝 no notes saved in this chat`);
        return reply(`📝 *Saved notes:*\n\n${keys.map((k,i) => `${i+1}. ${k}`).join('\n')}\n\nUse *.note get <keyword>* to read`);
      }

      if (action === 'get') {
        const key  = args[1]?.toLowerCase();
        const note = notes[chatId]?.[key];
        if (!note) return reply(`😑 no note found for *${key}*`);
        return reply(`📝 *${key}*\n\n${note.text}\n\n_Saved by @${note.by}_`);
      }

      if (action === 'delete') {
        const key = args[1]?.toLowerCase();
        if (!notes[chatId]?.[key]) return reply(`😑 note *${key}* not found`);
        delete notes[chatId][key];
        saveNotes(notes);
        return reply(`🗑 note *${key}* deleted`);
      }

      // Save: .note <keyword> <content>
      const keyword = args[0]?.toLowerCase();
      const content = args.slice(1).join(' ');
      if (!keyword || !content) return reply(p.phrases.wrongUsage('provide a keyword and content. example! .note reminders drink water. or .note list. or .note get reminders.'));

      notes[chatId][keyword] = { text: content, by: sender.split('@')[0], savedAt: Date.now() };
      saveNotes(notes);
      reply(`📝 Note saved as *${keyword}*\nUse *.note get ${keyword}* to retrieve`);
    }
  },

  {
    command: ['countdown', 'cd'],
    category: 'soultools',
    description: 'Start a public countdown in the group',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const from = parseInt(args[0]);
      if (!from || from < 3 || from > 30)
        return reply(`😑 countdown must be between 3 and 30\nUsage: *.countdown 10*`);

      reply(`⏳ starting countdown from *${from}*...`);
      await new Promise(r => setTimeout(r, 1500));

      for (let i = from; i >= 1; i--) {
        await sock.sendMessage(chatId, { text: `*${i}*${i === 1 ? ' 🔥' : ''}` });
        await new Promise(r => setTimeout(r, 1000));
      }
      await sock.sendMessage(chatId, { text: `💥 *GO!*` });
    }
  },

  {
    command: ['cal', 'calendar'],
    category: 'soultools',
    description: 'Show the current month calendar',
    execute: async ({ reply }) => {
      const now   = new Date();
      const year  = now.getFullYear();
      const month = now.getMonth();
      const today = now.getDate();

      const monthNames = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];
      const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];

      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month+1, 0).getDate();

      let cal = `📅 *${monthNames[month]} ${year}*\n`;
      cal    += `${days.join(' ')}\n`;

      let row = ' '.repeat(firstDay * 3);
      for (let d = 1; d <= lastDate; d++) {
        const str = d === today ? `*${String(d).padStart(2)}*` : String(d).padStart(2);
        row += str + ' ';
        if ((d + firstDay) % 7 === 0) { cal += row.trimEnd() + '\n'; row = ''; }
      }
      if (row.trim()) cal += row;
      reply(cal);
    }
  },

  {
    command: ['timezone', 'tz'],
    category: 'soultools',
    description: 'Convert time between timezones',
    execute: async ({ args, reply }) => {
      // .tz 3pm UTC to WAT
      const input = args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('provide the time and both timezones. example! .tz 3pm utc to wat'));

      const TZ_OFFSETS = {
        UTC:0, GMT:0, WAT:1, CAT:2, EAT:3, IST:5.5,
        PKT:5, BST:6, ICT:7, SGT:8, JST:9, AEST:10,
        EST:-5, EDT:-4, CST:-6, MST:-7, PST:-8, PDT:-7,
      };

      const match = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+([A-Z]{2,4})\s+to\s+([A-Z]{2,4})/i);
      if (!match) return reply(`😑 format: *.tz 3pm UTC to WAT*`);

      let [,hr,min,ampm,from,to] = match;
      let hour = parseInt(hr) + (min ? 0 : 0);
      if (ampm?.toLowerCase() === 'pm' && hour !== 12) hour += 12;
      if (ampm?.toLowerCase() === 'am' && hour === 12) hour = 0;

      const fromOff = TZ_OFFSETS[from.toUpperCase()];
      const toOff   = TZ_OFFSETS[to.toUpperCase()];
      if (fromOff === undefined || toOff === undefined)
        return reply(`😑 unknown timezone. Supported: ${Object.keys(TZ_OFFSETS).join(', ')}`);

      const utcHour  = hour - fromOff;
      const convHour = ((utcHour + toOff) % 24 + 24) % 24;
      const convMin  = min || '00';
      const suffix   = convHour >= 12 ? 'PM' : 'AM';
      const disp     = `${convHour % 12 || 12}:${convMin} ${suffix}`;

      reply(`🕐 *${hr}:${min||'00'} ${ampm?.toUpperCase()||''} ${from.toUpperCase()}* = *${disp} ${to.toUpperCase()}*`);
    }
  },

  {
    command: ['encrypt'],
    category: 'soultools',
    description: 'Encrypt a message — only .decrypt can decode it',
    execute: async ({ args, msg, reply }) => {
      const text = args.join(' ') || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
      if (!text) return reply(p.phrases.wrongUsage('type the message to encrypt or reply to one. example! .encrypt my secret message'));
      const encoded = xorCipher(text);
      reply(`🔒 *ENCRYPTED*\n\n\`${encoded}\`\n\nUse *.decrypt <code>* to decode`);
    }
  },

  {
    command: ['decrypt'],
    category: 'soultools',
    description: 'Decrypt an encrypted Crittix message',
    execute: async ({ args, reply }) => {
      const code = args[0];
      if (!code) return reply(p.phrases.wrongUsage('provide the encrypted code to decrypt it. example! .decrypt U2FsdGVkX1...'));
      const decoded = xorDecipher(code);
      if (!decoded) return reply(`😑 invalid code — not a Crittix encrypted message`);
      reply(`🔓 *DECRYPTED*\n\n${decoded}`);
    }
  },

];
