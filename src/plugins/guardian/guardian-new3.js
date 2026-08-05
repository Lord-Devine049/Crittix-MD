/*
 * GUARDIAN-NEW3.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: antiforeign, antigroupmention
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');

const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

module.exports = [

  {
    command: 'antiforeign',
    aliases: ['foreignblock', 'countryblock'],
    category: 'darkprotection',
    description: 'Block numbers outside allowed country codes. Usage: .antiforeign on|off|add <code>|list — e.g. .antiforeign add 234',
    groupOnly: true,
    execute: async ({ sock, chatId, sender, args, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(h.demonFail('Only admins can configure antiforeign.'));
      if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
      const db = loadDB('antiforeign.json');
      if (!db[chatId]) db[chatId] = { enabled: false, allowedCodes: ['234', '1', '44'] };
      const action = (args[0] || 'status').toLowerCase();

      if (action === 'on') {
        db[chatId].enabled = true;
        saveDB('antiforeign.json', db);
        const codes = db[chatId].allowedCodes.join(', ');
        return reply(`🌍 *Anti-Foreign: ON*\n\nAllowed country codes: +${codes}\nNumbers outside these codes will be flagged/kicked on join.\n\nAdd codes: .antiforeign add <code>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'off') {
        db[chatId].enabled = false;
        saveDB('antiforeign.json', db);
        return reply(`🌍 *Anti-Foreign: OFF*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'add') {
        const code = args[1]?.replace(/[^0-9]/g, '');
        if (!code) return reply(h.demonFail('Specify a country code. e.g. .antiforeign add 234'));
        if (!db[chatId].allowedCodes.includes(code)) {
          db[chatId].allowedCodes.push(code);
          saveDB('antiforeign.json', db);
          return reply(h.demonSuccess(`Country code +${code} added to allowlist.`));
        }
        return reply(h.demonFail(`+${code} is already allowed.`));
      }
      if (action === 'remove') {
        const code = args[1]?.replace(/[^0-9]/g, '');
        db[chatId].allowedCodes = db[chatId].allowedCodes.filter(c => c !== code);
        saveDB('antiforeign.json', db);
        return reply(h.demonSuccess(`Country code +${code} removed from allowlist.`));
      }
      if (action === 'list') {
        return reply(`🌍 *Anti-Foreign Status*\n\nEnabled: ${db[chatId].enabled ? 'ON 🟢' : 'OFF 🔴'}\nAllowed codes: +${db[chatId].allowedCodes.join(', +')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(`🌍 Anti-Foreign: *${db[chatId].enabled ? 'ON 🟢' : 'OFF 🔴'}*\n\nAllowed: +${db[chatId].allowedCodes.join(', +')}\n\n.antiforeign on | off | add <code> | remove <code> | list`);
    }
  },

];
