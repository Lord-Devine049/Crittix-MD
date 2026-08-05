/*
 * GROUPJID.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'groupjid',
  category: 'abysscommands',
  description: 'Get group JID',
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    reply('📋 Group JID: ' + chatId);
  }
};
