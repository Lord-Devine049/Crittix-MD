/*
 * STEAL.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Uses exif.js addExif for proper EXIF metadata on stolen stickers
 */
const h = require('../../lib/helpers');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const exif = require('../../lib/exif');

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

module.exports = {
  command: ['steal'],
  aliases: ['take'],
  category: 'shadowutilities',
  description: 'Re-package a sticker with custom pack/author name',
  execute: async ({ sock, msg, args, text, sender, chatId, cfg, prefix, reply }) => {

    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted)
      return reply(h.demonError('.steal', `${prefix}steal PackName | Author — reply to a sticker`));

    const quotedType = Object.keys(quoted)[0];
    if (quotedType !== 'stickerMessage')
      return reply(h.demonFail('That\'s not a sticker. Reply to a sticker.'));

    // Parse packname | author from args
    let packname = cfg?.BOT_NAME  || 'Crittix-MD';
    let author   = cfg?.OWNER_NAME || 'LORD DEVINE';

    if (text && text.includes('|')) {
      const [p, a] = text.split('|').map(s => s.trim());
      if (p) packname = p;
      if (a) author   = a;
    } else if (text && text.trim()) {
      packname = text.trim();
    }

    // React loading
    await sock.sendMessage(chatId, { react: { text: '🎨', key: msg.key } }).catch(() => {});

    try {
      const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
      const buf    = await streamToBuffer(stream);
      if (!buf || buf.length === 0) return reply(h.demonFail('Failed to download sticker'));

      const stickerBuf = await exif.addExif(buf, packname, author);

      await sock.sendMessage(chatId, { sticker: stickerBuf }, { quoted: msg });
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } }).catch(() => {});

    } catch (err) {
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } }).catch(() => {});
      reply(h.demonFail('Sticker steal failed: ' + err.message));
    }
  }
};
