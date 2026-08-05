module.exports = {
  command: 'groupinfo',
  aliases: ['ginfo', 'gcinfo'],
  category: 'groupanalytics',
  description: 'Show detailed group information and settings',
  groupOnly: true,
  execute: async ({ sock, chatId, groupMetadata, reply }) => {
    const { subject, id, owner, creation, participants, restrict, announce, approve, ephemeralDuration } = groupMetadata;
    const admins = participants.filter(p => p.admin).length;
    const bots = participants.filter(p => p.id.includes('lid')).length;

    reply(
      `📊 *Group Information*\n\n` +
      `📌 *Name:* ${subject}\n` +
      `🆔 *ID:* ${id}\n` +
      `👑 *Owner:* @${(owner || 'Unknown').split('@')[0]}\n` +
      `📅 *Created:* ${creation ? new Date(creation * 1000).toLocaleDateString() : 'Unknown'}\n` +
      `👥 *Members:* ${participants.length}\n` +
      `👮 *Admins:* ${admins}\n` +
      `🤖 *Bots:* ${bots}\n` +
      `🔒 *Restrict:* ${restrict ? 'Admins only' : 'Everyone'}\n` +
      `📢 *Announce:* ${announce ? 'Admins only' : 'Everyone'}\n` +
      `✅ *Approve:* ${approve ? 'ON' : 'OFF'}\n` +
      `⏱️ *Disappear:* ${ephemeralDuration ? ephemeralDuration + 's' : 'OFF'}\n\n` +
      `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
      owner ? [owner] : []
    );
  }
};
