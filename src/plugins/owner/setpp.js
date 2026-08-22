const h = require('../../lib/helpers');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const p = require('../../lib/phrases');


module.exports = {
  command: ['setpp'],
  category: 'voidsystem',
  description: "Set the bot's own profile picture. Reply to an image.",
  ownerOnly: true,
  execute: async ({ sock, msg, chatId, reply }) => {

    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted)
      return reply(p.phrases.wrongUsage('reply to an image to set it as the bot profile picture.'));

    const imgMsg = quoted.imageMessage;
    if (!imgMsg)
      return reply(p.phrases.wrongUsage('the replied message must be an image. jpg or png only.'));

    await sock.sendMessage(chatId, { react: { text: '⏳', key: msg.key } }).catch(() => {});

    try {
      const stream = await downloadContentFromMessage(imgMsg, 'image');
      let buf = Buffer.from([]);
      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

      if (!buf || buf.length === 0)
        return reply(p.phrases.error('Failed to download the image. It may have expired.'));

      await sock.updateProfilePicture(sock.authState?.creds?.me?.id, buf);

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } }).catch(() => {});
      reply(p.phrases.success('bot profile picture updated.'));
    } catch (e) {
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } }).catch(() => {});
      reply(p.phrases.error('failed to update profile picture. ' + e.message.slice(0, 150)));
    }
  }
};
