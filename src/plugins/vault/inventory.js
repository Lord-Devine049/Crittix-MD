/* INVENTORY.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
module.exports = {
  command: ['inventory', 'inv', 'bag'],
  aliases: ['inv', 'bag'],
  category: 'arena',
  description: 'View your inventory',
  execute: async ({ msg, sender, senderNumber, reply }) => {
    const items = vault.getInventory(sender);
    const name = msg.pushName || senderNumber;
    let txt = `╔═══════════════════════════════╗\n║ 🎒 𝐈𝐍𝐕𝐄𝐍𝐓𝐎𝐑𝐘\n╚═══════════════════════════════╝\n\n`;
    txt += `👤 ${h.toBoldItalic(name)}\n\n`;
    if (items.length === 0) {
      txt += `💀 ${h.toBoldItalic('Inventory is empty!')} ${h.demonEmoji()}\n\nVisit the .shop to buy items!`;
    } else {
      items.forEach(item => {
        const usesText = item.uses === -1 ? 'Permanent' : item.uses > 0 ? `${item.uses} uses left` : 'Expired';
        txt += `${item.emoji} ${h.toBoldItalic(item.name)}\n   ${item.description}\n   📊 ${usesText}\n\n`;
      });
    }
    return reply(txt);
  }
};
