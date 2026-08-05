/*
 * ============================================
 * JAIL.JS - Crittix-MD Jail System
 * Created by: LORD DEVINE
 * Tracks jailed members per group
 * ============================================
 */

const fs   = require('fs-extra');
const path = require('path');

const JAIL_PATH = path.join(__dirname, '..', '..', 'database', 'jail.json');

const load = () => {
  try {
    if (fs.existsSync(JAIL_PATH)) return JSON.parse(fs.readFileSync(JAIL_PATH, 'utf8'));
    return {};
  } catch (_) { return {}; }
};

const save = (data) => {
  try {
    fs.ensureDirSync(path.dirname(JAIL_PATH));
    fs.writeFileSync(JAIL_PATH, JSON.stringify(data, null, 2));
  } catch (_) {}
};

// Jail a member in a group
const jailMember = (chatId, jid) => {
  const data = load();
  if (!data[chatId]) data[chatId] = [];
  const clean = jid.replace(/:\d+@/, '@');
  if (!data[chatId].includes(clean)) data[chatId].push(clean);
  save(data);
};

// Unjail a member
const unjailMember = (chatId, jid) => {
  const data  = load();
  const clean = jid.replace(/:\d+@/, '@');
  if (!data[chatId]) return;
  data[chatId] = data[chatId].filter(j => j !== clean);
  save(data);
};

// Check if a member is jailed
const isJailed = (chatId, jid) => {
  const data  = load();
  const clean = jid.replace(/:\d+@/, '@');
  return (data[chatId] || []).includes(clean);
};

// Get all jailed members in a group
const getJailed = (chatId) => {
  const data = load();
  return data[chatId] || [];
};

module.exports = { jailMember, unjailMember, isJailed, getJailed };
