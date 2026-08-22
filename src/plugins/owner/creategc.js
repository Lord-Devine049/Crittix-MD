const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['creategc'],
  aliases: ['mkgroup'],
  category: 'voidsystem',
  description: 'Create a new WhatsApp group',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type the group name. example! .creategc crittix vip lounge'));

    const groupName = args.join(' ');

    try {
      const created = await sock.groupCreate(groupName, []);
      const code = await sock.groupInviteCode(created.id);
      const link = `https://chat.whatsapp.com/${code}`;

      await sock.sendMessage(chatId, {
        text:
          `✅ *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗖𝗿𝗲𝗮𝘁𝗲𝗚𝗖*\n\n` +
          `💳 Name: ${created.subject}\n` +
          `👤 Owner: @${created.owner?.split('@')[0]}\n` +
          `🔗 ${link}`,
        mentions: created.owner ? [created.owner] : []
      }, { quoted: msg });
    } catch (err) {
      reply(p.phrases.error('Failed to create group. Check bot permissions.'));
    }
  }
};
