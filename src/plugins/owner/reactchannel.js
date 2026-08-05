module.exports = {
  command: 'reactchannel',
  aliases: ['react-channel'],
  category: 'voidsystem',
  description: 'React to a WhatsApp channel post. Usage: reactchannel 👍 https://whatsapp.com/channel/ID/messageID',
  ownerOnly: true,
  execute: async ({ sock, msg, args, chatId, reply }) => {
    if (args.length < 2) {
      return reply(
        `📌 *Usage:* reactchannel [emoji] [channel_link]\n\n` +
        `_Example:_ reactchannel 👍 https://whatsapp.com/channel/123456789/99`
      );
    }

    const emoji = args[0];
    const link = args[1];

    const regex = /whatsapp\.com\/channel\/([0-9]+)(?:\/([0-9]+))?/;
    const match = link.match(regex);

    if (!match) return reply('❌ *Invalid channel link* • Check the URL format');
    const channelId = match[1];
    const messageId = match[2];
    if (!messageId) return reply('❌ *Message ID not found in link* • Copy the full post link');

    const channelJid = `${channelId}@newsletter`;

    try {
      await sock.sendMessage(channelJid, {
        react: {
          text: emoji,
          key: { id: messageId, remoteJid: channelJid }
        }
      });

      reply(
        `✅ *Reacted ${emoji} to channel post*\n\n` +
        `📡 Channel: ${channelId}\n` +
        `🔑 Message: ${messageId}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    } catch (e) {
      reply(`❌ *React failed* • ${e.message || 'Bot may not follow this channel'}`);
    }
  }
};
