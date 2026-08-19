/*
 * GUARDIAN-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: antifake, antighost, antidoxx, antiscam, antiphishing,
 *           antinsfw, antihatespeech, antibully, antitroll,
 *           antishorturl, antivoicenote
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

const toggle = async (feature, chatId, sock, sender, args, reply, descriptions) => {
  if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
  if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
  const db = loadDB(`${feature}.json`);
  const action = args[0]?.toLowerCase() || 'status';
  if (action === 'on') {
    db[chatId] = true;
    saveDB(`${feature}.json`, db);
    return reply(`🛡️ *${descriptions.name}: ON*\n\n${descriptions.onMsg}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
  }
  if (action === 'off') {
    db[chatId] = false;
    saveDB(`${feature}.json`, db);
    return reply(`🛡️ *${descriptions.name}: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
  }
  reply(`🛡️ *${descriptions.name}: ${db[chatId] ? 'ON 🟢' : 'OFF 🔴'}*\n\n.${feature} on | off\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
};

module.exports = [

  {
    command: 'antidoxx',
    aliases: ['doxxprotect', 'antidoxing'],
    category: 'darkprotection',
    description: 'Toggle anti-doxx — auto-delete messages containing personal info patterns. Usage: antidoxx on | off',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const doxxDB = loadDB('antidoxx.json');
      const action = args[0]?.toLowerCase() || 'status';
      if (action === 'on') {
        doxxDB[chatId] = { enabled: true, patterns: ['\\b\\d{11}\\b', 'bank account', 'sort code', 'ssn', 'passport number', 'home address', 'bvn'] };
        saveDB('antidoxx.json', doxxDB);
        return reply(`🛡️ *Anti-Doxx: ON*\n\nMessages with phone numbers, addresses, BVN, SSN patterns will be auto-deleted.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'off') { doxxDB[chatId] = { enabled: false }; saveDB('antidoxx.json', doxxDB); return reply(`🛡️ *Anti-Doxx: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      reply(`🛡️ Anti-Doxx: *${doxxDB[chatId]?.enabled ? 'ON' : 'OFF'}*\n\n.antidoxx on | off`);
    }
  },

  {
    command: 'antiscam',
    aliases: ['scamprotect', 'scamfilter'],
    category: 'darkprotection',
    description: 'Toggle anti-scam keyword filter. Usage: antiscam on | off | add <keyword>',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const scamDB = loadDB('antiscam.json');
      if (!scamDB[chatId]) scamDB[chatId] = { enabled: false, keywords: ['click here to claim', 'you have won', 'send btc', 'wire transfer urgent', 'investment returns 100%', 'whatsapp winner', 'account suspended click'] };
      const action = args[0]?.toLowerCase() || 'status';
      if (action === 'on') { scamDB[chatId].enabled = true; saveDB('antiscam.json', scamDB); return reply(`🛡️ *Anti-Scam: ON*\n\nFiltering ${scamDB[chatId].keywords.length} scam patterns.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      if (action === 'off') { scamDB[chatId].enabled = false; saveDB('antiscam.json', scamDB); return reply(`🛡️ *Anti-Scam: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      if (action === 'add') {
        const keyword = args.slice(1).join(' ').toLowerCase();
        scamDB[chatId].keywords.push(keyword);
        saveDB('antiscam.json', scamDB);
        return reply(`✅ *Scam keyword added:* "${keyword}"\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'list') return reply(`🛡️ *SCAM KEYWORDS*\n\n${scamDB[chatId].keywords.join('\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      reply(`Anti-Scam: *${scamDB[chatId].enabled ? 'ON' : 'OFF'}*\n\n.antiscam on | off | add <keyword> | list`);
    }
  },

  {
    command: 'antiphishing',
    aliases: ['phishingprotect', 'phishfilter'],
    category: 'darkprotection',
    description: 'Toggle anti-phishing domain checker. Usage: antiphishing on | off',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const phishDB = loadDB('antiphishing.json');
      const action = args[0]?.toLowerCase() || 'status';
      const knownPhishDomains = ['bit.ly/free', 'win-prize', 'click-now', 'claim-reward', 'free-airtime', 'data-bonus'];
      if (action === 'on') { phishDB[chatId] = { enabled: true, domains: knownPhishDomains }; saveDB('antiphishing.json', phishDB); return reply(`🛡️ *Anti-Phishing: ON*\n\nLinks matching known phishing patterns will be flagged/deleted.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      if (action === 'off') { phishDB[chatId] = { enabled: false }; saveDB('antiphishing.json', phishDB); return reply(`🛡️ *Anti-Phishing: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      reply(`Anti-Phishing: *${phishDB[chatId]?.enabled ? 'ON' : 'OFF'}*\n\n.antiphishing on | off`);
    }
  },

  {
    command: 'antishorturl',
    aliases: ['shorturlban', 'nobitly'],
    category: 'darkprotection',
    description: 'Toggle blocking of short URLs (bit.ly, tinyurl, etc). Usage: antishorturl on | off',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const shortDB = loadDB('antishorturl.json');
      const action = args[0]?.toLowerCase() || 'status';
      const blockedDomains = ['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly','adf.ly','linktr.ee'];
      if (action === 'on') { shortDB[chatId] = { enabled: true, domains: blockedDomains }; saveDB('antishorturl.json', shortDB); return reply(`🛡️ *Anti-Short URL: ON*\n\nBlocking ${blockedDomains.length} short URL services.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      if (action === 'off') { shortDB[chatId] = { enabled: false }; saveDB('antishorturl.json', shortDB); return reply(`🛡️ *Anti-Short URL: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      reply(`Anti-Short URL: *${shortDB[chatId]?.enabled ? 'ON' : 'OFF'}*\n\nBlocked: ${blockedDomains.join(', ')}\n\n.antishorturl on | off`);
    }
  },

];
