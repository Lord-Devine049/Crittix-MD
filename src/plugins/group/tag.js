const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'tag',
  category: 'abysscommands',
  description: 'Resend quoted message with invisible tags for all members',
  groupOnly: true,
  execute: async ({ sock, msg, chatId, reply }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return reply('reply to a message to tag everyone with it');

    const meta    = await sock.groupMetadata(chatId);
    const members = meta.participants.map(p => p.id.replace(/:\d+@/, '@'));

    const text =
      quoted.conversation ||
      quoted.extendedTextMessage?.text ||
      quoted.imageMessage?.caption ||
      quoted.videoMessage?.caption ||
      quoted.documentMessage?.caption || '';

    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const deleteCmd = async () => {
      try {
        await sock.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            id: msg.key.id,
            participant: msg.key.participant,
            fromMe: true
          }
        });
      } catch (_) {}
      try {
        if (ctx?.stanzaId) {
          await sock.sendMessage(chatId, {
            delete: {
              remoteJid: chatId,
              id: ctx.stanzaId,
              participant: ctx.participant,
              fromMe: false
            }
          });
        }
      } catch (_) {}
    };

    try {
      if (quoted.imageMessage) {
        const buf = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
        await sock.sendMessage(chatId, { image: buf, caption: text, mentions: members });

      } else if (quoted.videoMessage) {
        const buf = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
        await sock.sendMessage(chatId, { video: buf, caption: text, mentions: members });

      } else if (quoted.audioMessage) {
        const buf = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: !!quoted.audioMessage.ptt, mentions: members });

      } else if (quoted.stickerMessage) {
        const buf = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
        await sock.sendMessage(chatId, { sticker: buf, mentions: members });

      } else {
        await sock.sendMessage(chatId, { text: text || '\u200b', mentions: members });
      }

      await deleteCmd();

    } catch (e) {
      await sock.sendMessage(chatId, { text: text || '\u200b', mentions: members });
      await deleteCmd();
    }
  }
};
