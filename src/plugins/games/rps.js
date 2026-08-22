/*
 * RPS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'rps',
  category: 'arena',
  description: 'Start Rock Paper Scissors',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    if (!target.length) return reply(p.phrases.wrongUsage('tag your opponent to play rock paper scissors. example! .rps @user'));
    if (target[0] === sender) return reply(p.phrases.error('You cannot play against yourself'));
    const multiplayer = require('../../lib/multiplayer');
    const existing = multiplayer.getSession(cfg.OWNER_NUMBER, chatId);
    if (existing) return reply(p.phrases.error('A game is already running. Use .endgame to cancel'));
    const playerName = msg.pushName || senderNumber;
    multiplayer.createSession(cfg.OWNER_NUMBER, chatId, sender, playerName, 'rps');
    await sock.sendMessage(chatId, { text: '✊✋✌️ ROCK PAPER SCISSORS\n\n@' + sender.split('@')[0] + ' challenged @' + target[0].split('@')[0] + '!\n\nType *join* to accept!', mentions: [sender, target[0]] }, { quoted: msg });
  }
};
