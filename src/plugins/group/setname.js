module.exports = {
  command: 'setname',
  aliases: ['setgcname', 'renamegc', 'groupname'],
  category: 'abysscommands',
  description: 'Change the group name/subject. Usage: setname New Name',
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, chatId, text, prefix, reply }) => {
    if (!text) return reply(`📝 *Usage:* ${prefix}setname New Group Name`);

    try {
      await sock.groupUpdateSubject(chatId, text);
      reply(`✅ *Group name changed to:* ${text}`);
    } catch (e) {
      reply(`❌ *Failed:* ${e.message}`);
    }
  }
};
