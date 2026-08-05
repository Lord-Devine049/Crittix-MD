/*
 * AUCTION.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Bid coins on a random item — highest bid wins after 60 seconds
 */
const vault    = require('../../lib/vault');
const globalXP = require('../../lib/global-xp');
const h        = require('../../lib/helpers');

const ITEMS = [
  { name: 'Legendary Sword',   emoji: '⚔️',  min: 500  },
  { name: 'Shadow Cloak',      emoji: '🌑',  min: 800  },
  { name: 'Vault Key',         emoji: '🗝️',  min: 1000 },
  { name: 'Bounty Token',      emoji: '🎯',  min: 700  },
  { name: 'Crittix Crown',     emoji: '👑',  min: 2000 },
  { name: 'Night Raider Badge',emoji: '🏴',  min: 1500 },
  { name: 'Aura Crystal',      emoji: '💎',  min: 1200 },
  { name: 'Ghost Mask',        emoji: '👻',  min: 600  },
];

const activeAuctions = new Map();

module.exports = {
  command: ['auction', 'bid'],
  category: 'arena',
  description: 'Bid coins on rare items — highest bidder wins',
  groupOnly: true,
  execute: async ({ sock, msg, sender, senderNumber, chatId, args, reply }) => {

    // Place a bid on active auction
    if (activeAuctions.has(chatId)) {
      const auc = activeAuctions.get(chatId);
      const bid = parseInt(args[0]);
      if (!bid || bid <= 0) return reply(`💰 type *.bid <amount>* to place a bid`);
      if (bid <= auc.topBid) return reply(`😑 current top bid is 🪙 ${auc.topBid.toLocaleString()} — bid higher`);

      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < bid) return reply(`😑 you only have 🪙 ${bal?.balance||0}`);

      // Refund previous top bidder
      if (auc.topBidder && auc.topBidder !== sender) {
        vault.updateBalance(auc.topBidder, auc.topBid, 0);
      }

      vault.updateBalance(sender, -bid, 0);
      auc.topBid    = bid;
      auc.topBidder = sender;
      auc.topName   = senderNumber;

      await sock.sendMessage(chatId, {
        text: `💰 @${senderNumber} bids 🪙 ${bid.toLocaleString()} for *${auc.item.emoji} ${auc.item.name}*!\nAnyone going higher?`,
        mentions: [sender],
      }, { quoted: msg });
      return;
    }

    // Start new auction
    const item    = ITEMS[Math.floor(Math.random()*ITEMS.length)];
    const endTime = Date.now() + 60000;
    activeAuctions.set(chatId, { item, topBid: item.min, topBidder: null, topName: null, endTime });

    await sock.sendMessage(chatId, {
      text:
        `╔════════════════════════么\n║ 🔨 *AUCTION STARTED*\n╚════════════════════════么\n\n` +
        `${item.emoji} *${item.name}*\n` +
        `💰 Starting bid: 🪙 ${item.min.toLocaleString()}\n⏰ 60 seconds — highest bid wins!\n\n` +
        `Type *.bid <amount>* to place a bid\n么════════════════════════么`,
    }, { quoted: msg });

    setTimeout(async () => {
      const auc = activeAuctions.get(chatId);
      if (!auc) return;
      activeAuctions.delete(chatId);

      if (!auc.topBidder) {
        await sock.sendMessage(chatId, { text: `🔨 Auction ended — no bids placed. Item unsold.` });
        return;
      }

      globalXP.addXP(auc.topBidder, auc.topName);
      await sock.sendMessage(chatId, {
        text:
          `╔════════════════════════么\n║ 🔨 *AUCTION OVER*\n╚════════════════════════么\n\n` +
          `${auc.item.emoji} *${auc.item.name}*\n` +
          `🏆 Winner: @${auc.topName}\n💰 Final bid: 🪙 ${auc.topBid.toLocaleString()}\n么════════════════════════么`,
        mentions: [auc.topBidder],
      });
    }, 60000);
  }
};
