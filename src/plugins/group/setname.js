const p = require('../../lib/phrases');

module.exports = {
  command: 'setname',
  aliases: ['setgcname', 'renamegc', 'groupname'],
  category: 'abysscommands',
  description: 'Change the group name/subject. Usage: setname New Name',
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, chatId, text, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the new group name after the command. example! .setname night raiders reborn.'));

    try {
      await sock.groupUpdateSubject(chatId, text);
      reply(p.phrases.success(`group name changed to ${text}.`));
    } catch (e) {
      reply(`❌ *Failed:* ${e.message}`);
    }
  }
};
