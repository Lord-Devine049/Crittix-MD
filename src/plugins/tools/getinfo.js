/*
 * GETINFO.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'getinfo',
  category: 'soultools',
  description: 'Get user info',

  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    let _gtP = [];
    if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
    const target = h.getTarget(msg, _gtP);
    const jid = target[0] || msg.key.remoteJid;
    const num = jid.split('@')[0];
    let ppUrl = null;
    try { ppUrl = await sock.profilePictureUrl(jid, 'image'); } catch(_) {}
    const info = '👤 User Info\n\n📱 Number: +' + num + '\n🆔 JID: ' + jid;
    if (ppUrl) await sock.sendMessage(chatId, { image: { url: ppUrl }, caption: info, mentions: [jid] }, { quoted: msg });
    else reply(info);
  }
};
