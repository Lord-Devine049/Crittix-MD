/*
 * GETPP.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

async function resolveLidJid(sock, lidJid, groupId) {
  try {
    const meta = await sock.groupMetadata(groupId);
    const lidNum = lidJid.split('@')[0];
    for (const p of meta.participants || []) {
      const pLid = (p.lid || '').split('@')[0];
      if (pLid && pLid === lidNum) return p.id;
    }
  } catch (_) {}
  return null; 
}

module.exports = {
  command: 'getpp',
  category: 'voidsystem',
  description: 'Get profile picture of a tagged or replied-to user',

  execute: async ({ sock, msg, chatId, isGroupMsg, reply }) => {

    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    const mentioned   = contextInfo?.mentionedJid || [];

    let rawJid = null;

    if (mentioned.length > 0) {
      rawJid = mentioned[0];
    } else if (contextInfo?.participant) {
      rawJid = contextInfo.participant;
    } else if (contextInfo?.remoteJid && !contextInfo.remoteJid.endsWith('@g.us')) {
      rawJid = contextInfo.remoteJid;
    }

    if (!rawJid) {
      return reply(h.demonError('.getpp', `Reply to someone or tag them with ${h.prefix || '.'}getpp to fetch their profile picture`));
    }

    let jid = rawJid;
    if (rawJid.endsWith('@lid') && isGroupMsg) {
      const resolved = await resolveLidJid(sock, rawJid, chatId);
      if (resolved) jid = resolved;
    }

    let url = null;
    const candidates = [jid];
    if (jid !== rawJid) candidates.push(rawJid); 

    for (const candidate of candidates) {
      try {
        url = await sock.profilePictureUrl(candidate, 'image');
        if (url) { jid = candidate; break; }
      } catch (_) {}
    }

    if (!url) {
      return reply(h.demonFail(`No profile picture found for @${jid.split('@')[0]}`));
    }

    const num = jid.split('@')[0];
    await sock.sendMessage(chatId, {
      image: { url },
      caption: `📸 *Profile picture of @${num}*`,
      mentions: [jid]
    }, { quoted: msg });
  }
};
