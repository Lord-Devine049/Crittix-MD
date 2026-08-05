module.exports = {
  command: 'revoke',
  aliases: ['revokelink', 'resetlink'],
  category: 'abysscommands',
  description: 'Revoke the current group invite link and generate a new one',
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, chatId, reply }) => {
    try {
      await sock.groupRevokeInvite(chatId);
      const code = await sock.groupInviteCode(chatId);
      reply(`✅ *Group link reset*`);
    } catch (e) {
      reply(`❌ *Failed to reset link* • ${e.message}`);
    }
  }
};
