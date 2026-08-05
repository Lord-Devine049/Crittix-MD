/*
 * CUSTOMCMDS.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: setcmd, delcmd, listcmd
 * Let owner define text-trigger → text-response commands without writing code
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');

const DB_FILE = 'custom-commands.json';
const DB = () => path.join(process.cwd(), 'database', DB_FILE);
const loadCmds = () => { try { return fs.existsSync(DB()) ? JSON.parse(fs.readFileSync(DB(), 'utf8')) : {}; } catch { return {}; } };
const saveCmds = (data) => { try { fs.ensureDirSync(path.dirname(DB())); fs.writeFileSync(DB(), JSON.stringify(data, null, 2)); } catch {} };

// Export the loader so devine.js / message handler can check custom commands
const getCustomCommands = () => loadCmds();

module.exports = [

  {
    command: 'setcmd',
    aliases: ['addcmd', 'createcmd'],
    category: 'voidsystem',
    description: 'Create a custom text-trigger command. ownerOnly. Usage: .setcmd trigger | response text',
    ownerOnly: true,
    execute: async ({ text, reply }) => {
      if (!text || !text.includes('|')) return reply(h.demonError('.setcmd', '.setcmd <trigger> | <response>', 'Separate trigger and response with |'));
      const [trigger, ...responseParts] = text.split('|');
      const t = trigger.trim().toLowerCase().replace(/\s+/g, '');
      const r = responseParts.join('|').trim();
      if (!t || !r) return reply(h.demonFail('Both trigger and response must be non-empty.'));
      if (t.length > 30) return reply(h.demonFail('Trigger too long. Keep it under 30 characters.'));
      const data = loadCmds();
      data[t] = { response: r, createdAt: Date.now() };
      saveCmds(data);
      reply(h.demonSuccess(`Custom command created!\n\nTrigger: .${t}\nResponse: ${r.substring(0, 80)}...`));
    }
  },

  {
    command: 'delcmd',
    aliases: ['removecmd', 'rmcmd'],
    category: 'voidsystem',
    description: 'Delete a custom command. ownerOnly. Usage: .delcmd <trigger>',
    ownerOnly: true,
    execute: async ({ args, reply }) => {
      const t = (args[0] || '').toLowerCase().trim();
      if (!t) return reply(h.demonError('.delcmd', '.delcmd <trigger>', 'Specify which command to delete.'));
      const data = loadCmds();
      if (!data[t]) return reply(h.demonFail(`No custom command ".${t}" found. You sure you made it?`));
      delete data[t];
      saveCmds(data);
      reply(h.demonSuccess(`Custom command .${t} deleted. Gone like your dignity.`));
    }
  },

  {
    command: 'listcmd',
    aliases: ['mycmds', 'showcmds', 'customcmds'],
    category: 'voidsystem',
    description: 'List all custom commands. ownerOnly.',
    ownerOnly: true,
    execute: async ({ reply }) => {
      const data = loadCmds();
      const entries = Object.entries(data);
      if (!entries.length) return reply(`📋 *CUSTOM COMMANDS*\n\nNone set. Create one with .setcmd\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      const list = entries.map(([t, info], i) => `${i + 1}. *.${t}* → ${info.response.substring(0, 60)}${info.response.length > 60 ? '...' : ''}`).join('\n');
      reply(`📋 *CUSTOM COMMANDS (${entries.length})*\n\n${list}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }

];

module.exports.getCustomCommands = getCustomCommands;
