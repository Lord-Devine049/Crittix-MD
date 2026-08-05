/*
 * ============================================
 * CRITTIX-AURA.JS - Aura Farming & Betting System
 * Created by: 𝐋 𝐎 𝐑 𝐃 ♰ 𝔻 𝐄 𝐕 𝐈 𝐍 𝐄
 * ============================================
 */

const fs = require('fs-extra');
const path = require('path');

const AURA_DB_PATH = path.join(__dirname, '..', 'database', 'crittix-aura.json');
const HEAT_DB_PATH = path.join(__dirname, '..', 'database', 'crittix-heat.json');

// ── Normalize LID JIDs to phone number JID format ──
// In groups, WhatsApp sends participant as a LID (e.g. 12345678901234567890@lid)
// instead of a real phone number. We strip it to just the number part and
// re-attach @s.whatsapp.net so the key is consistent across DM and group usage.
const normalizeId = (userId) => {
  if (!userId) return userId;
  if (userId.endsWith('@lid')) {
    return userId.replace('@lid', '@s.whatsapp.net');
  }
  return userId;
};

// ============================================
// RANK SYSTEM
// ============================================
const RANKS = [
  { threshold: 10000, title: '🐍 𝗩𝗶𝗽𝗲𝗿', emoji: '🐍' },
  { threshold: 7500, title: '🔮 𝗖𝗲𝗹𝗲𝘀𝘁𝗶𝗮𝗹', emoji: '🔮' },
  { threshold: 5000, title: '👑 𝗚𝗼𝗱 𝗧𝗶𝗲𝗿', emoji: '👑' },
  { threshold: 3000, title: '💥 𝗟𝗲𝗴𝗲𝗻𝗱𝗮𝗿𝘆', emoji: '💥' },
  { threshold: 1500, title: '⚡ 𝗠𝘆𝘁𝗵𝗶𝗰', emoji: '⚡' },
  { threshold: 800, title: '🎖️ 𝗔𝗽𝗲𝘅', emoji: '🎖️' },
  { threshold: 400, title: '🏅 𝗘𝗹𝗶𝘁𝗲', emoji: '🏅' },
  { threshold: 185, title: '🥇 𝗩𝗲𝘁𝗲𝗿𝗮𝗻', emoji: '🥇' },
  { threshold: 75, title: '🥈 𝗔𝗱𝗲𝗽𝘁', emoji: '🥈' },
  { threshold: 0, title: '🥉 𝗡𝗼𝘃𝗶𝗰𝗲', emoji: '🥉' }
];

// ============================================
// DATABASE FUNCTIONS
// ============================================
const loadAuraData = () => {
  try {
    if (fs.existsSync(AURA_DB_PATH)) {
      const raw = JSON.parse(fs.readFileSync(AURA_DB_PATH, 'utf8'));
      // Remap any @lid keys to @s.whatsapp.net on the fly so all lookups match
      const normalized = {};
      for (const [key, val] of Object.entries(raw)) {
        const normKey = normalizeId(key);
        // If both @lid and @s.whatsapp.net exist for the same number, keep higher aura
        if (normalized[normKey]) {
          if ((val.aura || 0) > (normalized[normKey].aura || 0)) {
            normalized[normKey] = { ...val, userId: normKey };
          }
        } else {
          normalized[normKey] = { ...val, userId: normKey };
        }
      }
      return normalized;
    }
    return {};
  } catch (e) {
    console.error('⚠️ Error loading aura data:', e);
    return {};
  }
};

const saveAuraData = (data) => {
  try {
    fs.ensureDirSync(path.dirname(AURA_DB_PATH));
    fs.writeFileSync(AURA_DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('⚠️ Error saving aura data:', e);
  }
};

const loadHeatData = () => {
  try {
    if (fs.existsSync(HEAT_DB_PATH)) {
      return JSON.parse(fs.readFileSync(HEAT_DB_PATH, 'utf8'));
    }
    return {};
  } catch (e) {
    console.error('⚠️ Error loading heat data:', e);
    return {};
  }
};

const saveHeatData = (data) => {
  try {
    fs.ensureDirSync(path.dirname(HEAT_DB_PATH));
    fs.writeFileSync(HEAT_DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('⚠️ Error saving heat data:', e);
  }
};

// ============================================
// HEAT SYSTEM (For roast intensity)
// ============================================

/**
 * Update user's heat level
 * @param {string} userId - User's phone number
 * @param {string} chatId - Group/DM ID
 * @param {string} userName - User's display name
 * @param {number} points - Heat points to add
 */
const updateHeat = (userId, chatId, userName, points = 2) => {
  userId = normalizeId(userId);
  const heatData = loadHeatData();
  const key = `${userId}_${chatId}`;
  
  if (!heatData[key]) {
    heatData[key] = {
      userId,
      chatId,
      userName,
      heat: 0,
      lastActive: Date.now()
    };
  }
  
  heatData[key].heat += points;
  heatData[key].userName = userName; // Update name
  heatData[key].lastActive = Date.now();
  
  saveHeatData(heatData);
  return heatData[key].heat;
};

/**
 * Get user's heat level
 */
const getHeat = (userId, chatId) => {
  userId = normalizeId(userId);
  const heatData = loadHeatData();
  const key = `${userId}_${chatId}`;
  return heatData[key]?.heat || 0;
};

/**
 * Get heat leaderboard for a chat
 */
const getHeatLeaderboard = (chatId, limit = 10) => {
  const heatData = loadHeatData();
  const chatUsers = Object.values(heatData)
    .filter(u => u.chatId === chatId)
    .sort((a, b) => b.heat - a.heat)
    .slice(0, limit);
  
  return chatUsers;
};

// ============================================
// AURA SYSTEM
// ============================================

/**
 * Register user for aura system
 */
const registerUser = (userId, userName) => {
  userId = normalizeId(userId);
  const auraData = loadAuraData();
  
  if (auraData[userId]) {
    return { success: false, reason: 'already_registered' };
  }
  
  auraData[userId] = {
    userId,
    userName,
    aura: 0,
    lastFarm: 0,
    registeredAt: Date.now()
  };
  
  saveAuraData(auraData);
  return { success: true };
};

/**
 * Farm aura (daily)
 */
const farmAura = (userId, userName) => {
  userId = normalizeId(userId);
  const auraData = loadAuraData();
  
  if (!auraData[userId]) {
    return { success: false, reason: 'not_registered' };
  }
  
  const user = auraData[userId];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  // Check cooldown
  if (now - user.lastFarm < dayInMs) {
    const remaining = dayInMs - (now - user.lastFarm);
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return { success: false, reason: 'cooldown', hours, minutes };
  }
  
  // Random aura reward
  const reward = Math.floor(Math.random() * (50 - 25 + 1)) + 25; // 25-50
  user.aura += reward;
  user.lastFarm = now;
  user.userName = userName; // Update name
  
  saveAuraData(auraData);
  return { success: true, reward, newTotal: user.aura };
};

/**
 * Get user's aura info
 */
const getUserAura = (userId) => {
  userId = normalizeId(userId);
  const auraData = loadAuraData();
  if (!auraData[userId]) return null;
  
  const user = auraData[userId];
  const rank = getRank(user.aura);
  const position = getGlobalRank(userId);
  
  return {
    ...user,
    rank,
    position,
    totalUsers: Object.keys(auraData).length
  };
};

/**
 * Get rank info based on aura
 */
const getRank = (aura) => {
  for (const rank of RANKS) {
    if (aura >= rank.threshold) {
      // Find next rank
      const currentIndex = RANKS.indexOf(rank);
      const nextRank = currentIndex > 0 ? RANKS[currentIndex - 1] : null;
      
      if (nextRank) {
        const progress = aura - rank.threshold;
        const needed = nextRank.threshold - rank.threshold;
        const percentage = Math.floor((progress / needed) * 100);
        const barFilled = Math.floor(percentage / 10);
        const bar = '█'.repeat(barFilled) + '░'.repeat(10 - barFilled);
        
        return {
          ...rank,
          nextRank: nextRank.title,
          progress: percentage,
          bar
        };
      }
      
      return { ...rank, nextRank: 'MAX RANK', progress: 100, bar: '██████████' };
    }
  }
  
  return RANKS[RANKS.length - 1];
};

/**
 * Get global rank position
 */
const getGlobalRank = (userId) => {
  userId = normalizeId(userId);
  const auraData = loadAuraData();
  const sorted = Object.values(auraData)
    .sort((a, b) => b.aura - a.aura);
  
  return sorted.findIndex(u => u.userId === userId) + 1;
};

/**
 * Get global leaderboard
 */
const getAuraLeaderboard = (limit = 10) => {
  const auraData = loadAuraData();
  return Object.values(auraData)
    .sort((a, b) => b.aura - a.aura)
    .slice(0, limit)
    .map(u => ({
      ...u,
      rank: getRank(u.aura)
    }));
};

/**
 * Create a bet/duel
 */
const createBet = (hostId, hostName, amount) => {
  hostId = normalizeId(hostId);
  const auraData = loadAuraData();
  
  if (!auraData[hostId]) {
    return { success: false, reason: 'not_registered' };
  }
  
  if (auraData[hostId].aura < amount) {
    return { success: false, reason: 'insufficient_aura' };
  }
  
  if (amount < 50) {
    return { success: false, reason: 'minimum_50' };
  }
  
  return { success: true };
};

/**
 * Process bet result
 */
const processBet = (hostId, joinerId, amount) => {
  hostId = normalizeId(hostId);
  joinerId = normalizeId(joinerId);
  const auraData = loadAuraData();
  
  if (!auraData[hostId] || !auraData[joinerId]) {
    return { success: false, reason: 'users_not_found' };
  }
  
  if (auraData[joinerId].aura < amount) {
    return { success: false, reason: 'joiner_insufficient' };
  }
  
  // Random winner
  const isHostWinner = Math.random() < 0.5;
  const winnerId = isHostWinner ? hostId : joinerId;
  const loserId = isHostWinner ? joinerId : hostId;
  
  const prize = amount * 2;
  
  auraData[winnerId].aura += amount; // Winner gets opponent's aura
  auraData[loserId].aura -= amount; // Loser loses their aura
  
  saveAuraData(auraData);
  
  return {
    success: true,
    winnerId,
    loserId,
    winnerName: auraData[winnerId].userName,
    loserName: auraData[loserId].userName,
    prize: amount,
    winnerNewTotal: auraData[winnerId].aura,
    loserNewTotal: auraData[loserId].aura
  };
};

module.exports = {
  // Heat system
  updateHeat,
  getHeat,
  getHeatLeaderboard,
  
  // Aura system
  registerUser,
  farmAura,
  getUserAura,
  getRank,
  getAuraLeaderboard,
  
  // Betting
  createBet,
  processBet,
  
  RANKS
};
