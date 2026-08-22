/*
 * SAVE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


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
      return reply(p.phrases.wrongUsage('reply to any media to save it. example! reply to an image then .save'));

    const quotedType = Object.keys(quoted)[0];
    const isImage = quotedType === 'imageMessage';
    const isVideo = quotedType === 'videoMessage';
    const isAudio = quotedType === 'audioMessage';
    const isDoc   = quotedType === 'documentMessage';

    if (!isImage && !isVideo && !isAudio && !isDoc)
      return reply(p.phrases.error('Reply to an image, video, audio, or document'));

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
      if (!media) return reply(p.phrases.error('Download failed'));

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

      reply(p.phrases.success('media saved to bot dm.'));
    } catch {
      reply(p.phrases.error('Failed to save media'));
    }
  }
};
