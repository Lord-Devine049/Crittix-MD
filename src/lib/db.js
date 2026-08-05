/*
 * ============================================
 * DB.JS — Database Manager
 * Created by: 𝐋𝐎𝐑𝐃♰𝔻𝐄𝐕𝐈𝐍𝐄
 * ============================================
 */

const fs   = require('fs-extra');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', '..', 'database');

const FILES = {
  config  : path.join(DB_DIR, 'botconfig.json'),
  groups  : path.join(DB_DIR, 'groups.json'),
  users   : path.join(DB_DIR, 'users.json'),
  banned  : path.join(DB_DIR, 'banned.json')
};

// ── Ensure DB dir and files exist ──
const init = () => {
  fs.ensureDirSync(DB_DIR);
  for (const [key, filepath] of Object.entries(FILES)) {
    if (!fs.existsSync(filepath)) {
      const defaults = {
        config : { prefix: '.', botNumber: '' },
        groups : {},
        users  : {},
        banned : {}
      };
      fs.writeJsonSync(filepath, defaults[key], { spaces: 2 });
    }
  }
};

// ── Generic read / write ──
const read  = (file) => { try { return fs.readJsonSync(FILES[file]); } catch { return {}; } };
const write = (file, data) => { try { fs.writeJsonSync(FILES[file], data, { spaces: 2 }); } catch {} };

// ============================================
// USERS
// ============================================
const getUser = (jid) => {
  const users = read('users');
  if (!users[jid]) users[jid] = { jid, heat: 0, dmReceived: false, banned: false, joinedAt: Date.now() };
  return users[jid];
};

const saveUser = (jid, data) => {
  const users = read('users');
  users[jid] = { ...getUser(jid), ...data };
  write('users', users);
};

const addHeat = (jid, amount = 1) => {
  const user = getUser(jid);
  const oldHeat = user.heat;
  user.heat += amount;
  saveUser(jid, { heat: user.heat });
  return { oldHeat, newHeat: user.heat };
};

const resetHeat = (jid) => saveUser(jid, { heat: 0 });

const getHeat = (jid) => getUser(jid).heat;

// ── First DM tracking ──
const hasDmBeenReceived = (jid) => getUser(jid).dmReceived;
const markDmReceived    = (jid) => saveUser(jid, { dmReceived: true });

// ============================================
// GROUPS
// ============================================
const getGroup = (jid) => {
  const groups = read('groups');
  if (!groups[jid]) groups[jid] = { jid, mode: 'public', addedAt: Date.now() };
  return groups[jid];
};

const saveGroup = (jid, data) => {
  const groups = read('groups');
  groups[jid] = { ...getGroup(jid), ...data };
  write('groups', groups);
};

const getGroupMode    = (jid) => getGroup(jid).mode || 'public';
const setGroupMode    = (jid, mode) => saveGroup(jid, { mode });

// ── Welcome / Goodbye — per group config ──
const getWelcome   = (jid) => getGroup(jid).welcomeConfig || { enabled: false, greeting: '' };
const setWelcome   = (jid, data) => saveGroup(jid, { welcomeConfig: { ...getWelcome(jid), ...data } });
const getGoodbye   = (jid) => getGroup(jid).goodbyeConfig || { enabled: false, greeting: '' };
const setGoodbye   = (jid, data) => saveGroup(jid, { goodbyeConfig: { ...getGoodbye(jid), ...data } });

// ── Scheduled lock/unlock (closetime/opentime) ──
const getSchedule   = (jid) => getGroup(jid).schedule || {};
const setSchedule   = (jid, data) => saveGroup(jid, { schedule: { ...getSchedule(jid), ...data } });
const clearSchedule = (jid, key) => {
  const s = getSchedule(jid);
  delete s[key];
  saveGroup(jid, { schedule: s });
};

// ── Anti-features — per group, per feature ──
// value: false | 'warn' | 'kick' | 'delete'
const getAnti    = (jid, feature) => getGroup(jid)[feature] || false;
const setAnti    = (jid, feature, value) => saveGroup(jid, { [feature]: value });

// ── Group ban system ──
// Stores which members are banned from sending messages per group
const getGroupBanned  = (jid) => getGroup(jid).groupBanned || {};
const isGroupBanned   = (jid, userJid) => !!(getGroup(jid).groupBanned || {})[userJid];

const groupBanUser    = (jid, userJid, bannedByJid) => {
  const banned = getGroupBanned(jid);
  banned[userJid] = { bannedBy: bannedByJid, bannedAt: Date.now() };
  saveGroup(jid, { groupBanned: banned });
};

const groupUnbanUser  = (jid, userJid) => {
  const banned = getGroupBanned(jid);
  delete banned[userJid];
  saveGroup(jid, { groupBanned: banned });
};

// ── Bad words list per group ──
const getBadWords  = (jid) => getGroup(jid).badWords || [];
const setBadWords  = (jid, words) => saveGroup(jid, { badWords: words });

const addBadWord   = (jid, word) => {
  const words = getBadWords(jid);
  if (!words.includes(word.toLowerCase())) words.push(word.toLowerCase());
  setBadWords(jid, words);
};

const removeBadWord = (jid, word) => {
  const words = getBadWords(jid).filter(w => w !== word.toLowerCase());
  setBadWords(jid, words);
};

// ── Warn threshold per group (default 3) ──
const getWarnThreshold = (jid) => getGroup(jid).warnThreshold || 3;
const setWarnThreshold = (jid, num) => saveGroup(jid, { warnThreshold: Math.max(1, Math.min(10, num)) });

// ── Warning system — per group, per user, per feature ──
const getWarnings = (jid) => getGroup(jid).warnings || {};

const addWarning = (jid, userJid, feature) => {
  const group    = getGroup(jid);
  const warnings = group.warnings || {};
  if (!warnings[userJid]) warnings[userJid] = {};
  warnings[userJid][feature] = (warnings[userJid][feature] || 0) + 1;
  saveGroup(jid, { warnings });
  return warnings[userJid][feature];
};

const getWarningCount = (jid, userJid, feature) => {
  const warnings = getGroup(jid).warnings || {};
  return warnings[userJid]?.[feature] || 0;
};

const clearWarnings = (jid, userJid, feature) => {
  const group    = getGroup(jid);
  const warnings = group.warnings || {};
  if (warnings[userJid]) {
    delete warnings[userJid][feature];
    if (!Object.keys(warnings[userJid]).length) delete warnings[userJid];
  }
  saveGroup(jid, { warnings });
};

// ============================================
// BAN SYSTEM
// ============================================
const isBanned = (jid) => {
  const banned = read('banned');
  return !!banned[jid];
};

const banUser = (jid, reason = 'No reason given') => {
  const banned = read('banned');
  banned[jid] = { jid, reason, bannedAt: Date.now() };
  write('banned', banned);
};

const unbanUser = (jid) => {
  const banned = read('banned');
  delete banned[jid];
  write('banned', banned);
};

// ============================================
// HEAT MILESTONES — what CRITTIX says when heat jumps
// ============================================
const HEAT_MILESTONES = [
  { threshold: 10,  message: '𝒘𝒐𝒘 𝒍𝒆𝒗𝒆𝒍 𝟏 𝒂𝒍𝒓𝒆𝒂𝒅𝒚, 𝒚𝒐𝒖 𝒔𝒖𝒓𝒆 𝒅𝒐 𝒕𝒂𝒍𝒌 𝒂 𝒍𝒐𝒕 𝒇𝒐𝒓 𝒏𝒐 𝒓𝒆𝒂𝒔𝒐𝒏' },
  { threshold: 50,  message: '𝒃𝒓𝒐 𝒊𝒔 𝒉𝒆𝒂𝒕𝒊𝒏𝒈 𝒖𝒑, 𝒄𝒂𝒍𝒎 𝒅𝒐𝒘𝒏 𝒂 𝒍𝒊𝒕𝒕𝒍𝒆 𝒚𝒐𝒖\'𝒓𝒆 𝒈𝒐𝒊𝒏𝒈 𝒕𝒐𝒐 𝒉𝒂𝒓𝒅' },
  { threshold: 100, message: '𝒚𝒐 𝒉𝒆𝒂𝒕 𝒍𝒆𝒗𝒆𝒍 𝟏𝟎𝟎, 𝒘𝒉𝒚 𝒂𝒓𝒆 𝒚𝒐𝒖 𝒔𝒕𝒊𝒍𝒍 𝒕𝒂𝒍𝒌𝒊𝒏𝒈 𝒕𝒉𝒊𝒔 𝒎𝒖𝒄𝒉 𝒃𝒓𝒐' },
  { threshold: 200, message: '𝒍𝒆𝒗𝒆𝒍 𝟐𝟎𝟎 𝒉𝒆𝒂𝒕, 𝒚𝒐𝒖\'𝒓𝒆 𝒐𝒇𝒇𝒊𝒄𝒊𝒂𝒍𝒍𝒚 𝒕𝒉𝒆 𝒎𝒐𝒔𝒕 𝒂𝒏𝒏𝒐𝒚𝒊𝒏𝒈 𝒑𝒆𝒓𝒔𝒐𝒏 𝒊𝒏 𝒕𝒉𝒊𝒔 𝒈𝒓𝒐𝒖𝒑' },
  { threshold: 300, message: '𝟑𝟎𝟎 𝒉𝒆𝒂𝒕 𝒎𝒐𝒅𝒆 𝒂𝒄𝒕𝒊𝒗𝒂𝒕𝒆𝒅, 𝒚𝒐𝒖\'𝒓𝒆 𝒐𝒏 𝒂 𝒅𝒊𝒇𝒇𝒆𝒓𝒆𝒏𝒕 𝒍𝒆𝒗𝒆𝒍 𝒐𝒇 𝒄𝒉𝒂𝒐𝒔 𝒓𝒊𝒈𝒉𝒕 𝒏𝒐𝒘' },
  { threshold: 500, message: '𝟓𝟎𝟎 𝒉𝒆𝒂𝒕?? 𝒃𝒓𝒐 𝒈𝒆𝒕 𝒂 𝒍𝒊𝒇𝒆 𝒐𝒖𝒕𝒔𝒊𝒅𝒆 𝒐𝒇 𝒕𝒉𝒊𝒔 𝒈𝒓𝒐𝒖𝒑 𝒑𝒍𝒆𝒂𝒔𝒆' }
];

const checkMilestone = (oldHeat, newHeat) => {
  for (const m of HEAT_MILESTONES) {
    if (oldHeat < m.threshold && newHeat >= m.threshold) return m.message;
  }
  return null;
};

module.exports = {
  init,
  getUser, saveUser, addHeat, resetHeat, getHeat,
  hasDmBeenReceived, markDmReceived,
  getGroup, saveGroup, getGroupMode, setGroupMode,
  getWelcome, setWelcome, getGoodbye, setGoodbye,
  getSchedule, setSchedule, clearSchedule,
  getAnti, setAnti,
  getGroupBanned, isGroupBanned, groupBanUser, groupUnbanUser,
  getBadWords, setBadWords, addBadWord, removeBadWord,
  getWarnThreshold, setWarnThreshold,
  getWarnings, addWarning, getWarningCount, clearWarnings,
  isBanned, banUser, unbanUser,
  checkMilestone, HEAT_MILESTONES
};