/*
 * GIVEMEMOJI.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'givememoji',
  category: 'shadowutilities',
  description: 'Get random emoji sticker',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const emojis = ['😂','🥶','💀','😈','🔥','💯','🤡','👀','💜','🫡'];
    reply(emojis[Math.floor(Math.random()*emojis.length)]);
  }
};
