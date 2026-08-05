/*
 * ============================================
 * GLOBAL-XP.JS - Crittix-MD Global XP System
 * Created by: LORD DEVINE
 * Tracks participation across ALL owner instances
 * ============================================
 */

const fs   = require('fs-extra');
const path = require('path');

const XP_PATH = path.join(__dirname, '..', '..', 'database', 'global-xp.json');
const XP_PER_GAME = 5;

// Normalize a JID — converts @lid to @s.whatsapp.net
// LID number parts are >15 digits and not real phone numbers,
// but we can't reverse them. We just ensure the suffix is correct
// so future lookups are consistent. Old LID-keyed entries get
// remapped at load time so they merge with any real-number entry.
const normalizeJid = (jid) => {
  if (!jid) return jid;
  if (jid.endsWith('@lid')) return jid.replace('@lid', '@s.whatsapp.net');
  return jid;
};

const load = () => {
  try {
    if (!fs.existsSync(XP_PATH)) return {};
    const raw = JSON.parse(fs.readFileSync(XP_PATH, 'utf8'));
    // Remap any LID-keyed entries — merge by keeping higher XP
    const normalized = {};
    for (const [, val] of Object.entries(raw)) {
      const normJid = normalizeJid(val.jid || '');
      const normKey = normJid.split('@')[0];
      if (normalized[normKey]) {
        if ((val.xp || 0) > (normalized[normKey].xp || 0)) {
          normalized[normKey] = { ...val, jid: normJid };
        }
      } else {
        normalized[normKey] = { ...val, jid: normJid };
      }
    }
    return normalized;
  } catch (_) { return {}; }
};

const save = (data) => {
  try {
    fs.ensureDirSync(path.dirname(XP_PATH));
    fs.writeFileSync(XP_PATH, JSON.stringify(data, null, 2));
  } catch (_) {}
};

const addXP = (jid, userName, points = XP_PER_GAME) => {
  jid = normalizeJid(jid);
  const data = load();
  const key  = jid.split('@')[0];
  if (!data[key]) data[key] = { jid, userName, xp: 0, games: 0 };
  data[key].xp      += points;
  data[key].games   += 1;
  data[key].userName = userName;
  data[key].jid      = jid;
  save(data);
  return data[key].xp;
};

const getLeaderboard = (limit = 10) => {
  const data = load();
  return Object.values(data).sort((a, b) => b.xp - a.xp).slice(0, limit);
};

const getUserXP = (jid) => {
  jid = normalizeJid(jid);
  const data = load();
  const key  = jid.split('@')[0];
  return data[key] || null;
};

const getUserRank = (jid) => {
  jid = normalizeJid(jid);
  const data   = load();
  const sorted = Object.values(data).sort((a, b) => b.xp - a.xp);
  const key    = jid.split('@')[0];
  const idx    = sorted.findIndex(u => u.jid.split('@')[0] === key);
  return { rank: idx + 1, total: sorted.length };
};

// getXP is an alias for getUserXP — kept for backward compat with older plugin calls
const getXP = getUserXP;

module.exports = { addXP, getLeaderboard, getUserXP, getXP, getUserRank, XP_PER_GAME };
