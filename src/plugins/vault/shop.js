/* SHOP.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
const p = require('../../lib/phrases');

module.exports = {
  command: 'shop',
  category: 'arena',
  description: 'View the item shop or buy items',
  execute: async ({ args, sender, prefix, reply }) => {
    if (args[0]) {
      const itemId = args[0].toLowerCase();
      const result = vault.buyItem(sender, itemId);
      if (!result.success) {
        if (result.reason === 'not_found') return reply(`✘ ${h.toBoldItalic('Item not found')} ${h.demonEmoji()}\n\nUse ${prefix}shop to see all items`);
        if (result.reason === 'insufficient') return reply(`✘ ${h.toBoldItalic('Not enough coins!')} ${h.demonEmoji()}\n\n💰 ${h.toBoldItalic('Balance')}: 🪙 ${vault.formatBalance(result.balance)}\n💲 ${h.toBoldItalic('Price')}: 🪙 ${vault.formatBalance(result.price)}`);
        if (result.reason === 'already_owned') return reply(`✘ ${h.toBoldItalic('You already own this item')} ${h.demonEmoji()}`);
        return reply(`✘ ${h.toBoldItalic('Purchase failed')} ${h.demonEmoji()}`);
      }
      return reply(p.phrases.success(`purchased ${result.item.name}. new balance: ${vault.formatBalance(result.newBalance)} coins.`));
    }
    const items = vault.getShop();
    let txt = `╔═══════════════════════════════╗\n║ 🛒 𝐒𝐇𝐎𝐏\n╚═══════════════════════════════╝\n\n`;
    items.forEach(item => {
      txt += `${item.emoji} ${h.toBoldItalic(item.name)} — 🪙 ${vault.formatBalance(item.price)}\n`;
      txt += `   ID: \`${item.id}\` | ${item.description}\n\n`;
    });
    txt += `💡 ${h.toBoldItalic('Buy with')}: ${prefix}shop <item-id>`;
    return reply(txt);
  }
};
