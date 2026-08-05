/*
 * BOOT-TIME.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Persistent runtime that survives server restarts
 */

const fs   = require('fs-extra');
const path = require('path');

const BOOT_FILE = path.join(__dirname, '..', '..', 'database', 'boot-time.json');

const initBootTime = () => {
  try {
    fs.ensureDirSync(path.dirname(BOOT_FILE));
    if (!fs.existsSync(BOOT_FILE)) {
      fs.writeFileSync(BOOT_FILE, JSON.stringify({ startedAt: Date.now() }));
    }
  } catch (_) {}
};

const getRuntime = () => {
  try {
    if (!fs.existsSync(BOOT_FILE)) return 'unknown';
    const { startedAt } = JSON.parse(fs.readFileSync(BOOT_FILE, 'utf8'));
    const ms      = Date.now() - startedAt;
    const days    = Math.floor(ms / 86400000);
    const hours   = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (days > 0)    return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0)   return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  } catch (_) { return 'unknown'; }
};

const getStartedAt = () => {
  try {
    if (!fs.existsSync(BOOT_FILE)) return Date.now();
    return JSON.parse(fs.readFileSync(BOOT_FILE, 'utf8')).startedAt || Date.now();
  } catch (_) { return Date.now(); }
};

module.exports = { initBootTime, getRuntime, getStartedAt };
