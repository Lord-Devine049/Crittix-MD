/*
 * MUTE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'mute',
  aliases: ['close'],
  category: 'abysscommands',
  description: 'Mute group',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const sender_ = msg.key.participant || msg.key.remoteJid;
    if (!await h.isSenderAdmin(sock, chatId, sender_)) return reply(p.phrases.adminOnly());
    if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
    await sock.groupSettingUpdate(chatId, 'announcement');
    reply('✓ Group muted, only the strong shall type');
  }
};
