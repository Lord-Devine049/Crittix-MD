/*
 * CREATOR.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['creator', 'about'],
  category: 'soultools',
  description: 'Bot info and creator',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    reply('╔════════════════════╗\n║ 💜 CRITTIX-MD\n╚════════════════════╝\n║ Creator: LORD DEVINE\n║ Bot: ' + cfg.BOT_NAME + '\n║ Version: ' + (cfg.VERSION||'1.0.0') + '\n║ Prefix: ' + cfg.PREFIX + '\n║ Mode: ' + cfg.MODE + '\n╚════════════════════╝');
  }
};
