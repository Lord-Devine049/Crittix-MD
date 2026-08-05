/*
 * SAVE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['save'],
  aliases: ['savemedia'],
  category: 'voidsystem',
  description: 'Save any quoted media to bot DM',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted)
      return reply(h.demonError('.save', '.save — reply to any media'));

    const quotedType = Object.keys(quoted)[0];
    const isImage = quotedType === 'imageMessage';
    const isVideo = quotedType === 'videoMessage';
    const isAudio = quotedType === 'audioMessage';
    const isDoc   = quotedType === 'documentMessage';

    if (!isImage && !isVideo && !isAudio && !isDoc)
      return reply(h.demonFail('Reply to an image, video, audio, or document'));

    try {
      const quotedMsg = {
        key: {
          remoteJid: chatId,
          id: ctx?.stanzaId,
          participant: ctx?.participant
        },
        message: quoted
      };

      const media = await sock.downloadMediaMessage(quotedMsg);
      if (!media) return reply(h.demonFail('Download failed'));

      const botJid = (sock.authState?.creds?.me?.id || '').replace(/:\d+@/, '@');

      if (isImage) {
        await sock.sendMessage(botJid, {
          image: media,
          caption: `📸 Saved from ${sender.split('@')[0]}`
        });
      } else if (isVideo) {
        await sock.sendMessage(botJid, {
          video: media,
          caption: `🎥 Saved from ${sender.split('@')[0]}`
        });
      } else if (isAudio) {
        await sock.sendMessage(botJid, {
          audio: media,
          mimetype: 'audio/mpeg'
        });
      } else if (isDoc) {
        await sock.sendMessage(botJid, {
          document: media,
          mimetype: quoted.documentMessage?.mimetype || 'application/octet-stream',
          fileName: quoted.documentMessage?.fileName || 'file'
        });
      }

      reply(h.demonSuccess('Media saved to bot DM'));
    } catch {
      reply(h.demonFail('Failed to save media'));
    }
  }
};
