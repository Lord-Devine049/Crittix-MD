/*
 * VAULT-NEW2.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
const fs = require('fs-extra');
const path = require('path');

const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

const COOLDOWN_MS = 3600000;

module.exports = [

  {
    command: 'pawnshop',
    aliases: ['pawnitems', 'sellitems'],
    category: 'arena',
    description: 'Sell inventory items back to the bot for coins. Usage: pawnshop',
    execute: async ({ sender, reply }) => {
      const invData = loadDB('inventory.json');
      const userInv = invData[sender] || [];
      if (!userInv.length) return reply(h.demonFail('your inventory is empty — nothing to pawn. Stay broke then 💀'));
      const sellPrice = (item) => {
        const prices = { legendary: 500, rare: 200, uncommon: 80, common: 30 };
        return prices[item.rarity?.toLowerCase()] || 25;
      };
      const lines = userInv.slice(0, 10).map((it, i) => `${i + 1}. *${it.name || it}* — 🪙 ${sellPrice(it)}`).join('\n');
      const totalValue = userInv.slice(0, 10).reduce((s, it) => s + sellPrice(it), 0);
      const sold = userInv.splice(0, 10);
      invData[sender] = userInv;
      saveDB('inventory.json', invData);
      vault.updateBalance(sender, totalValue, 0);
      reply(`🏪 *PAWN SHOP*\n\nSold items:\n${lines}\n\n💰 Total received: 🪙 ${totalValue}\n\nYou pawned your dignity too, but hey, coins are coins. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'vaultinterest',
    aliases: ['claiminterest', 'interest'],
    category: 'arena',
    description: 'Claim daily interest on your vault balance (2%). Usage: vaultinterest',
    execute: async ({ sender, reply }) => {
      const cd = loadDB('vault-interest-cd.json');
      const now = Date.now();
      if (cd[sender] && now - cd[sender] < 86400000) {
        const rem = Math.ceil((86400000 - (now - cd[sender])) / 3600000);
        return reply(h.demonFail(`interest already claimed. Come back in *${rem}h*. The bank doesn't care about your urgency.`));
      }
      const bal = vault.getBalance(sender);
      const balance = bal?.balance || 0;
      if (balance < 100) return reply(h.demonFail('need at least 🪙 100 to earn interest. Grow your account first.'));
      const interest = Math.floor(balance * 0.02);
      vault.updateBalance(sender, interest, 0);
      cd[sender] = now;
      saveDB('vault-interest-cd.json', cd);
      reply(`💹 *VAULT INTEREST*\n\nBalance: 🪙 ${balance.toLocaleString()}\nInterest (2%): 🪙 *${interest}*\nNew balance: 🪙 ${(balance + interest).toLocaleString()}\n\nSlow money is still money. Respect the process. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },



  {
    command: 'vaultflex',
    aliases: ['networth', 'showwealth'],
    category: 'arena',
    description: 'Display your total net worth across vault + businesses + property. Usage: vaultflex',
    execute: async ({ sender, senderNumber, reply }) => {
      const bal = vault.getBalance(sender);
      const balance = bal?.balance || 0;
      const bizData = loadDB('business.json');
      const propData = loadDB('property.json');
      const carData = loadDB('cars.json');
      const userBiz = bizData[sender] || [];
      const userProp = propData[sender] || [];
      const userCars = carData[sender] || [];
      const bizValue = userBiz.reduce((s, b) => s + (b.value || b.cost || 0), 0);
      const propValue = userProp.reduce((s, p) => s + (p.value || p.cost || 0), 0);
      const carValue = userCars.reduce((s, c) => s + (c.value || c.price || 0), 0);
      const netWorth = balance + bizValue + propValue + carValue;
      const tier = netWorth >= 100000 ? '👑 Empire Tier' : netWorth >= 50000 ? '💎 Elite' : netWorth >= 10000 ? '🔥 Rising' : netWorth >= 1000 ? '📈 Building' : '💀 Broke';
      reply(
        `╔════════════════════════么\n` +
        `║ 💰 *VAULT FLEX — @${senderNumber}*\n` +
        `╚════════════════════════么\n\n` +
        `🏦 Cash: 🪙 ${balance.toLocaleString()}\n` +
        `🏢 Businesses: 🪙 ${bizValue.toLocaleString()} (${userBiz.length} owned)\n` +
        `🏠 Properties: 🪙 ${propValue.toLocaleString()} (${userProp.length} owned)\n` +
        `🚗 Vehicles: 🪙 ${carValue.toLocaleString()} (${userCars.length} owned)\n\n` +
        `💼 *NET WORTH: 🪙 ${netWorth.toLocaleString()}*\n` +
        `🏅 Status: ${tier}\n\n` +
        `么════════════════════════么\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'giveaway',
    aliases: ['startgiveaway', 'botgive'],
    category: 'arena',
    description: 'Admin starts a timed giveaway. Members join, bot picks winner. Usage: giveaway start 1000 | giveaway join | giveaway end',
    groupOnly: true,
    execute: async ({ sock, msg, sender, senderNumber, chatId, args, reply, isOwner, isSudo }) => {
      const action = args[0]?.toLowerCase() || 'join';
      const gData = loadDB('giveaway.json');
      if (!gData[chatId]) gData[chatId] = null;
      if (action === 'start') {
        if (!await h.isSenderAdmin(sock, chatId, sender))
          return reply(h.demonFail('only admins can start a giveaway'));
          if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
        const prize = parseInt(args[1]) || 500;
        gData[chatId] = { prize, entries: [], started: Date.now(), by: senderNumber };
        saveDB('giveaway.json', gData);
        return sock.sendMessage(chatId, {
          text: `🎁 *CRITTIX GIVEAWAY STARTED!*\n\n🏆 Prize: 🪙 ${prize.toLocaleString()}\nStarted by: @${senderNumber}\n\nType *.giveaway join* to enter!\nAdmin ends it with *.giveaway end*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: [sender]
        }, { quoted: msg });
      }
      if (action === 'join') {
        const ga = gData[chatId];
        if (!ga) return reply(h.demonFail('no active giveaway in this group. Ask an admin to start one.'));
        if (ga.entries.includes(sender)) return reply(h.demonFail('you\'re already in the giveaway. Patience.'));
        ga.entries.push(sender);
        saveDB('giveaway.json', gData);
        return reply(`✅ Entered! You're entry #${ga.entries.length}. May the odds be with you. 😤`);
      }
      if (action === 'end') {
        if (!await h.isSenderAdmin(sock, chatId, sender))
          return reply(h.demonFail('only admins can end the giveaway'));
          if (!await h.isBotAdmin(sock, chatId)) return reply(h.demonFail('Make my Lord Admin'));
        const ga = gData[chatId];
        if (!ga) return reply(h.demonFail('no active giveaway to end'));
        if (!ga.entries.length) { gData[chatId] = null; saveDB('giveaway.json', gData); return reply(h.demonFail('no one entered. Awkward.')); }
        const winnerJid = ga.entries[Math.floor(Math.random() * ga.entries.length)];
        const winnerNum = winnerJid.split('@')[0];
        vault.updateBalance(winnerJid, ga.prize, 0);
        gData[chatId] = null;
        saveDB('giveaway.json', gData);
        return sock.sendMessage(chatId, {
          text: `🎉 *GIVEAWAY WINNER!*\n\n🏆 @${winnerNum} takes the prize!\n💰 Prize: 🪙 ${ga.prize.toLocaleString()}\n👥 Total entries: ${ga.entries.length}\n\nLucky soul. Don't spend it all at once. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: [winnerJid]
        }, { quoted: msg });
      }
      reply(h.demonError('.giveaway', '.giveaway start <prize> | .giveaway join | .giveaway end'));
    }
  },

  {
    command: 'robinsurance',
    aliases: ['checkinsurance', 'insurancestatus'],
    category: 'arena',
    description: 'Check if you have active rob insurance coverage. Usage: robinsurance',
    execute: async ({ sender, reply }) => {
      const insData = loadDB('rob-insurance.json');
      const userIns = insData[sender];
      if (!userIns || !userIns.active) return reply(`🔓 *INSURANCE STATUS*\n\nYou have *no* active insurance.\nYou\'re wide open for robbers. Get coverage with *.insurance*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      const now = Date.now();
      const expiry = userIns.expiry || 0;
      if (now > expiry) {
        insData[sender].active = false;
        saveDB('rob-insurance.json', insData);
        return reply(`🔓 *INSURANCE EXPIRED*\n\nYour policy ran out. You're unprotected now.\nRenew with *.insurance*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const hoursLeft = Math.ceil((expiry - now) / 3600000);
      reply(`🛡️ *INSURANCE ACTIVE*\n\n✅ You're covered!\nExpires in: *${hoursLeft}h*\nCoverage: Reduces rob losses by 50%\n\nSomeone tries to rob you — they get half the haul. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }

];
