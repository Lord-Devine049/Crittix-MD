/*
 * STOCKS.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Fake stock market — prices shift randomly every hour
 */
const fs    = require('fs-extra');
const path  = require('path');
const vault = require('../../lib/vault');
const h     = require('../../lib/helpers');
const p = require('../../lib/phrases');


const STK_PATH  = path.join(process.cwd(), 'database', 'stocks.json');
const PORT_PATH = path.join(process.cwd(), 'database', 'portfolios.json');

const BASE_STOCKS = [
  { id: 'CRTTX', name: 'Crittix Corp',    price: 500,  trend: 0 },
  { id: 'NRADR', name: 'Night Raiders',   price: 750,  trend: 0 },
  { id: 'DEVNE', name: 'Devine Labs',      price: 1200, trend: 0 },
  { id: 'ABYSS', name: 'Abyss Holdings',  price: 300,  trend: 0 },
  { id: 'VAULT', name: 'Vault Finance',   price: 900,  trend: 0 },
];

const loadStocks = () => {
  try {
    let s = fs.existsSync(STK_PATH) ? JSON.parse(fs.readFileSync(STK_PATH,'utf8')) : null;
    const HOUR = 60*60*1000;
    if (!s || Date.now()-s.updatedAt > HOUR) {
      const stocks = (s?.stocks || BASE_STOCKS).map(stk => {
        const change = (Math.random()-0.45) * 0.15; // slight upward bias
        const newPrice = Math.max(50, Math.round(stk.price * (1+change)));
        return { ...stk, prev: stk.price, price: newPrice, trend: newPrice > stk.price ? 1 : -1 };
      });
      s = { stocks, updatedAt: Date.now() };
      fs.ensureDirSync(path.dirname(STK_PATH));
      fs.writeFileSync(STK_PATH, JSON.stringify(s,null,2));
    }
    return s;
  } catch(_) { return { stocks: BASE_STOCKS, updatedAt: Date.now() }; }
};

const loadPortfolios = () => { try { return fs.existsSync(PORT_PATH) ? JSON.parse(fs.readFileSync(PORT_PATH,'utf8')) : {}; } catch(_) { return {}; } };
const savePortfolios = d => { try { fs.ensureDirSync(path.dirname(PORT_PATH)); fs.writeFileSync(PORT_PATH, JSON.stringify(d,null,2)); } catch(_) {} };

module.exports = {
  command: ['stocks', 'stock', 'market'],
  category: 'arena',
  description: 'Fake stock market — buy/sell/check prices',
  execute: async ({ sender, senderNumber, args, reply }) => {
    const { stocks } = loadStocks();
    const action = args[0]?.toLowerCase();

    if (!action || action === 'list') {
      let txt = `╔════════════════════════么\n║ 📈 *STOCK MARKET*\n║ Prices update every hour\n╚════════════════════════么\n\n`;
      stocks.forEach(s => {
        const dir   = s.trend > 0 ? '📈' : '📉';
        const diff  = s.prev ? (((s.price-s.prev)/s.prev)*100).toFixed(1) : '0.0';
        const sign  = diff > 0 ? '+' : '';
        txt += `${dir} *${s.id}* — ${s.name}\n   🪙 ${s.price} (${sign}${diff}%)\n\n`;
      });
      txt += `Buy: *.stock buy <ID> <qty>*\nSell: *.stock sell <ID> <qty>*\nPortfolio: *.stock portfolio*\n么════════════════════════么`;
      return reply(txt);
    }

    const portfolios = loadPortfolios();
    const key        = sender.replace(/:\d+@/,'@');

    if (action === 'portfolio') {
      const port = portfolios[key];
      if (!port || !Object.keys(port).length) return reply('😑 you own nothing. buy stocks first');
      let txt = `╔════════════════════════么\n║ 💼 *YOUR PORTFOLIO*\n╚════════════════════════么\n\n`;
      let total = 0;
      for (const [id, qty] of Object.entries(port)) {
        const stk   = stocks.find(s => s.id === id);
        if (!stk || !qty) continue;
        const val   = stk.price * qty;
        total      += val;
        txt += `📊 *${id}* × ${qty} = 🪙 ${val.toLocaleString()}\n`;
      }
      txt += `\n💰 *Total Value:* 🪙 ${total.toLocaleString()}\n么════════════════════════么`;
      return reply(txt);
    }

    if (action === 'buy' || action === 'sell') {
      const id  = args[1]?.toUpperCase();
      const qty = parseInt(args[2]);
      const stk = stocks.find(s => s.id === id);
      if (!stk || !qty || qty <= 0) return reply(p.phrases.wrongUsage(`provide the stock id and quantity. example! .stock ${action} CRITTIX 5`));

      const cost = stk.price * qty;
      const bal  = vault.getBalance(sender);

      if (action === 'buy') {
        if (!bal || bal.balance < cost) return reply(`😑 broke. costs 🪙 ${cost.toLocaleString()}`);
        vault.updateBalance(sender, -cost, 0);
        if (!portfolios[key]) portfolios[key] = {};
        portfolios[key][id] = (portfolios[key][id] || 0) + qty;
        savePortfolios(portfolios);
        return reply(`📈 Bought *${qty}× ${stk.name}* for 🪙 ${cost.toLocaleString()}`);
      }

      if (action === 'sell') {
        const owned = portfolios[key]?.[id] || 0;
        if (owned < qty) return reply(`😑 you only own ${owned}× ${id}`);
        vault.updateBalance(sender, cost, 0);
        portfolios[key][id] -= qty;
        if (portfolios[key][id] <= 0) delete portfolios[key][id];
        savePortfolios(portfolios);
        return reply(`📉 Sold *${qty}× ${stk.name}* for 🪙 ${cost.toLocaleString()}`);
      }
    }

    reply(p.phrases.wrongUsage('use .stock list. or buy. or sell. or portfolio.'));
  }
};
