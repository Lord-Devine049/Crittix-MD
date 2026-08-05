/*
 * NPMSTALK.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Ported from Axis XMD
 */
const axios = require('axios');
const h = require('../../lib/helpers');

module.exports = {
  command: ['npmstalk'],
  aliases: ['npmsearch'],
  category: 'soultools',
  description: 'Look up an npm package',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(h.demonError('.npmstalk', '.npmstalk <package name>'));

    try {
      const res = await axios.get(
        `https://registry.npmjs.org/${encodeURIComponent(text)}`,
        { timeout: 10000 }
      );

      const d = res.data;
      const latest = d['dist-tags']?.latest;
      const info = d.versions?.[latest] || {};

      const out =
        `📦 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗡𝗣𝗠*\n\n` +
        `*Package:* ${d.name}\n` +
        `*Version:* ${latest}\n` +
        `*License:* ${info.license || 'N/A'}\n` +
        `*Description:* ${(d.description || 'N/A').substring(0, 200)}\n` +
        `*Author:* ${typeof d.author === 'object' ? d.author?.name : (d.author || 'N/A')}\n` +
        `*Keywords:* ${(info.keywords || []).slice(0, 5).join(', ') || 'N/A'}\n\n` +
        `🔗 https://npmjs.com/package/${d.name}`;

      reply(out);
    } catch (err) {
      if (err.response?.status === 404)
        return reply(h.demonFail(`Package "${text}" not found on npm`));
      reply(h.demonFail('npm registry unavailable. Try again.'));
    }
  }
};
