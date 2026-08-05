const h = require('../../lib/helpers');

module.exports = {
  command: ['acceptall', 'approveall'],
  aliases: ['acceptrequests'],
  category: 'forbiddenarts',
  description: 'Approve all pending join requests',
  adminOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, prefix, reply }) => {
    if (!isGroupMsg) return reply(h.demonFail('This isn\'t a group you moron'));

    try {
      const botAdmin = await h.isBotAdmin(sock, chatId);
      if (!botAdmin) return reply(h.botNeedsAdminMessage('approve join requests'));

      const requests = await sock.groupRequestParticipantsList(chatId);
      if (!requests || requests.length === 0)
        return reply(h.demonFail('No requests found. The group is as empty as your brain'));

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

      reply(h.demonSuccess(`Approved ${approved} join request(s)`));
    } catch {
      reply(h.demonFail('Failed to approve requests. I My even an admin? you are so dull'));
    }
  }
};
