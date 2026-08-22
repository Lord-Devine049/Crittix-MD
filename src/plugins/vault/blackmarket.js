/*
 * BLACKMARKET.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Secret rotating shop — refreshes every 24h with 3 random exclusive items
 */
const fs    = require('fs-extra');
const path  = require('path');
const vault = require('../../lib/vault');
const h     = require('../../lib/helpers');
const p = require('../../lib/phrases');


const BM_PATH = path.join(process.cwd(), 'database', 'blackmarket.json');

const ALL_ITEMS = [
  { id: 'bm_doublexp',  name: 'Double XP Card',    price: 2000,  desc: 'Double all XP gains for 24h',          emoji: '⚡', uses: 1 },
  { id: 'bm_steal',     name: 'Master Thief',       price: 3500,  desc: 'Rob success rate +50% for 3 robs',     emoji: '🦹', uses: 3 },
  { id: 'bm_immunity',  name: 'Immunity Badge',     price: 4000,  desc: 'Can\'t be robbed for 48h',             emoji: '🛡️', uses: 1 },
  { id: 'bm_jackpot',   name: 'Jackpot Token',      price: 5000,  desc: 'Guaranteed win on next gamble',        emoji: '🎰', uses: 1 },
  { id: 'bm_ghost',     name: 'Ghost Mode',         price: 6000,  desc: 'Hidden from leaderboard for 24h',      emoji: '👻', uses: 1 },
  { id: 'bm_heist',     name: 'Heist Blueprint',    price: 7500,  desc: 'Doubles your cut in next heist',       emoji: '📋', uses: 1 },
  { id: 'bm_bomb',      name: 'Vault Bomb',         price: 9000,  desc: 'Steal 20% from a random online user',  emoji: '💣', uses: 1 },
  { id: 'bm_legend',   name: 'Legend Scroll',       price: 12000, desc: '+500 aura instantly',                  emoji: '📜', uses: 1 },
];

const getOrRefresh = () => {
  try {
    let bm = fs.existsSync(BM_PATH) ? JSON.parse(fs.readFileSync(BM_PATH,'utf8')) : null;
    const DAY = 24*60*60*1000;
    if (!bm || Date.now() - bm.refreshedAt > DAY) {
      const shuffled = [...ALL_ITEMS].sort(() => Math.random()-0.5).slice(0,3);
      bm = { items: shuffled, refreshedAt: Date.now() };
      fs.ensureDirSync(path.dirname(BM_PATH));
      fs.writeFileSync(BM_PATH, JSON.stringify(bm,null,2));
    }
    return bm;
  } catch(_) { return { items: ALL_ITEMS.slice(0,3), refreshedAt: Date.now() }; }
};

module.exports = {
  command: ['blackmarket', 'bm'],
  category: 'arena',
  description: 'Secret rotating shop — refreshes every 24h',
  execute: async ({ sender, args, reply }) => {
    const bm      = getOrRefresh();
    const action  = args[0]?.toLowerCase();

    if (!action || action === 'list') {
      const next   = Math.max(0, 24*60*60*1000 - (Date.now()-bm.refreshedAt));
      const hrs    = Math.floor(next/(60*60*1000));
      const mins   = Math.floor((next%(60*60*1000))/(60*1000));
      let txt = `╔════════════════════════么\n║ 🖤 *BLACK MARKET*\n║ Refreshes in ${hrs}h ${mins}m\n╚════════════════════════么\n\n`;
      bm.items.forEach((item, i) => {
        txt += `${i+1}. ${item.emoji} *${item.name}*\n   💬 ${item.desc}\n   🪙 ${item.price.toLocaleString()} coins\n\n`;
      });
      txt += `Buy with *.bm buy <1/2/3>*\n么════════════════════════么`;
      return reply(txt);
    }

    if (action === 'buy') {
      const idx  = parseInt(args[1]) - 1;
      const item = bm.items[idx];
      if (!item || idx < 0 || idx > 2) return reply(p.phrases.wrongUsage('choose item 1 2 or 3. example! .bm buy 1'));

      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < item.price)
        return reply(`😑 broke. you need 🪙 ${item.price.toLocaleString()}`);

      vault.updateBalance(sender, -item.price, 0);
      vault.addToInventory(sender, { ...item, boughtAt: Date.now() });

      return reply(
        `╔════════════════════════么\n║ 🖤 *PURCHASED*\n╚════════════════════════么\n\n` +
        `${item.emoji} *${item.name}*\n💸 Paid: 🪙 ${item.price.toLocaleString()}\n💰 Remaining: 🪙 ${(bal.balance - item.price).toLocaleString()}\n\n` +
        `Item added to your inventory\n么════════════════════════么`
      );
    }

    reply(p.phrases.wrongUsage('use .bm to view the black market. or .bm buy 1 to purchase.'));
  }
};
