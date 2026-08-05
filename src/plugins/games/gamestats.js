/*
 * GAMESTATS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'gamestats',
  category: 'groupanalytics',
  description: 'Show game statistics',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const multiplayer = require('../../lib/multiplayer');
    const session = multiplayer.getSession(cfg.OWNER_NUMBER, chatId);
    if (!session) return reply('No active game in this chat');
    reply('🎮 Active Game: ' + session.gameType + '\n👥 Players: ' + session.players.map(p => p.name).join(' vs ') + '\n📊 Status: ' + session.status);
  }
};
