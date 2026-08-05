/*
 * VAULT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'vault',
  category: 'arena',
  description: 'Access your personal vault',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const vault = require('../../lib/vault');
    const sub = args[0]?.toLowerCase();
    if (!sub) return reply('🔐 VAULT COMMANDS\n\n.vault save <key> <value>\n.vault get <key>\n.vault list\n.vault delete <key>\n.vault clear');
    if (sub === 'save') {
      const key = args[1]; const val = args.slice(2).join(' ');
      if (!key || !val) return reply(h.demonError('.vault save', '.vault save <key> <value>'));
      vault.set(sender, key, val);
      return reply('✓ Saved to vault: ' + key);
    }
    if (sub === 'get') {
      const key = args[1];
      if (!key) return reply(h.demonError('.vault get', '.vault get <key>'));
      const val = vault.get(sender, key);
      return reply(val ? '🔐 ' + key + ':\n' + val : h.demonFail('Key not found: ' + key));
    }
    if (sub === 'list') {
      const items = vault.list(sender);
      if (!items.length) return reply('Your vault is empty');
      return reply('🔐 Your vault:\n\n' + items.map(k => '➩ ' + k).join('\n'));
    }
    if (sub === 'delete') {
      const key = args[1];
      if (!key) return reply(h.demonError('.vault delete', '.vault delete <key>'));
      vault.remove(sender, key);
      return reply('✓ Deleted: ' + key);
    }
    if (sub === 'clear') { vault.clear(sender); return reply('✓ Vault cleared'); }
    reply(h.demonFail('Unknown subcommand'));
  }
};
