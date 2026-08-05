/*
 * ============================================
 * EMOJIDUEL.JS - Emoji Decode Game
 * Crittix-MD Arena — LORD DEVINE
 * Works in: Groups AND DMs
 * ============================================
 */

const arena = require('../../lib/arena');
const globalXP = require('../../lib/global-xp');


const LOBBY_SECONDS    = 120;
const ROUND_SECONDS    = 20;
const TOTAL_ROUNDS     = 10;
const MIN_PLAYERS      = 2;

// ── Emoji puzzle bank (50+ puzzles) ───────────────

const PUZZLES = [
  // Movies
  { emoji: '🦁👑',         answers: ['lion king'] },
  { emoji: '🧊👸',         answers: ['frozen'] },
  { emoji: '⚡🕷️',         answers: ['spider-man', 'spiderman'] },
  { emoji: '🚀🧸',         answers: ['toy story'] },
  { emoji: '🔱🐠',         answers: ['finding nemo'] },
  { emoji: '🏠🔝',         answers: ['up'] },
  { emoji: '💎🌹',         answers: ['beauty and the beast'] },
  { emoji: '🧙‍♂️💍',         answers: ['lord of the rings'] },
  { emoji: '🤖🔴',         answers: ['terminator'] },
  { emoji: '⏰🔙🚗',       answers: ['back to the future'] },
  { emoji: '🐉🗡️',         answers: ['how to train your dragon'] },
  { emoji: '🕊️🚢🧊',       answers: ['titanic'] },
  { emoji: '🎭🦇',         answers: ['batman', 'the dark knight'] },
  { emoji: '🌊🦈',         answers: ['jaws'] },
  { emoji: '👽🚲🌕',       answers: ['e.t.', 'et'] },
  { emoji: '🦸‍♂️🛡️⭐',      answers: ['captain america', 'avengers'] },
  { emoji: '🐺👦🌿',       answers: ['the jungle book'] },
  { emoji: '🔮🏫',         answers: ['harry potter'] },
  // Animals
  { emoji: '🐘🌍',         answers: ['african elephant', 'elephant'] },
  { emoji: '🦒🌿',         answers: ['giraffe'] },
  { emoji: '🐧🧊',         answers: ['penguin'] },
  { emoji: '🦈🌊',         answers: ['shark'] },
  { emoji: '🦋🌺',         answers: ['butterfly'] },
  { emoji: '🦅🏔️',         answers: ['bald eagle', 'eagle'] },
  { emoji: '🐢🏖️',         answers: ['sea turtle', 'turtle'] },
  { emoji: '🦁🌾',         answers: ['lion'] },
  { emoji: '🐊🌴',         answers: ['crocodile'] },
  { emoji: '🦩🦵',         answers: ['flamingo'] },
  { emoji: '🐝🌻',         answers: ['bee'] },
  { emoji: '🦜🌳',         answers: ['parrot'] },
  { emoji: '🐬🌊',         answers: ['dolphin'] },
  { emoji: '🦔🍂',         answers: ['hedgehog'] },
  // Food
  { emoji: '🍎🥧',         answers: ['apple pie'] },
  { emoji: '🍌🥛',         answers: ['banana smoothie', 'banana milk'] },
  { emoji: '🍓🧁',         answers: ['strawberry cupcake'] },
  { emoji: '🧀🍔',         answers: ['cheeseburger'] },
  { emoji: '🥜🧈',         answers: ['peanut butter'] },
  { emoji: '🫐🥞',         answers: ['blueberry pancakes', 'pancakes'] },
  { emoji: '🍦🍫',         answers: ['chocolate ice cream'] },
  { emoji: '🍋🧃',         answers: ['lemonade'] },
  { emoji: '🌮🌶️',         answers: ['spicy tacos', 'tacos'] },
  { emoji: '🍜🐟',         answers: ['fish noodles', 'fish soup'] },
  { emoji: '🥑🍞',         answers: ['avocado toast'] },
  // Places
  { emoji: '🗼🇫🇷',         answers: ['eiffel tower', 'paris'] },
  { emoji: '🗽🇺🇸',         answers: ['statue of liberty', 'new york'] },
  { emoji: '🏯🇯🇵',         answers: ['japan', 'japanese castle'] },
  { emoji: '🏔️🌨️',         answers: ['snowy mountain', 'everest', 'mount everest'] },
  { emoji: '🗿🏝️',         answers: ['easter island'] },
  { emoji: '🕌🌙',         answers: ['mosque'] },
  { emoji: '🏟️⚽',         answers: ['soccer stadium', 'football stadium', 'stadium'] },
  { emoji: '🌉🌃',         answers: ['golden gate bridge', 'night bridge', 'bridge'] },
  // Phrases & concepts
  { emoji: '💔😭',         answers: ['heartbreak', 'broken heart'] },
  { emoji: '🧠💡',         answers: ['bright idea', 'brain idea', 'idea'] },
  { emoji: '👁️❤️',         answers: ['i love', 'eye love', 'i love you'] },
  { emoji: '🏃💨',         answers: ['running fast', 'fast runner'] },
  { emoji: '🤝👔',         answers: ['business deal', 'deal'] },
  { emoji: '⏰⌛',         answers: ['running out of time', 'time is up', 'time'] },
  { emoji: '🌧️☂️',         answers: ['umbrella in the rain', 'rainy day'] },
  { emoji: '😴💤',         answers: ['sleeping', 'asleep', 'sleep'] },
  { emoji: '💰💸',         answers: ['money', 'spending money', 'rich'] },
  { emoji: '🔥🌊',         answers: ['fire and water', 'opposites'] },
  { emoji: '🎵❤️',         answers: ['music love', 'love music', 'i love music'] },
  { emoji: '🌈☀️',         answers: ['rainbow sunshine', 'sunshine rainbow', 'rainbow'] },
];

const shufflePuzzles = () => {
  const copy = [...PUZZLES];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, TOTAL_ROUNDS);
};

// ── Scoreboard ─────────────────────────────────────

const buildScoreboard = (game) => {
  return [...game.players]
    .sort((a, b) => (game.scores[b.id] || 0) - (game.scores[a.id] || 0))
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
    text: `✅ @${senderNumber} joined Emoji Duel! (${game.players.length} players)`,
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
    await sock.sendMessage(chatId, { text: `⚠️ Emoji Duel cancelled — need at least ${MIN_PLAYERS} players.` });
    return;
  }

  game.status  = 'active';
  game.round   = 1;
  game.scores  = {};
  game.puzzles = shufflePuzzles();
  for (const p of game.players) game.scores[p.id] = 0;
  arena.setGame(chatId, game);

  const playerList = game.players.map(p => `• @${p.id.split('@')[0]}`).join('\n');
  await sock.sendMessage(chatId, {
    text:
      `🎭 *EMOJI DUEL — GAME START*\n\n` +
      `Players:\n${playerList}\n\n` +
      `${TOTAL_ROUNDS} rounds • ${ROUND_SECONDS}s each\n` +
      `Decode the emoji combo first for a point!`,
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

  if (game.round === 6) {
    await sock.sendMessage(chatId, {
      text: `📊 *MIDGAME SCOREBOARD (after 5 rounds)*\n\n${buildScoreboard(game)}`,
      mentions: game.players.map(p => p.id)
    });
    await new Promise(r => setTimeout(r, 2000));
  }

  const puzzle       = game.puzzles[game.round - 1];
  game.currentPuzzle = puzzle;
  game.answered      = false;
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text:
      `🎭 *ROUND ${game.round}/${TOTAL_ROUNDS}*\n\n` +
      `What does this represent?\n\n` +
      `${puzzle.emoji}\n\n` +
      `⚡ First correct answer wins the round! (${ROUND_SECONDS}s)`
  });

  const t = setTimeout(async () => {
    const g = arena.getGame(chatId);
    if (!g || g.answered || g.round !== game.round) return;
    await sock.sendMessage(chatId, {
      text: `⏰ Time's up! The answer was: *${puzzle.answers[0].toUpperCase()}*\n\nNext round...`
    });
    g.round++;
    arena.setGame(chatId, g);
    await new Promise(r => setTimeout(r, 1500));
    nextRound(sock, chatId, cfg);
  }, ROUND_SECONDS * 1000);

  game._roundTimer = t;
  arena.trackTimer(chatId, t);
  arena.setGame(chatId, game);
};

// ── Finish game ────────────────────────────────────

const finishGame = async (sock, chatId, game) => {
  const sorted   = [...game.players].sort((a, b) => (game.scores[b.id] || 0) - (game.scores[a.id] || 0));
  const topScore = game.scores[sorted[0].id] || 0;
  const tied     = sorted.filter(p => (game.scores[p.id] || 0) === topScore);

  if (tied.length > 1) {
    game.round       = 'sudden-death';
    game.answered    = false;
    game.tiedPlayers = tied.map(p => p.id);
    // Reuse a random puzzle from the full bank not in current set
    const extra = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    game.currentPuzzle = extra;
    arena.setGame(chatId, game);

    await sock.sendMessage(chatId, {
      text:
        `🏁 *FINAL SCOREBOARD*\n\n${buildScoreboard(game)}\n\n` +
        `⚡ TIE! Sudden death:\n${extra.emoji}`,
      mentions: game.players.map(p => p.id)
    });

    const t = setTimeout(async () => {
      const g = arena.getGame(chatId);
      if (!g || g.answered) return;
      arena.endGame(chatId);
      await sock.sendMessage(chatId, {
        text: `⏰ Nobody got it! Still tied. Everyone wins! 🎉\nAnswer: *${extra.answers[0].toUpperCase()}*`
      });
    }, ROUND_SECONDS * 1000);

    arena.trackTimer(chatId, t);
    return;
  }

  const winner = sorted[0];
  for (const p of game.players) globalXP.addXP(p.id, p.name || p.id.split('@')[0]);
  arena.endGame(chatId);
  await sock.sendMessage(chatId, {
    text:
      `🏆 *EMOJI DUEL OVER!*\n\n` +
      `${buildScoreboard(game)}\n\n` +
      `🥇 Winner: @${winner.id.split('@')[0]} with *${game.scores[winner.id]}* points!`,
    mentions: [winner.id]
  });
};

// ── Input handler ──────────────────────────────────

const onInput = async (sock, msg, text, chatId, sender, senderNumber, game, cfg) => {
  if (!game.currentPuzzle || game.answered) return false;
  if (!game.players.some(p => p.id === sender)) return false;
  if (game.round === 'sudden-death' && game.tiedPlayers && !game.tiedPlayers.includes(sender)) return false;

  const guess    = text.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const isMatch  = game.currentPuzzle.answers.some(a =>
    a.toLowerCase().replace(/[^a-z0-9 ]/g, '') === guess
  );

  if (!isMatch) return false;

  if (game._roundTimer) { clearTimeout(game._roundTimer); game._roundTimer = null; }
  game.answered = true;

  if (game.round === 'sudden-death') {
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text:
        `⚡ *SUDDEN DEATH WON!*\n\n` +
        `🥇 @${sender.split('@')[0]} nailed it!\n` +
        `Answer: *${game.currentPuzzle.answers[0].toUpperCase()}*`,
      mentions: [sender]
    });
    return true;
  }

  game.scores[sender] = (game.scores[sender] || 0) + 1;
  game.round++;
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text:
      `✅ Correct! The answer was *${game.currentPuzzle.answers[0].toUpperCase()}*\n\n` +
      `🏅 @${sender.split('@')[0]} gets a point! (${game.scores[sender]} total)`,
    mentions: [sender]
  }, { quoted: msg });

  await new Promise(r => setTimeout(r, 1500));
  nextRound(sock, chatId, cfg);
  return true;
};

// ── Plugin export ──────────────────────────────────

module.exports = {
  command:     'emojiduel',
  aliases:     ['emoji'],
  category:    'shadowgames',
  description: 'Emoji Decode game — decode emoji combos first to score',

  execute: async ({ sock, msg, args, sender, senderNumber, chatId, isOwner, isSudo, cfg, prefix, reply }) => {
    const sub = args[0]?.toLowerCase();

    if (sub === 'stop') {
      const game = arena.getGame(chatId);
      if (!game || game.type !== 'emojiduel') return reply('✘ No active Emoji Duel here.');
      if (!isOwner && !isSudo && game.host.id !== sender) return reply('✘ Only the host or admin can stop this.');
      arena.endGame(chatId);
      return reply('🛑 Emoji Duel stopped.');
    }

    if (sub !== 'start') {
      return reply(`Usage: \`${prefix}emojiduel start\` or \`${prefix}emojiduel stop\``);
    }

    if (arena.hasActiveGame(chatId)) {
      const g = arena.getGame(chatId);
      return reply(`⚠️ *${arena.GAME_TITLES[g.type]}* is already active.\nUse \`${arena.STOP_COMMANDS[g.type]}\` to end it first.`);
    }

    const name  = msg.pushName || senderNumber;
    const state = {
      type:          'emojiduel',
      status:        'waiting',
      host:          { id: sender, name },
      players:       [{ id: sender, name }],
      scores:        {},
      round:         1,
      puzzles:       [],
      currentPuzzle: null,
      answered:      false,
      _timers:       [],
      _onJoin:       onJoin,
      _onInput:      onInput,
    };

    arena.setGame(chatId, state);

    const lobbyT = setTimeout(() => startGame(sock, chatId, cfg), LOBBY_SECONDS * 1000);
    arena.trackTimer(chatId, lobbyT);

    await sock.sendMessage(chatId, {
      text:
        `🎭 *EMOJI DUEL — LOBBY OPEN*\n\n` +
        `@${sender.split('@')[0]} started a lobby!\n\n` +
        `Type *join* to enter.\n` +
        `Game starts in *2 minutes*.\n` +
        `Need at least ${MIN_PLAYERS} players.\n\n` +
        `Stop: \`${prefix}emojiduel stop\``,
      mentions: [sender]
    }, { quoted: msg });
  }
};
