module.exports = {
  command: 'channelinfo',
  aliases: ['cinfo', 'getbotinfo', 'freebot'],
  category: 'soultools',
  description: 'Get info about a WhatsApp channel via link. Usage: channelinfo https://whatsapp.com/channel/XXX',
  execute: async ({ sock, text, reply }) => {
    if (!text || !text.includes('whatsapp.com/channel/')) {
      return reply(
        `📢 *Usage:* channelinfo https://whatsapp.com/channel/XXX\n\n` +
        `_You can also forward a message from a channel and use .idch_\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }

    const code = text.split('whatsapp.com/channel/')[1]?.split('/')[0];
    if (!code) return reply('❌ *Invalid channel link*');

    try {
      const meta = await sock.newsletterMetadata('invite', code);

      reply(
        `📡 *Channel Info*\n\n` +
        `📛 *Name:* ${meta.name || 'Unknown'}\n` +
        `🆔 *JID:* ${meta.id}\n` +
        `👥 *Followers:* ${(meta.subscribers || 0).toLocaleString()}\n` +
        `✔️ *Verified:* ${meta.verification === 'VERIFIED' ? 'Yes ✅' : 'No'}\n` +
        `📝 *Desc:* ${meta.description || '—'}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    } catch (e) {
      reply(`❌ *Failed to fetch channel info* • ${e.message}`);
    }
  }
};
