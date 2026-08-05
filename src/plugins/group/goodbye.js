const db = require('../../lib/db');
module.exports = {
  command: 'goodbye',
  category: 'abysscommands',
  description: 'Toggle/configure goodbye messages',
  sudoOnly: true,
  groupOnly: true,
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const action = args[0]?.toLowerCase();
    if (action === 'on') {
      db.setGoodbye(chatId, { enabled: true });
      return reply('✓ goodbye messages on');
    }
    if (action === 'off') {
      db.setGoodbye(chatId, { enabled: false });
      return reply('✓ goodbye messages off');
    }
    if (action === 'set') {
      const msg_ = args.slice(1).join(' ');
      if (!msg_) return reply('usage: .goodbye set <message>');
      db.setGoodbye(chatId, { greeting: msg_, enabled: true });
      return reply('✓ goodbye message set — ' + msg_);
    }
    const cfg = db.getGoodbye(chatId);
    reply('🖤 GOODBYE\n\nstatus: ' + (cfg.enabled ? 'on' : 'off') + '\nmessage: ' + (cfg.greeting || 'default') + '\n\n.goodbye on\n.goodbye off\n.goodbye set <message>');
  }
};