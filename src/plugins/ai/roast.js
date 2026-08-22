/*
 * ROAST.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'airoast',
  aliases: ['roastai'],
  category: 'darkintelligence',
  description: 'AI-powered roast — tag or reply to a person',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    const jid = target[0];
    const name = jid ? '@' + jid.split('@')[0] : (args.join(' ') || 'this guy');
    try {
      const crittixAI = require('../../lib/crittix-ai');
      await sock.sendPresenceUpdate('composing', chatId);
      await new Promise(r => setTimeout(r, 1500));
      const roast = await crittixAI.generateRoast(name + ' exists', name, 5, 'roast');
      await sock.sendMessage(chatId, { text: roast, mentions: jid ? [jid] : [] }, { quoted: msg });
    } catch(e) { reply(p.phrases.error('roast failed. ' + e.message)); }
  }
};
