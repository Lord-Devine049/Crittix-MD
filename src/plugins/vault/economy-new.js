/*
 * ECONOMY-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: beg, crime, bankrob
 */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');

const cooldowns = new Map();
const isOnCooldown = (key, ms) => {
  const last = cooldowns.get(key);
  if (last && Date.now() - last < ms) return Math.ceil((ms - (Date.now() - last)) / 1000);
  return false;
};
const setCooldown = (key) => cooldowns.set(key, Date.now());

const BEG_RESPONSES_FAIL = [
  'Nobody gave you anything. L + ratio + broke.',
  'You held out your hand and everyone walked past. Touch grass.',
  'The streets said no. The streets are smarter than you.',
  'Begged to an empty audience. Even imaginary people ignored you.',
  'You gave your best puppy eyes and got nothing. Tragic.',
];
const BEG_RESPONSES_WIN = [
  'Some kind soul took pity on your broke ass.',
  'A stranger dropped coins out of disgust, not generosity.',
  'You begged loud enough to embarrass someone into giving.',
  'Pure sympathy coins. Savor the shame.',
];
const CRIME_TYPES = [
  { name: 'pickpocketed a tourist', risk: 0.35 },
  { name: 'hacked a vending machine', risk: 0.25 },
  { name: 'sold counterfeit designer bags', risk: 0.40 },
  { name: 'ran a 3-card monte scam', risk: 0.45 },
  { name: 'robbed a food delivery guy', risk: 0.30 },
  { name: 'started a fake crypto project', risk: 0.20 },
  { name: 'pirated software and sold it', risk: 0.15 },
  { name: 'staged a slip-and-fall lawsuit', risk: 0.50 },
];

module.exports = [

  {
    command: 'beg',
    aliases: ['panhandle', 'askformoney'],
    category: 'arena',
    description: 'Beg for coins with a roast-flavored chance of rejection. Usage: .beg',
    execute: async ({ sender, reply }) => {
      const cd = isOnCooldown(`beg_${sender}`, 5 * 60 * 1000);
      if (cd) return reply(`😂 *YOU ALREADY BEGGED*\n\nYou still have your hand out? Wait ${cd}s before begging again, clown.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      setCooldown(`beg_${sender}`);

      const success = Math.random() > 0.45;
      if (!success) {
        return reply(`🪙 *BEG FAILED*\n\n${BEG_RESPONSES_FAIL[Math.floor(Math.random() * BEG_RESPONSES_FAIL.length)]}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const amount = Math.floor(Math.random() * 150) + 10;
      try {
        vault.addCoins(sender, amount);
      } catch { /* vault may not have addCoins, degrade gracefully */ }
      reply(
        `🪙 *BEG SUCCESS*\n\n${BEG_RESPONSES_WIN[Math.floor(Math.random() * BEG_RESPONSES_WIN.length)]}\n\n` +
        `💰 Received: *${amount} coins*\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'crime',
    aliases: ['docrime', 'commitmcrime'],
    category: 'arena',
    description: 'Commit a flavor crime for coins — or get caught and lose some. Usage: .crime',
    execute: async ({ sender, reply }) => {
      const cd = isOnCooldown(`crime_${sender}`, 8 * 60 * 1000);
      if (cd) return reply(`🚨 *LAY LOW*\n\nThe heat is still on you. Lay low for ${cd}s before your next job.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      setCooldown(`crime_${sender}`);

      const crimeType = CRIME_TYPES[Math.floor(Math.random() * CRIME_TYPES.length)];
      const caught = Math.random() < crimeType.risk;

      if (caught) {
        const fine = Math.floor(Math.random() * 200) + 50;
        try { vault.removeCoins(sender, fine); } catch {}
        return reply(
          `🚨 *BUSTED*\n\nYou ${crimeType.name} and got caught.\n\n` +
          `👮 Fine: *${fine} coins*\n\n` +
          `Should've stayed home, criminal.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }
      const reward = Math.floor(Math.random() * 400) + 100;
      try { vault.addCoins(sender, reward); } catch {}
      reply(
        `💰 *CRIME SUCCESSFUL*\n\nYou ${crimeType.name} and got away with it.\n\n` +
        `🤑 Earned: *${reward} coins*\n\n` +
        `Criminal. Absolute menace. Stay dangerous.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'bankrob',
    aliases: ['robbank', 'bankheist'],
    category: 'arena',
    description: 'High-risk solo bank robbery for big coins or big loss. Usage: .bankrob',
    execute: async ({ sender, reply }) => {
      const cd = isOnCooldown(`bankrob_${sender}`, 30 * 60 * 1000);
      if (cd) { const m = Math.floor(cd / 60); return reply(`🏦 *TOO HOT*\n\nFeds are still watching after that last job. Lie low for ${m}m ${cd % 60}s.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      setCooldown(`bankrob_${sender}`);

      const roll = Math.random();
      const phases = [
        '🏦 *BANK ROB INITIATED*\n\n_Casing the vault..._',
        '🔒 _Bypassing security..._',
        '💣 _Blowing the safe door..._',
      ];

      if (roll < 0.5) {
        const loss = Math.floor(Math.random() * 500) + 200;
        try { vault.removeCoins(sender, loss); } catch {}
        return reply(
          `🚨 *BANK ROB FAILED*\n\n` +
          `Silent alarm. SWAT in 30 seconds. You barely escaped.\n\n` +
          `💸 Legal fees and bribes: *${loss} coins*\n\n` +
          `Pathetic. Real criminals don't get caught this easily.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }
      if (roll < 0.80) {
        const gain = Math.floor(Math.random() * 1200) + 400;
        try { vault.addCoins(sender, gain); } catch {}
        return reply(
          `💰 *BANK ROB SUCCESS*\n\n` +
          `You cleaned out the vault before anyone noticed.\n\n` +
          `🤑 Stolen: *${gain} coins*\n\n` +
          `Pure criminal excellence. They'll talk about this one.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }
      const jackpot = Math.floor(Math.random() * 3000) + 1500;
      try { vault.addCoins(sender, jackpot); } catch {}
      reply(
        `🏆 *JACKPOT — LEGENDARY BANK ROB*\n\n` +
        `Vault cracked, guards tied up, getaway clean. Pure cinema.\n\n` +
        `🤑 JACKPOT: *${jackpot} coins*\n\n` +
        `They'll make a Netflix documentary about this.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }

];
