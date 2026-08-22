/*
 * STICKERINFO.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'stickerinfo',
  category: 'shadowutilities',
  description: 'Get sticker pack info',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
    const stickMsg = quoted?.stickerMessage || msg.message?.stickerMessage;
    if (!stickMsg) return reply(p.phrases.wrongUsage('reply to a sticker to get its info.'));
    reply('🎴 Sticker Info\n\n📦 Pack: ' + (stickMsg.packName||'Unknown') + '\n👤 Author: ' + (stickMsg.author||'Unknown') + '\n🆔 ID: ' + (stickMsg.fileSha256?.toString('hex')?.slice(0,16)||'N/A'));
  }
};
