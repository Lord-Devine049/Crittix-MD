/*
 * GITCLONE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');

module.exports = {
  command: ['gitclone'],
  aliases: ['git'],
  category: 'darkweb',
  description: 'Download a GitHub repo as ZIP',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const url = args[0];
    if (!url || !url.includes('github.com'))
      return reply(h.demonError('.gitclone', '.gitclone <github url>'));

    const match = url.match(/(?:https?:\/\/|git@)github\.com[/:]([\w.-]+)\/([\w.-]+)/i);
    if (!match) return reply(h.demonFail('Invalid GitHub URL'));

    const [, user, rawRepo] = match;
    const repo = rawRepo.replace(/\.git$/, '');
    const zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`;

    try {
      const head = await axios.head(zipUrl, { timeout: 10000 });
      const disposition = head.headers['content-disposition'] || '';
      const filenameMatch = disposition.match(/filename=(.+)/);
      const filename = filenameMatch ? filenameMatch[1].trim() : `${repo}.zip`;

      await sock.sendMessage(chatId, {
        document: { url: zipUrl },
        fileName: filename.endsWith('.zip') ? filename : filename + '.zip',
        mimetype: 'application/zip',
        caption: `📦 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗚𝗶𝘁𝗖𝗹𝗼𝗻𝗲*\n\n${user}/${repo}`
      }, { quoted: msg });
    } catch {
      reply(h.demonFail('Failed to fetch GitHub repo. Check the URL.'));
    }
  }
};
