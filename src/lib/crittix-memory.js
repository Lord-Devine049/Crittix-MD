/*
 * CRITTIX-MEMORY.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Stores conversation history per user per chat
 * Auto-cleans anything older than 24 hours
 * Powers context-aware Crittix AI replies
 */
const fs   = require('fs-extra');
const path = require('path');

const MEM_PATH  = path.join(__dirname, '..', '..', 'database', 'crittix-memory.json');
const MAX_AGE   = 24 * 60 * 60 * 1000; // 24 hours
const MAX_TURNS = 12; // max messages kept per user per chat

const load = () => {
  try { return fs.existsSync(MEM_PATH) ? JSON.parse(fs.readFileSync(MEM_PATH,'utf8')) : {}; }
  catch(_) { return {}; }
};
const save = d => {
  try { fs.ensureDirSync(path.dirname(MEM_PATH)); fs.writeFileSync(MEM_PATH, JSON.stringify(d)); }
  catch(_) {}
};

// Clean stale entries globally
const cleanup = (db) => {
  const now = Date.now();
  for (const chatId in db) {
    for (const userId in db[chatId]) {
      db[chatId][userId] = db[chatId][userId].filter(m => now - m.ts < MAX_AGE);
      if (!db[chatId][userId].length) delete db[chatId][userId];
    }
    if (!Object.keys(db[chatId]).length) delete db[chatId];
  }
  return db;
};

// Add a message to memory
const addMessage = (chatId, userId, role, content) => {
  let db = load();
  db     = cleanup(db);
  if (!db[chatId]) db[chatId] = {};
  if (!db[chatId][userId]) db[chatId][userId] = [];

  db[chatId][userId].push({ role, content, ts: Date.now() });

  // Trim to max turns (keep last N)
  if (db[chatId][userId].length > MAX_TURNS)
    db[chatId][userId] = db[chatId][userId].slice(-MAX_TURNS);

  save(db);
};

// Get conversation history formatted for AI (no ts field)
const getHistory = (chatId, userId) => {
  const db = cleanup(load());
  save(db);
  return (db[chatId]?.[userId] || []).map(m => ({ role: m.role, content: m.content }));
};

// Get recent group messages for recap (all users in a chat)
const getGroupMessages = (chatId, limit = 50) => {
  const db  = cleanup(load());
  const all = [];
  for (const userId in (db[chatId] || {})) {
    for (const m of db[chatId][userId]) {
      if (m.role === 'user') all.push({ userId, content: m.content, ts: m.ts });
    }
  }
  return all.sort((a,b) => a.ts - b.ts).slice(-limit);
};

// Clear a user's memory
const clearMemory = (chatId, userId) => {
  const db = load();
  if (db[chatId]?.[userId]) { delete db[chatId][userId]; save(db); }
};

module.exports = { addMessage, getHistory, getGroupMessages, clearMemory };
