const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

module.exports = {
  command: 'setgrouppp',
  aliases: ['setgcpp', 'grouppp'],
  category: 'abysscommands',
  description: 'Set the group profile picture. Reply to an image.',
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, msg, chatId, reply }) => {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted) return reply('🖼️ *Reply to an image* with setgrouppp');

    const imgMsg = quoted.imageMessage;
    if (!imgMsg) return reply('❌ *Reply to an image (JPG/PNG)*');

    try {
      const stream = await downloadContentFromMessage(imgMsg, 'image');
      const buf = await streamToBuffer(stream);
      if (!buf || buf.length === 0) return reply('❌ *Failed to download image*');

      await sock.updateProfilePicture(chatId, buf);
      reply('✅ *Group picture updated*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_');
    } catch (e) {
      reply(`❌ *Failed to update* • ${e.message}`);
    }
  }
};
