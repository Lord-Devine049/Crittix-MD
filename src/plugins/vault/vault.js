/*
 * VAULT.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


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
      if (!key || !val) return reply(p.phrases.wrongUsage('provide a key and value to save. example! .vault save mykey my secret value'));
      vault.set(sender, key, val);
      return reply(p.phrases.success('saved to vault: ' + key + '.'));
    }
    if (sub === 'get') {
      const key = args[1];
      if (!key) return reply(p.phrases.wrongUsage('provide the key to retrieve. example! .vault get mykey'));
      const val = vault.get(sender, key);
      return reply(val ? p.phrases.success(key + ': ' + val) : p.phrases.notFound('key not found: ' + key));
    }
    if (sub === 'list') {
      const items = vault.list(sender);
      if (!items.length) return reply('Your vault is empty');
      return reply('🔐 Your vault:\n\n' + items.map(k => '➩ ' + k).join('\n'));
    }
    if (sub === 'delete') {
      const key = args[1];
      if (!key) return reply(p.phrases.wrongUsage('provide the key to delete. example! .vault delete mykey'));
      vault.remove(sender, key);
      return reply(p.phrases.success('deleted: ' + key + '.'));
    }
    if (sub === 'clear') { vault.clear(sender); return reply(p.phrases.success('vault cleared.')); }
    reply(p.phrases.error('Unknown subcommand'));
  }
};
