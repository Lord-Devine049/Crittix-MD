/*
 * SCRATCH.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Scratch card lottery — pay 100 coins, chance of big reward
 */
const vault    = require('../../lib/vault');
const globalXP = require('../../lib/global-xp');
const h        = require('../../lib/helpers');

const COST = 100;
const OUTCOMES = [
  { emoji: '💀', label: 'NOTHING',    multiplier: 0,    chance: 35 },
  { emoji: '💀', label: 'NOTHING',    multiplier: 0,    chance: 20 },
  { emoji: '🪙', label: '2X',         multiplier: 2,    chance: 20 },
  { emoji: '💰', label: '3X',         multiplier: 3,    chance: 12 },
  { emoji: '💎', label: '5X',         multiplier: 5,    chance: 7  },
  { emoji: '👑', label: '10X JACKPOT',multiplier: 10,   chance: 4  },
  { emoji: '🌑', label: '20X MEGA',   multiplier: 20,   chance: 2  },
];

const roll = () => {
  const rand = Math.random() * 100;
  let cum = 0;
  for (const o of OUTCOMES) { cum += o.chance; if (rand < cum) return o; }
  return OUTCOMES[0];
};

const scratchRow = () => [roll(), roll(), roll()];

module.exports = {
  command: ['scratch', 'scratchcard'],
  category: 'arena',
  description: 'Scratch card lottery — pay 🪙100, win up to 20x',
  execute: async ({ sender, senderNumber, reply }) => {
    const bal = vault.getBalance(sender);
    if (!bal || bal.balance < COST)
      return reply(`😑 need 🪙 ${COST} to scratch — you're broke`);

    vault.updateBalance(sender, -COST, 0);

    const row1 = scratchRow();
    const row2 = scratchRow();
    const row3 = scratchRow();
    const allRows = [...row1, ...row2, ...row3];

    // Win if any row has 3 matching multipliers
    let winRow = null;
    for (const row of [row1, row2, row3]) {
      if (row[0].multiplier > 0 && row[0].multiplier === row[1].multiplier && row[1].multiplier === row[2].multiplier) {
        winRow = row[0]; break;
      }
    }

    const fmt = r => r.map(o => o.emoji).join(' ');
    let txt = `╔════════════════════════么\n║ 🎫 *SCRATCH CARD*\n╚════════════════════════么\n\n`;
    txt    += `${fmt(row1)}\n${fmt(row2)}\n${fmt(row3)}\n\n`;

    if (winRow) {
      const prize = COST * winRow.multiplier;
      vault.updateBalance(sender, prize, 0);
      globalXP.addXP(sender, msg.pushName || senderNumber);
      txt += `🎉 *${winRow.label}!* +🪙 ${prize.toLocaleString()}\n`;
      txt += `💰 Balance: 🪙 ${(bal.balance - COST + prize).toLocaleString()}`;
    } else {
      txt += `💀 No match. Better luck next time\n`;
      txt += `💰 Balance: 🪙 ${(bal.balance - COST).toLocaleString()}`;
    }

    txt += `\n么════════════════════════么`;
    reply(txt);
  }
};
