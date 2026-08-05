module.exports = {
  command: 'totalmembers',
  aliases: ['members', 'gccount'],
  category: 'groupanalytics',
  description: 'Show total member count and admin breakdown',
  groupOnly: true,
  execute: async ({ groupMetadata, reply }) => {
    const participants = groupMetadata.participants;
    const admins = participants.filter(p => p.admin).length;
    const total = participants.length;

    reply(
      `👥 *Group Members*\n\n` +
      `📊 *Total:* ${total}\n` +
      `👑 *Admins:* ${admins}\n` +
      `👤 *Members:* ${total - admins}\n\n` +
      `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
    );
  }
};
