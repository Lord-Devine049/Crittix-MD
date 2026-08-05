/*
 * ============================================
 * TELEBASE.JS — Telegram User & Session DB
 * Created by: 𝐋𝐎𝐑𝐃♰𝔻𝐄𝐕𝐈𝐍𝐄
 * Stores per-Telegram-user data in telebase/
 * ============================================
 */

const fs   = require('fs-extra');
const path = require('path');

const TELEBASE_DIR    = path.join(process.cwd(), 'telebase');
const USERS_FILE      = path.join(TELEBASE_DIR, 'users.json');
const BANNED_FILE     = path.join(TELEBASE_DIR, 'banned.json');
const STATS_FILE      = path.join(TELEBASE_DIR, 'stats.json');
const PHONE_MAP_FILE  = path.join(TELEBASE_DIR, 'phone_map.json');
const SESSION_TIMES_FILE = path.join(TELEBASE_DIR, 'session_times.json');

fs.ensureDirSync(TELEBASE_DIR);

function readJSON(filePath, def = {}) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return def;
  } catch { return def; }
}

function writeJSON(filePath, data) {
  try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8'); return true; }
  catch (e) { console.error('[TELEBASE] write error:', e.message); return false; }
}

function updateStats() {
  const users  = readJSON(USERS_FILE, {});
  const banned = readJSON(BANNED_FILE, {});
  const stats  = {
    totalUsers:  Object.keys(users).length,
    bannedUsers: Object.keys(banned).length,
    lastUpdated: Date.now()
  };
  writeJSON(STATS_FILE, stats);
  return stats;
}

function saveUser(chatId, username, firstName) {
  const users = readJSON(USERS_FILE, {});
  const id    = String(chatId);
  if (!users[id]) {
    users[id] = { chatId: id, username, firstName, joinedAt: Date.now(), activeBots: 0 };
  } else {
    users[id].username  = username;
    users[id].firstName = firstName;
  }
  writeJSON(USERS_FILE, users);
  updateStats();
  return users[id];
}

function getUser(chatId) {
  return readJSON(USERS_FILE, {})[String(chatId)] || null;
}

function getAllUsers()     { return Object.keys(readJSON(USERS_FILE, {})); }
function getAllUsersData() { return Object.values(readJSON(USERS_FILE, {})); }

function incrementUserBots(chatId) {
  const users = readJSON(USERS_FILE, {});
  const id    = String(chatId);
  if (users[id]) { users[id].activeBots = (users[id].activeBots || 0) + 1; writeJSON(USERS_FILE, users); }
}

function decrementUserBots(chatId) {
  const users = readJSON(USERS_FILE, {});
  const id    = String(chatId);
  if (users[id]) { users[id].activeBots = Math.max(0, (users[id].activeBots || 0) - 1); writeJSON(USERS_FILE, users); }
}

function banUser(chatId) {
  const banned = readJSON(BANNED_FILE, {});
  banned[String(chatId)] = { bannedAt: Date.now() };
  writeJSON(BANNED_FILE, banned);
  updateStats();
  return true;
}

function unbanUser(chatId) {
  const banned = readJSON(BANNED_FILE, {});
  const id     = String(chatId);
  if (banned[id]) { delete banned[id]; writeJSON(BANNED_FILE, banned); updateStats(); return true; }
  return false;
}

function isBanned(chatId) {
  return !!readJSON(BANNED_FILE, {})[String(chatId)];
}

function mapPhoneToOwner(phoneNumber, chatId) {
  const map = readJSON(PHONE_MAP_FILE, {});
  map[String(phoneNumber)] = { chatId: String(chatId), mappedAt: Date.now() };
  writeJSON(PHONE_MAP_FILE, map);
  return true;
}

function getOwnerByPhone(phoneNumber) {
  return readJSON(PHONE_MAP_FILE, {})[String(phoneNumber)]?.chatId || null;
}

function removePhoneMapping(phoneNumber) {
  const map = readJSON(PHONE_MAP_FILE, {});
  const k   = String(phoneNumber);
  if (map[k]) { delete map[k]; writeJSON(PHONE_MAP_FILE, map); return true; }
  return false;
}

function getStats() {
  const s = readJSON(STATS_FILE, null);
  return s || updateStats();
}

function saveSessionTime(phoneNumber, startTime) {
  const times = readJSON(SESSION_TIMES_FILE, {});
  times[String(phoneNumber)] = startTime;
  writeJSON(SESSION_TIMES_FILE, times);
}

function getSessionTime(phoneNumber) {
  return readJSON(SESSION_TIMES_FILE, {})[String(phoneNumber)] || null;
}

function removeSessionTime(phoneNumber) {
  const times = readJSON(SESSION_TIMES_FILE, {});
  delete times[String(phoneNumber)];
  writeJSON(SESSION_TIMES_FILE, times);
}

module.exports = {
  saveUser, getUser, getAllUsers, getAllUsersData,
  incrementUserBots, decrementUserBots,
  banUser, unbanUser, isBanned,
  mapPhoneToOwner, getOwnerByPhone, removePhoneMapping,
  getStats, updateStats,
  saveSessionTime, getSessionTime, removeSessionTime
};
