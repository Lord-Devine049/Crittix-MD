/*
 * ACTIVITY-TRACKER.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Tracks last message time per user per group
 */
const fs   = require('fs-extra');
const path = require('path');

const ACT_PATH = path.join(__dirname, '..', '..', 'database', 'activity.json');

const load = () => {
  try { return fs.existsSync(ACT_PATH) ? JSON.parse(fs.readFileSync(ACT_PATH,'utf8')) : {}; }
  catch(_) { return {}; }
};
const save = d => {
  try { fs.ensureDirSync(path.dirname(ACT_PATH)); fs.writeFileSync(ACT_PATH, JSON.stringify(d)); }
  catch(_) {}
};

// Record activity
const recordActivity = (chatId, jid) => {
  const db  = load();
  const key = jid.replace(/:\d+@/,'@');
  if (!db[chatId]) db[chatId] = {};
  db[chatId][key] = Date.now();
  save(db);
};

// Get inactive members (haven't sent a message in X days)
const getInactive = (chatId, members, days = 7) => {
  const db      = load();
  const cutoff  = Date.now() - days * 24 * 60 * 60 * 1000;
  const tracked = db[chatId] || {};
  return members
    .map(p => ({ jid: p.id.replace(/:\d+@/,'@'), admin: p.admin }))
    .filter(p => {
      if (p.admin) return false; // never flag admins
      const last = tracked[p.jid];
      return !last || last < cutoff; // never seen or too old
    });
};

module.exports = { recordActivity, getInactive };
