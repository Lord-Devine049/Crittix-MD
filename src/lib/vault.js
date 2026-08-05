/*
 * ============================================
 * VAULT.JS - Economy System for Crittix MD
 * Created by: 𝗟𝗼𝗿𝗱 𝙳𝙴𝚅𝙸𝙽𝙴
 * ============================================
 */

const fs = require('fs');
const path = require('path');

//DB path
const DB_DIR = path.join(process.cwd(), 'database');
const DB_PATH = path.join(DB_DIR, 'vault.json');

//Default DB structure
const DEFAULT_DB = {
  users: {},
  shop: [],      
  transactions: [] 
};

// ── Shop items (default catalog) ──
const DEFAULT_SHOP = [
  { id: 'shield',     name: 'Rob Shield',      price: 500,   description: 'Protects you from being robbed once',     emoji: '🛡️',  type: 'protection', uses: 1 },
  { id: 'booster',    name: 'XP Booster',      price: 1000,  description: 'Double XP for 24 hours',                  emoji: '⚡',  type: 'booster',    duration: 86400000 },
  { id: 'lockpick',   name: 'Lockpick',         price: 750,   description: 'Increases rob success rate by 20%',       emoji: '🔓',  type: 'tool',       uses: 3 },
  { id: 'lucky',      name: 'Lucky Charm',      price: 1500,  description: 'Boosts gambling win chance by 15%',       emoji: '🍀',  type: 'luck',       uses: 5 },
  { id: 'vault',      name: 'Vault Upgrade',    price: 5000,  description: 'Increases bank capacity by 10,000',       emoji: '🏦',  type: 'upgrade',    uses: -1 },
  { id: 'pickaxe',    name: 'Pickaxe',          price: 300,   description: 'Required for mining work',                emoji: '⛏️',  type: 'tool',       uses: 10 },
  { id: 'sword',      name: 'Sword',            price: 800,   description: 'Required for hunting/battle work',        emoji: '⚔️',  type: 'weapon',     uses: 10 },
  { id: 'fishing_rod',name: 'Fishing Rod',      price: 400,   description: 'Required for fishing work',               emoji: '🎣',  type: 'tool',       uses: 10 },
];

// ── Cooldowns (ms) ──
const COOLDOWNS = {
  daily:   24 * 60 * 60 * 1000,       // 24h
  weekly:  7 * 24 * 60 * 60 * 1000,   // 7d
  monthly: 30 * 24 * 60 * 60 * 1000,  // 30d
  work:    2 * 60 * 60 * 1000,         // 2h
  rob:     6 * 60 * 60 * 1000,         // 6h
};

// ── Rewards ──
const REWARDS = {
  daily:   { min: 200,  max: 500  },
  weekly:  { min: 1500, max: 3000 },
  monthly: { min: 8000, max: 15000 },
};

// ── Work jobs ──
const WORK_JOBS = [
  { name: 'Mined coal',        min: 150, max: 400,  tool: 'pickaxe',     emoji: '⛏️'  },
  { name: 'Caught fish',       min: 100, max: 350,  tool: 'fishing_rod', emoji: '🎣'  },
  { name: 'Hunted monsters',   min: 200, max: 500,  tool: 'sword',       emoji: '⚔️'  },
  { name: 'Delivered packages',min: 100, max: 300,  tool: null,          emoji: '📦'  },
  { name: 'Cleaned streets',   min: 80,  max: 250,  tool: null,          emoji: '🧹'  },
  { name: 'Wrote code',        min: 200, max: 600,  tool: null,          emoji: '💻'  },
  { name: 'Cooked meals',      min: 120, max: 350,  tool: null,          emoji: '🍳'  },
  { name: 'Fixed cars',        min: 180, max: 450,  tool: null,          emoji: '🔧'  },
  { name: 'Tutored students',  min: 150, max: 400,  tool: null,          emoji: '📚'  },
  { name: 'Streamed online',   min: 50,  max: 800,  tool: null,          emoji: '🎮'  },
];

// ── XP thresholds per level ──
const xpForLevel = (level) => Math.floor(100 * Math.pow(1.5, level - 1));

// ─────────────────────────────────────────────
// DB HELPERS
// ─────────────────────────────────────────────
const loadDB = () => {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      const initial = { ...DEFAULT_DB, shop: DEFAULT_SHOP };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    // Ensure all top-level keys exist (guards against partial/corrupted JSON)
    if (!data.users) data.users = {};
    if (!data.shop || data.shop.length === 0) data.shop = DEFAULT_SHOP;
    if (!data.transactions) data.transactions = [];
    return data;
  } catch (e) {
    console.error('[VAULT] DB load error:', e.message);
    return { ...DEFAULT_DB, shop: DEFAULT_SHOP };
  }
};

const saveDB = (db) => {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    if (db.transactions.length > 100) db.transactions = db.transactions.slice(-100);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('[VAULT] DB save error:', e.message);
  }
};

// ─────────────────────────────────────────────
// USER HELPERS
// ─────────────────────────────────────────────
const getUser = (db, jid) => {
  if (!db.users[jid]) {
    db.users[jid] = {
      balance: 0,
      bank: 0,
      inventory: [],
      lastDaily: 0,
      lastWeekly: 0,
      lastMonthly: 0,
      lastWork: 0,
      lastRob: 0,
      xp: 0,
      level: 1,
      totalEarned: 0,
      robStreak: 0,
    };
  }
  return db.users[jid];
};

const addXP = (user, amount) => {
  user.xp += amount;
  const needed = xpForLevel(user.level + 1);
  if (user.xp >= needed) {
    user.xp -= needed;
    user.level += 1;
    return true; // leveled up
  }
  return false;
};

const formatBalance = (amount) => {
  return amount.toLocaleString('en-US');
};

const formatCooldown = (ms) => {
  if (ms <= 0) return 'Ready!';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const logTransaction = (db, from, to, amount, type) => {
  db.transactions.push({
    from, to, amount, type,
    timestamp: Date.now()
  });
};

const hasItem = (user, itemId) => {
  return user.inventory.some(i => i.id === itemId && i.uses !== 0);
};

const useItem = (user, itemId) => {
  const item = user.inventory.find(i => i.id === itemId && i.uses !== 0);
  if (!item) return false;
  if (item.uses > 0) item.uses--;
  if (item.uses === 0) {
    user.inventory = user.inventory.filter(i => i !== item);
  }
  return true;
};

// ─────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Get user balance info
 */
const getBalance = (jid) => {
  const db = loadDB();
  const user = getUser(db, jid);
  return {
    balance: user.balance,
    bank: user.bank,
    total: user.balance + user.bank,
    level: user.level,
    xp: user.xp,
    xpNeeded: xpForLevel(user.level + 1),
    totalEarned: user.totalEarned || 0
  };
};

/**
 * Claim daily reward
 */
const claimDaily = (jid) => {
  const db = loadDB();
  const user = getUser(db, jid);
  const now = Date.now();
  const cd = COOLDOWNS.daily - (now - user.lastDaily);

  if (cd > 0) return { success: false, cooldown: cd };

  const amount = rand(REWARDS.daily.min, REWARDS.daily.max);
  // Streak bonus (consecutive days)
  const isStreak = (now - user.lastDaily) < COOLDOWNS.daily * 2;
  if (!user.streak) user.streak = 0;
  user.streak = isStreak ? user.streak + 1 : 1;
  const streakBonus = Math.min(user.streak * 50, 500); // max 500 bonus
  const total = amount + streakBonus;

  user.balance += total;
  user.totalEarned = (user.totalEarned || 0) + total;
  user.lastDaily = now;
  const leveledUp = addXP(user, 50);
  saveDB(db);

  return { success: true, amount: total, base: amount, streakBonus, streak: user.streak, leveledUp, newLevel: user.level };
};

/**
 * Claim weekly reward
 */
const claimWeekly = (jid) => {
  const db = loadDB();
  const user = getUser(db, jid);
  const now = Date.now();
  const cd = COOLDOWNS.weekly - (now - user.lastWeekly);

  if (cd > 0) return { success: false, cooldown: cd };

  const amount = rand(REWARDS.weekly.min, REWARDS.weekly.max);
  user.balance += amount;
  user.totalEarned = (user.totalEarned || 0) + amount;
  user.lastWeekly = now;
  const leveledUp = addXP(user, 200);
  saveDB(db);

  return { success: true, amount, leveledUp, newLevel: user.level };
};

/**
 * Claim monthly reward
 */
const claimMonthly = (jid) => {
  const db = loadDB();
  const user = getUser(db, jid);
  const now = Date.now();
  const cd = COOLDOWNS.monthly - (now - user.lastMonthly);

  if (cd > 0) return { success: false, cooldown: cd };

  const amount = rand(REWARDS.monthly.min, REWARDS.monthly.max);
  user.balance += amount;
  user.totalEarned = (user.totalEarned || 0) + amount;
  user.lastMonthly = now;
  const leveledUp = addXP(user, 500);
  saveDB(db);

  return { success: true, amount, leveledUp, newLevel: user.level };
};

/**
 * Work and earn coins
 */
const doWork = (jid) => {
  const db = loadDB();
  const user = getUser(db, jid);
  const now = Date.now();
  const cd = COOLDOWNS.work - (now - user.lastWork);

  if (cd > 0) return { success: false, cooldown: cd };

  // Pick random job
  const job = WORK_JOBS[Math.floor(Math.random() * WORK_JOBS.length)];
  let amount = rand(job.min, job.max);

  // Tool bonus: if job requires a tool and user has it, +30% pay
  let usedTool = false;
  if (job.tool && hasItem(user, job.tool)) {
    amount = Math.floor(amount * 1.3);
    useItem(user, job.tool);
    usedTool = true;
  }

  user.balance += amount;
  user.totalEarned = (user.totalEarned || 0) + amount;
  user.lastWork = now;
  const leveledUp = addXP(user, 30);
  saveDB(db);

  return { success: true, amount, job, usedTool, leveledUp, newLevel: user.level };
};

/**
 * Rob another user
 */
const robUser = (robberJid, victimJid) => {
  const db = loadDB();
  const robber = getUser(db, robberJid);
  const victim = getUser(db, victimJid);
  const now = Date.now();

  const cd = COOLDOWNS.rob - (now - robber.lastRob);
  if (cd > 0) return { success: false, reason: 'cooldown', cooldown: cd };
  if (victim.balance < 100) return { success: false, reason: 'broke', balance: victim.balance };

  // Check if victim has shield
  if (hasItem(victim, 'shield')) {
    useItem(victim, 'shield');
    saveDB(db);
    return { success: false, reason: 'shielded' };
  }

  // Base success chance: 45%
  let successChance = 0.45;
  if (hasItem(robber, 'lockpick')) {
    successChance += 0.20;
    useItem(robber, 'lockpick');
  }

  robber.lastRob = now;

  if (Math.random() < successChance) {
    // Rob succeeds - steal 20-40% of victim's balance
    const percent = rand(20, 40) / 100;
    const stolen = Math.floor(victim.balance * percent);
    victim.balance -= stolen;
    robber.balance += stolen;
    robber.totalEarned = (robber.totalEarned || 0) + stolen;
    robber.robStreak = (robber.robStreak || 0) + 1;
    const leveledUp = addXP(robber, 40);
    logTransaction(db, robberJid, victimJid, stolen, 'rob');
    saveDB(db);
    return { success: true, stolen, percent: Math.round(percent * 100), leveledUp, newLevel: robber.level };
  } else {
    // Rob fails - pay fine (10-20% of robber's balance)
    const finePct = rand(10, 20) / 100;
    const fine = Math.floor(Math.max(robber.balance * finePct, 50));
    const actualFine = Math.min(fine, robber.balance);
    robber.balance -= actualFine;
    victim.balance += actualFine;
    robber.robStreak = 0;
    saveDB(db);
    return { success: false, reason: 'caught', fine: actualFine };
  }
};

/**
 * Gamble coins
 */
const gamble = (jid, amount) => {
  const db = loadDB();
  const user = getUser(db, jid);

  if (amount <= 0) return { success: false, reason: 'invalid_amount' };
  if (user.balance < amount) return { success: false, reason: 'insufficient', balance: user.balance };

  // Win chance: 45% base, +15% with lucky charm
  let winChance = 0.45;
  if (hasItem(user, 'lucky')) {
    winChance += 0.15;
    useItem(user, 'lucky');
  }

  const won = Math.random() < winChance;

  if (won) {
    // Multiply: 1.5x to 3x
    const multiplier = (rand(15, 30) / 10);
    const winnings = Math.floor(amount * multiplier);
    user.balance += winnings - amount; // net gain
    user.totalEarned = (user.totalEarned || 0) + winnings;
    const leveledUp = addXP(user, 20);
    saveDB(db);
    return { success: true, won: true, amount, winnings, multiplier, newBalance: user.balance, leveledUp };
  } else {
    user.balance -= amount;
    saveDB(db);
    return { success: true, won: false, amount, newBalance: user.balance };
  }
};

/**
 * Play slots
 */
const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '💀', '⭐'];
const SLOT_MULTIPLIERS = {
  '💎💎💎': 10,
  '7️⃣7️⃣7️⃣': 8,
  '⭐⭐⭐': 6,
  '🍇🍇🍇': 4,
  '🍊🍊🍊': 3,
  '🍋🍋🍋': 3,
  '🍒🍒🍒': 2,
  '💀💀💀': 0, // jackpot loss - lose double
};

const slots = (jid, amount) => {
  const db = loadDB();
  const user = getUser(db, jid);

  if (amount <= 0) return { success: false, reason: 'invalid_amount' };
  if (user.balance < amount) return { success: false, reason: 'insufficient', balance: user.balance };

  const spin = [
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
  ];

  const key = spin.join('');
  const multiplier = SLOT_MULTIPLIERS[key];

  let netChange = 0;
  let won = false;
  let winnings = 0;

  if (multiplier !== undefined) {
    if (multiplier === 0) {
      // Skull jackpot - lose double
      netChange = -(amount * 2);
      won = false;
    } else {
      winnings = amount * multiplier;
      netChange = winnings - amount;
      won = true;
    }
  } else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) {
    // Two matching - win back 1.5x
    winnings = Math.floor(amount * 1.5);
    netChange = winnings - amount;
    won = true;
  } else {
    // All different - lose
    netChange = -amount;
    won = false;
  }

  user.balance = Math.max(0, user.balance + netChange);
  if (won) user.totalEarned = (user.totalEarned || 0) + winnings;
  const leveledUp = addXP(user, 15);
  saveDB(db);

  return {
    success: true,
    spin,
    won,
    winnings: won ? winnings : 0,
    lost: won ? 0 : Math.abs(netChange),
    multiplier: multiplier || (won ? 1.5 : 0),
    newBalance: user.balance,
    isSkull: multiplier === 0,
    leveledUp
  };
};

/**
 * Transfer coins to another user
 */
const transfer = (fromJid, toJid, amount) => {
  const db = loadDB();
  const from = getUser(db, fromJid);
  const to = getUser(db, toJid);

  if (amount <= 0) return { success: false, reason: 'invalid_amount' };
  if (from.balance < amount) return { success: false, reason: 'insufficient', balance: from.balance };

  from.balance -= amount;
  to.balance += amount;
  logTransaction(db, fromJid, toJid, amount, 'transfer');
  saveDB(db);

  return { success: true, amount, fromBalance: from.balance, toBalance: to.balance };
};

/**
 * Get leaderboard (top 10 by total balance)
 */
const getLeaderboard = () => {
  const db = loadDB();
  return Object.entries(db.users)
    .map(([jid, data]) => ({
      jid,
      total: (data.balance || 0) + (data.bank || 0),
      balance: data.balance || 0,
      level: data.level || 1
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
};

/**
 * Get shop items
 */
const getShop = () => {
  const db = loadDB();
  return db.shop || DEFAULT_SHOP;
};

/**
 * Buy item from shop
 */
const buyItem = (jid, itemId) => {
  const db = loadDB();
  const user = getUser(db, jid);
  const item = (db.shop || DEFAULT_SHOP).find(i => i.id === itemId);

  if (!item) return { success: false, reason: 'not_found' };
  if (user.balance < item.price) return { success: false, reason: 'insufficient', balance: user.balance, price: item.price };

  // Check if already has non-consumable
  if (item.uses === -1 && hasItem(user, itemId)) {
    return { success: false, reason: 'already_owned' };
  }

  user.balance -= item.price;
  user.inventory.push({ ...item });
  logTransaction(db, jid, 'shop', item.price, 'purchase');
  saveDB(db);

  return { success: true, item, newBalance: user.balance };
};

/**
 * Get user inventory
 */
const getInventory = (jid) => {
  const db = loadDB();
  const user = getUser(db, jid);
  return user.inventory || [];
};

/**
 * Add an arbitrary item object to a user's inventory (used by blackmarket etc.)
 */
const addToInventory = (jid, item) => {
  const db = loadDB();
  const user = getUser(db, jid);
  if (!user.inventory) user.inventory = [];
  user.inventory.push({ ...item });
  saveDB(db);
};

/**
 * Save a key-value pair for a user
 */
const set = (jid, key, value) => {
  const db = loadDB();
  const user = getUser(db, jid);
  if (!user.kv) user.kv = {};
  user.kv[key] = value;
  saveDB(db);
};

/**
 * Get a value by key for a user
 */
const get = (jid, key) => {
  const db = loadDB();
  const user = getUser(db, jid);
  return user.kv ? user.kv[key] : undefined;
};

/**
 * List all keys saved by a user
 */
const list = (jid) => {
  const db = loadDB();
  const user = getUser(db, jid);
  return user.kv ? Object.keys(user.kv) : [];
};

/**
 * Delete a key for a user
 */
const remove = (jid, key) => {
  const db = loadDB();
  const user = getUser(db, jid);
  if (user.kv) delete user.kv[key];
  saveDB(db);
};

/**
 * Clear all vault keys for a user
 */
const clear = (jid) => {
  const db = loadDB();
  const user = getUser(db, jid);
  user.kv = {};
  saveDB(db);
};

/**
 * Add or subtract coins/bank from a user's balance.
 * @param {string} jid       - User JID
 * @param {number} coinDelta - Amount to add/subtract from wallet (negative = subtract)
 * @param {number} bankDelta - Amount to add/subtract from bank (default 0)
 */
const updateBalance = (jid, coinDelta = 0, bankDelta = 0) => {
  const db   = loadDB();
  const user = getUser(db, jid);
  user.balance = Math.max(0, (user.balance || 0) + coinDelta);
  user.bank    = Math.max(0, (user.bank    || 0) + bankDelta);
  saveDB(db);
  return { balance: user.balance, bank: user.bank };
};

// Convenience wrappers used by economy-new.js and other plugins
const addCoins    = (jid, amount) => updateBalance(jid,  Math.abs(amount), 0);
const removeCoins = (jid, amount) => updateBalance(jid, -Math.abs(amount), 0);

module.exports = {
  getBalance,
  updateBalance,
  addCoins,
  removeCoins,
  claimDaily,
  claimWeekly,
  claimMonthly,
  doWork,
  robUser,
  gamble,
  slots,
  transfer,
  getLeaderboard,
  getShop,
  buyItem,
  set,
  get,
  list,
  remove,
  clear,
  getInventory,
  addToInventory,
  formatBalance,
  formatCooldown,
  SLOT_SYMBOLS,
};