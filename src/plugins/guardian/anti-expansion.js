/*
 * ANTI-EXPANSION.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: antivoicecall, antivideocall, anticommand, anticstic, antigif,
 *           antiaudio, antivideo, antiimage, antidocument, anticontact,
 *           antilocation, antipoll, antiinvite,
 *           antireaction, antimentionall, antirepeat
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (f) => path.join(process.cwd(), 'database', f);
const loadDB = (f) => { try { return fs.existsSync(DB(f)) ? JSON.parse(fs.readFileSync(DB(f),'utf8')) : {}; } catch { return {}; } };
const saveDB = (f, d) => { try { fs.ensureDirSync(path.dirname(DB(f))); fs.writeFileSync(DB(f), JSON.stringify(d,null,2)); } catch {} };

const makeToggle = (cmd, dbFile, name, onMsg) => ({
  command: cmd,
  aliases: [`set${cmd}`, `toggle${cmd}`],
  category: 'darkprotection',
  description: `Toggle ${name}. adminOnly. Usage: .${cmd} on|off`,
  groupOnly: true,
  execute: async ({ sock, chatId, sender, args, reply }) => {
    if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
    if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
    const db = loadDB(dbFile);
    const action = (args[0] || 'status').toLowerCase();
    if (action === 'on')  { db[chatId] = true;  saveDB(dbFile, db); return reply(`🛡️ *${name}: ON*\n\n${onMsg}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
    if (action === 'off') { db[chatId] = false; saveDB(dbFile, db); return reply(`🛡️ *${name}: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
    reply(`🛡️ ${name}: *${db[chatId] ? 'ON 🟢' : 'OFF 🔴'}*\n\n.${cmd} on | off`);
  }
});

module.exports = [

  {
    command: 'antivoicecall',
    aliases: ['blockvoicecall', 'rejectvoicecall'],
    category: 'darkprotection',
    description: 'Block voice calls directed at the bot. adminOnly. Usage: .antivoicecall on|off',
    groupOnly: false,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      const db = loadDB('antivoicecall.json');
      const action = (args[0] || 'status').toLowerCase();
      if (action === 'on')  { db['global'] = true;  saveDB('antivoicecall.json', db); return reply(`📵 *Anti-Voice Call: ON*\n\nAll incoming voice calls will be rejected.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      if (action === 'off') { db['global'] = false; saveDB('antivoicecall.json', db); return reply(`📵 *Anti-Voice Call: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      reply(`📵 Anti-Voice Call: *${db['global'] ? 'ON 🟢' : 'OFF 🔴'}*\n\n.antivoicecall on | off`);
    }
  },

  {
    command: 'antivideocall',
    aliases: ['blockvideocall', 'rejectvideocall'],
    category: 'darkprotection',
    description: 'Block video calls directed at the bot. Usage: .antivideocall on|off',
    groupOnly: false,
    execute: async ({ args, reply }) => {
      const db = loadDB('antivideocall.json');
      const action = (args[0] || 'status').toLowerCase();
      if (action === 'on')  { db['global'] = true;  saveDB('antivideocall.json', db); return reply(`📹 *Anti-Video Call: ON*\n\nAll video calls will be rejected automatically.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      if (action === 'off') { db['global'] = false; saveDB('antivideocall.json', db); return reply(`📹 *Anti-Video Call: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      reply(`📹 Anti-Video Call: *${db['global'] ? 'ON 🟢' : 'OFF 🔴'}*\n\n.antivideocall on | off`);
    }
  },

  makeToggle('anticommand',  'anticommand.json',   'Anti-Command',          'Non-admins can no longer use bot commands in this group.'),
  makeToggle('anticstic',    'anticstic.json',      'Anti-Animated Sticker', 'Animated stickers will be auto-deleted. Static stickers still allowed.'),
  makeToggle('antigif',      'antigif.json',        'Anti-GIF',              'GIF messages will be auto-deleted.'),
  makeToggle('antiaudio',    'antiaudio.json',      'Anti-Audio',            'All audio/voice messages from non-admins will be auto-deleted.'),
  makeToggle('antivideo',    'antivideo.json',      'Anti-Video',            'All video messages from non-admins will be auto-deleted.'),
  makeToggle('antiimage',    'antiimage.json',      'Anti-Image',            'All image messages from non-admins will be auto-deleted.'),
  makeToggle('antidocument', 'antidocument.json',   'Anti-Document',         'All document/file messages from non-admins will be auto-deleted.'),
  makeToggle('anticontact',  'anticontact.json',    'Anti-Contact',          'Shared contact cards will be auto-deleted.'),
  makeToggle('antilocation', 'antilocation.json',   'Anti-Location',         'Shared location messages will be auto-deleted.'),
  makeToggle('antipoll',     'antipoll.json',       'Anti-Poll',             'Polls created by non-admins will be auto-deleted. Admins can still poll.'),
  makeToggle('antiinvite',   'antiinvite.json',     'Anti-Invite',           'Messages with WhatsApp group invite links (wa.me/...) will be auto-deleted.'),
  makeToggle('antireaction', 'antireaction.json',   'Anti-Reaction',         'Non-admins cannot react to messages (reactions will be removed).'),
  makeToggle('antimentionall','antimentionall.json','Anti-Mention-All',      'Mass @all/@everyone style mentions by non-admins will be auto-deleted.'),

];
