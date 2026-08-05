/*
 * KICKALL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'kickall',
  category: 'forbiddenarts',
  description: 'Kick all non-admins',
  ownerOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Bot needs admin'));
    const meta = await sock.groupMetadata(chatId);
    const { botJid, botLid } = h.getBotJids(sock);
    const targets = meta.participants.filter(p => !p.admin && !h.isBotParticipant(p, botJid, botLid));
    global.kickAllRunning[chatId] = true; global.kickAllCancel[chatId] = false;
    reply('⚙️ Kicking ' + targets.length + ' members... Type .stopkickall to cancel');
    for (const p of targets) {
      if (global.kickAllCancel[chatId]) break;
      try { await sock.groupParticipantsUpdate(chatId, [p.id], 'remove'); } catch(_) {}
      await new Promise(r => setTimeout(r, 1200));
    }
    global.kickAllRunning[chatId] = false;
    reply('✓ Done');
  }
};
