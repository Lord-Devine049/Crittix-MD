/*
 * READQR.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const FormData = require('form-data');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['scanqr'],
  aliases: ['readqr'],
  category: 'soultools',
  description: 'Read a QR code from a quoted image',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted)
      return reply(p.phrases.wrongUsage('reply to a qr code image to read it.'));

    const quotedType = Object.keys(quoted)[0];
    if (quotedType !== 'imageMessage')
      return reply(p.phrases.wrongUsage('reply to an image that contains a qr code.'));

    try {
      const quotedMsg = {
        key: { remoteJid: chatId, id: ctx?.stanzaId, participant: ctx?.participant },
        message: quoted
      };

      const buffer = await sock.downloadMediaMessage(quotedMsg);
      if (!buffer) return reply(p.phrases.error('failed to download the image.'));

      const form = new FormData();
      form.append('file', buffer, { filename: 'qr.png', contentType: 'image/png' });

      const res = await axios.post('https://api.qrserver.com/v1/read-qr-code/', form, {
        headers: form.getHeaders(),
        timeout: 15000
      });

      const qrText = res.data?.[0]?.symbol?.[0]?.data;
      if (!qrText) return reply(p.phrases.notFound('no qr code detected in that image.'));

      reply(`📱 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗤𝗥 𝗥𝗲𝗮𝗱𝗲𝗿*\n\n${qrText}`);
    } catch {
      reply(p.phrases.error('qr read failed. try a clearer image.'));
    }
  }
};
