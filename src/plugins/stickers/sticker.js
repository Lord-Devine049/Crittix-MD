/*
 * STICKER.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Uses exif.js for proper sticker conversion with EXIF metadata
 */
const h = require('../../lib/helpers');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const exif = require('../../lib/exif');
const p = require('../../lib/phrases');


module.exports = {
  command: ['sticker'],
  category: 'shadowutilities',
  description: 'Convert image/video to sticker',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, cfg, prefix, reply }) => {

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
    const vidMsg = quoted?.videoMessage || msg.message?.videoMessage;

    if (!imgMsg && !vidMsg)
      return reply(p.phrases.wrongUsage('reply to or send an image or video with the command. example! .sticker'));

    // React loading
    await sock.sendMessage(chatId, { react: { text: '🎨', key: msg.key } }).catch(() => {});

    try {
      const type = imgMsg ? 'image' : 'video';
      const mediaMsg = imgMsg || vidMsg;

      // Check video duration limit (10s)
      if (vidMsg && (vidMsg.seconds || 0) > 10)
        return reply(p.phrases.error(`Video too long: ${vidMsg.seconds}s — max 10 seconds`));

      const stream = await downloadContentFromMessage(mediaMsg, type);
      let buf = Buffer.from([]);
      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
      if (!buf || buf.length === 0) return reply(p.phrases.error('Failed to download media'));

      const packname = cfg.BOT_NAME || 'Crittix-MD';
      const author   = cfg.OWNER_NAME || 'LORD DEVINE';

      let stickerPath;
      if (type === 'image') {
        stickerPath = await exif.writeExifImg(buf, { packname, author });
      } else {
        stickerPath = await exif.writeExifVid(buf, { packname, author });
      }

      const fs = require('fs');
      const stickerBuf = fs.readFileSync(stickerPath);
      fs.unlinkSync(stickerPath);

      await sock.sendMessage(chatId, { sticker: stickerBuf }, { quoted: msg });
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } }).catch(() => {});

    } catch (e) {
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } }).catch(() => {});
      reply(p.phrases.error('sticker creation failed. ' + e.message));
    }
  }
};
