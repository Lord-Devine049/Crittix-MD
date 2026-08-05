/*
 * READQR.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const FormData = require('form-data');
const h = require('../../lib/helpers');

module.exports = {
  command: ['scanqr'],
  aliases: ['readqr'],
  category: 'soultools',
  description: 'Read a QR code from a quoted image',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted)
      return reply(h.demonError('.readqr', '.readqr — reply to a QR code image'));

    const quotedType = Object.keys(quoted)[0];
    if (quotedType !== 'imageMessage')
      return reply(h.demonFail('Reply to an image containing a QR code'));

    try {
      const quotedMsg = {
        key: { remoteJid: chatId, id: ctx?.stanzaId, participant: ctx?.participant },
        message: quoted
      };

      const buffer = await sock.downloadMediaMessage(quotedMsg);
      if (!buffer) return reply(h.demonFail('Failed to download image'));

      const form = new FormData();
      form.append('file', buffer, { filename: 'qr.png', contentType: 'image/png' });

      const res = await axios.post('https://api.qrserver.com/v1/read-qr-code/', form, {
        headers: form.getHeaders(),
        timeout: 15000
      });

      const qrText = res.data?.[0]?.symbol?.[0]?.data;
      if (!qrText) return reply(h.demonFail('No QR code detected in image'));

      reply(`📱 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗤𝗥 𝗥𝗲𝗮𝗱𝗲𝗿*\n\n${qrText}`);
    } catch {
      reply(h.demonFail('QR read failed. Try a clearer image.'));
    }
  }
};
