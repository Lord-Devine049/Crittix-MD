const db = require('../../lib/db');
module.exports = {
  command: 'resetwarnall',
  category: 'abysscommands',
  description: 'Reset all warnings in the group',
  sudoOnly: true,
  groupOnly: true,
  execute: async ({ chatId, reply }) => {
    db.saveGroup(chatId, { warnings: {} });
    reply('✓ all warnings cleared');
  }
};