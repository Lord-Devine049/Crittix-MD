'use strict';
const db = require('../../lib/db');
module.exports = {
  command: 'welcome',
  category: 'abysscommands',
  description: 'Toggle/configure welcome messages',
  sudoOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const action = args[0]?.toLowerCase();
    if (action === 'on') {
      db.setWelcome(chatId, { enabled: true });
      return reply('✓ welcome messages on');
    }
    if (action === 'off') {
      db.setWelcome(chatId, { enabled: false });
      return reply('✓ welcome messages off');
    }
    if (action === 'set') {
      const msg_ = args.slice(1).join(' ');
      if (!msg_) return reply('usage: .welcome set <message>');
      db.setWelcome(chatId, { greeting: msg_, enabled: true });
      return reply('✓ welcome greeting set — ' + msg_);
    }
    const cfg = db.getWelcome(chatId);
    reply('🖤 WELCOME\n\nstatus: ' + (cfg.enabled ? 'on' : 'off') + '\ngreeting: ' + (cfg.greeting || 'default') + '\n\n.welcome on\n.welcome off\n.welcome set <message>');
  }
};