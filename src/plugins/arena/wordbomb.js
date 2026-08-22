/*
 * ============================================
 * WORDBOMB.JS - Word Bomb
 * Crittix-MD Arena — LORD DEVINE
 * Works in: Groups AND DMs
 * ============================================
 */

const arena  = require('../../lib/arena');
const globalXP = require('../../lib/global-xp');

const fetch  = require('node-fetch');
const p = require('../../lib/phrases');


const LOBBY_SECONDS = 120;
const TURN_SECONDS  = 10;
const STARTING_LIVES = 3;
const MIN_PLAYERS   = 2;

// ── Dictionary validation ─────────────────────────

const isRealWord = async (word) => {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`,
      { timeout: 5000 }
    );
    return res.ok;
  } catch (_) {
    return true; // Allow if API unavailable
  }
};

// ── Letter combo generator ─────────────────────────

const TWO_LETTER_COMBOS = [
  'ST', 'TR', 'PR', 'BL', 'CR', 'FL', 'GR', 'PL', 'SC', 'SP',
  'SH', 'CH', 'TH', 'WH', 'PH', 'KN', 'WR', 'GN', 'QU', 'SK',
  'SM', 'SN', 'SW', 'TW', 'SL', 'BR', 'CL', 'DR', 'FR', 'GL',
];

const THREE_LETTER_COMBOS = [
  'OUN', 'ING', 'ANT', 'ION', 'ENT', 'AIN', 'OUT', 'ORT', 'ALL',
  'OWN', 'ATE', 'ING', 'RAN', 'RAT', 'CAT', 'DOG', 'MAN', 'SUN',
  'OOK', 'ANG', 'INE', 'OAT', 'EAR', 'AIR', 'OIL', 'OWL', 'ARK',
];

const getCombo = (roundCount) => {
  if (roundCount < 10) {
    return TWO_LETTER_COMBOS[Math.floor(Math.random() * TWO_LETTER_COMBOS.length)];
  }
  return THREE_LETTER_COMBOS[Math.floor(Math.random() * THREE_LETTER_COMBOS.length)];
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
    text: `✅ @${senderNumber} joined Word Bomb! (${game.players.length} players)`,
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
    await sock.sendMessage(chatId, { text: `⚠️ Word Bomb cancelled — need at least ${MIN_PLAYERS} players.` });
    return;
  }

  game.status      = 'active';
  game.alive       = game.players.map(p => p.id);
  game.lives       = {};
  game.usedWords   = new Set();
  game.roundCount  = 0;
  game.currentIdx  = 0;
  game.letters     = getCombo(0);

  for (const p of game.players) game.lives[p.id] = STARTING_LIVES;
  arena.setGame(chatId, game);

  const playerList = game.players.map(p => `• @${p.id.split('@')[0]} ❤️❤️❤️`).join('\n');
  await sock.sendMessage(chatId, {
    text:
      `💣 *WORD BOMB — GAME START*\n\n` +
      `Players:\n${playerList}\n\n` +
      `Rules:\n` +
      `• Say any real word that *CONTAINS* the letters\n` +
      `• ${TURN_SECONDS}s per turn — fail = lose a ❤️\n` +
      `• Lose all 3 ❤️ = eliminated\n` +
      `• Combo changes every 3 rounds\n` +
      `• No repeats allowed\n\n` +
      `First combo: *${game.letters}*`,
    mentions: game.players.map(p => p.id)
  });

  await new Promise(r => setTimeout(r, 2000));
  promptNextPlayer(sock, chatId, cfg);
};

// ── Format lives ───────────────────────────────────

const formatLives = (lives) => {
  const full  = '❤️';
  const empty = '🖤';
  return full.repeat(lives) + empty.repeat(STARTING_LIVES - lives);
};

// ── Lives display ──────────────────────────────────

const buildLivesDisplay = (game) =>
  game.alive
    .map(id => {
      const p = game.players.find(p => p.id === id);
      return `@${id.split('@')[0]}: ${formatLives(game.lives[id] || 0)}`;
    })
    .join('\n');

// ── Prompt next player ─────────────────────────────

const promptNextPlayer = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || game.status !== 'active') return;

  if (game.alive.length === 1) {
    const winnerId = game.alive[0];
    for (const p of game.players) globalXP.addXP(p.id, p.name || p.id.split('@')[0]);
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text: `🏆 *WORD BOMB OVER!*\n\n💣 @${winnerId.split('@')[0]} is the last one standing!`,
      mentions: [winnerId]
    });
    return;
  }

  const currentId = game.alive[game.currentIdx % game.alive.length];

  if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }

  const t = setTimeout(async () => {
    const g = arena.getGame(chatId);
    if (!g || g.status !== 'active') return;
    const currentNow = g.alive[g.currentIdx % g.alive.length];
    if (currentNow !== currentId) return;

    await sock.sendMessage(chatId, {
      text: `💥 @${currentId.split('@')[0]} failed to answer in time! −❤️`,
      mentions: [currentId]
    });

    loseLife(sock, chatId, currentId, cfg);
  }, TURN_SECONDS * 1000);

  game._turnTimer = t;
  arena.trackTimer(chatId, t);
  arena.setGame(chatId, game);

  // Update combo every 3 rounds
  if (game.roundCount % 3 === 0 && game.roundCount > 0) {
    game.letters = getCombo(game.roundCount);
    arena.setGame(chatId, game);
  }

  await sock.sendMessage(chatId, {
    text:
      `💣 *WORD BOMB*\n\n` +
      `Combo: *${game.letters}*\n\n` +
      `👉 @${currentId.split('@')[0]} — say a word containing *${game.letters}*\n` +
      `⏱️ ${TURN_SECONDS}s\n\n` +
      buildLivesDisplay(game),
    mentions: [currentId]
  });
};

// ── Lose a life ────────────────────────────────────

const loseLife = async (sock, chatId, playerId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game) return;

  game.lives[playerId] = (game.lives[playerId] || 0) - 1;

  if (game.lives[playerId] <= 0) {
    // Eliminated
    const pName = game.players.find(p => p.id === playerId)?.name || playerId.split('@')[0];
    game.alive = game.alive.filter(id => id !== playerId);

    if (game.alive.length === 0) {
      arena.endGame(chatId);
      await sock.sendMessage(chatId, { text: `💥 Everyone was eliminated! No winner. 💀` });
      return;
    }

    if (game.alive.length === 1) {
      const winnerId = game.alive[0];
      arena.endGame(chatId);
      await sock.sendMessage(chatId, {
        text:
          `💀 @${playerId.split('@')[0]} is eliminated!\n\n` +
          `🏆 @${winnerId.split('@')[0]} wins Word Bomb! 💣`,
        mentions: [playerId, winnerId]
      });
      return;
    }

    game.currentIdx = game.currentIdx % game.alive.length;
    arena.setGame(chatId, game);

    await sock.sendMessage(chatId, {
      text: `💀 @${playerId.split('@')[0]} used all lives — *ELIMINATED!* (${game.alive.length} left)`,
      mentions: [playerId]
    });
  } else {
    game.currentIdx = (game.currentIdx + 1) % game.alive.length;
    game.roundCount++;
    arena.setGame(chatId, game);
  }

  await new Promise(r => setTimeout(r, 1000));
  promptNextPlayer(sock, chatId, cfg);
};

// ── Input handler ──────────────────────────────────

const onInput = async (sock, msg, text, chatId, sender, senderNumber, game, cfg) => {
  const currentId = game.alive[game.currentIdx % game.alive.length];
  if (sender !== currentId) return false;

  const word  = text.trim().toUpperCase();
  const combo = game.letters.toUpperCase();

  if (word.length < combo.length) return false; // Too short, probably not a word input

  // Must CONTAIN the combo
  if (!word.includes(combo)) {
    await sock.sendMessage(chatId, {
      text: `✘ "${word}" doesn't contain *${combo}*! −❤️`
    }, { quoted: msg });
    if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }
    return loseLife(sock, chatId, sender, cfg).then(() => true);
  }

  // Must be a real word
  const valid = await isRealWord(word);
  if (!valid) {
    await sock.sendMessage(chatId, {
      text: `✘ "${word}" is not a real word! −❤️`
    }, { quoted: msg });
    if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }
    return loseLife(sock, chatId, sender, cfg).then(() => true);
  }

  // No repeats
  if (game.usedWords.has(word.toLowerCase())) {
    await sock.sendMessage(chatId, {
      text: `✘ "${word}" was already used this game! −❤️`
    }, { quoted: msg });
    if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }
    return loseLife(sock, chatId, sender, cfg).then(() => true);
  }

  // Valid!
  if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }
  game.usedWords.add(word.toLowerCase());
  game.currentIdx = (game.currentIdx + 1) % game.alive.length;
  game.roundCount++;

  // Update combo every 3 rounds
  if (game.roundCount % 3 === 0) {
    game.letters = getCombo(game.roundCount);
  }

  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text: `✅ *${word}* — accepted!`
  }, { quoted: msg });

  await new Promise(r => setTimeout(r, 500));
  promptNextPlayer(sock, chatId, cfg);
  return true;
};

// ── Plugin export ──────────────────────────────────

module.exports = {
  command:     'wordbomb',
  aliases:     ['wb'],
  category:    'shadowgames',
  description: 'Word Bomb — say words containing the combo or lose a life',

  execute: async ({ sock, msg, args, sender, senderNumber, chatId, isOwner, isSudo, cfg, prefix, reply }) => {
    const sub = args[0]?.toLowerCase();

    if (sub === 'stop') {
      const game = arena.getGame(chatId);
      if (!game || game.type !== 'wordbomb') return reply('✘ No active Word Bomb here.');
      if (!isOwner && !isSudo && game.host.id !== sender) return reply('✘ Only the host or admin can stop this.');
      arena.endGame(chatId);
      return reply('🛑 Word Bomb stopped.');
    }

    if (sub !== 'start') {
      return reply(p.phrases.wrongUsage('use .wordbomb start to begin. or .wordbomb stop to end it.'));
    }

    if (arena.hasActiveGame(chatId)) {
      const g = arena.getGame(chatId);
      return reply(`⚠️ *${arena.GAME_TITLES[g.type]}* is already active.\nUse \`${arena.STOP_COMMANDS[g.type]}\` to end it first.`);
    }

    const name  = msg.pushName || senderNumber;
    const state = {
      type:       'wordbomb',
      status:     'waiting',
      host:       { id: sender, name },
      players:    [{ id: sender, name }],
      alive:      [],
      lives:      {},
      usedWords:  new Set(),
      roundCount: 0,
      currentIdx: 0,
      letters:    '',
      _timers:    [],
      _onJoin:    onJoin,
      _onInput:   onInput,
    };

    arena.setGame(chatId, state);

    const lobbyT = setTimeout(() => startGame(sock, chatId, cfg), LOBBY_SECONDS * 1000);
    arena.trackTimer(chatId, lobbyT);

    await sock.sendMessage(chatId, {
      text:
        `💣 *WORD BOMB — LOBBY OPEN*\n\n` +
        `@${sender.split('@')[0]} started a lobby!\n\n` +
        `Type *join* to enter.\n` +
        `Game starts in *2 minutes*.\n` +
        `Need at least ${MIN_PLAYERS} players.\n\n` +
        `Stop: \`${prefix}wordbomb stop\``,
      mentions: [sender]
    }, { quoted: msg });
  }
};
