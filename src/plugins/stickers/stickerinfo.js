/*
 * STICKERINFO.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'stickerinfo',
  category: 'shadowutilities',
  description: 'Get sticker pack info',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const stickMsg = quoted?.stickerMessage || msg.message?.stickerMessage;
    if (!stickMsg) return reply(h.demonError('.stickerinfo', 'Reply to a sticker'));
    reply('🎴 Sticker Info\n\n📦 Pack: ' + (stickMsg.packName||'Unknown') + '\n👤 Author: ' + (stickMsg.author||'Unknown') + '\n🆔 ID: ' + (stickMsg.fileSha256?.toString('hex')?.slice(0,16)||'N/A'));
  }
};
