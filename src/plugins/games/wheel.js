/*
 * WHEEL.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Spin a wheel of prizes — pay 200 coins per spin
 */
const vault    = require('../../lib/vault');
const globalXP = require('../../lib/global-xp');
const h        = require('../../lib/helpers');

const COST = 200;
const SEGMENTS = [
  { label: '💀 NOTHING',      multiplier: 0,   weight: 30 },
  { label: '🪙 2x',           multiplier: 2,   weight: 25 },
  { label: '💰 3x',           multiplier: 3,   weight: 18 },
  { label: '💎 5x',           multiplier: 5,   weight: 12 },
  { label: '👑 8x',           multiplier: 8,   weight: 8  },
  { label: '🔥 10x JACKPOT',  multiplier: 10,  weight: 5  },
  { label: '☄️ 15x INSANE',   multiplier: 15,  weight: 2  },
];

const spin = () => {
  const total = SEGMENTS.reduce((s,o) => s+o.weight, 0);
  let r = Math.random()*total;
  for (const seg of SEGMENTS) { r -= seg.weight; if (r <= 0) return seg; }
  return SEGMENTS[0];
};

const WHEEL_ART = ['🎡','🌀','⭕','🔄','💫','🌪️','🎯'];

module.exports = {
  command: ['wheel'],
  category: 'arena',
  description: 'Spin the wheel of prizes — 🪙200 per spin',
  execute: async ({ sender, senderNumber, reply }) => {
    const bal = vault.getBalance(sender);
    if (!bal || bal.balance < COST)
      return reply(`😑 need 🪙 ${COST} to spin — you're broke`);

    vault.updateBalance(sender, -COST, 0);

    // Simulate spinning animation text
    const spins  = WHEEL_ART.sort(() => Math.random()-0.5).slice(0,5).join(' ');
    const result = spin();
    const prize  = COST * result.multiplier;

    if (prize > 0) {
      vault.updateBalance(sender, prize, 0);
      globalXP.addXP(sender, msg.pushName || senderNumber);
    }

    const newBal = vault.getBalance(sender);
    reply(
      `╔════════════════════════么\n║ 🎡 *WHEEL OF FORTUNE*\n╚════════════════════════么\n\n` +
      `${spins}\n\n` +
      `🎯 Result: *${result.label}*\n\n` +
      (prize > 0
        ? `🎉 Won: *🪙 ${prize.toLocaleString()}*\n`
        : `💀 Tough luck, try again\n`) +
      `💰 Balance: 🪙 ${newBal.balance.toLocaleString()}\n么════════════════════════么`
    );
  }
};
