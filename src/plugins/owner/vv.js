/*
 * VV.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const h = require('../../lib/helpers');

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

module.exports = {
  command: ['vv'],
  aliases: ['viewonce'],
  category: 'voidsystem',
  description: 'Read a view-once media and forward to owner DM',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, cfg }) => {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted)
      return reply(h.demonError('.vv', '.vv — reply to a view-once media'));

    const innerMsg =
      quoted.viewOnceMessageV2?.message ||
      quoted.viewOnceMessage?.message ||
      quoted;

    const msgType = Object.keys(innerMsg)[0];
    const isImage = msgType === 'imageMessage';
    const isVideo = msgType === 'videoMessage';
    const isAudio = msgType === 'audioMessage';

    if (!isImage && !isVideo && !isAudio)
      return reply(h.demonFail('Reply to a view-once image, video, or audio message'));

    try {
      const mediaMsg = innerMsg[msgType];
      let stream;
      if (isImage) stream = await downloadContentFromMessage(mediaMsg, 'image');
      else if (isVideo) stream = await downloadContentFromMessage(mediaMsg, 'video');
      else stream = await downloadContentFromMessage(mediaMsg, 'audio');

      const buf = await streamToBuffer(stream);
      if (!buf || buf.length === 0) return reply(h.demonFail('Download failed. Media may have expired.'));

      const senderNum = sender.split('@')[0];
      const caption = `👁️ *View-Once Unveiled*\nFrom: @${senderNum}`;

      if (isImage) {
        await sock.sendMessage(chatId, { image: buf, caption }, { quoted: msg });
      } else if (isVideo) {
        await sock.sendMessage(chatId, { video: buf, caption }, { quoted: msg });
      } else if (isAudio) {
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });
      }

      console.log('[VV] View-once media revealed — chat:', chatId, '| from:', senderNum);
    } catch (err) {
      reply(h.demonFail('Failed to read view-once media: ' + err.message));
    }
  }
};
