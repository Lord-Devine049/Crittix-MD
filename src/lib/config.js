/*
 * ============================================
 * CONFIG.JS: Per-Instance Config Manager
 * Created by: 𝗟𝗼𝗿𝗱 𝙳𝙴𝚅𝙸𝙽𝙴
 * ============================================
 */

const { AsyncLocalStorage } = require('async_hooks');
const fs   = require('fs-extra');
const path = require('path');

const instanceStore = new AsyncLocalStorage();

const CONFIG_DIR = path.join(process.cwd(), 'config');

const DEFAULTS = {
  BOT_NAME:         'Crittix MD',
  OWNER_NAME:       '𝗟𝗼𝗿𝗱 𝙳𝙴𝚅𝙸𝙽𝙴',
  OWNER_NUMBER:     '',
  PREFIX:           '.',
  FONT:             'default',
  BOT_BIO:          'Powered by 𝗟𝗼𝗿𝗱 𝙳𝙴𝚅𝙸𝙽𝙴',
  SUDO_NUMBERS:     [],
  MODE:             'self',
  GROQ_API_KEY:     '',
  REPLICATE_API_KEY: '',
  GEMINI_API_KEY:   'AIzaSyCx5gYMPHnHyiEMzY1KbC_5-A0HbAXQ0Vw',
  BOT_PIC:          '',
  BOT_PIC_TYPE:     'image',
  ALWAYS_ONLINE:    false,
  AUTO_READ:        false,
  AUTO_REACT:       false,
  AUTO_REACT_EMOJI: '💜',
  ANTI_DELETE:      false,
  ANTI_EDIT:        false,
  AUTO_TYPING:      false,
  AUTO_RECORDING:   false,
  ANTICALL:         false,
  ANTIONCEVIEW:     false,
  ANTIBUG:          false,
  ANTIRAID:         false,
  CRITTIX_MODE:     false,
  AUTO_LIKE_STATUS: false,
  AUTO_VIEW_STATUS: false,
  SAVE_STATUS:      false,
  VERSION:          '1.0.0'
};

const _getOwner = (override) =>
  String(override || instanceStore.getStore()?.ownerNumber || '').replace(/\D/g, '');

const _configPath = (on) => path.join(CONFIG_DIR, `${on}.json`);

const getConfig = (ownerNumber) => {
  const on = _getOwner(ownerNumber);
  if (!on) return { ...DEFAULTS };
  try {
    fs.ensureDirSync(CONFIG_DIR);
    const fp = _configPath(on);
    if (!fs.existsSync(fp)) {
      const def = {
        ...DEFAULTS,
        OWNER_NUMBER: on,
        BOT_PIC: process.env.DEFAULT_BOT_PIC || 'https://files.catbox.moe/0wl5v6.jpg'
      };
      fs.writeFileSync(fp, JSON.stringify(def, null, 2));
      return { ...def };
    }
    const parsed = JSON.parse(fs.readFileSync(fp, 'utf8'));
    return { ...DEFAULTS, ...parsed, OWNER_NUMBER: on };
  } catch (e) {
    console.error('[CONFIG] Failed to load config:', e.message);
    return { ...DEFAULTS, OWNER_NUMBER: on };
  }
};

const setConfig = (ownerOrUpdates, updatesArg) => {
  let on, updates;
  if (updatesArg === undefined) {
    on      = _getOwner();
    updates = ownerOrUpdates;
  } else {
    on      = _getOwner(ownerOrUpdates);
    updates = updatesArg;
  }
  if (!on) { console.error('[CONFIG] No owner context for setConfig()'); return false; }
  try {
    fs.ensureDirSync(CONFIG_DIR);
    const merged = { ...getConfig(on), ...updates };
    fs.writeFileSync(_configPath(on), JSON.stringify(merged, null, 2));
    return true;
  } catch (e) {
    console.error('[CONFIG] Failed to save config:', e.message);
    return false;
  }
};

const createOwnerConfig = (ownerNumber) => {
  const on = String(ownerNumber).replace(/\D/g, '');
  if (!on) return false;
  fs.ensureDirSync(CONFIG_DIR);
  const fp = _configPath(on);
  if (!fs.existsSync(fp)) {
    const def = {
      ...DEFAULTS,
      OWNER_NUMBER: on,
      BOT_PIC: process.env.DEFAULT_BOT_PIC || 'https://files.catbox.moe/0wl5v6.jpg'
    };
    fs.writeFileSync(fp, JSON.stringify(def, null, 2));
  }
  return true;
};

const deleteOwnerConfig = (ownerNumber) => {
  try {
    const fp = _configPath(String(ownerNumber).replace(/\D/g, ''));
    if (fs.existsSync(fp)) { fs.unlinkSync(fp); return true; }
    return false;
  } catch { return false; }
};

const normalizeNumber = (jid) =>
  String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '').replace(/^0+/, '');

const isOwner = (senderJid, ownerOverride) => {
  const on = _getOwner(ownerOverride);
  if (!senderJid || !on) return false;
  const raw = String(senderJid);

  if (raw.endsWith('@lid') && global.BOT_LID_MAP?.[on]) {
    if (raw === global.BOT_LID_MAP[on]) return true;
  }

  const cfg       = getConfig(on);
  const ownerNum  = String(cfg.OWNER_NUMBER || '').replace(/\D/g, '');
  const senderNum = normalizeNumber(senderJid);
  if (!ownerNum || !senderNum) return false;
  return (
    senderNum === ownerNum ||
    senderNum.endsWith(ownerNum) ||
    ownerNum.endsWith(senderNum)
  );
};

const isSudo = (senderJid, ownerOverride) => {
  if (isOwner(senderJid, ownerOverride)) return true;
  const on  = _getOwner(ownerOverride);
  const cfg = getConfig(on);
  const num = normalizeNumber(senderJid);
  return (cfg.SUDO_NUMBERS || []).some(s => {
    const c = String(s).replace(/\D/g, '');
    return num === c || num.endsWith(c) || c.endsWith(num);
  });
};

const addSudo = (a, b) => {
  const on  = b !== undefined ? _getOwner(a) : _getOwner();
  const num = String(b !== undefined ? b : a).replace(/\D/g, '');
  if (!on) { console.error('[CONFIG] No owner context for addSudo()'); return false; }
  const cfg   = getConfig(on);
  const sudos = cfg.SUDO_NUMBERS || [];
  if (sudos.includes(num)) return false;
  sudos.push(num);
  setConfig(on, { SUDO_NUMBERS: sudos });
  return true;
};

const removeSudo = (a, b) => {
  const on  = b !== undefined ? _getOwner(a) : _getOwner();
  const num = String(b !== undefined ? b : a).replace(/\D/g, '');
  if (!on) return false;
  const cfg   = getConfig(on);
  const sudos = (cfg.SUDO_NUMBERS || []).filter(s => String(s).replace(/\D/g, '') !== num);
  setConfig(on, { SUDO_NUMBERS: sudos });
  return true;
};

const runWithInstance = (ownerNumber, fn) => {
  const on = String(ownerNumber).replace(/\D/g, '');
  return instanceStore.run({ ownerNumber: on }, fn);
};

module.exports = {
  getConfig,
  setConfig,
  set:               setConfig,
  isOwner,
  isSudo,
  addSudo,
  removeSudo,
  createOwnerConfig,
  deleteOwnerConfig,
  normalizeNumber,
  runWithInstance,
  DEFAULTS
};
