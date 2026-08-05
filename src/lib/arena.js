/*
 * ============================================
 * ARENA.JS - Global Arena Game State Manager
 * Created by: LORD DEVINE
 * Manages all arena game sessions in-memory.
 * One active game per chatId (global.arenaGames).
 * ============================================
 */

if (!global.arenaGames)     global.arenaGames     = new Map();
if (!global.arenaRateLimit) global.arenaRateLimit = new Map();

/**
 * Get the active game for a chat, or null.
 */
const getGame = (chatId) => global.arenaGames.get(chatId) || null;

/**
 * Create / overwrite the game state for a chat.
 */
const setGame = (chatId, state) => {
  global.arenaGames.set(chatId, state);
};

/**
 * End a game: clear all timers and remove from the map.
 */
const endGame = (chatId) => {
  const game = global.arenaGames.get(chatId);
  if (!game) return false;
  if (Array.isArray(game._timers)) {
    for (const t of game._timers) {
      try { clearTimeout(t); } catch (_) {}
    }
  }
  global.arenaGames.delete(chatId);
  return true;
};

/**
 * Check whether a chat currently has an active arena game.
 */
const hasActiveGame = (chatId) => global.arenaGames.has(chatId);

/**
 * Game-specific rate limiter.
 * Returns true if the sender is sending too fast (should be ignored).
 */
const isRateLimited = (chatId, sender) => {
  const key = `${chatId}::${sender}`;
  const now = Date.now();
  const last = global.arenaRateLimit.get(key) || 0;
  if (now - last < 700) return true;
  global.arenaRateLimit.set(key, now);
  // Periodic cleanup
  if (global.arenaRateLimit.size > 600) {
    for (const [k, v] of global.arenaRateLimit) {
      if (now - v > 15000) global.arenaRateLimit.delete(k);
    }
  }
  return false;
};

/**
 * Add a timer ID to the game so it is cleared on endGame().
 */
const trackTimer = (chatId, timerId) => {
  const game = global.arenaGames.get(chatId);
  if (!game) return;
  if (!game._timers) game._timers = [];
  game._timers.push(timerId);
};

/**
 * Human-readable labels for each game type.
 */
const GAME_TITLES = {
  tictactoe:  '🎮 Tic Tac Toe',
  wordchain:  '🔤 Word Chain Game',
  mathrace:   '🧮 Fast Math Battle',
  emojiduel:  '🎭 Emoji Duel',
  murder:     '🔪 Murder Mystery',
  triviawar:  '🧠 Trivia War',
  wordbomb:   '💣 Word Bomb',
};

/**
 * The stop command for each game type.
 */
const STOP_COMMANDS = {
  tictactoe:  '.ttt stop',
  wordchain:  '.wcg stop',
  mathrace:   '.mathrace stop',
  emojiduel:  '.emojiduel stop',
  murder:     '.murder stop',
  triviawar:  '.triviawar stop',
  wordbomb:   '.wordbomb stop',
};

/**
 * Prefix commands that map to each game type (for stop-command detection).
 */
const GAME_CMD_MAP = {
  ttt:        'tictactoe',
  tictactoe:  'tictactoe',
  wcg:        'wordchain',
  mathrace:   'mathrace',
  emojiduel:  'emojiduel',
  murder:     'murder',
  triviawar:  'triviawar',
  wordbomb:   'wordbomb',
};

module.exports = {
  getGame,
  setGame,
  endGame,
  hasActiveGame,
  isRateLimited,
  trackTimer,
  GAME_TITLES,
  STOP_COMMANDS,
  GAME_CMD_MAP,
};
