/*
 * VV2.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Like .vv but sends the media to owner DM instead of the group
 */
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

module.exports = {
  command: ['vv2'],
  aliases: ['vvdm'],
  category: 'voidsystem',
  description: 'Read a view-once media and send it to owner DM silently',
  ownerOnly: true,
  execute: async ({ sock, msg, sender, chatId, reply, cfg }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted)
      return reply(p.phrases.wrongUsage('reply to a view once media to reveal it.'));

    const innerMsg =
      quoted.viewOnceMessageV2?.message ||
      quoted.viewOnceMessage?.message   ||
      quoted;

    const msgType = Object.keys(innerMsg)[0];
    const isImage = msgType === 'imageMessage';
    const isVideo = msgType === 'videoMessage';
    const isAudio = msgType === 'audioMessage';

    if (!isImage && !isVideo && !isAudio)
      return reply(p.phrases.error('Reply to a view-once image, video, or audio message'));

    try {
      const mediaMsg = innerMsg[msgType];
      let stream;
      if (isImage)      stream = await downloadContentFromMessage(mediaMsg, 'image');
      else if (isVideo) stream = await downloadContentFromMessage(mediaMsg, 'video');
      else              stream = await downloadContentFromMessage(mediaMsg, 'audio');

      const buf = await streamToBuffer(stream);
      if (!buf || buf.length === 0)
        return reply(p.phrases.error('Download failed. Media may have expired.'));

      const ownerJid  = cfg.OWNER_NUMBER + '@s.whatsapp.net';
      const senderNum = (ctx?.participant || sender || '').split('@')[0];
      const caption   = `👁️ *View-Once (VV2)*\nFrom: @${senderNum}\nChat: ${chatId.split('@')[0]}`;

      if (isImage) {
        await sock.sendMessage(ownerJid, { image: buf, caption });
      } else if (isVideo) {
        await sock.sendMessage(ownerJid, { video: buf, caption });
      } else {
        await sock.sendMessage(ownerJid, { text: caption });
        await sock.sendMessage(ownerJid, { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true });
      }

      // Silent confirm to the user only (no group drop)
      await reply(p.phrases.success('sent to owner dm.'));

      console.log('[VV2] View-once sent to owner DM — chat:', chatId, '| from:', senderNum);
    } catch (err) {
      reply(p.phrases.error('failed to read view-once media. ' + err.message));
    }
  }
};
