/*
 * SCREENVARIANTS.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: sstab, ssphone, ssfull
 * Extends existing webss command with viewport presets
 */
const h = require('../../lib/helpers');

const BASE = 'https://prexzyapis.com/ssweb/webss';

const viewports = {
  sstab: { label: 'Tablet (1024×768)', size: '1024x768' },
  ssphone: { label: 'Phone (390×844)', size: '390x844' },
  ssfull: { label: 'Full Page', size: 'full' }
};

module.exports = [

  {
    command: 'sstab',
    aliases: ['screenshottab', 'tabshot'],
    category: 'soultools',
    description: 'Take a tablet-viewport screenshot of a website. Usage: .sstab <url>',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const url = args[0];
      if (!url || !url.startsWith('http')) return reply(h.demonError('.sstab', '.sstab <url> — e.g. .sstab https://google.com'));
      await reply('📸 *Taking tablet screenshot...*');
      try {
        await sock.sendMessage(chatId, {
          image: { url: `${BASE}?url=${encodeURIComponent(url)}&size=1024x768` },
          caption: `📱 *Screenshot (Tablet 1024×768)*\n🔗 ${url}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Tab screenshot failed — ${e.message}`)); }
    }
  },

  {
    command: 'ssphone',
    aliases: ['screenshotphone', 'mobileshot'],
    category: 'soultools',
    description: 'Take a phone-viewport screenshot of a website. Usage: .ssphone <url>',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const url = args[0];
      if (!url || !url.startsWith('http')) return reply(h.demonError('.ssphone', '.ssphone <url> — e.g. .ssphone https://google.com'));
      await reply('📱 *Taking mobile screenshot...*');
      try {
        await sock.sendMessage(chatId, {
          image: { url: `${BASE}?url=${encodeURIComponent(url)}&size=390x844` },
          caption: `📱 *Screenshot (Mobile 390×844)*\n🔗 ${url}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Phone screenshot failed — ${e.message}`)); }
    }
  },

  {
    command: 'ssfull',
    aliases: ['screenshotfull', 'fullshot', 'fullpagess'],
    category: 'soultools',
    description: 'Take a full-page screenshot of a website. Usage: .ssfull <url>',
    execute: async ({ sock, msg, args, chatId, reply }) => {
      const url = args[0];
      if (!url || !url.startsWith('http')) return reply(h.demonError('.ssfull', '.ssfull <url> — e.g. .ssfull https://google.com'));
      await reply('🖥️ *Taking full-page screenshot... this one might take a moment.*');
      try {
        await sock.sendMessage(chatId, {
          image: { url: `${BASE}?url=${encodeURIComponent(url)}&full=true` },
          caption: `🖥️ *Full-Page Screenshot*\n🔗 ${url}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Full-page screenshot failed — ${e.message}`)); }
    }
  }

];
