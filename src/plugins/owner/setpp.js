const h = require('../../lib/helpers');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: ['setpp'],
  category: 'voidsystem',
  description: "Set the bot's own profile picture. Reply to an image.",
  ownerOnly: true,
  execute: async ({ sock, msg, chatId, reply }) => {

    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted)
      return reply(h.demonError('.setpp', 'Reply to an image to set as bot profile picture'));

    const imgMsg = quoted.imageMessage;
    if (!imgMsg)
      return reply(h.demonError('.setpp', 'Replied message must be an image (JPG/PNG)'));

    await sock.sendMessage(chatId, { react: { text: '⏳', key: msg.key } }).catch(() => {});

    try {
      const stream = await downloadContentFromMessage(imgMsg, 'image');
      let buf = Buffer.from([]);
      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

      if (!buf || buf.length === 0)
        return reply(h.demonFail('Failed to download the image. It may have expired.'));

      await sock.updateProfilePicture(sock.authState?.creds?.me?.id, buf);

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } }).catch(() => {});
      reply(`✅ *Bot profile picture updated!*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    } catch (e) {
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } }).catch(() => {});
      reply(h.demonFail('Failed to update profile picture: ' + e.message.slice(0, 150)));
    }
  }
};
