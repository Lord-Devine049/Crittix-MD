/* ADMINONLY.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: 'adminonly',
  category: 'darkprotection',
  description: 'Lock group settings to admins only',
  groupOnly: true,
  execute: async ({ sock, msg, args, sender, chatId, groupMetadata, isGroupMsg, prefix, reply }) => {
    if (!isGroupMsg) return reply(`✘ ${h.toBoldItalic('Group only you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    const groupId = groupMetadata?.id || chatId;
    const senderIsAdmin = await h.isSenderAdmin(sock, groupId, sender);
    if (!senderIsAdmin) return reply(`✘ ${h.toBoldItalic('Only admins can use this command you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    const botIsAdmin = await h.isBotAdmin(sock, groupId);
    if (!botIsAdmin) return reply(h.demonFail('Make my Lord Admin'));
    const action = args[0]?.toLowerCase();
    try {
      if (action === 'on') {
        await sock.groupSettingUpdate(groupId, 'locked');
        return reply(`${h.demonEmoji()} ${h.toBoldItalic('Admin only ACTIVATED')} - ${h.toBoldItalic('Peasants locked out')} 🔥`);
      } else if (action === 'off') {
        await sock.groupSettingUpdate(groupId, 'unlocked');
        return reply(`✓ ${h.toBoldItalic('Admin only deactivated - Peasants can edit')}`);
      } else {
        return reply(`${h.demonEmoji()} ${h.toBoldItalic('ADMIN ONLY')}\n\n${h.toBoldItalic('Lock group settings (name, description, picture) to admins only.')}\n\n🔥 ${h.toBoldItalic('Usage')}:\n• ${prefix}adminonly on - Lock settings\n• ${prefix}adminonly off - Unlock settings`);
      }
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Failed - make bot admin first you')} ${h.toBoldItalic(h.randomCuss())}! ${h.demonEmoji()}`);
    }
  }
};
