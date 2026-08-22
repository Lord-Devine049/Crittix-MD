/*
 * QCSTICKER.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Ported from Axis XMD
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: ['qc', 'quotesticker'],
  aliases: ['quotecards'],
  category: 'creativetools',
  description: 'Create a quote card sticker from your text',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('type your quote after the command. example! .qc if you know you know.'));

    const name = msg.pushName || sender.split('@')[0];

    let profilePic;
    try {
      profilePic = await sock.profilePictureUrl(sender, 'image');
    } catch {
      profilePic = 'https://telegra.ph/file/6880771c1f1b5954d7203.jpg';
    }

    const url = `https://www.laurine.site/api/generator/qc?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}&photo=${encodeURIComponent(profilePic)}`;

    try {
      const { Sticker, StickerTypes } = require('wa-sticker-formatter');
      const sticker = new Sticker(url, {
        pack: '𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗',
        author: 'Quote Card',
        type: StickerTypes.FULL,
        quality: 90
      });
      const buffer = await sticker.toBuffer();
      await sock.sendMessage(chatId, { sticker: buffer }, { quoted: msg });
    } catch {
      reply(p.phrases.error('quote sticker failed. check if wa-sticker-formatter is installed.'));
    }
  }
};
