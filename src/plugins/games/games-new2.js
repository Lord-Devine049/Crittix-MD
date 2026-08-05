/*
 * GAMES-NEW2.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: petadopt, petfeed, petbattle, fishinggame, treasurehunt,
 *           dungeoncrawl, bossfight, questboard, dailyquest, achievementlist,
 *           skilltree, craftitem, lootbox, gachapull, guildcreate, prestige,
 *           enchant, marketplace
 */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
const globalXP = require('../../lib/global-xp');
const fs = require('fs-extra');
const path = require('path');

const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

module.exports = [

  {
    command: 'petadopt',
    aliases: ['adopt', 'getpet'],
    category: 'arena',
    description: 'Adopt a virtual pet. Usage: petadopt dog | petadopt cat | petadopt dragon',
    execute: async ({ sender, args, reply }) => {
      const pets = loadDB('pets.json');
      if (pets[sender]) return reply(h.demonFail(`you already have a *${pets[sender].species}* named *${pets[sender].name}*. one is enough`));
      const types = { dog:'🐕', cat:'🐈', dragon:'🐉', fox:'🦊', wolf:'🐺', rabbit:'🐰', bear:'🐻', bird:'🦜' };
      const species = (args[0] || 'dog').toLowerCase();
      if (!types[species]) return reply(h.demonFail(`pick: ${Object.keys(types).join(', ')}`));
      const names = ['Shadow','Blaze','Nova','Void','Storm','Luna','Rex','Ash'];
      const name = args[1] || names[Math.floor(Math.random() * names.length)];
      pets[sender] = { species, name, emoji: types[species], hunger: 100, happiness: 100, xp: 0, level: 1, born: Date.now() };
      saveDB('pets.json', pets);
      reply(`${types[species]} *PET ADOPTED!*\n\nMeet *${name}* the ${species}!\n\n❤️ Hunger: 100%\n😊 Happiness: 100%\n⭐ Level: 1\n\nFeed it: .petfeed\nBattle it: .petbattle @user\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'petfeed',
    aliases: ['feedpet', 'peteat'],
    category: 'arena',
    description: 'Feed your virtual pet. Usage: petfeed',
    execute: async ({ sender, reply }) => {
      const pets = loadDB('pets.json');
      const pet = pets[sender];
      if (!pet) return reply(h.demonFail('you don\'t have a pet — adopt one with .petadopt'));
      const last = pet.lastFed || 0;
      if (Date.now() - last < 1800000) return reply(h.demonFail(`${pet.name} isn't hungry yet — come back in ${Math.ceil((1800000 - (Date.now() - last)) / 60000)} min`));
      const bal = vault.getBalance(sender);
      const COST = 20;
      if (!bal || bal.balance < COST) return reply(h.demonFail(`need 🪙 ${COST} to feed ${pet.name}`));
      vault.updateBalance(sender, -COST, 0);
      pet.hunger = Math.min(100, (pet.hunger || 0) + 25);
      pet.happiness = Math.min(100, (pet.happiness || 0) + 10);
      pet.xp = (pet.xp || 0) + 10;
      pet.lastFed = Date.now();
      if (pet.xp >= pet.level * 100) { pet.level++; }
      pets[sender] = pet;
      saveDB('pets.json', pets);
      reply(`${pet.emoji} *${pet.name} FED!*\n\n❤️ Hunger: ${pet.hunger}%\n😊 Happiness: ${pet.happiness}%\n⭐ Level: ${pet.level} (XP: ${pet.xp})\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'petbattle',
    aliases: ['petfight'],
    category: 'arena',
    description: 'Battle your pet vs another user\'s pet. Usage: petbattle @user',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, senderNumber, reply }) => {
      const pets = loadDB('pets.json');
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target = h.getTarget(msg, _gtP)?.[0];
      if (!target) return reply(h.demonError('.petbattle', '.petbattle @opponent'));
      const myPet = pets[sender];
      const theirPet = pets[target];
      if (!myPet) return reply(h.demonFail('you don\'t have a pet — .petadopt first'));
      if (!theirPet) return reply(h.demonFail('that user doesn\'t have a pet'));
      const myPow = myPet.level * 10 + myPet.xp + Math.random() * 30;
      const theirPow = theirPet.level * 10 + theirPet.xp + Math.random() * 30;
      const won = myPow > theirPow;
      const prize = 50;
      if (won) vault.updateBalance(sender, prize, 0);
      await sock.sendMessage(chatId, {
        text: `⚔️ *PET BATTLE*\n\n${myPet.emoji} *${myPet.name}* (Lv.${myPet.level}) — Power: ${Math.round(myPow)}\nvs\n${theirPet.emoji} *${theirPet.name}* (Lv.${theirPet.level}) — Power: ${Math.round(theirPow)}\n\n🏆 Winner: ${won ? myPet.name : theirPet.name}!\n${won ? `@${senderNumber} wins 🪙 ${prize}!` : `@${target.split('@')[0]} wins!`}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
        mentions: [sender, target]
      }, { quoted: msg });
    }
  },

  {
    command: 'fishinggame',
    aliases: ['fish', 'gofish'],
    category: 'arena',
    description: 'Virtual fishing for coins. Usage: fishinggame',
    execute: async ({ sender, reply }) => {
      const COOLDOWN = 900000; // 15min
      const fishing = loadDB('fishing.json');
      const last = fishing[sender] || 0;
      if (Date.now() - last < COOLDOWN) return reply(h.demonFail(`bait's not ready — come back in ${Math.ceil((COOLDOWN - (Date.now() - last)) / 60000)} min`));
      const catches = [
        { name:'🐟 Sardine', prize:10, chance:35 }, { name:'🐠 Clownfish', prize:25, chance:25 },
        { name:'🐡 Pufferfish', prize:50, chance:15 }, { name:'🦈 Small Shark', prize:150, chance:10 },
        { name:'🐙 Octopus', prize:200, chance:8 }, { name:'👑 LEGENDARY FISH', prize:1000, chance:2 },
        { name:'🥾 Old Boot', prize:0, chance:5 },
      ];
      const rand = Math.random() * 100;
      let cum = 0, caught = catches[0];
      for (const c of catches) { cum += c.chance; if (rand < cum) { caught = c; break; } }
      if (caught.prize > 0) vault.updateBalance(sender, caught.prize, 0);
      fishing[sender] = Date.now();
      saveDB('fishing.json', fishing);
      reply(`🎣 *FISHING RESULTS*\n\nYou cast your line...\n\n${caught.prize > 0 ? `✅ Caught: *${caught.name}*\n💰 Earned: 🪙 ${caught.prize}` : `😂 You caught: *${caught.name}*\nAbsolutely nothing of value.`}\n\n⏰ Next fishing in 15 min\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'treasurehunt',
    aliases: ['hunt', 'findtreasure'],
    category: 'arena',
    description: 'Random treasure hunt for coins. Usage: treasurehunt',
    execute: async ({ sender, msg, senderNumber, reply }) => {
      const COOLDOWN = 1800000; // 30min
      const hunts = loadDB('treasurehunt.json');
      const last = hunts[sender] || 0;
      if (Date.now() - last < COOLDOWN) return reply(h.demonFail(`map isn't ready — try again in ${Math.ceil((COOLDOWN - (Date.now() - last)) / 60000)} min`));
      const outcomes = [
        { desc:'dug up an old chest', prize:500, chance:5 },
        { desc:'found a buried pouch of coins', prize:200, chance:15 },
        { desc:'stumbled upon a hidden cache', prize:100, chance:25 },
        { desc:'found some coins in the dirt', prize:30, chance:30 },
        { desc:'found a rusty nail', prize:0, chance:25 },
      ];
      const rand = Math.random() * 100;
      let cum = 0, result = outcomes[0];
      for (const o of outcomes) { cum += o.chance; if (rand < cum) { result = o; break; } }
      if (result.prize > 0) { vault.updateBalance(sender, result.prize, 0); globalXP.addXP(sender, msg.pushName || senderNumber); }
      hunts[sender] = Date.now();
      saveDB('treasurehunt.json', hunts);
      reply(`🗺️ *TREASURE HUNT*\n\nYou followed the map and...\n\n${result.prize > 0 ? `✅ *${result.desc}!*\n💰 Found: 🪙 ${result.prize}` : `😂 ${result.desc}. That's it.`}\n\n⏰ Next hunt in 30 min\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'dungeoncrawl',
    aliases: ['dungeon', 'crawl'],
    category: 'arena',
    description: 'Text dungeon crawl mini-RPG. Usage: dungeoncrawl start | dungeoncrawl fight | dungeoncrawl run',
    execute: async ({ sender, senderNumber, args, prefix, reply }) => {
      const key = `dungeon_${sender}`;
      const dungeons = loadDB('dungeons.json');
      if (args[0] === 'start' || !dungeons[key]) {
        dungeons[key] = { hp: 100, floor: 1, gold: 0 };
        saveDB('dungeons.json', dungeons);
        return reply(`⚔️ *DUNGEON CRAWL*\n\nYou enter the dungeon...\n\n❤️ HP: 100 | 🏰 Floor: 1\n\nA monster appears!\n\n${prefix}dungeoncrawl fight — attack it\n${prefix}dungeoncrawl run — flee like a coward\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const char = dungeons[key];
      if (args[0] === 'fight') {
        const monsters = ['👹 Goblin','🐉 Drake','💀 Skeleton','🦂 Scorpion','😈 Demon'];
        const monster = monsters[Math.floor(Math.random() * monsters.length)];
        const monsterHp = char.floor * 20 + Math.floor(Math.random() * 20);
        const dmgDealt = 20 + Math.floor(Math.random() * 30);
        const dmgTaken = Math.floor(Math.random() * 25);
        if (dmgDealt >= monsterHp) {
          char.gold += char.floor * 50;
          char.floor++;
          char.hp = Math.min(100, char.hp + 10);
          dungeons[key] = char;
          saveDB('dungeons.json', dungeons);
          if (char.floor > 10) {
            vault.updateBalance(sender, char.gold, 0);
            delete dungeons[key];
            saveDB('dungeons.json', dungeons);
            return reply(`🏆 *DUNGEON COMPLETE!*\n\nYou cleared all 10 floors!\n💰 Total loot: 🪙 ${char.gold.toLocaleString()}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
          }
          return reply(`⚔️ *Victory! ${monster} defeated!*\n\n❤️ HP: ${char.hp} | 🏰 Floor: ${char.floor}\n💰 Gold: ${char.gold}\n\nNext fight: ${prefix}dungeoncrawl fight\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } else {
          char.hp -= dmgTaken;
          dungeons[key] = char;
          saveDB('dungeons.json', dungeons);
          if (char.hp <= 0) {
            delete dungeons[key];
            saveDB('dungeons.json', dungeons);
            return reply(`💀 *YOU DIED*\n\nKilled by ${monster} on floor ${char.floor}.\nAll gold lost. That's a skill issue.\n\nRestart: ${prefix}dungeoncrawl start\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
          }
          return reply(`⚔️ *Fight continues!*\n\nYou and ${monster} are locked in combat.\n❤️ HP: ${char.hp}\n\n${prefix}dungeoncrawl fight | ${prefix}dungeoncrawl run\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
      }
      if (args[0] === 'run') {
        const gold = char.gold;
        if (gold > 0) vault.updateBalance(sender, Math.floor(gold / 2), 0);
        delete dungeons[key];
        saveDB('dungeons.json', dungeons);
        return reply(`🏃 *You ran away!*\n\nYou escaped floor ${char.floor} with 🪙 ${Math.floor(gold / 2)} (half your loot).\n\nCoward. But alive.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const char2 = dungeons[key];
      reply(`⚔️ *DUNGEON STATUS*\n\n❤️ HP: ${char2.hp}\n🏰 Floor: ${char2.floor}\n💰 Gold: ${char2.gold}\n\n${prefix}dungeoncrawl fight | run`);
    }
  },

  {
    command: 'bossfight',
    aliases: ['boss', 'groupboss'],
    category: 'arena',
    description: 'Group boss fight event. Usage: bossfight start | bossfight attack',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, senderNumber, args, prefix, reply }) => {
      const bosses = loadDB('bossfight.json');
      if (args[0] === 'start') {
        if (bosses[chatId]?.active) return reply(h.demonFail('boss fight already in progress'));
        const bossNames = ['🔥 Inferno Titan','💀 Lord Void','🐉 Shadow Drake','😈 Demon King','👹 Ancient Troll'];
        const bossName = bossNames[Math.floor(Math.random() * bossNames.length)];
        const bossHp = 5000;
        bosses[chatId] = { name: bossName, hp: bossHp, maxHp: bossHp, active: true, participants: {}, started: Date.now() };
        saveDB('bossfight.json', bosses);
        return sock.sendMessage(chatId, { text: `👹 *BOSS FIGHT!*\n\n*${bossName}* has appeared!\n❤️ HP: ${bossHp.toLocaleString()}\n\nEveryone attack with: ${prefix}bossfight attack\nFight for 5 minutes — winner split the loot!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
      }
      const fight = bosses[chatId];
      if (!fight?.active) return reply(h.demonFail(`no boss fight active — start one with ${prefix}bossfight start`));
      const ATTACK_CD = 10000;
      const lastAttack = fight.participants[sender] || 0;
      if (Date.now() - lastAttack < ATTACK_CD) return reply(h.demonFail(`cooldown — attack again in ${Math.ceil((ATTACK_CD - (Date.now() - lastAttack)) / 1000)}s`));
      const dmg = 50 + Math.floor(Math.random() * 150);
      fight.hp = Math.max(0, fight.hp - dmg);
      fight.participants[sender] = Date.now();
      if (!fight.damageBy) fight.damageBy = {};
      fight.damageBy[sender] = (fight.damageBy?.[sender] || 0) + dmg;
      if (fight.hp <= 0) {
        const winners = Object.entries(fight.damageBy).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const prizes = [500, 250, 100];
        for (const [i, [jid]] of winners.entries()) vault.updateBalance(jid, prizes[i] || 50, 0);
        delete bosses[chatId];
        saveDB('bossfight.json', bosses);
        return sock.sendMessage(chatId, {
          text: `🏆 *BOSS DEFEATED!*\n\n*${fight.name}* has been slain!\n\n🥇 Top Damage:\n${winners.map(([jid, dmg], i) => `${i+1}. @${jid.split('@')[0]} — ${dmg} dmg`).join('\n')}\n\nPrizes distributed! 🎉\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: winners.map(([jid]) => jid)
        }, { quoted: msg });
      }
      saveDB('bossfight.json', bosses);
      const bar = Math.floor((fight.hp / fight.maxHp) * 10);
      const hpBar = '█'.repeat(bar) + '░'.repeat(10 - bar);
      await sock.sendMessage(chatId, { text: `⚔️ @${senderNumber} deals *${dmg} damage!*\n\n👹 *${fight.name}*\n❤️ [${hpBar}] ${fight.hp.toLocaleString()}/${fight.maxHp.toLocaleString()}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`, mentions: [sender] }, { quoted: msg });
    }
  },

  {
    command: 'questboard',
    aliases: ['quests', 'missions'],
    category: 'arena',
    description: 'View available quests. Usage: questboard',
    execute: async ({ prefix, reply }) => {
      reply(
        `📋 *QUEST BOARD*\n\n` +
        `Daily Quests (reset every 24h):\n` +
        `• 🎣 Fish 3 times → 🪙 100\n` +
        `• 🎲 Gamble 5 times → 🪙 200\n` +
        `• 💬 Use 10 commands → 🪙 50\n` +
        `• 🗺️ Complete a treasure hunt → 🪙 150\n\n` +
        `Weekly Quests:\n` +
        `• ⚔️ Win 10 PVP battles → 🪙 1000\n` +
        `• 🐉 Clear the dungeon → 🪙 2000\n` +
        `• 👹 Participate in 3 boss fights → 🪙 500\n\n` +
        `Claim your daily: ${prefix}dailyquest\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'dailyquest',
    aliases: ['dquest', 'todayquest'],
    category: 'arena',
    description: 'Get your daily quest and reward. Usage: dailyquest',
    execute: async ({ sender, reply }) => {
      const COOLDOWN = 86400000;
      const quests = loadDB('dailyquests.json');
      const last = quests[sender]?.last || 0;
      if (Date.now() - last < COOLDOWN) return reply(h.demonFail(`daily quest already claimed — reset in ${Math.ceil((COOLDOWN - (Date.now() - last)) / 3600000)}h`));
      const questList = [
        { name:'Send 5 messages', reward:50 }, { name:'Use .fishinggame once', reward:100 },
        { name:'Check your .balance', reward:25 }, { name:'Use .gamble once', reward:75 },
        { name:'Win a .blackjack game', reward:200 }, { name:'Complete a .dungeoncrawl', reward:500 },
        { name:'Feed your .petfeed', reward:80 }, { name:'Open a .lootbox', reward:150 },
      ];
      const quest = questList[Math.floor(Math.random() * questList.length)];
      const prize = quest.reward;
      vault.updateBalance(sender, prize, 0);
      quests[sender] = { last: Date.now(), quest: quest.name };
      saveDB('dailyquests.json', quests);
      reply(`📋 *DAILY QUEST*\n\n✅ Quest: *${quest.name}*\n\n(Auto-completed for simplicity)\n💰 Reward: 🪙 ${prize}\n\n⏰ Next quest in 24h\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'achievementlist',
    aliases: ['achievements2', 'badges2'],
    category: 'arena',
    description: 'View all available achievements. Usage: achievementlist',
    execute: async ({ sender, reply }) => {
      reply(
        `🏆 *ACHIEVEMENT LIST*\n\n` +
        `💰 *VAULT*\n• First Coin — Earn your first coin\n• Millionaire — Reach 🪙 1,000,000\n• High Roller — Gamble 🪙 10,000 in one go\n\n` +
        `⚔️ *COMBAT*\n• First Blood — Win your first PVP\n• Beast Slayer — Defeat a dungeon boss\n• Boss Hunter — Participate in 10 boss fights\n\n` +
        `🐾 *PETS*\n• Pet Parent — Adopt a pet\n• Max Bond — Reach Pet Level 10\n• Battle Ready — Win 5 pet battles\n\n` +
        `🎣 *EXPLORATION*\n• Fisherman — Fish 10 times\n• Treasure Hunter — Complete 5 treasure hunts\n• Dungeon Clearer — Finish all 10 floors\n\n` +
        `📊 *SOCIAL*\n• Chat King — Use 500 commands total\n• Group Legend — Be top in group for a week\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'skilltree',
    aliases: ['skills', 'perks'],
    category: 'arena',
    description: 'View your skill tree based on XP/level. Usage: skilltree',
    execute: async ({ sender, reply }) => {
      const xp = globalXP.getXP(sender) || 0;
      const level = Math.floor(xp / 100) + 1;
      const locked = '🔒', unlocked = '✅';
      reply(
        `🌳 *SKILL TREE*\n\n` +
        `📊 Level: *${level}* | XP: ${xp}\n\n` +
        `${level >= 1 ? unlocked : locked} Lv.1 — Basic Commands Unlocked\n` +
        `${level >= 3 ? unlocked : locked} Lv.3 — Vault Access\n` +
        `${level >= 5 ? unlocked : locked} Lv.5 — Dungeon Crawl\n` +
        `${level >= 8 ? unlocked : locked} Lv.8 — Boss Fight Participation\n` +
        `${level >= 10 ? unlocked : locked} Lv.10 — Auction House\n` +
        `${level >= 15 ? unlocked : locked} Lv.15 — Prestige Available\n` +
        `${level >= 20 ? unlocked : locked} Lv.20 — Guild Leadership\n` +
        `${level >= 25 ? unlocked : locked} Lv.25 — Legendary Pet Unlock\n` +
        `${level >= 30 ? unlocked : locked} Lv.30 — Elite Status\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'lootbox',
    aliases: ['openbox', 'crate'],
    category: 'arena',
    description: 'Open a lootbox for random rewards. Usage: lootbox',
    execute: async ({ sender, msg, senderNumber, reply }) => {
      const COST = 150, COOLDOWN = 3600000;
      const boxes = loadDB('lootboxes.json');
      const last = boxes[sender] || 0;
      if (Date.now() - last < COOLDOWN) return reply(h.demonFail(`lootbox not ready — ${Math.ceil((COOLDOWN - (Date.now() - last)) / 60000)} min`));
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < COST) return reply(h.demonFail(`need 🪙 ${COST} to open a lootbox`));
      vault.updateBalance(sender, -COST, 0);
      const rewards = [
        { name:'🪙 Coins', prize:50, chance:30 }, { name:'💰 Big Coins', prize:300, chance:20 },
        { name:'💎 Gem Coins', prize:750, chance:15 }, { name:'👑 Royal Cache', prize:1500, chance:8 },
        { name:'🌟 Jackpot', prize:5000, chance:2 }, { name:'📦 Empty Box', prize:0, chance:25 },
      ];
      const rand = Math.random() * 100;
      let cum = 0, result = rewards[0];
      for (const r of rewards) { cum += r.chance; if (rand < cum) { result = r; break; } }
      if (result.prize > 0) { vault.updateBalance(sender, result.prize, 0); globalXP.addXP(sender, msg.pushName || senderNumber); }
      boxes[sender] = Date.now();
      saveDB('lootboxes.json', boxes);
      reply(`📦 *LOOTBOX OPENED*\n\n✨ Inside: *${result.name}*\n${result.prize > 0 ? `💰 Value: 🪙 ${result.prize}` : '😂 Absolutely nothing. RNG hates you.'}\n\n⏰ Next box in 1h\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'gachapull',
    aliases: ['gacha', 'pull'],
    category: 'arena',
    description: 'Gacha pull for random items. Usage: gachapull',
    execute: async ({ sender, reply }) => {
      const COST = 100, COOLDOWN = 1800000;
      const pulls = loadDB('gacha.json');
      const last = pulls[sender] || 0;
      if (Date.now() - last < COOLDOWN) return reply(h.demonFail(`pull not ready — ${Math.ceil((COOLDOWN - (Date.now() - last)) / 60000)} min`));
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < COST) return reply(h.demonFail(`need 🪙 ${COST} to pull`));
      vault.updateBalance(sender, -COST, 0);
      const items = [
        { rarity:'⚪ Common', item:'Basic Sword', value:50, chance:40 },
        { rarity:'🟢 Uncommon', item:'Silver Shield', value:150, chance:30 },
        { rarity:'🔵 Rare', item:'Dragon Claw', value:400, chance:15 },
        { rarity:'🟣 Epic', item:'Void Orb', value:800, chance:10 },
        { rarity:'🟡 Legendary', item:'Crittix Blade', value:3000, chance:5 },
      ];
      const rand = Math.random() * 100;
      let cum = 0, pulled = items[0];
      for (const item of items) { cum += item.chance; if (rand < cum) { pulled = item; break; } }
      vault.updateBalance(sender, pulled.value, 0);
      pulls[sender] = Date.now();
      saveDB('gacha.json', pulls);
      reply(`🎰 *GACHA PULL*\n\n${pulled.rarity}\n✨ *${pulled.item}*\n💰 Value: 🪙 ${pulled.value}\n\n${pulled.rarity.includes('Legendary') ? '🌟 LEGENDARY PULL! The stars align!' : pulled.rarity.includes('Epic') ? '🟣 Epic pull! Not bad!' : 'Keep pulling for something better.'}\n\n⏰ Next pull in 30min\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'guildcreate',
    aliases: ['guild', 'createguild'],
    category: 'arena',
    description: 'Create or join a guild. Usage: guildcreate MyGuild | guildcreate join GuildName',
    groupOnly: true,
    execute: async ({ chatId, sender, senderNumber, args, prefix, reply }) => {
      const guilds = loadDB('guilds.json');
      if (!guilds[chatId]) guilds[chatId] = {};
      if (args[0] === 'join') {
        const guildName = args.slice(1).join(' ');
        if (!guilds[chatId][guildName]) return reply(h.demonFail(`guild "${guildName}" doesn't exist here`));
        if (guilds[chatId][guildName].members.includes(sender)) return reply(h.demonFail('already in this guild'));
        guilds[chatId][guildName].members.push(sender);
        saveDB('guilds.json', guilds);
        return reply(`🏰 *Joined guild: ${guildName}*\n\nMembers: ${guilds[chatId][guildName].members.length}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (args[0] === 'list') {
        if (!Object.keys(guilds[chatId]).length) return reply(h.demonFail('no guilds in this group yet — create one!'));
        return reply(`🏰 *GUILDS IN THIS GROUP*\n\n${Object.entries(guilds[chatId]).map(([n, g]) => `• *${n}* — ${g.members.length} members`).join('\n')}\n\nJoin: ${prefix}guildcreate join <name>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const name = args.join(' ');
      if (!name) return reply(h.demonError('.guildcreate', `.guildcreate <guild name> | ${prefix}guildcreate join <name>`));
      if (guilds[chatId][name]) return reply(h.demonFail(`guild "${name}" already exists`));
      const COST = 500;
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < COST) return reply(h.demonFail(`need 🪙 ${COST} to create a guild`));
      vault.updateBalance(sender, -COST, 0);
      guilds[chatId][name] = { leader: sender, members: [sender], created: Date.now() };
      saveDB('guilds.json', guilds);
      reply(`🏰 *GUILD CREATED: ${name}*\n\n👑 Leader: @${senderNumber}\n💸 Cost: 🪙 ${COST}\n\nMembers can join with: ${prefix}guildcreate join ${name}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'prestige',
    aliases: ['prestigeup', 'reset'],
    category: 'arena',
    description: 'Reset your level for a prestige badge once max level reached. Usage: prestige',
    execute: async ({ sender, senderNumber, reply }) => {
      const xp = globalXP.getXP(sender) || 0;
      const level = Math.floor(xp / 100) + 1;
      if (level < 15) return reply(h.demonFail(`need level 15 to prestige — you're level ${level}. keep grinding`));
      const prestigeDB = loadDB('prestige.json');
      const current = prestigeDB[sender] || 0;
      prestigeDB[sender] = current + 1;
      saveDB('prestige.json', prestigeDB);
      // Reset XP
      const globalXPDB = loadDB('global-xp.json') || {};
      globalXPDB[sender] = 0;
      saveDB('global-xp.json', globalXPDB);
      const titles = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Legend', 'Mythic', 'CRITTIX'];
      const title = titles[Math.min(current, titles.length - 1)];
      reply(`⭐ *PRESTIGE ${current + 1}!*\n\nTitle: *${title} ${senderNumber}*\n\nLevel reset to 1. XP wiped.\nBut that prestige badge? Permanent flex.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'enchant',
    aliases: ['enchantitem', 'buff'],
    category: 'arena',
    description: 'Enchant an inventory item for a random buff. Usage: enchant sword',
    execute: async ({ sender, args, reply }) => {
      const item = args.join(' ') || 'your item';
      const COST = 100;
      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < COST) return reply(h.demonFail(`need 🪙 ${COST} to enchant`));
      vault.updateBalance(sender, -COST, 0);
      const enchants = ['🔥 Fiery (+20% dmg)','❄️ Frost (slows enemy)','⚡ Lightning (chain dmg)','💀 Death (instant kill 5%)','🛡️ Guard (+30% defense)','🌟 Luck (rare drops +50%)',  '☠️ Cursed (-10% all stats, oops)'];
      const e = enchants[Math.floor(Math.random() * enchants.length)];
      reply(`✨ *ENCHANTED!*\n\n🗡️ Item: *${item}*\n✨ Enchantment: *${e}*\n\n${e.includes('Cursed') ? '😂 Welp. RNG is not on your side today.' : 'Powerful. Don\'t waste it.'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'marketplace',
    aliases: [ 'shop2'],
    category: 'arena',
    description: 'Buy/sell virtual items. Usage: marketplace list | marketplace buy sword | marketplace sell sword 200',
    execute: async ({ sender, args, reply }) => {
      const items = loadDB('marketplace.json');
      if (!items.listings) items.listings = {};
      const action = args[0]?.toLowerCase() || 'list';
      if (action === 'list') {
        if (!Object.keys(items.listings).length) return reply(`🏪 *MARKETPLACE*\n\nNo listings yet. Sell something!\n\nSell: .marketplace sell <item name> <price>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        let txt = `🏪 *MARKETPLACE*\n\n`;
        for (const [id, listing] of Object.entries(items.listings).slice(0, 10)) {
          txt += `• *${listing.item}* — 🪙 ${listing.price} (by @${listing.seller})\n  ID: \`${id}\`\n`;
        }
        return reply(txt + `\nBuy: .marketplace buy <ID>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'sell') {
        const price = parseInt(args[args.length - 1]);
        const itemName = args.slice(1, -1).join(' ');
        if (!itemName || isNaN(price)) return reply(h.demonError('.marketplace sell', '.marketplace sell <item name> <price>'));
        const id = Date.now().toString(36);
        items.listings[id] = { item: itemName, price, seller: (sender.split('@')[0]).slice(0,10), sellerJid: sender, listed: Date.now() };
        saveDB('marketplace.json', items);
        return reply(`✅ *Listed!*\n\n📦 Item: *${itemName}*\n💰 Price: 🪙 ${price}\n🆔 ID: \`${id}\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'buy') {
        const id = args[1];
        const listing = items.listings[id];
        if (!listing) return reply(h.demonFail(`listing ID not found`));
        const bal = vault.getBalance(sender);
        if (!bal || bal.balance < listing.price) return reply(h.demonFail(`need 🪙 ${listing.price}`));
        vault.updateBalance(sender, -listing.price, 0);
        vault.updateBalance(listing.sellerJid, listing.price, 0);
        const bought = listing.item;
        delete items.listings[id];
        saveDB('marketplace.json', items);
        return reply(`✅ *Purchased!*\n\n📦 Item: *${bought}*\n💸 Paid: 🪙 ${listing.price}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply('Usage: .marketplace list | sell <item> <price> | buy <ID>');
    }
  },

  {
    command: 'craftitem',
    aliases: ['craft', 'combine'],
    category: 'arena',
    description: 'Craft items by combining ingredients. Usage: craftitem sword | craftitem list',
    execute: async ({ sender, args, reply }) => {
      const recipes = {
        'power sword': { needs: ['basic sword', 'fire shard'], result: '🔥 Power Sword', value: 2000 },
        'dragon shield': { needs: ['shield', 'dragon scale'], result: '🐉 Dragon Shield', value: 3000 },
        'void staff': { needs: ['staff', 'void crystal'], result: '🌑 Void Staff', value: 5000 },
      };
      if (!args[0] || args[0] === 'list') {
        let txt = `⚒️ *CRAFTING RECIPES*\n\n`;
        for (const [name, recipe] of Object.entries(recipes)) {
          txt += `• *${recipe.result}*\n  Needs: ${recipe.needs.join(' + ')}\n  Value: 🪙 ${recipe.value}\n\n`;
        }
        return reply(txt + `\nCraft: .craftitem <recipe name>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const recipe = recipes[args.join(' ').toLowerCase()];
      if (!recipe) return reply(h.demonFail(`recipe not found — .craftitem list`));
      // Auto-craft and give value (simplified — real inventory system would check items)
      const bal = vault.getBalance(sender);
      const CRAFT_COST = Math.floor(recipe.value * 0.5);
      if (!bal || bal.balance < CRAFT_COST) return reply(h.demonFail(`need 🪙 ${CRAFT_COST} in materials/coins`));
      vault.updateBalance(sender, -CRAFT_COST + recipe.value, 0);
      reply(`⚒️ *ITEM CRAFTED!*\n\n${recipe.result}\n\n📦 Materials: ${recipe.needs.join(', ')}\n💸 Net gain: 🪙 ${recipe.value - CRAFT_COST}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }

];
