const db = require('../../lib/db');
const p = require('../../lib/phrases');

module.exports = {
  command: 'resetwarnall',
  category: 'abysscommands',
  description: 'Reset all warnings in the group',
  sudoOnly: true,
  groupOnly: true,
  execute: async ({ chatId, reply }) => {
    db.saveGroup(chatId, { warnings: {} });
    reply(p.phrases.success('all warnings cleared.'));
  }
};