/*
 * LISTREQUESTS.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: listrequests
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'listrequests',
  aliases: ['pendingrequests', 'joinrequests'],
  category: 'groupanalytics',
  description: 'View pending group join requests without approving/rejecting them.',
  adminOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      const botAdmin = await h.isBotAdmin(sock, chatId);
      if (!botAdmin) return reply(p.phrases.adminOnly());

      const requests = await sock.groupRequestParticipantsList(chatId);
      if (!requests || requests.length === 0) {
        return reply(`📋 *PENDING JOIN REQUESTS*\n\nNone. Ghost group energy.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }

      const lines = requests.map((r, i) => {
        const num = r.jid?.split('@')[0] || 'unknown';
        const time = r.requestTime ? new Date(r.requestTime * 1000).toLocaleString() : 'unknown time';
        return `${i + 1}. @${num}\n   📅 ${time}`;
      });

      reply(
        `📋 *PENDING JOIN REQUESTS (${requests.length})*\n\n` +
        lines.join('\n\n') +
        `\n\n💡 Use *.acceptall* or *.rejectall* to act on them.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    } catch (e) {
      reply(p.phrases.error(`Couldn't fetch requests: ${e.message}`));
    }
  }
};
