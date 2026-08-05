 /*
 * ============================================
 * OBSERVER.JS - Stats Tracking for Crittix MD
 * Created by: 𝐋 𝐎 𝐑 𝐃 ♰ 𝔻 𝐄 𝐕 𝐈 𝐍 𝐄
 * ============================================
 */

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(process.cwd(), 'database');
const DB_PATH = path.join(DB_DIR, 'observer.json');

// ── Default structure ──
const DEFAULT_DB = {
  users: {},    // { jid: { messages, commands, lastSeen, firstSeen, streak, lastDate, commandMap } }
  groups: {},   // { groupId: { messages, commands, members, name, topUsers } }
  commands: {}, // { commandName: count }
  bot: {
    startTime: Date.now(),
    totalMessages: 0,
    totalCommands: 0,
    totalUsers: 0,
    totalGroups: 0,
  }
};

// ─────────────────────────────────────────────
// DB HELPERS
// ─────────────────────────────────────────────
const loadDB = () => {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
      return JSON.parse(JSON.stringify(DEFAULT_DB));
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    if (!data.users) data.users = {};
    if (!data.groups) data.groups = {};
    if (!data.commands) data.commands = {};
    if (!data.bot) data.bot = { ...DEFAULT_DB.bot };
    return data;
  } catch (e) {
    console.error('[OBSERVER] DB load error:', e.message);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
};

const saveDB = (db) => {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('[OBSERVER] DB save error:', e.message);
  }
};

// ── Get or create user entry ──
const getUser = (db, jid, pushName) => {
  if (!db.users[jid]) {
    db.users[jid] = {
      messages: 0,
      commands: 0,
      lastSeen: Date.now(),
      firstSeen: Date.now(),
      pushName: pushName || jid.split('@')[0],
      streak: 1,
      lastDate: getTodayStr(),
      commandMap: {},
      activityByHour: new Array(24).fill(0),
    };
    db.bot.totalUsers = Object.keys(db.users).length;
  } else {
    if (pushName) db.users[jid].pushName = pushName;
    db.users[jid].lastSeen = Date.now();
  }
  return db.users[jid];
};

// ── Get or create group entry ──
const getGroup = (db, groupId, groupName) => {
  if (!db.groups[groupId]) {
    db.groups[groupId] = {
      messages: 0,
      commands: 0,
      name: groupName || groupId,
      firstSeen: Date.now(),
      topUsers: {},
    };
    db.bot.totalGroups = Object.keys(db.groups).length;
  } else {
    if (groupName) db.groups[groupId].name = groupName;
  }
  return db.groups[groupId];
};

const getTodayStr = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const updateStreak = (user) => {
  const today = getTodayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (user.lastDate === today) return; // already tracked today
  if (user.lastDate === yesterday) {
    user.streak = (user.streak || 1) + 1; // continuing streak
  } else {
    user.streak = 1; // streak broken
  }
  user.lastDate = today;
};

const formatDuration = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric'
});

// ─────────────────────────────────────────────
// CORE TRACKER - called from message loop hook
// ─────────────────────────────────────────────

/**
 * Track every incoming message
 * Call this for ALL messages (commands and non-commands)
 */
const trackMessage = (jid, groupId, groupName, pushName, isCommand, commandName) => {
  try {
    const db = loadDB();
    const user = getUser(db, jid, pushName);
    const hour = new Date().getHours();

    // Update user stats
    user.messages++;
    user.lastSeen = Date.now();
    updateStreak(user);

    // Track activity by hour
    if (!user.activityByHour) user.activityByHour = new Array(24).fill(0);
    user.activityByHour[hour]++;

    // Update global bot stats
    db.bot.totalMessages = (db.bot.totalMessages || 0) + 1;

    // Track command usage
    if (isCommand && commandName) {
      user.commands++;
      if (!user.commandMap) user.commandMap = {};
      user.commandMap[commandName] = (user.commandMap[commandName] || 0) + 1;

      if (!db.commands) db.commands = {};
      db.commands[commandName] = (db.commands[commandName] || 0) + 1;
      db.bot.totalCommands = (db.bot.totalCommands || 0) + 1;
    }

    // Track group stats
    if (groupId) {
      const group = getGroup(db, groupId, groupName);
      group.messages++;
      if (isCommand) group.commands++;

      // Track top users per group
      if (!group.topUsers) group.topUsers = {};
      group.topUsers[jid] = (group.topUsers[jid] || 0) + 1;
    }

    saveDB(db);
  } catch (e) {
    console.error('[OBSERVER] trackMessage error:', e.message);
  }
};

// ─────────────────────────────────────────────
// EXPORTED QUERY FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Get stats for a specific user
 */
const getUserStats = (jid) => {
  const db = loadDB();
  const user = db.users[jid];
  if (!user) return null;

  // Calculate rank among all users by message count
  const allUsers = Object.entries(db.users)
    .sort((a, b) => b[1].messages - a[1].messages);
  const rank = allUsers.findIndex(([id]) => id === jid) + 1;

  // Most used command
  const topCmd = user.commandMap
    ? Object.entries(user.commandMap).sort((a, b) => b[1] - a[1])[0]
    : null;

  // Most active hour
  const peakHour = user.activityByHour
    ? user.activityByHour.indexOf(Math.max(...user.activityByHour))
    : -1;

  return {
    ...user,
    rank,
    totalUsers: allUsers.length,
    topCommand: topCmd ? { name: topCmd[0], count: topCmd[1] } : null,
    peakHour,
    memberSince: formatDate(user.firstSeen),
    lastSeenFormatted: formatDuration(Date.now() - user.lastSeen) + ' ago',
  };
};

/**
 * Get stats for a group
 */
const getGroupStats = (groupId) => {
  const db = loadDB();
  const group = db.groups[groupId];
  if (!group) return null;

  // Top 5 users in this group
  const topUsers = Object.entries(group.topUsers || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    ...group,
    topUsers,
  };
};

/**
 * Get top N users by message count
 */
const getTopUsers = (groupId, limit = 10) => {
  const db = loadDB();

  if (groupId) {
    // Top users in specific group
    const group = db.groups[groupId];
    if (!group) return [];
    return Object.entries(group.topUsers || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([jid, count]) => ({
        jid,
        count,
        pushName: db.users[jid]?.pushName || jid.split('@')[0]
      }));
  }

  // Global top users
  return Object.entries(db.users)
    .sort((a, b) => b[1].messages - a[1].messages)
    .slice(0, limit)
    .map(([jid, data]) => ({
      jid,
      count: data.messages,
      pushName: data.pushName || jid.split('@')[0],
      level: data.streak || 1
    }));
};

/**
 * Get top N commands by usage
 */
const getTopCommands = (limit = 10) => {
  const db = loadDB();
  return Object.entries(db.commands || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
};

/**
 * Get message count (user, group, or global)
 */
const getMessageCount = (jid, groupId) => {
  const db = loadDB();
  if (jid) return db.users[jid]?.messages || 0;
  if (groupId) return db.groups[groupId]?.messages || 0;
  return db.bot.totalMessages || 0;
};

/**
 * Get user rank in a group or globally
 */
const getRank = (jid, groupId) => {
  const db = loadDB();

  if (groupId) {
    const group = db.groups[groupId];
    if (!group) return { rank: 0, total: 0, count: 0 };
    const sorted = Object.entries(group.topUsers || {})
      .sort((a, b) => b[1] - a[1]);
    const rank = sorted.findIndex(([id]) => id === jid) + 1;
    return { rank, total: sorted.length, count: group.topUsers?.[jid] || 0 };
  }

  const sorted = Object.entries(db.users)
    .sort((a, b) => b[1].messages - a[1].messages);
  const rank = sorted.findIndex(([id]) => id === jid) + 1;
  return { rank, total: sorted.length, count: db.users[jid]?.messages || 0 };
};

/**
 * Get user level based on message count
 */
const getLevel = (jid) => {
  const db = loadDB();
  const user = db.users[jid];
  if (!user) return { level: 0, messages: 0, nextLevel: 50, progress: 0 };

  // Level thresholds: 50, 150, 350, 700, 1200, 2000, 3000, 5000, 8000, 12000...
  const thresholds = [0, 50, 150, 350, 700, 1200, 2000, 3000, 5000, 8000, 12000, 18000, 25000];
  let level = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (user.messages >= thresholds[i]) level = i;
    else break;
  }

  const current = thresholds[level] || 0;
  const next = thresholds[level + 1] || thresholds[thresholds.length - 1];
  const progress = Math.floor(((user.messages - current) / (next - current)) * 10);
  const safeProgress = Math.min(Math.max(progress, 0), 10);

  return {
    level,
    messages: user.messages,
    currentThreshold: current,
    nextLevel: next,
    progress: safeProgress,
    progressBar: '█'.repeat(safeProgress) + '░'.repeat(10 - safeProgress),
  };
};

/**
 * Get user activity pattern by hour
 */
const getActivity = (jid) => {
  const db = loadDB();
  const user = db.users[jid];
  if (!user) return null;

  const hours = user.activityByHour || new Array(24).fill(0);
  const max = Math.max(...hours, 1);
  const peakHour = hours.indexOf(max);
  const totalToday = hours.reduce((a, b) => a + b, 0);

  // Build activity chart (simplified for text)
  const chart = hours.map((count, h) => {
    const bar = count > 0 ? '▓'.repeat(Math.ceil((count / max) * 5)) : '░';
    return `${String(h).padStart(2, '0')}:00 ${bar} ${count}`;
  });

  return {
    hours,
    peakHour,
    peakCount: max,
    chart,
    streak: user.streak || 1,
    lastDate: user.lastDate,
  };
};

/**
 * Get global bot stats
 */
const getBotStats = () => {
  const db = loadDB();
  const uptime = Date.now() - (global.botStartTime || db.bot.startTime || Date.now());
  const topCmd = Object.entries(db.commands || {})
    .sort((a, b) => b[1] - a[1])[0];

  return {
    totalMessages: db.bot.totalMessages || 0,
    totalCommands: db.bot.totalCommands || 0,
    totalUsers: Object.keys(db.users).length,
    totalGroups: Object.keys(db.groups).length,
    uptime: formatDuration(uptime),
    topCommand: topCmd ? { name: topCmd[0], count: topCmd[1] } : null,
  };
};

module.exports = {
  trackMessage,
  getUserStats,
  getGroupStats,
  getTopUsers,
  getTopCommands,
  getMessageCount,
  getRank,
  getLevel,
  getActivity,
  getBotStats,
  formatDuration,
  formatDate,
}; 