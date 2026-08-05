/*
 * ============================================
 * MULTIPLAYER.JS - Multiplayer Game Engine
 * Created by: 𝐋 𝐎 𝐑 𝐃 ♰ 𝔻 𝐄 𝐕 𝐈 𝐍 𝐄
 * ============================================
 */

const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'multiplayer.json');

// ============================================
// DATABASE FUNCTIONS
// ============================================
const loadGames = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
    return { sessions: {} };
  } catch (e) {
    console.error('⚠️ Error loading multiplayer.json:', e);
    return { sessions: {} };
  }
};

const saveGames = (data) => {
  try {
    fs.ensureDirSync(path.dirname(DB_PATH));
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('⚠️ Error saving multiplayer.json:', e);
    return false;
  }
};

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Get session key (isolates games per owner)
 * @param {string} ownerNumber - Bot owner's phone number
 * @param {string} chatId - Chat where game is happening
 */
const getSessionKey = (ownerNumber, chatId) => {
  return `${ownerNumber}_${chatId}`;
};

/**
 * Create a new game session
 */
const createSession = (ownerNumber, chatId, gameType, hostId, hostName, isGroupChat, waitMessageId = null) => {
  const games = loadGames();
  const sessionKey = getSessionKey(ownerNumber, chatId);
  
  games.sessions[sessionKey] = {
    ownerNumber,
    chatId,
    gameType,
    host: { id: hostId, name: hostName },
    players: [{ id: hostId, name: hostName }], // Host auto-joins
    status: 'waiting', // waiting, active, finished
    createdAt: Date.now(),
    waitMessageId, // Message ID to track join replies
    isGroupChat,
    gameData: {} // Game-specific data
  };
  
  saveGames(games);
  return games.sessions[sessionKey];
};

/**
 * Get active session for an owner in a specific chat
 */
const getSession = (ownerNumber, chatId) => {
  const games = loadGames();
  const sessionKey = getSessionKey(ownerNumber, chatId);
  return games.sessions[sessionKey] || null;
};

/**
 * Add player to session
 */
const addPlayer = (ownerNumber, chatId, playerId, playerName) => {
  const games = loadGames();
  const sessionKey = getSessionKey(ownerNumber, chatId);
  const session = games.sessions[sessionKey];
  
  if (!session) return { success: false, reason: 'no_session' };
  if (session.status !== 'waiting') return { success: false, reason: 'already_started' };
  
  // Check if already joined
  if (session.players.some(p => p.id === playerId)) {
    return { success: false, reason: 'already_joined' };
  }
  
  session.players.push({ id: playerId, name: playerName });
  saveGames(games);
  
  return { success: true, session };
};

/**
 * Start the game (change status to active)
 */
const startGame = (ownerNumber, chatId, gameData = {}) => {
  const games = loadGames();
  const sessionKey = getSessionKey(ownerNumber, chatId);
  const session = games.sessions[sessionKey];
  
  if (!session) return null;
  
  session.status = 'active';
  session.startedAt = Date.now();
  session.gameData = gameData;
  
  saveGames(games);
  return session;
};

/**
 * Update game data
 */
const updateGameData = (ownerNumber, chatId, gameData) => {
  const games = loadGames();
  const sessionKey = getSessionKey(ownerNumber, chatId);
  const session = games.sessions[sessionKey];
  
  if (!session) return null;
  
  session.gameData = { ...session.gameData, ...gameData };
  session.lastActivity = Date.now();
  
  saveGames(games);
  return session;
};

/**
 * End/delete session
 */
const endSession = (ownerNumber, chatId) => {
  const games = loadGames();
  const sessionKey = getSessionKey(ownerNumber, chatId);
  
  if (games.sessions[sessionKey]) {
    delete games.sessions[sessionKey];
    saveGames(games);
    return true;
  }
  
  return false;
};

/**
 * Check if player is in the game
 */
const isPlayerInGame = (ownerNumber, chatId, playerId) => {
  const session = getSession(ownerNumber, chatId);
  if (!session) return false;
  return session.players.some(p => p.id === playerId);
};

/**
 * Get player name from session
 */
const getPlayerName = (ownerNumber, chatId, playerId) => {
  const session = getSession(ownerNumber, chatId);
  if (!session) return null;
  const player = session.players.find(p => p.id === playerId);
  return player ? player.name : null;
};

/**
 * Cleanup expired waiting sessions (called periodically)
 */
const cleanupExpiredSessions = (maxWaitTime = 60000) => {
  const games = loadGames();
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, session] of Object.entries(games.sessions)) {
    if (session.status === 'waiting' && (now - session.createdAt) > maxWaitTime) {
      delete games.sessions[key];
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    saveGames(games);
    console.log(`🧹 Cleaned ${cleaned} expired game sessions`);
  }
  
  return cleaned;
};

// Auto-cleanup every 2 minutes
setInterval(() => cleanupExpiredSessions(), 120000);

module.exports = {
  createSession,
  getSession,
  addPlayer,
  startGame,
  updateGameData,
  endSession,
  isPlayerInGame,
  getPlayerName,
  cleanupExpiredSessions,
  getSessionKey
};
