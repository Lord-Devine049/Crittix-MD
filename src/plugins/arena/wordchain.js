/*
 * ============================================
 * WORDCHAIN.JS - Word Chain Game
 * Crittix-MD Arena — LORD DEVINE
 * Works in: Groups AND DMs
 * ============================================
 */

const arena = require('../../lib/arena');
const globalXP = require('../../lib/global-xp');

const fetch = require('node-fetch');

const LOBBY_SECONDS = 120;
const TURN_SECONDS  = 30;
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
    return true; // If API unavailable, pass
  }
};

// ── Starting word pool ─────────────────────────────

const SEED_WORDS = [
  'apple','table','eagle','orange','lucky','enter','river','yellow','lemon',
  'nice','east','tomato','one','engine','ice','echo','umbrella','oven','net',
  'angel','lamp','pepper','rain','ant','tree','example','open','nail','link',
  'oval','neat','tiger','rat','almond','drop','park','keep','name','eleven',
];

const getRandomSeedWord = () => SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)].toUpperCase();

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
    text: `✅ @${senderNumber} joined Word Chain! (${game.players.length} players)`,
    mentions: [sender]
  }, { quoted: msg });
  return true;
};

// ── Start game logic ───────────────────────────────

const startGame = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || game.status !== 'waiting') return;

  if (game.players.length < MIN_PLAYERS) {
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text: `⚠️ Word Chain cancelled — not enough players (need ${MIN_PLAYERS}).`
    });
    return;
  }

  const seedWord = getRandomSeedWord();

  game.status        = 'active';
  game.alive         = game.players.map(p => p.id);
  game.chain         = [seedWord];
  game.lastWord      = seedWord;
  game.usedWords     = new Set([seedWord.toLowerCase()]);
  game.currentIndex  = 0;
  arena.setGame(chatId, game);

  const playerList = game.players.map(p => `• @${p.id.split('@')[0]}`).join('\n');
  await sock.sendMessage(chatId, {
    text:
      `🔤 *WORD CHAIN — GAME START*\n\n` +
      `Players:\n${playerList}\n\n` +
      `First word: *${seedWord}*\n\n` +
      `Rules:\n` +
      `• Your word must START with *${seedWord.slice(-1)}*\n` +
      `• Must be a real English word\n` +
      `• No repeats\n` +
      `• ${TURN_SECONDS}s per turn or you're eliminated`,
    mentions: game.players.map(p => p.id)
  });

  promptNextPlayer(sock, chatId, cfg);
};

// ── Prompt next player ─────────────────────────────

const promptNextPlayer = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || game.status !== 'active') return;

  if (game.alive.length === 1) {
    const winnerId   = game.alive[0];
    const winnerName = game.players.find(p => p.id === winnerId)?.name || winnerId.split('@')[0];
    for (const p of game.players) globalXP.addXP(p.id, p.name || p.id.split('@')[0]);
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text: `🏆 *WORD CHAIN OVER!*\n\nWinner: @${winnerId.split('@')[0]} (${winnerName}) 🎉`,
      mentions: [winnerId]
    });
    return;
  }

  const currentId   = game.alive[game.currentIndex % game.alive.length];
  const lastLetter  = game.lastWord.slice(-1).toUpperCase();
  const remaining   = game.alive.length;

  // Clear old timer
  if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }

  const t = setTimeout(async () => {
    const g = arena.getGame(chatId);
    if (!g || g.status !== 'active') return;
    const mover = g.players.find(p => p.id === currentId);

    await sock.sendMessage(chatId, {
      text: `⏰ @${currentId.split('@')[0]} timed out and is *eliminated!*`,
      mentions: [currentId]
    });

    eliminatePlayer(sock, chatId, currentId, cfg);
  }, TURN_SECONDS * 1000);

  game._turnTimer = t;
  arena.trackTimer(chatId, t);
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text:
      `🔤 *WORD CHAIN*\n\n` +
      `Last word: *${game.lastWord}*\n` +
      `Your word must start with: *${lastLetter}*\n\n` +
      `👉 @${currentId.split('@')[0]} — your turn!\n` +
      `Players left: ${remaining}\n` +
      `⏱️ ${TURN_SECONDS}s`,
    mentions: [currentId]
  });
};

// ── Eliminate a player ─────────────────────────────

const eliminatePlayer = async (sock, chatId, playerId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game) return;

  const idx = game.alive.indexOf(playerId);
  if (idx === -1) return;
  game.alive.splice(idx, 1);

  if (game.alive.length === 0) {
    arena.endGame(chatId);
    await sock.sendMessage(chatId, { text: `🏁 Word Chain ended — everyone was eliminated!` });
    return;
  }

  if (game.alive.length === 1) {
    const winnerId = game.alive[0];
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text: `🏆 *WORD CHAIN OVER!*\n\nWinner: @${winnerId.split('@')[0]} 🎉`,
      mentions: [winnerId]
    });
    return;
  }

  // Wrap current index
  game.currentIndex = game.currentIndex % game.alive.length;
  arena.setGame(chatId, game);
  promptNextPlayer(sock, chatId, cfg);
};

// ── Input handler ──────────────────────────────────

const onInput = async (sock, msg, text, chatId, sender, senderNumber, game, cfg) => {
  const currentId = game.alive[game.currentIndex % game.alive.length];
  if (sender !== currentId) return false;

  const word       = text.trim().toUpperCase();
  const lastLetter = game.lastWord.slice(-1).toUpperCase();

  // Must start with last letter
  if (word[0] !== lastLetter) {
    await sock.sendMessage(chatId, {
      text: `✘ "${word}" doesn't start with *${lastLetter}*. Try again!`
    }, { quoted: msg });
    return true;
  }

  // Must be a real word
  const valid = await isRealWord(word);
  if (!valid) {
    await sock.sendMessage(chatId, {
      text: `✘ "${word}" is not a valid English word. You're *eliminated!*`,
      mentions: [sender]
    });
    if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }
    return eliminatePlayer(sock, chatId, sender, cfg).then(() => true);
  }

  // Must not be repeated
  if (game.usedWords.has(word.toLowerCase())) {
    await sock.sendMessage(chatId, {
      text: `✘ "${word}" was already used! You're *eliminated!*`,
      mentions: [sender]
    });
    if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }
    return eliminatePlayer(sock, chatId, sender, cfg).then(() => true);
  }

  // Valid move
  if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }
  game.chain.push(word);
  game.lastWord = word;
  game.usedWords.add(word.toLowerCase());
  game.currentIndex = (game.currentIndex + 1) % game.alive.length;
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text: `✅ *${word}* — accepted!`
  }, { quoted: msg });

  promptNextPlayer(sock, chatId, cfg);
  return true;
};

// ── Plugin export ──────────────────────────────────

module.exports = {
  command:     'wcg',
  aliases:     ['wordchain'],
  category:    'shadowgames',
  description: 'Word Chain elimination game',

  execute: async ({ sock, msg, args, sender, senderNumber, chatId, isGroupMsg, isOwner, isSudo, cfg, prefix, reply }) => {
    const sub = args[0]?.toLowerCase();

    if (!sub) {
      return reply(
        `🔤 *WORD CHAIN GAME*\n\n` +
        `To start: \`${prefix}wcg start\`\n` +
        `To stop:  \`${prefix}wcg stop\``
      );
    }

    if (sub === 'stop') {
      const game = arena.getGame(chatId);
      if (!game || game.type !== 'wordchain') return reply('✘ No active Word Chain game here.');
      const isAdm = isOwner || isSudo || game.host.id === sender;
      if (!isAdm) return reply('✘ Only the host or an admin can stop this game.');
      arena.endGame(chatId);
      return reply('🛑 Word Chain stopped.');
    }

    if (sub !== 'start') {
      return reply(`Usage: \`${prefix}wcg start\` or \`${prefix}wcg stop\``);
    }

    // Check for any active arena game
    if (arena.hasActiveGame(chatId)) {
      const g = arena.getGame(chatId);
      const title = arena.GAME_TITLES[g.type] || g.type;
      const stop  = arena.STOP_COMMANDS[g.type] || '.endgame';
      return reply(`⚠️ *${title}* is already active here.\nUse \`${stop}\` to end it first.`);
    }

    const name  = msg.pushName || senderNumber;
    const state = {
      type:    'wordchain',
      status:  'waiting',
      host:    { id: sender, name },
      players: [{ id: sender, name }],
      _timers:  [],
      _onJoin:  onJoin,
      _onInput: onInput,
    };

    arena.setGame(chatId, state);

    // 2-minute lobby
    const lobbyT = setTimeout(() => startGame(sock, chatId, cfg), LOBBY_SECONDS * 1000);
    arena.trackTimer(chatId, lobbyT);

    await sock.sendMessage(chatId, {
      text:
        `🔤 *WORD CHAIN GAME — LOBBY OPEN*\n\n` +
        `@${sender.split('@')[0]} opened a lobby!\n\n` +
        `Type *join* to enter.\n` +
        `Game starts in *2 minutes* regardless.\n` +
        `Need at least ${MIN_PLAYERS} players.\n\n` +
        `Stop: \`${prefix}wcg stop\``,
      mentions: [sender]
    }, { quoted: msg });
  }
};
