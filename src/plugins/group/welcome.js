'use strict';
const db = require('../../lib/db');
const p = require('../../lib/phrases');

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
      return reply(p.phrases.success('welcome messages enabled.'));
    }
    if (action === 'off') {
      db.setWelcome(chatId, { enabled: false });
      return reply(p.phrases.success('welcome messages disabled.'));
    }
    if (action === 'set') {
      const msg_ = args.slice(1).join(' ');
      if (!msg_) return reply(p.phrases.wrongUsage('type the welcome message after set. example! .welcome set welcome to the group! read the rules.'));
      db.setWelcome(chatId, { greeting: msg_, enabled: true });
      return reply(p.phrases.success('welcome message set.'));
    }
    const cfg = db.getWelcome(chatId);
    reply('🖤 WELCOME\n\nstatus: ' + (cfg.enabled ? 'on' : 'off') + '\ngreeting: ' + (cfg.greeting || 'default') + '\n\n.welcome on\n.welcome off\n.welcome set <message>');
  }
};