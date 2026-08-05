/*
 * ENDGAME.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'endgame',
  category: 'arena',
  description: 'End current game session',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const multiplayer = require('../../lib/multiplayer');
    const session = multiplayer.getSession(cfg.OWNER_NUMBER, chatId);
    if (!session) return reply(h.demonFail('No active game in this chat'));
    if (session.hostId !== sender && !isOwner && !isSudo) return reply(h.demonFail('Only the host or owner can end the game'));
    multiplayer.endSession(cfg.OWNER_NUMBER, chatId);
    reply('✓ Game ended');
  }
};
