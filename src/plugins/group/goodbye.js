const db = require('../../lib/db');
const p = require('../../lib/phrases');

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
      return reply(p.phrases.success('goodbye messages enabled.'));
    }
    if (action === 'off') {
      db.setGoodbye(chatId, { enabled: false });
      return reply(p.phrases.success('goodbye messages disabled.'));
    }
    if (action === 'set') {
      const msg_ = args.slice(1).join(' ');
      if (!msg_) return reply(p.phrases.wrongUsage('type the goodbye message after set. example! .goodbye set bye bye! you will be missed.'));
      db.setGoodbye(chatId, { greeting: msg_, enabled: true });
      return reply(p.phrases.success('goodbye message set.'));
    }
    const cfg = db.getGoodbye(chatId);
    reply('🖤 GOODBYE\n\nstatus: ' + (cfg.enabled ? 'on' : 'off') + '\nmessage: ' + (cfg.greeting || 'default') + '\n\n.goodbye on\n.goodbye off\n.goodbye set <message>');
  }
};