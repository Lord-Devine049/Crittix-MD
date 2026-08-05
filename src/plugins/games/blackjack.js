/*
 * BLACKJACK.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Classic blackjack against the bot
 */
const vault    = require('../../lib/vault');
const globalXP = require('../../lib/global-xp');
const h        = require('../../lib/helpers');

const SUITS = ['♠','♥','♦','♣'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

const deck = () => {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ r, s });
  return d.sort(() => Math.random()-0.5);
};

const val = (hand) => {
  let total = 0, aces = 0;
  for (const c of hand) {
    if (c.r === 'A') { aces++; total += 11; }
    else if (['J','Q','K'].includes(c.r)) total += 10;
    else total += parseInt(c.r);
  }
  while (total > 21 && aces--) total -= 10;
  return total;
};

const fmt = (hand) => hand.map(c => `${c.r}${c.s}`).join(' ');

const sessions = new Map(); // chatId+sender -> session

module.exports = {
  command: ['blackjack', 'bj'],
  category: 'arena',
  description: 'Classic blackjack against the bot',
  execute: async ({ sock, msg, sender, senderNumber, chatId, args, reply }) => {
    const key    = `${chatId}:${sender}`;
    const action = args[0]?.toLowerCase();

    // Active session — hit or stand
    if (sessions.has(key)) {
      const s = sessions.get(key);
      if (action === 'hit') {
        s.player.push(s.deck.pop());
        const pVal = val(s.player);
        if (pVal > 21) {
          sessions.delete(key);
          return reply(`╔════════════════════════么\n║ 💀 *BUST*\n╚════════════════════════么\n\nYour hand: ${fmt(s.player)} (${pVal})\n💸 Lost: 🪙 ${s.bet.toLocaleString()}\n\nYou busted like the broke mf you are`);
        }
        return reply(`Your hand: ${fmt(s.player)} (${pVal})\nDealer shows: ${fmt([s.dealer[0]])} ?\n\nType *.bj hit* or *.bj stand*`);
      }

      if (action === 'stand') {
        const d = s.dealer;
        while (val(d) < 17) d.push(s.deck.pop());
        const pVal = val(s.player), dVal = val(d);
        sessions.delete(key);

        let result, coinChange;
        if (dVal > 21 || pVal > dVal) {
          coinChange = s.bet;
          vault.updateBalance(sender, s.bet, 0);
          globalXP.addXP(sender, msg.pushName || senderNumber);
          result = `🏆 *YOU WIN!* +🪙 ${s.bet.toLocaleString()}`;
        } else if (pVal === dVal) {
          coinChange = 0;
          vault.updateBalance(sender, s.bet, 0); // refund
          result = `🤝 *PUSH* — bet returned`;
        } else {
          coinChange = -s.bet;
          result = `💀 *DEALER WINS* -🪙 ${s.bet.toLocaleString()}`;
        }

        return reply(
          `╔════════════════════════么\n║ 🃏 *BLACKJACK RESULT*\n╚════════════════════════么\n\n` +
          `Your hand: ${fmt(s.player)} (${pVal})\n` +
          `Dealer hand: ${fmt(d)} (${dVal})\n\n${result}\n么════════════════════════么`
        );
      }
      return reply(`Type *.bj hit* or *.bj stand*`);
    }

    // Start new game
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) return reply(h.demonError('.blackjack', '.blackjack <bet amount>'));
    const bal = vault.getBalance(sender);
    if (!bal || bal.balance < bet) return reply(`😑 broke. you have 🪙 ${bal?.balance || 0}`);

    vault.updateBalance(sender, -bet, 0);
    const d = deck();
    const player = [d.pop(), d.pop()];
    const dealer = [d.pop(), d.pop()];
    sessions.set(key, { player, dealer, deck: d, bet });

    const pVal = val(player);
    // Natural blackjack
    if (pVal === 21) {
      const prize = Math.floor(bet * 2.5);
      vault.updateBalance(sender, prize, 0);
      globalXP.addXP(sender, msg.pushName || senderNumber);
      sessions.delete(key);
      return reply(
        `╔════════════════════════么\n║ 🃏 *BLACKJACK!*\n╚════════════════════════么\n\n` +
        `Your hand: ${fmt(player)} (21)\n🏆 NATURAL BLACKJACK! +🪙 ${prize.toLocaleString()}\n么════════════════════════么`
      );
    }

    reply(
      `╔════════════════════════么\n║ 🃏 *BLACKJACK*\n╚════════════════════════么\n\n` +
      `Your hand: ${fmt(player)} (${pVal})\n` +
      `Dealer shows: ${fmt([dealer[0]])} ?\n\n` +
      `Bet: 🪙 ${bet.toLocaleString()}\n\n` +
      `*.bj hit* — take a card\n*.bj stand* — hold your hand`
    );
  }
};
