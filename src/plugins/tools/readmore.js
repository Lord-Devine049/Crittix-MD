/*
 * READMORE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'readmore',
  category: 'soultools',
  description: 'Send text with read more',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const txt = args.join(' ');
    if (!txt) return;
    await sock.sendMessage(chatId, { text: txt + '\u200B'.repeat(4001) }, { quoted: msg });
  }
};
