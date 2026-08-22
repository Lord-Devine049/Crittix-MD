/* ADMINONLY.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');

module.exports = {
  command: 'adminonly',
  category: 'darkprotection',
  description: 'Lock group settings to admins only',
  groupOnly: true,
  execute: async ({ sock, msg, args, sender, chatId, groupMetadata, isGroupMsg, prefix, reply }) => {
    if (!isGroupMsg) return reply(`✘ ${h.toBoldItalic('Group only you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    const groupId = groupMetadata?.id || chatId;
    const senderIsAdmin = await h.isSenderAdmin(sock, groupId, sender);
    if (!senderIsAdmin) return reply(p.phrases.adminOnly());
    const botIsAdmin = await h.isBotAdmin(sock, groupId);
    if (!botIsAdmin) return reply(p.phrases.adminOnly());
    const action = args[0]?.toLowerCase();
    try {
      if (action === 'on') {
        await sock.groupSettingUpdate(groupId, 'locked');
        return reply(`${h.demonEmoji()} ${h.toBoldItalic('Admin only ACTIVATED')} - ${h.toBoldItalic('Peasants locked out')} 🔥`);
      } else if (action === 'off') {
        await sock.groupSettingUpdate(groupId, 'unlocked');
        return reply(p.phrases.success('admin only mode deactivated.'));
      } else {
        return reply(p.phrases.wrongUsage('use .adminonly on to lock group settings. or .adminonly off to unlock them.'));
      }
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Failed - make bot admin first you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    }
  }
};
