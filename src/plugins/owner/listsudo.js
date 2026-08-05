/*
 * LISTSUDO.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'listsudo',
  category: 'voidsystem',
  description: 'List sudo users',
  sudoOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    const sudos = cfg.SUDO_NUMBERS || []; if (!sudos.length) return reply('No sudo users set'); reply('👥 Sudo users:\n\n' + sudos.map((s,i) => (i+1) + '. +' + s).join('\n'));
  }
};
