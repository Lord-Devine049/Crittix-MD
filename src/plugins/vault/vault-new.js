/*
 * VAULT-NEW.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Commands: jackpot, lottery, raffle, casino, poker, roulette2, scratch2,
 *           fortunewheel, treasurechest, bankheist2, stockmarket, cryptotrade,
 *           nftmint, businessbuy, propertybuy, carbuy, garage, mansion, taxpay, insurance
 */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
const globalXP = require('../../lib/global-xp');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

module.exports = [

  {
    command: 'jackpot',
    aliases: ['pooljackpot'],
    category: 'arena',
    description: 'Contribute to the group jackpot pool. Random winner takes all. Usage: jackpot 500',
    groupOnly: true,
    execute: async ({ sock, msg, sender, senderNumber, chatId, args, reply }) => {
      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount < 50) return reply(h.demonError('.jackpot', '.jackpot <amount> (minimum 50 coins)'));
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < amount) return reply(h.demonFail(`you need 🪙 ${amount} to enter — you only have 🪙 ${bal?.balance || 0}. broke confirmed`));
      const pools = loadDB('jackpot.json');
      if (!pools[chatId]) pools[chatId] = { entries: [], total: 0, lastDraw: 0 };
      const pool = pools[chatId];
      vault.updateBalance(sender, -amount, 0);
      pool.entries.push({ jid: sender, num: senderNumber, amount });
      pool.total += amount;
      saveDB('jackpot.json', pools);
      // Auto-draw when pool has 3+ entries and last draw > 5 min ago
      if (pool.entries.length >= 3 && Date.now() - pool.lastDraw > 300000) {
        const winner = pool.entries[Math.floor(Math.random() * pool.entries.length)];
        const prize = pool.total;
        vault.updateBalance(winner.jid, prize, 0);
        pools[chatId] = { entries: [], total: 0, lastDraw: Date.now() };
        saveDB('jackpot.json', pools);
        await sock.sendMessage(chatId, {
          text: `╔════════════════════════么\n║ 🎰 *JACKPOT DRAW!*\n╚════════════════════════么\n\n🏆 Winner: @${winner.num}\n💰 Prize: 🪙 ${prize.toLocaleString()}\n\n${pool.entries.length} players entered. One legend walked away with it all. 😤\n\n么════════════════════════么`,
          mentions: [winner.jid]
        }, { quoted: msg });
        return;
      }
      reply(`🎰 *JACKPOT*\n\nYou entered 🪙 ${amount}\n🏦 Pool total: 🪙 ${pool.total.toLocaleString()}\n👥 Entries: ${pool.entries.length}\n\nDraw triggers at 3+ entries. Stay ready 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'lottery',
    aliases: ['lotto', 'buyticket'],
    category: 'arena',
    description: 'Buy a lottery ticket. Usage: lottery',
    execute: async ({ sender, senderNumber, msg, reply }) => {
      const COST = 50, JACKPOT = 5000;
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < COST) return reply(h.demonFail(`need 🪙 ${COST} to buy a ticket — you're broke again`));
      vault.updateBalance(sender, -COST, 0);
      const ticket = Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1);
      const winning = Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1);
      const matches = ticket.filter(n => winning.includes(n)).length;
      const prizes = { 6: JACKPOT, 5: 1000, 4: 200, 3: 50, 2: 10 };
      const prize = prizes[matches] || 0;
      if (prize > 0) vault.updateBalance(sender, prize, 0);
      if (prize > 0) globalXP.addXP(sender, msg.pushName || senderNumber);
      reply(
        `🎟️ *LOTTERY*\n\n` +
        `🎫 Your ticket: ${ticket.join(' - ')}\n` +
        `🎯 Winning: ${winning.join(' - ')}\n` +
        `✅ Matches: *${matches}*\n\n` +
        `${prize > 0 ? `🎉 You won 🪙 ${prize}! Finally.` : `💀 No win. 🪙 ${COST} gone. F in the chat.`}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'raffle',
    aliases: ['startdraw'],
    category: 'arena',
    description: 'Admin starts a raffle. Members join. Usage: raffle start 500 | raffle join | raffle draw',
    groupOnly: true,
    execute: async ({ sock, msg, sender, senderNumber, chatId, args, reply, isOwner, isSudo }) => {
      const action = args[0]?.toLowerCase() || 'join';
      const raffles = loadDB('raffle.json');
      if (!raffles[chatId]) raffles[chatId] = null;
      if (action === 'start') {
        if (!await h.isSenderAdmin(sock, chatId, sender))
          return reply(p.phrases.adminOnly());
          if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
        const prize = parseInt(args[1]) || 500;
        raffles[chatId] = { prize, entries: [], started: Date.now() };
        saveDB('raffle.json', raffles);
        return sock.sendMessage(chatId, { text: `🎉 *RAFFLE STARTED!*\n\n🏆 Prize: 🪙 ${prize.toLocaleString()}\n\nType *.raffle join* to enter! Admin draws with *.raffle draw*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
      }
      const raffle = raffles[chatId];
      if (!raffle) return reply(p.phrases.adminOnly());
      if (action === 'join') {
        if (raffle.entries.find(e => e.jid === sender)) return reply(h.demonFail('you already entered, greedy'));
        raffle.entries.push({ jid: sender, num: senderNumber });
        saveDB('raffle.json', raffles);
        return reply(`✅ *You entered the raffle!*\n👥 Total entries: ${raffle.entries.length}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'draw') {
        if (!await h.isSenderAdmin(sock, chatId, sender))
          return reply(p.phrases.adminOnly());
          if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
        if (!raffle.entries.length) { raffles[chatId] = null; saveDB('raffle.json', raffles); return reply(h.demonFail('no entries — not even one person cared')); }
        const winner = raffle.entries[Math.floor(Math.random() * raffle.entries.length)];
        vault.updateBalance(winner.jid, raffle.prize, 0);
        raffles[chatId] = null;
        saveDB('raffle.json', raffles);
        await sock.sendMessage(chatId, { text: `🎉 *RAFFLE WINNER!*\n\n🏆 @${winner.num}\n💰 Prize: 🪙 ${raffle.prize.toLocaleString()}\n\nLuck favored this one. The rest of you? Maybe next time 💀`, mentions: [winner.jid] }, { quoted: msg });
        return;
      }
      reply('Usage: .raffle start <prize> | .raffle join | .raffle draw');
    }
  },

  {
    command: 'casino',
    aliases: ['casinohub', 'gamblemenu'],
    category: 'arena',
    description: 'Hub of all vault gambling games. Usage: casino',
    execute: async ({ prefix, reply }) => {
      reply(
        `🎰 *CRITTIX CASINO*\n` +
        `_Where fortunes are made and wallets go to die_ 😈\n\n` +
        `╔════════════════════════么\n` +
        `║ 🎲 *GAMES AVAILABLE*\n` +
        `╚════════════════════════么\n\n` +
        `🎰 ${prefix}slots <amount> — Slot machine\n` +
        `🎲 ${prefix}gamble <amount> — Pure coin flip\n` +
        `🃏 ${prefix}blackjack <amount> — Card game\n` +
        `🎫 ${prefix}scratch — Scratch card (🪙100)\n` +
        `🎫 ${prefix}scratch2 — Premium scratch tiers\n` +
        `🎡 ${prefix}fortunewheel — Spin the prize wheel\n` +
        `🎯 ${prefix}roulette2 <amount> <color/number> — Roulette\n` +
        `🃏 ${prefix}poker <amount> — Poker hand vs bot\n` +
        `🎰 ${prefix}jackpot <amount> — Group pool jackpot\n` +
        `🎟️ ${prefix}lottery — Buy lottery ticket\n` +
        `🏦 ${prefix}heist — Group heist\n\n` +
        `💰 ${prefix}balance — Check your coins\n` +
        `📊 ${prefix}leaderboard — Top earners\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'poker',
    aliases: ['pokerhand'],
    category: 'arena',
    description: 'Play simplified poker vs bot. Usage: poker 200',
    execute: async ({ sender, senderNumber, msg, args, prefix, reply }) => {
      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount < 50) return reply(h.demonError('.poker', `.poker <bet> (min 50) — e.g. ${prefix}poker 200`));
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < amount) return reply(h.demonFail(`need 🪙 ${amount} — you only got 🪙 ${bal?.balance || 0}. bet within your means`));
      const suits = ['♠️','♥️','♦️','♣️'];
      const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
      const deck = suits.flatMap(s => values.map(v => `${v}${s}`));
      const shuffle = d => d.sort(() => Math.random() - 0.5);
      shuffle(deck);
      const hand = deck.splice(0, 5);
      const botHand = deck.splice(0, 5);
      const handVal = hand.reduce((s, c) => {
        const v = c.replace(/[♠♥♦♣️]/g, '');
        const n = values.indexOf(v.replace('️',''));
        return s + n;
      }, 0);
      const botVal = botHand.reduce((s, c) => {
        const v = c.replace(/[♠♥♦♣️]/g, '');
        const n = values.indexOf(v.replace('️',''));
        return s + n;
      }, 0);
      const won = handVal > botVal;
      const tie = handVal === botVal;
      vault.updateBalance(sender, won ? amount : (tie ? 0 : -amount), 0);
      if (won) globalXP.addXP(sender, msg.pushName || senderNumber);
      const newBal = (vault.getBalance(sender)?.balance || 0);
      reply(
        `🃏 *POKER HAND*\n\n` +
        `🤝 Your hand: ${hand.join(' ')}\n` +
        `🤖 Bot hand: ${botHand.join(' ')}\n\n` +
        `${won ? `🎉 *YOU WIN!* +🪙 ${amount}` : tie ? `🤝 *TIE.* coins returned.` : `💀 *BOT WINS!* -🪙 ${amount}`}\n` +
        `💰 Balance: 🪙 ${newBal.toLocaleString()}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },



  {
    command: 'fortunewheel',
    aliases: ['spinwheel'],
    category: 'arena',
    description: 'Spin the fortune wheel. Usage: fortunewheel',
    execute: async ({ sender, senderNumber, msg, reply }) => {
      const COST = 100;
      const segments = [
        { label:'NOTHING', prize:0, emoji:'💀', chance:30 },
        { label:'x1.5', prize:150, emoji:'🪙', chance:25 },
        { label:'x2', prize:200, emoji:'💰', chance:20 },
        { label:'x4', prize:400, emoji:'💎', chance:12 },
        { label:'x8', prize:800, emoji:'👑', chance:8 },
        { label:'JACKPOT x20', prize:2000, emoji:'🌟', chance:5 },
      ];
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < COST) return reply(h.demonFail(`need 🪙 ${COST} to spin`));
      vault.updateBalance(sender, -COST, 0);
      const rand = Math.random() * 100;
      let cum = 0, landed = segments[0];
      for (const seg of segments) { cum += seg.chance; if (rand < cum) { landed = seg; break; } }
      const spin = segments.map((s, i) => `${s.emoji} [${s.label}]`).join(' → ');
      if (landed.prize > 0) { vault.updateBalance(sender, landed.prize, 0); globalXP.addXP(sender, msg.pushName || senderNumber); }
      reply(
        `🎡 *FORTUNE WHEEL*\n\n` +
        `🎰 ${spin}\n\n` +
        `⬇️ Landed: *${landed.emoji} ${landed.label}*\n\n` +
        `${landed.prize > 0 ? `🎉 *+🪙 ${landed.prize.toLocaleString()}*` : `💀 Nothing. The wheel is rigged and it still hates you.`}\n` +
        `💰 Balance: 🪙 ${vault.getBalance(sender)?.balance?.toLocaleString()}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'treasurechest',
    aliases: ['chest', 'claimchest'],
    category: 'arena',
    description: 'Claim the timed treasure chest. Available once per hour. Usage: treasurechest',
    execute: async ({ sender, reply }) => {
      const chests = loadDB('treasurechest.json');
      const COOLDOWN = 3600000; // 1 hour
      const last = chests[sender] || 0;
      const remaining = COOLDOWN - (Date.now() - last);
      if (remaining > 0) {
        const m = Math.ceil(remaining / 60000);
        return reply(h.demonFail(`chest is locked — come back in *${m} min*. patience, clown`));
      }
      const prize = Math.floor(Math.random() * 400) + 100;
      vault.updateBalance(sender, prize, 0);
      chests[sender] = Date.now();
      saveDB('treasurechest.json', chests);
      reply(`🎁 *TREASURE CHEST*\n\n💰 You found: 🪙 ${prize}\n\n🕐 Next chest in: *1 hour*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'stockmarket',
    aliases: ['stocks2', 'vstock'],
    category: 'arena',
    description: 'Virtual stock market. Usage: stockmarket list | stockmarket buy AAPL 10 | stockmarket sell AAPL 5',
    execute: async ({ sender, args, reply }) => {
      const stocks = { CRITTIX: 100, VAULT: 250, DEMON: 75, EMPIRE: 500, RAIDCOIN: 30 };
      const holdings = loadDB('vstock.json');
      if (!holdings[sender]) holdings[sender] = {};
      const action = args[0]?.toLowerCase() || 'list';
      // Simulate price fluctuation per hour
      const hour = Math.floor(Date.now() / 3600000);
      const prices = {};
      for (const [k, base] of Object.entries(stocks)) {
        const change = Math.sin(hour * k.length * 0.1) * 0.3;
        prices[k] = Math.round(base * (1 + change));
      }
      if (action === 'list') {
        let txt = `📈 *CRITTIX STOCK MARKET*\n\n`;
        for (const [k, p] of Object.entries(prices)) {
          const base = stocks[k];
          const diff = p - base;
          txt += `${diff >= 0 ? '📈' : '📉'} *${k}*: 🪙 ${p} (${diff >= 0 ? '+' : ''}${diff})\n`;
        }
        txt += `\n💼 *Your Portfolio:*\n`;
        for (const [k, qty] of Object.entries(holdings[sender])) {
          if (qty > 0) txt += `• ${k}: ${qty} shares @ 🪙 ${prices[k]} each = 🪙 ${(qty * (prices[k] || 0)).toLocaleString()}\n`;
        }
        return reply(txt + `\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const ticker = args[1]?.toUpperCase();
      const qty = parseInt(args[2]);
      if (!ticker || !prices[ticker] || isNaN(qty) || qty < 1) return reply(h.demonError('.stockmarket', '.stockmarket buy/sell <TICKER> <qty> — e.g. stockmarket buy CRITTIX 5'));
      const cost = prices[ticker] * qty;
      if (action === 'buy') {
        const bal = vault.getBalance(sender);
        if (!bal || bal.balance < cost) return reply(h.demonFail(`need 🪙 ${cost} — you only have 🪙 ${bal?.balance || 0}`));
        vault.updateBalance(sender, -cost, 0);
        holdings[sender][ticker] = (holdings[sender][ticker] || 0) + qty;
        saveDB('vstock.json', holdings);
        return reply(`📈 *Bought ${qty}x ${ticker}*\nCost: 🪙 ${cost.toLocaleString()}\nShares owned: ${holdings[sender][ticker]}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'sell') {
        if ((holdings[sender][ticker] || 0) < qty) return reply(h.demonFail(`you only have ${holdings[sender][ticker] || 0} shares of ${ticker}`));
        vault.updateBalance(sender, cost, 0);
        holdings[sender][ticker] -= qty;
        saveDB('vstock.json', holdings);
        return reply(`📉 *Sold ${qty}x ${ticker}*\nReceived: 🪙 ${cost.toLocaleString()}\nShares left: ${holdings[sender][ticker]}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply('Usage: stockmarket list | buy <TICKER> <qty> | sell <TICKER> <qty>');
    }
  },

  {
    command: 'cryptotrade',
    aliases: ['ctrade', 'vcrypto'],
    category: 'arena',
    description: 'Virtual crypto trading game. Usage: cryptotrade list | cryptotrade buy BTC 100 | cryptotrade sell BTC 50',
    execute: async ({ sender, args, reply }) => {
      const coins = { BTC: 50000, ETH: 3000, DOGE: 0.3, CRITTIXCOIN: 420, SOL: 150 };
      const portfolio = loadDB('vcrypto.json');
      if (!portfolio[sender]) portfolio[sender] = {};
      const action = args[0]?.toLowerCase() || 'list';
      const min = Math.floor(Date.now() / 60000);
      const prices = {};
      for (const [k, base] of Object.entries(coins)) {
        prices[k] = parseFloat((base * (1 + (Math.sin(min * k.length * 0.17)) * 0.15)).toFixed(4));
      }
      if (action === 'list') {
        let txt = `₿ *VIRTUAL CRYPTO MARKET*\n\n`;
        for (const [k, p] of Object.entries(prices)) txt += `• *${k}*: 🪙 ${p.toLocaleString()}\n`;
        txt += `\n💼 Portfolio:\n`;
        for (const [k, qty] of Object.entries(portfolio[sender])) {
          if (qty > 0) txt += `• ${k}: ${qty} @ 🪙 ${prices[k]} = 🪙 ${(qty * (prices[k] || 0)).toFixed(2)}\n`;
        }
        return reply(txt + `\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const coin = args[1]?.toUpperCase();
      const spend = parseFloat(args[2]);
      if (!coin || !prices[coin] || isNaN(spend) || spend <= 0) return reply(h.demonError('.cryptotrade', '.cryptotrade buy/sell <COIN> <coin_amount> — e.g. cryptotrade buy BTC 0.001'));
      const vaultCost = spend * prices[coin];
      if (action === 'buy') {
        const bal = vault.getBalance(sender);
        if (!bal || bal.balance < vaultCost) return reply(h.demonFail(`need 🪙 ${vaultCost.toFixed(2)} to buy ${spend} ${coin}`));
        vault.updateBalance(sender, -Math.round(vaultCost), 0);
        portfolio[sender][coin] = parseFloat(((portfolio[sender][coin] || 0) + spend).toFixed(8));
        saveDB('vcrypto.json', portfolio);
        return reply(`₿ *Bought ${spend} ${coin}*\nSpent: 🪙 ${vaultCost.toFixed(2)}\nTotal: ${portfolio[sender][coin]} ${coin}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'sell') {
        if ((portfolio[sender][coin] || 0) < spend) return reply(h.demonFail(`you only have ${portfolio[sender][coin] || 0} ${coin}`));
        vault.updateBalance(sender, Math.round(vaultCost), 0);
        portfolio[sender][coin] = parseFloat(((portfolio[sender][coin] || 0) - spend).toFixed(8));
        saveDB('vcrypto.json', portfolio);
        return reply(`₿ *Sold ${spend} ${coin}*\nReceived: 🪙 ${vaultCost.toFixed(2)}\nRemaining: ${portfolio[sender][coin]} ${coin}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply('Usage: cryptotrade list | buy <COIN> <amount> | sell <COIN> <amount>');
    }
  },

  {
    command: 'nftmint',
    aliases: ['mintnft', 'fakeNFT'],
    category: 'arena',
    description: 'Mint a fake NFT for clout. Usage: nftmint',
    execute: async ({ sender, reply }) => {
      const COST = 200;
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < COST) return reply(h.demonFail(`need 🪙 ${COST} to mint — even fake NFTs cost money`));
      vault.updateBalance(sender, -COST, 0);
      const adjectives = ['Cursed','Demonic','Legendary','Shadow','Void','Eternal','Glitched','Broken','Supreme','Hollow'];
      const nouns = ['Ape','Crittix','Demon','Ghost','Empire','Phantom','Skull','Legion','Void','Beast'];
      const id = Math.floor(Math.random() * 9999);
      const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} #${id}`;
      const traits = ['Background: Void Black', `Eyes: ${['Laser','Hollow','Demon','Gold'][Math.floor(Math.random()*4)]}`, `Rarity: ${['Common','Rare','Epic','Legendary'][Math.floor(Math.random()*4)]}`];
      reply(
        `🖼️ *NFT MINTED*\n\n` +
        `🎨 Name: *${name}*\n` +
        `🔢 Token ID: #${id}\n` +
        `📋 Traits:\n${traits.map(t => `• ${t}`).join('\n')}\n` +
        `💸 Mint Cost: 🪙 ${COST}\n\n` +
        `😂 Congratulations on spending real coins on a fake NFT. Peak Crittix behavior.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'businessbuy',
    aliases: ['buybiz', 'openshop'],
    category: 'arena',
    description: 'Buy a virtual business for passive income. Usage: businessbuy list | businessbuy <business>',
    execute: async ({ sender, args, reply }) => {
      const businesses = {
        'food stall': { cost: 500, income: 50, desc: 'Tiny stall, tiny gains. Still beats nothing.' },
        'barber shop': { cost: 1500, income: 150, desc: 'Cutting heads, stacking coins.' },
        'tech startup': { cost: 5000, income: 600, desc: 'Burn rate is high but so is the drip.' },
        'nightclub': { cost: 10000, income: 1500, desc: 'Where coins and bad decisions thrive.' },
        'crypto exchange': { cost: 25000, income: 4000, desc: 'Collect fees while others panic-sell.' },
      };
      const owned = loadDB('businesses.json');
      if (!owned[sender]) owned[sender] = [];
      if (!args[0] || args[0].toLowerCase() === 'list') {
        let txt = `🏪 *VIRTUAL BUSINESSES*\n\n`;
        for (const [name, data] of Object.entries(businesses)) {
          const have = owned[sender].includes(name) ? '✅' : '❌';
          txt += `${have} *${name}* — 🪙 ${data.cost} (earns 🪙 ${data.income}/day)\n_${data.desc}_\n\n`;
        }
        txt += `Buy: .businessbuy <name>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
        return reply(txt);
      }
      const name = args.join(' ').toLowerCase();
      const biz = businesses[name];
      if (!biz) return reply(h.demonFail(`"${name}" is not a real business — check the list`));
      if (owned[sender].includes(name)) return reply(h.demonFail(`you already own a ${name}, greedy`));
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < biz.cost) return reply(h.demonFail(`need 🪙 ${biz.cost} — you only have 🪙 ${bal?.balance || 0}`));
      vault.updateBalance(sender, -biz.cost, 0);
      owned[sender].push(name);
      saveDB('businesses.json', owned);
      reply(`🏪 *Business Purchased!*\n\n🏢 *${name.toUpperCase()}*\n💰 Paid: 🪙 ${biz.cost}\n📈 Passive Income: 🪙 ${biz.income}/day\n\n${biz.desc}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'propertybuy',
    aliases: ['buyproperty', 'realestate'],
    category: 'arena',
    description: 'Buy virtual property for passive income. Usage: propertybuy list | propertybuy apartment',
    execute: async ({ sender, args, reply }) => {
      const props = {
        'studio apartment': { cost: 2000, income: 100, desc: 'Small but it\'s honest work.' },
        'house': { cost: 8000, income: 400, desc: 'Landlord era activated.' },
        'mansion': { cost: 30000, income: 2000, desc: 'Big house, bigger ego.' },
        'skyscraper': { cost: 100000, income: 8000, desc: 'You\'re basically a real estate mogul now.' },
      };
      const owned = loadDB('properties.json');
      if (!owned[sender]) owned[sender] = [];
      if (!args[0] || args[0].toLowerCase() === 'list') {
        let txt = `🏠 *VIRTUAL REAL ESTATE*\n\n`;
        for (const [name, data] of Object.entries(props)) {
          const have = owned[sender].includes(name) ? '✅' : '❌';
          txt += `${have} *${name}* — 🪙 ${data.cost.toLocaleString()} (🪙 ${data.income}/day)\n`;
        }
        return reply(txt + `\nBuy: .propertybuy <name>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const name = args.join(' ').toLowerCase();
      const prop = props[name];
      if (!prop) return reply(h.demonFail(`"${name}" not found — check the list`));
      if (owned[sender].includes(name)) return reply(h.demonFail(`already own this property`));
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < prop.cost) return reply(h.demonFail(`need 🪙 ${prop.cost.toLocaleString()}`));
      vault.updateBalance(sender, -prop.cost, 0);
      owned[sender].push(name);
      saveDB('properties.json', owned);
      reply(`🏠 *Property Purchased!*\n\n🏢 *${name.toUpperCase()}*\n💸 Paid: 🪙 ${prop.cost.toLocaleString()}\n📈 Earns: 🪙 ${prop.income}/day\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'carbuy',
    aliases: ['buycar', 'getwhip'],
    category: 'arena',
    description: 'Buy a virtual car for flex. Usage: carbuy list | carbuy ferrari',
    execute: async ({ sender, args, reply }) => {
      const cars = {
        'toyota corolla': { cost: 500, emoji: '🚗', desc: 'Reliable and soulless. Just like you.' },
        'honda civic': { cost: 800, emoji: '🚙', desc: 'Modified by every teenager ever.' },
        'bmw m3': { cost: 5000, emoji: '🏎️', desc: 'For people who need everyone to know.' },
        'ferrari': { cost: 20000, emoji: '🏎️', desc: 'Red. Fast. Debt.' },
        'lambo': { cost: 50000, emoji: '🏎️', desc: 'The dream. You actually did it.' },
        'crittix beast': { cost: 100000, emoji: '😈', desc: 'Fictional, yet legendary. Fastest in the empire.' },
      };
      const owned = loadDB('garagedb.json');
      if (!owned[sender]) owned[sender] = [];
      if (!args[0] || args[0].toLowerCase() === 'list') {
        let txt = `🚗 *CAR DEALERSHIP*\n\n`;
        for (const [name, data] of Object.entries(cars)) {
          const have = owned[sender].includes(name) ? '✅' : '🔒';
          txt += `${have} ${data.emoji} *${name}* — 🪙 ${data.cost.toLocaleString()}\n`;
        }
        return reply(txt + `\nBuy: .carbuy <name>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const name = args.join(' ').toLowerCase();
      const car = cars[name];
      if (!car) return reply(h.demonFail(`"${name}" is not in the lot — check .carbuy list`));
      if (owned[sender].includes(name)) return reply(h.demonFail(`you already have a ${name} in your garage`));
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < car.cost) return reply(h.demonFail(`need 🪙 ${car.cost.toLocaleString()} — you got 🪙 ${bal?.balance || 0}`));
      vault.updateBalance(sender, -car.cost, 0);
      owned[sender].push(name);
      saveDB('garagedb.json', owned);
      reply(`${car.emoji} *Bought: ${name.toUpperCase()}*\n\n💸 Paid: 🪙 ${car.cost.toLocaleString()}\n\n${car.desc}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'garage',
    aliases: ['mygarage', 'mycars'],
    category: 'arena',
    description: 'View your owned cars. Usage: garage',
    execute: async ({ sender, reply }) => {
      const owned = loadDB('garagedb.json');
      const cars = owned[sender] || [];
      if (!cars.length) return reply(h.demonFail('your garage is empty. tragic. try .carbuy list'));
      reply(`🚗 *YOUR GARAGE*\n\n${cars.map((c, i) => `${i + 1}. 🏎️ ${c.toUpperCase()}`).join('\n')}\n\n${cars.length} car(s) total. Flexing approved.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'mansion',
    aliases: ['mymansion', 'bighouse'],
    category: 'arena',
    description: 'Buy or view a virtual mansion. Usage: mansion buy | mansion view',
    execute: async ({ sender, args, reply }) => {
      const COST = 50000;
      const mansions = loadDB('mansions.json');
      const action = args[0]?.toLowerCase() || 'view';
      if (action === 'buy') {
        if (mansions[sender]) return reply(h.demonFail('you already own a mansion — one is enough, showoff'));
        const bal = vault.getBalance(sender);
        if (!bal || bal.balance < COST) return reply(h.demonFail(`need 🪙 ${COST.toLocaleString()} — the struggle is real`));
        vault.updateBalance(sender, -COST, 0);
        mansions[sender] = { bought: Date.now(), name: 'Crittix Manor' };
        saveDB('mansions.json', mansions);
        return reply(`🏰 *MANSION ACQUIRED!*\n\nWelcome to *Crittix Manor*.\n💸 Paid: 🪙 ${COST.toLocaleString()}\n\nYou're officially a Crittix Empire elite. Don't embarrass us.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const m = mansions[sender];
      if (!m) return reply(h.demonFail('you don\'t own a mansion yet — .mansion buy to flex'));
      reply(`🏰 *YOUR MANSION*\n\n🏛️ Name: *${m.name}*\n📅 Purchased: ${new Date(m.bought).toLocaleDateString()}\n\nLiving large in the Crittix Empire 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'taxpay',
    aliases: ['tax', 'paytax'],
    category: 'arena',
    description: 'Pay your economy tax (flavor/fun). Usage: taxpay',
    execute: async ({ sender, reply }) => {
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance <= 0) return reply(h.demonFail('you have nothing to tax. even the economy doesn\'t want your broke energy'));
      const taxRate = 0.05;
      const tax = Math.max(10, Math.floor(bal.balance * taxRate));
      if (bal.balance < tax) return reply(h.demonFail(`not enough coins to pay tax — ${Math.round(taxRate*100)}% of ${bal.balance} is ${tax}`));
      vault.updateBalance(sender, -tax, 0);
      reply(
        `🏦 *TAX COLLECTED*\n\n` +
        `📊 Tax Rate: ${Math.round(taxRate * 100)}%\n` +
        `💸 Deducted: 🪙 ${tax}\n` +
        `💰 Remaining: 🪙 ${(bal.balance - tax).toLocaleString()}\n\n` +
        `The Crittix Empire thanks you for your contribution. 😈\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'insurance',
    aliases: ['buyinsurance', 'robprotect'],
    category: 'arena',
    description: 'Buy insurance to protect against .rob. Usage: insurance buy | insurance status',
    execute: async ({ sender, args, reply }) => {
      const COST = 300;
      const insured = loadDB('insurance.json');
      const action = args[0]?.toLowerCase() || 'status';
      if (action === 'buy') {
        if (insured[sender] && insured[sender] > Date.now()) {
          const h = Math.ceil((insured[sender] - Date.now()) / 3600000);
          return reply(h.demonFail ? h.demonFail(`already insured for ${h}h more`) : `Already insured for ${h}h more`);
        }
        const bal = vault.getBalance(sender);
        if (!bal || bal.balance < COST) return reply(`Need 🪙 ${COST} to buy insurance`);
        vault.updateBalance(sender, -COST, 0);
        insured[sender] = Date.now() + (24 * 3600000); // 24h
        saveDB('insurance.json', insured);
        return reply(`🛡️ *Insurance Purchased!*\n\n✅ Protected from .rob for *24 hours*\n💸 Cost: 🪙 ${COST}\n\nNow let them try to rob you 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const exp = insured[sender];
      if (!exp || exp <= Date.now()) return reply(`🛡️ *Insurance Status*\n\n❌ Not insured\n\nBuy with .insurance buy for 🪙 300\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      const h = Math.ceil((exp - Date.now()) / 3600000);
      reply(`🛡️ *Insurance Status*\n\n✅ *Active — ${h}h remaining*\n\nYou're protected. Try not to be too smug about it.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }

];
