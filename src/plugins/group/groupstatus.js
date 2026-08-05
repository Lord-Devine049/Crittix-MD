const { downloadContentFromMessage, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'groupstatus',
  aliases: ['togcstatus', 'gst', 'gcstatus'],
  category: 'abysscommands',
  description: 'Post text, image, or video as a group status.',
  groupOnly: true,
  adminOnly: false,
  execute: async ({ sock, msg, text, chatId, reply }) => {

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;

    const imageMsg = quotedMsg?.imageMessage || null;
    const videoMsg = quotedMsg?.videoMessage || null;
    const audioMsg = quotedMsg?.audioMessage || null;

    const hasMedia = Boolean(imageMsg || videoMsg || audioMsg);

    if (!quotedMsg && !text) {
      return reply(
        `Are you stupid? Reply to a media or provide text.\n\n` +
`*Example:* .groupstatus Hello group\n` +
`Or reply to an image/video/audio with .groupstatus`
      );
    }

    function genId() {
      return '3EB0' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    try {
      // ── Text only ──
      if (!hasMedia && text) {
        await sock.relayMessage(chatId, {
          groupStatusMessageV2: {
            message: {
              extendedTextMessage: {
                text,
                backgroundArgb: 0xFF000000,
                textArgb: 0xFFFFFFFF,
                font: 1,
                contextInfo: { mentionedJid: [], isGroupStatus: true }
              }
            }
          }
        }, { messageId: genId() });
        return reply('📢 *Text status posted!*');
      }

      // ── Download ──
      let stream, mediaType;
      if (imageMsg)      { stream = await downloadContentFromMessage(imageMsg, 'image'); mediaType = 'image'; }
      else if (videoMsg) { stream = await downloadContentFromMessage(videoMsg, 'video'); mediaType = 'video'; }
      else if (audioMsg) { stream = await downloadContentFromMessage(audioMsg, 'audio'); mediaType = 'audio'; }

      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      if (!buffer.length) return reply('❌ *Failed to download media*');

      // ── Upload to WA servers ──
      const mediaInput = mediaType === 'image' ? { image: buffer }
                       : mediaType === 'video' ? { video: buffer }
                       : { audio: buffer };

      const preparedMedia = await prepareWAMessageMedia(mediaInput, { upload: sock.waUploadToServer });

      if (text) {
        if (mediaType === 'image' && preparedMedia.imageMessage) preparedMedia.imageMessage.caption = text;
        if (mediaType === 'video' && preparedMedia.videoMessage) preparedMedia.videoMessage.caption = text;
      }

      // ── Relay as group status only ──
      await sock.relayMessage(chatId, {
        groupStatusMessageV2: { message: preparedMedia }
      }, { messageId: genId() });

      reply('*Done!*');
    } catch (e) {
      reply(`⚠️ *Failed* • ${e.message}`);
    }
  }
};
