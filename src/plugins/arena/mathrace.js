/*
 * ============================================
 * MATHRACE.JS - Fast Math Battle
 * Crittix-MD Arena — LORD DEVINE
 * Works in: Groups AND DMs
 * ============================================
 */

const arena = require('../../lib/arena');
const globalXP = require('../../lib/global-xp');
const p = require('../../lib/phrases');



const LOBBY_SECONDS    = 120;
const QUESTION_SECONDS = 15;
const TOTAL_ROUNDS     = 10;
const MIN_PLAYERS      = 2;

// ── Question generator ─────────────────────────────

const genQuestion = (round) => {
  let a, b, answer, display;

  if (round <= 3) {
    // Rounds 1-3: simple add/subtract up to 100
    a = Math.floor(Math.random() * 100) + 1;
    b = Math.floor(Math.random() * 100) + 1;
    const ops = ['+', '-'];
    const op  = ops[Math.floor(Math.random() * ops.length)];
    if (op === '+') { answer = a + b; display = `${a} + ${b}`; }
    else            { [a, b] = a > b ? [a, b] : [b, a]; answer = a - b; display = `${a} - ${b}`; }
  } else if (round <= 6) {
    // Rounds 4-6: multiply/divide up to 50
    a = Math.floor(Math.random() * 50) + 2;
    b = Math.floor(Math.random() * 20) + 2;
    const ops = ['×', '÷'];
    const op  = ops[Math.floor(Math.random() * ops.length)];
    if (op === '×') { answer = a * b; display = `${a} × ${b}`; }
    else {
      // Ensure clean division
      const product = a * b;
      answer  = a;
      display = `${product} ÷ ${b}`;
    }
  } else {
    // Rounds 7-10: mixed with brackets
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    const c  = Math.floor(Math.random() * 50) + 1;
    const ops2 = ['×', '+'];
    const op   = ops2[Math.floor(Math.random() * ops2.length)];
    if (op === '×') { answer = a * b + c; display = `(${a} × ${b}) + ${c}`; }
    else            { answer = a + b * c; display = `${a} + (${b} × ${c})`; }
  }

  return { display, answer };
};

// ── Scoreboard ─────────────────────────────────────

const buildScoreboard = (game) => {
  const sorted = [...game.players].sort((a, b) =>
    (game.scores[b.id] || 0) - (game.scores[a.id] || 0)
  );
  return sorted
    .map((p, i) => `${i + 1}. @${p.id.split('@')[0]}: ${game.scores[p.id] || 0} pts`)
    .join('\n');
};

// ── Join handler ───────────────────────────────────

const onJoin = async (sock, msg, chatId, sender, senderNumber, game, cfg) => {
  if (game.players.some(p => p.id === sender)) {
    await sock.sendMessage(chatId, { text: `✘ You already joined.` }, { quoted: msg });
    return true;
  }
  const name = msg.pushName || senderNumber;
  game.players.push({ id: sender, name });
  arena.setGame(chatId, game);
  await sock.sendMessage(chatId, {
    text: `✅ @${senderNumber} joined Fast Math! (${game.players.length} players)`,
    mentions: [sender]
  }, { quoted: msg });
  return true;
};

// ── Start game ─────────────────────────────────────

const startGame = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || game.status !== 'waiting') return;

  if (game.players.length < MIN_PLAYERS) {
    arena.endGame(chatId);
    await sock.sendMessage(chatId, { text: `⚠️ Fast Math cancelled — need at least ${MIN_PLAYERS} players.` });
    return;
  }

  // Initialise scores
  game.status  = 'active';
  game.round   = 1;
  game.scores  = {};
  for (const p of game.players) game.scores[p.id] = 0;
  arena.setGame(chatId, game);

  const playerList = game.players.map(p => `• @${p.id.split('@')[0]}`).join('\n');
  await sock.sendMessage(chatId, {
    text:
      `🧮 *FAST MATH BATTLE — START*\n\n` +
      `Players:\n${playerList}\n\n` +
      `${TOTAL_ROUNDS} rounds • ${QUESTION_SECONDS}s per question\n` +
      `First correct answer wins the round! (+1 pt)\n` +
      `Wrong answers: no penalty`,
    mentions: game.players.map(p => p.id)
  });

  await new Promise(r => setTimeout(r, 2000));
  nextRound(sock, chatId, cfg);
};

// ── Next round ─────────────────────────────────────

const nextRound = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || game.status !== 'active') return;

  if (game.round > TOTAL_ROUNDS) {
    return finishGame(sock, chatId, game);
  }

  // Midgame scoreboard every 5 rounds
  if (game.round === 6) {
    await sock.sendMessage(chatId, {
      text: `📊 *MIDGAME SCOREBOARD (after 5 rounds)*\n\n${buildScoreboard(game)}`,
      mentions: game.players.map(p => p.id)
    });
    await new Promise(r => setTimeout(r, 2000));
  }

  const q       = genQuestion(game.round);
  game.question  = q;
  game.answered  = false;
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text:
      `🧮 *ROUND ${game.round}/${TOTAL_ROUNDS}*\n\n` +
      `❓ ${q.display} = ?\n\n` +
      `⚡ First correct answer wins! (${QUESTION_SECONDS}s)`
  });

  // Timeout for this round
  const t = setTimeout(async () => {
    const g = arena.getGame(chatId);
    if (!g || g.status !== 'active' || g.answered) return;
    await sock.sendMessage(chatId, {
      text: `⏰ Time's up! The answer was *${q.answer}*\n\nMoving to next round...`
    });
    g.round++;
    arena.setGame(chatId, g);
    await new Promise(r => setTimeout(r, 1500));
    nextRound(sock, chatId, cfg);
  }, QUESTION_SECONDS * 1000);

  game._roundTimer = t;
  arena.trackTimer(chatId, t);
  arena.setGame(chatId, game);
};

// ── Finish game ────────────────────────────────────

const finishGame = async (sock, chatId, game) => {
  const sorted = [...game.players].sort((a, b) =>
    (game.scores[b.id] || 0) - (game.scores[a.id] || 0)
  );
  const topScore = game.scores[sorted[0].id] || 0;
  const tied     = sorted.filter(p => (game.scores[p.id] || 0) === topScore);

  if (tied.length > 1) {
    // Sudden death
    game.round    = 'sudden-death';
    game.answered = false;
    const q = genQuestion(10);
    game.question = q;
    game.tiedPlayers = tied.map(p => p.id);
    arena.setGame(chatId, game);

    await sock.sendMessage(chatId, {
      text:
        `🏁 *FINAL SCOREBOARD*\n\n${buildScoreboard(game)}\n\n` +
        `⚡ TIE! Sudden death round:\n` +
        `❓ ${q.display} = ?`,
      mentions: game.players.map(p => p.id)
    });

    const t = setTimeout(async () => {
      const g = arena.getGame(chatId);
      if (!g || g.answered) return;
      arena.endGame(chatId);
      await sock.sendMessage(chatId, {
        text: `⏰ Nobody answered! It's still a tie. Everyone wins! 🎉\nAnswer was: *${q.answer}*`,
        mentions: tied.map(p => p.id)
      });
    }, QUESTION_SECONDS * 1000);

    arena.trackTimer(chatId, t);
    return;
  }

  const winner = sorted[0];
  for (const p of game.players) globalXP.addXP(p.id, p.name || p.id.split('@')[0]);
  arena.endGame(chatId);
  await sock.sendMessage(chatId, {
    text:
      `🏆 *FAST MATH BATTLE OVER!*\n\n` +
      `${buildScoreboard(game)}\n\n` +
      `🥇 Winner: @${winner.id.split('@')[0]} with *${game.scores[winner.id]}* points!`,
    mentions: [winner.id]
  });
};

// ── Input handler ──────────────────────────────────

const onInput = async (sock, msg, text, chatId, sender, senderNumber, game, cfg) => {
  if (!game.question || game.answered) return false;
  if (!game.players.some(p => p.id === sender)) return false;

  // Sudden death: only tied players can answer
  if (game.round === 'sudden-death' && game.tiedPlayers && !game.tiedPlayers.includes(sender)) return false;

  const guess = parseFloat(text.trim());
  if (isNaN(guess)) return false;

  if (guess !== game.question.answer) return false; // Wrong answer — ignore (others can still answer)

  // Correct!
  if (game._roundTimer) { clearTimeout(game._roundTimer); game._roundTimer = null; }
  game.answered = true;

  if (game.round === 'sudden-death') {
    const winnerName = game.players.find(p => p.id === sender)?.name || senderNumber;
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text:
        `⚡ *SUDDEN DEATH WON!*\n\n` +
        `🥇 @${sender.split('@')[0]} (${winnerName}) got it!\n` +
        `Answer: *${game.question.answer}*`,
      mentions: [sender]
    });
    return true;
  }

  game.scores[sender] = (game.scores[sender] || 0) + 1;
  game.round++;
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text:
      `✅ *${game.question.display} = ${game.question.answer}*\n\n` +
      `🏅 @${sender.split('@')[0]} gets the point! (${game.scores[sender]} total)`,
    mentions: [sender]
  }, { quoted: msg });

  await new Promise(r => setTimeout(r, 1500));
  nextRound(sock, chatId, cfg);
  return true;
};

// ── Plugin export ──────────────────────────────────

module.exports = {
  command:     'mathrace',
  aliases:     [],
  category:    'shadowgames',
  description: 'Fast Math Battle — first correct answer wins each round',

  execute: async ({ sock, msg, args, sender, senderNumber, chatId, isOwner, isSudo, cfg, prefix, reply }) => {
    const sub = args[0]?.toLowerCase();

    if (sub === 'stop') {
      const game = arena.getGame(chatId);
      if (!game || game.type !== 'mathrace') return reply('✘ No active Fast Math Battle here.');
      if (!isOwner && !isSudo && game.host.id !== sender) return reply('✘ Only the host or admin can stop this.');
      arena.endGame(chatId);
      return reply('🛑 Fast Math Battle stopped.');
    }

    if (sub !== 'start') {
      return reply(p.phrases.wrongUsage('use .mathrace start to begin. or .mathrace stop to end it.'));
    }

    if (arena.hasActiveGame(chatId)) {
      const g = arena.getGame(chatId);
      return reply(`⚠️ *${arena.GAME_TITLES[g.type]}* is already active.\nUse \`${arena.STOP_COMMANDS[g.type]}\` to end it first.`);
    }

    const name  = msg.pushName || senderNumber;
    const state = {
      type:     'mathrace',
      status:   'waiting',
      host:     { id: sender, name },
      players:  [{ id: sender, name }],
      scores:   {},
      round:    1,
      question: null,
      answered: false,
      _timers:  [],
      _onJoin:  onJoin,
      _onInput: onInput,
    };

    arena.setGame(chatId, state);

    const lobbyT = setTimeout(() => startGame(sock, chatId, cfg), LOBBY_SECONDS * 1000);
    arena.trackTimer(chatId, lobbyT);

    await sock.sendMessage(chatId, {
      text:
        `🧮 *FAST MATH BATTLE — LOBBY OPEN*\n\n` +
        `@${sender.split('@')[0]} started a lobby!\n\n` +
        `Type *join* to enter.\n` +
        `Game starts in *2 minutes*.\n` +
        `Need at least ${MIN_PLAYERS} players.\n\n` +
        `Stop: \`${prefix}mathrace stop\``,
      mentions: [sender]
    }, { quoted: msg });
  }
};
