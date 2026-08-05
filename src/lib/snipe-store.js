/*
 * SNIPE-STORE.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Stores last deleted message per group for .snipe
 */
const fs   = require('fs-extra');
const path = require('path');

const SNIPE_PATH = path.join(__dirname, '..', '..', 'database', 'snipe-store.json');
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes, deleted msgs expire

const load = () => {
  try { return fs.existsSync(SNIPE_PATH) ? JSON.parse(fs.readFileSync(SNIPE_PATH,'utf8')) : {}; }
  catch(_) { return {}; }
};
const save = d => { try { fs.ensureDirSync(path.dirname(SNIPE_PATH)); fs.writeFileSync(SNIPE_PATH, JSON.stringify(d,null,2)); } catch(_){} };

// Store deleted message
const storeSnipe = (chatId, data) => {
  const db = load();
  db[chatId] = { ...data, deletedAt: Date.now() };
  save(db);
};

// Get last snipe for a chat
const getSnipe = (chatId) => {
  const db   = load();
  const snipe = db[chatId];
  if (!snipe) return null;
  if (Date.now() - snipe.deletedAt > MAX_AGE_MS) {
    delete db[chatId]; save(db); return null;
  }
  return snipe;
};

module.exports = { storeSnipe, getSnipe };
