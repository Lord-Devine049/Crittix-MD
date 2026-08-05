/*
 * GETGROUPPIC.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Get the current group's profile picture.
 */
const h = require('../../lib/helpers');

module.exports = {
  command: ['getgrouppic', 'getgrouppp', 'gcpic', 'grouppic'],
  category: 'voidsystem',
  description: 'Get the group profile picture',
  groupOnly: true,
  execute: async ({ sock, msg, chatId, groupMetadata, reply }) => {
    try {
      const url = await sock.profilePictureUrl(chatId, 'image');
      const groupName = groupMetadata?.subject || 'Group';
      await sock.sendMessage(chatId, {
        image: { url },
        caption: `📸 *${groupName}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    } catch (e) {
      reply(h.demonFail('This group has no profile picture set.'));
    }
  }
};
