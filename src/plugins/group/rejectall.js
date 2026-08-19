const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['rejectall', 'denyall'],
  aliases: ['declineall'],
  category: 'forbiddenarts',
  description: 'Reject all pending join requests',
  adminOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, prefix, reply }) => {
    if (!isGroupMsg) return reply(h.demonFail('This command only works in groups. Where are you even running this?'));

    try {
      const botAdmin = await h.isBotAdmin(sock, chatId);
      if (!botAdmin) return reply(p.phrases.botNeedsAdmin());

      const requests = await sock.groupRequestParticipantsList(chatId);
      if (!requests || requests.length === 0)
        return reply(h.demonFail('No pending join requests'));

      let rejected = 0;
      for (const req of requests) {
        try {
          await sock.groupRequestParticipantsUpdate(chatId, [req.jid], 'reject');
          rejected++;
          await h.sleep(500);
        } catch {
          continue;
        }
      }

      reply(h.demonSuccess(`Rejected ${rejected} join request(s)`));
    } catch {
      reply(p.phrases.adminOnly());
    }
  }
};
