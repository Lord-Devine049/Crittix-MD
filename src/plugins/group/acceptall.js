const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['acceptall', 'approveall'],
  aliases: ['acceptrequests'],
  category: 'forbiddenarts',
  description: 'Approve all pending join requests',
  adminOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, prefix, reply }) => {
    if (!isGroupMsg) return reply(p.phrases.groupOnly());

    try {
      const botAdmin = await h.isBotAdmin(sock, chatId);
      if (!botAdmin) return reply(p.phrases.botNeedsAdmin());

      const requests = await sock.groupRequestParticipantsList(chatId);
      if (!requests || requests.length === 0)
        return reply(p.phrases.notFound('no join requests found in this group.'));

      let approved = 0;
      for (const req of requests) {
        try {
          await sock.groupRequestParticipantsUpdate(chatId, [req.jid], 'approve');
          approved++;
          await h.sleep(500);
        } catch {
          continue;
        }
      }

      reply(p.phrases.success(`approved ${approved} join request(s).`));
    } catch {
      reply(p.phrases.adminOnly());
    }
  }
};
