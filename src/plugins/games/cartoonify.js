/*
 * CARTOONIFY.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['cartoonify', 'cartoon'],
  aliases: [],
  category: 'arena',
  description: 'Turn a quoted image into cartoon style',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted) return reply(h.demonError('.cartoonify', '.cartoonify — reply to an image'));

    const quotedType = Object.keys(quoted)[0];
    if (quotedType !== 'imageMessage')
      return reply(h.demonFail('Reply to an image message'));

    try {
      const quotedMsg = {
        key: { remoteJid: chatId, id: ctx?.stanzaId, participant: ctx?.participant },
        message: quoted
      };

      const buffer = await sock.downloadMediaMessage(quotedMsg);
      if (!buffer) return reply(h.demonFail('Failed to download image'));

      const axios = require('axios');
      const FormData = require('form-data');

      const form = new FormData();
      form.append('image', buffer, { filename: 'img.jpg', contentType: 'image/jpeg' });

      const res = await axios.post(
        'https://prexzyapis.com/tools/cartoonify',
        form,
        { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 30000 }
      );

      await sock.sendMessage(chatId, {
        image: Buffer.from(res.data),
        caption: '🎨 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗖𝗮𝗿𝘁𝗼𝗼𝗻𝗶𝗳𝘆*'
      }, { quoted: msg });
    } catch {
      reply(h.demonFail('Cartoonify failed. Try another image.'));
    }
  }
};
