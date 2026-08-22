/*
 * QR.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'qr',
  category: 'soultools',
  description: 'Generate QR code',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const txt = args.join(' ');
    if (!txt) return reply(p.phrases.wrongUsage('type text or a url to generate a qr code. example! .qr https://crittix.com'));
    const url = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(txt);
    await sock.sendMessage(chatId, { image: { url }, caption: '🔲 QR: ' + txt }, { quoted: msg });
  }
};
