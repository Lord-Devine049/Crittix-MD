const p = require('../../lib/phrases');

module.exports = {
  command: 'join',
  aliases: ['joingc', 'joingroup'],
  category: 'abysscommands',
  description: 'Make the bot join a group via invite link. Owner/Sudo only.',
  ownerOnly: true,
  execute: async ({ sock, text, reply, prefix }) => {
    if (!text) return reply(p.phrases.wrongUsage('provide the full group invite link. example! .join https://chat.whatsapp.com/xxxxxxxx'));

    const link = text.trim();
    const code = link.includes('chat.whatsapp.com/')
      ? link.split('chat.whatsapp.com/')[1]
      : link;

    if (!code) return reply('❌ *Invalid invite link*');

    try {
      await sock.groupAcceptInvite(code);
      reply(p.phrases.success('joined the group.'));
    } catch (e) {
      reply(`❌ *Failed to join* • ${e.message || 'Link may be invalid or expired'}`);
    }
  }
};
