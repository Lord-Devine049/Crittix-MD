/*
 * ============================================
 * DEVINE.JS - Crittix-MD Plugin Router
 * Created by: 𝗟𝗼𝗿𝗱 𝙳𝙴𝚅𝙸𝙽𝙴
 * Auto-loads plugins, auto-builds menu, routes commands
 * ============================================
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { downloadContentFromMessage, downloadMediaMessage, proto } = require('@whiskeysockets/baileys');
const crypto = require('crypto');
const cfgLib = require('./lib/config');
const { getConfig, isOwner, isSudo } = cfgLib;
const { applyFont, getConfigFont } = require('./lib/fonts');
const helpers = require('./lib/helpers');
const { runAntiFeatures, handleAntiRaid, handleAntiPromote, handleAntiDemote } = require('./lib/anti-handlers');
const db = require('./lib/db');
const crittixAI = require('./lib/crittix-ai');
const crittixAura = require('./lib/crittix-aura');
const crittixDB = require('./lib/crittix-db');
const crittixStickers = require('./lib/crittix-stickers');
const observer = require('./lib/observer');
const multiplayer = require('./lib/multiplayer');
const tictactoe = require('./lib/tictactoe');
const rps = require('./lib/rps');

const PLUGINS_DIR = path.join(__dirname, 'plugins');
const plugins = new Map(); 

const loadPlugins = () => {
  plugins.clear();
  const categories = fs.readdirSync(PLUGINS_DIR).filter(f =>
    fs.statSync(path.join(PLUGINS_DIR, f)).isDirectory()
  );

  for (const cat of categories) {
    const catPath = path.join(PLUGINS_DIR, cat);
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const pluginPath = path.join(catPath, file);
        delete require.cache[require.resolve(pluginPath)];
        const plugin = require(pluginPath);
        const list = Array.isArray(plugin) ? plugin : [plugin];
        for (const p of list) {
          if (p.command) {
            const entry = { ...p, category: p.category || cat };
            const cmds = Array.isArray(p.command) ? p.command : [p.command];
            const aliases = Array.isArray(p.aliases) ? p.aliases : (p.aliases ? [p.aliases] : []);
            for (const cmd of [...cmds, ...aliases]) {
              plugins.set(cmd.toLowerCase(), entry);
            }
          }
        }
      } catch (e) {
        console.error(chalk.red(`[PLUGIN] Failed to load ${file}:`), e.message);
      }
    }
  }

  console.log(chalk.green(`[DEVINE] ✅ Loaded ${plugins.size} commands from plugins`));
};

const getPluginsMap  = () => plugins;
const getPluginCount = () => plugins.size;

const watchPlugins = () => {
  fs.watch(PLUGINS_DIR, { recursive: true }, (event, filename) => {
    if (filename && filename.endsWith('.js')) {
      console.log(chalk.yellow(`[DEVINE] 🔄 Plugin changed: ${filename} — reloading...`));
      loadPlugins();
    }
  });
};

const buildMenu = (prefix) => {
  getConfig();
  
  const CATEGORY_LABELS = {
    abysscommands:    'ABYSS COMMANDS',
    darkprotection:   'DARK PROTECTION',
    voidsystem:       'VOID SYSTEM',
    soultools:        'SOUL TOOLS',
    forbiddenarts:    'FORBIDDEN ARTS',
    darkintelligence: 'DARK INTELLIGENCE',
    groupanalytics:   'GROUP ANALYTICS',
    arena:            'ARENA',
    shadowutilities:  'SHADOW UTILITIES',
    verdict:          'VERDICT',
    darkweb:          'DARKWEB',
    shadowgames:      'SHADOW GAMES',
    shadowstrike:     'SHADOW STRIKE',
    creativetools:    'CREATIVE TOOLS',
    darkcraft:        'DARK CRAFT',
  };

  const CATEGORY_ORDER = [
    'abysscommands',
    'darkprotection',
    'voidsystem',
    'soultools',
    'forbiddenarts',
    'darkintelligence',
    'groupanalytics',
    'arena',
    'shadowutilities',
    'verdict',
    'darkweb',
    'shadowgames',
    'shadowstrike',
    'creativetools',
    'darkcraft',
  ];

  const categoryMap = new Map();
  const seenPlugin = new Set();

  for (const [, p] of plugins) {
    const identity = p.command + '::' + (p.category || 'soultools');
    if (seenPlugin.has(identity)) continue;
    seenPlugin.add(identity);
    const primary = Array.isArray(p.command) ? p.command[0] : p.command;
    const cat = p.category || 'soultools';
    if (!CATEGORY_ORDER.includes(cat)) continue;
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat).push(primary);
  }

  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const runtimeStr = h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;

  // ── Header 
  let menu = `╔═════════════════════么\n`;
  menu += `║ 闇┏━━▣〔 𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗 〕\n`;
  menu += `║ 闇┃ 𝚄𝚂𝙴𝚁𝙽𝙰𝙼𝙴: {USERNAME}\n`;
  menu += `║ 闇┃ 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂: 𝟏𝟎𝟎𝟎+\n`;
  menu += `║ 闇┃ 𝙿𝚁𝙴𝙵𝙸𝚇: ${prefix}\n`;
  menu += `║ 闇┃ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴: ${runtimeStr}\n`;
  menu += `║ 闇┃ 𝙳𝙴𝚅: 𝗟𝗼𝗿𝗱 𝙳𝙴𝚅𝙸𝙽𝙴\n`;
  menu += `║ 闇┗━━━━━━━━━━━━━━▣\n`;
  menu += `┗━━━━━━━━━━━━━━━━━━━━━━\n`;

  for (const catKey of CATEGORY_ORDER) {
    const cmds = categoryMap.get(catKey);
    if (!cmds || cmds.length === 0) continue;
    const catLabel = applyFont(CATEGORY_LABELS[catKey], 'sansbold');
    menu += `┏━━▣〔 ${catLabel} 〕\n`;
    for (const cmd of cmds.sort()) {
      const cmdTitle = cmd.charAt(0).toUpperCase() + cmd.slice(1).toLowerCase();
      menu += `┃ 闇 ${applyFont(cmdTitle, 'mono')}\n`;
    }
    menu += `┗━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  }

  return menu.trimEnd();
};

const reply = async (sock, msg, text, extra = {}) => {
  const chatId = msg.key.remoteJid;
  return sock.sendMessage(chatId, { text, ...extra }, { quoted: msg });
};

if (!global.presenceCache) global.presenceCache = {};
if (!global.afkStore) global.afkStore = {};
if (!global.activeBets) global.activeBets = {};
if (!global.kickAllRunning) global.kickAllRunning = {};
if (!global.kickAllCancel) global.kickAllCancel = {};

module.exports = (sock, ownerNumber) => {
  const _on = String(ownerNumber || '').replace(/\D/g, '');
  const MSG_CACHE_FILE   = path.join(__dirname, '..', 'database', `msg-cache-${_on}.json`);
  const MSG_CACHE_LIMIT  = 300;
  const MSG_CACHE_EXPIRY = 60 * 60 * 1000;

  const messageCache = (() => {
    const m = new Map();
    try {
      if (fs.existsSync(MSG_CACHE_FILE)) {
        const raw = JSON.parse(fs.readFileSync(MSG_CACHE_FILE, 'utf8'));
        const now = Date.now();
        for (const [k, v] of Object.entries(raw)) {
          if (v && (now - v.cachedAt) < MSG_CACHE_EXPIRY) m.set(k, v);
        }
      }
    } catch (_) {}
    return m;
  })();

  const chatMsgIndex = new Map();
  for (const [msgId, entry] of messageCache) {
    const cid = entry.chatId || '';
    if (!cid) continue;
    if (!chatMsgIndex.has(cid)) chatMsgIndex.set(cid, []);
    chatMsgIndex.get(cid).push(msgId);
  }

  const _persistCache = () => {
    try {
      const obj = {};
      for (const [k, v] of messageCache) obj[k] = v;
      fs.writeFileSync(MSG_CACHE_FILE, JSON.stringify(obj), 'utf8');
    } catch (_) {}
  };

  const cacheMessage = (id, data) => {
    if (messageCache.size >= MSG_CACHE_LIMIT) {
      const oldest = messageCache.keys().next().value;
      messageCache.delete(oldest);
    }
    const entry = { ...data, cachedAt: Date.now() };
    messageCache.set(id, entry);
    const cid = data.chatId || '';
    if (cid) {
      if (!chatMsgIndex.has(cid)) chatMsgIndex.set(cid, []);
      const ids = chatMsgIndex.get(cid);
      ids.push(id);
      if (ids.length > 50) ids.shift();
    }
    _persistCache();
  };

  const getCachedMessage = (id) => {
    const c = messageCache.get(id);
    if (c && Date.now() - c.cachedAt < MSG_CACHE_EXPIRY) return c;
    if (c) messageCache.delete(id);
    return null;
  };

  const getCachedMessageByChat = (chatId, senderJid = null) => {
    const ids = chatMsgIndex.get(chatId) || [];
    const now = Date.now();
    const numOf = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '').replace(/^0+/, '');
    if (senderJid) {
      const senderNum = numOf(senderJid);
      for (let i = ids.length - 1; i >= 0; i--) {
        const entry = messageCache.get(ids[i]);
        if (!entry) continue;
        if ((now - entry.cachedAt) >= MSG_CACHE_EXPIRY) continue;
        const entryNum = numOf(entry.sender);
        const lidLike = (n) => n.length > 13;
        if (senderNum && entryNum && senderNum !== entryNum && !lidLike(senderNum) && !lidLike(entryNum)) continue;
        return entry;
      }
    }
    for (let i = ids.length - 1; i >= 0; i--) {
      const entry = messageCache.get(ids[i]);
      if (!entry) continue;
      if ((now - entry.cachedAt) >= MSG_CACHE_EXPIRY) continue;
      return entry;
    }
    return null;
  };

  setInterval(() => {
    const now = Date.now();
    let changed = false;
    for (const [k, v] of messageCache) {
      if (now - v.cachedAt >= MSG_CACHE_EXPIRY) { messageCache.delete(k); changed = true; }
    }
    if (changed) _persistCache();
  }, 5 * 60 * 1000);

  const processedMessages = new Set();
  const withInst = (fn) => async (...a) => cfgLib.runWithInstance(_on, () => fn(...a));

  loadPlugins();
  if (!global._crittixWatchStarted) {
    global._crittixWatchStarted = true;
    watchPlugins();
  }

  //arena helper
  const arena        = require('./lib/arena');
  const arenaHandler = require('./lib/arena-handler');
  const _tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(_tmpDir)) { try { fs.mkdirSync(_tmpDir, { recursive: true }); } catch (_) {} }

  const cfg = getConfig();

  sock.ev.on('presence.update', ({ id, presences }) => {
    try {
      if (!global.presenceCache[id]) global.presenceCache[id] = {};
      Object.entries(presences).forEach(([jid, p]) => {
        global.presenceCache[id][jid] = {
          lastKnownPresence: p.lastKnownPresence,
          lastSeen: p.lastSeen || null,
          updatedAt: Date.now()
        };
      });
    } catch (e) {}
  });

  //Anti-call
  sock.ev.on('call', withInst(async (calls) => {
    const cfg = getConfig();
    const _loadCallDb = (f) => {
      try {
        const p = require('path').join(process.cwd(), 'database', f);
        return require('fs-extra').existsSync(p) ? JSON.parse(require('fs-extra').readFileSync(p, 'utf8')) : {};
      } catch { return {}; }
    };
    const vcDb  = _loadCallDb('antivoicecall.json');
    const vidDb = _loadCallDb('antivideocall.json');

    for (const call of calls) {
      if (call.status !== 'offer') continue;
      const blockVoice = cfg.ANTICALL || !!vcDb['global'];
      const blockVideo = cfg.ANTICALL || !!vidDb['global'];
      const shouldBlock = call.isVideo ? blockVideo : blockVoice;
      if (!shouldBlock) continue;

      try { await sock.rejectCall(call.id, call.from); } catch {}
      const callType = call.isVideo ? 'ᴠɪᴅᴇᴏ' : 'ᴠᴏɪᴄᴇ';
      await sock.sendMessage(call.from, {
        text: helpers.toBoldItalic(`${callType} calls are not allowed. Your call was rejected.`)
      }).catch(() => {});
    }
  }));

  //Group events (welcome, goodbye, antiraid, antipromote, antidemote)
  sock.ev.on('group-participants.update', withInst(async ({ id, participants, action, author }) => {
    try {
      const cfg = getConfig();

      const participantJids = (participants || []).map(p =>
        typeof p === 'string' ? p : (p?.id || p?.jid || String(p))
      ).filter(Boolean);

      if (action === 'add') {
        await handleAntiRaid(sock, id, participantJids);

        const welcomeCfg = db.getWelcome(id);
        if (welcomeCfg.enabled) {
          try {
            const groupMeta = await Promise.race([
              sock.groupMetadata(id),
              new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
            ]);
            for (const participant of participantJids) {
              const ppUrl = await sock.profilePictureUrl(participant, 'image').catch(() => null);
              const greeting = welcomeCfg.greeting || 'Welcome, hope you enjoy your stay here';
              const welcomeMsg = `╭─────── ⛧ WELCOME ⛧ ───────╮\n│ ➜ @${participant.split('@')[0]}\n│ ➜ joined ${groupMeta.subject}\n│ ➜ members: ${groupMeta.participants.length}\n│ ➜ ${greeting}\n╰─────────────────────────────╯`;
              if (ppUrl) {
                await sock.sendMessage(id, { image: { url: ppUrl }, caption: welcomeMsg, mentions: [participant] });
              } else {
                await sock.sendMessage(id, { text: welcomeMsg, mentions: [participant] });
              }
            }
          } catch (e) { console.error('[WELCOME] Error:', e.message); }
        }
      }

      if (action === 'remove') {
        const goodbyeCfg = db.getGoodbye(id);
        if (goodbyeCfg.enabled) {
          try {
            const groupMeta = await sock.groupMetadata(id);
            for (const participant of participantJids) {
              const ppUrl = await sock.profilePictureUrl(participant, 'image').catch(() => null);
              const greeting = goodbyeCfg.greeting || 'Hope they had a good time here';
              const msg = `╭─────── ⛧ GOODBYE ⛧ ───────╮\n│ ➜ @${participant.split('@')[0]}\n│ ➜ left ${groupMeta.subject}\n│ ➜ members: ${groupMeta.participants.length}\n│ ➜ ${greeting}\n╰─────────────────────────────╯`;
              if (ppUrl) {
                await sock.sendMessage(id, { image: { url: ppUrl }, caption: msg, mentions: [participant] });
              } else {
                await sock.sendMessage(id, { text: msg, mentions: [participant] });
              }
            }
          } catch (e) { console.error('[GOODBYE] Error:', e.message); }
        }
      }

      const authorJid = typeof author === 'string' ? author : (Array.isArray(author) ? author[0] : String(author || ''));
      
      if (action === 'promote' && authorJid && !isOwner(authorJid) && !isSudo(authorJid)) {
        for (const pJid of participantJids) {
          if (!pJid || isOwner(pJid) || isSudo(pJid)) continue;
          await handleAntiPromote(sock, id, authorJid, pJid).catch((e) => console.error(chalk.red('[ANTIPROMOTE] error:'), e.message));
        }
      }

      if (action === 'demote' && authorJid && !isOwner(authorJid) && !isSudo(authorJid)) {
        for (const pJid of participantJids) {
          if (!pJid || isOwner(pJid) || isSudo(pJid)) continue;
          await handleAntiDemote(sock, id, authorJid, pJid).catch((e) => console.error(chalk.red('[ANTIDEMOTE] error:'), e.message));
        }
      }
    } catch (e) {
      console.error(chalk.red('[GROUP EVENT] Error:'), e.message);
    }
  }));

  //Anti-delete
  const handleDeletedMsg = async (keyId, chatId, deleterJid = null) => {
    const cfg = getConfig();
    try {
      const _snipeStore = require('./lib/snipe-store');
      const _cached = getCachedMessage(keyId);
      if (_cached && chatId.endsWith('@g.us')) {
        _snipeStore.storeSnipe(chatId, {
          sender:      _cached.sender || null,
          senderName:  _cached.pushName || (_cached.sender ? _cached.sender.split('@')[0] : '?'),
          deleter:     deleterJid || _cached.sender || null,
          text:        _cached.text || null,
          msgType:     _cached.rawMessage ? Object.keys(_cached.rawMessage)[0] : 'unknown',
        });
      }
    } catch(_) {}
    console.log(chalk.yellow(`[ANTIDELETE] Delete event — id: ${keyId} | ANTI_DELETE: ${cfg.ANTI_DELETE}`));
    if (!cfg.ANTI_DELETE) return;
    try {
      const ownerJid = cfg.OWNER_NUMBER + '@s.whatsapp.net';
      const cached = getCachedMessage(keyId);
      console.log(chalk.yellow(`[ANTIDELETE] Cache lookup: ${cached ? 'FOUND' : 'NOT FOUND'}`));

      if (!cached) {
        const deleterNum = deleterJid ? deleterJid.split('@')[0] : null;
        let chatDisplay = chatId.split('@')[0];
        if (chatId.endsWith('@g.us')) {
          try { chatDisplay = (await sock.groupMetadata(chatId))?.subject || chatId.split('@')[0]; } catch (_) {}
        }
        const noCache = deleterNum
          ? `🗑️ *DELETED MESSAGE*\n\n👤 Deleted by: @${deleterNum}\n📍 Chat: ${chatDisplay}\n⚠️ Content unavailable (sent before bot started)`
          : `🗑️ *DELETED MESSAGE*\n\n📍 Chat: ${chatDisplay}\n⚠️ Content unavailable (sent before bot started)`;
        await sock.sendMessage(ownerJid, { text: noCache }).catch(() => {});
        return;
      }

      const senderNum  = cached.sender?.split('@')[0] || '?';
      const senderName = cached.pushName || senderNum;
      const deleterNum = deleterJid ? deleterJid.split('@')[0] : senderNum;
      const chatName   = cached.groupName || chatId.split('@')[0];
      const isGroup    = chatId.endsWith('@g.us');
      const timestamp  = new Date().toLocaleString();
      const mentions   = cached.sender ? [cached.sender] : [];

      const header = [
        '╔═══════════════════════════════════════════╗',
        '║ 🗑️ 𝐃𝐄𝐋𝐄𝐓𝐄𝐃 𝐌𝐄𝐒𝐒𝐀𝐆𝐄 🗑️',
        '╚═══════════════════════════════════════════╝',
        '',
        `👤 ғʀᴏᴍ: ${senderName} (@${senderNum})`,
        isGroup ? `📍 ɢʀᴏᴜᴘ: ${chatName}` : `💬 ᴅᴍ: ${senderNum}`,
        `🗑 ᴅᴇʟᴇᴛᴇᴅ ʙʏ: @${deleterNum}`,
        `🕐 ᴛɪᴍᴇ: ${timestamp}`,
        '',
        '╰────────────────────────────────────────╯'
      ].join('\n');

      const rawMsg = cached.rawMessage;
      const msgText = cached.text || '';

      const voInner = rawMsg?.viewOnceMessageV2?.message || rawMsg?.viewOnceMessage?.message;
      const effectiveRaw = voInner || rawMsg;
      const isViewOnce = !!voInner;

      const imgMsg   = effectiveRaw?.imageMessage;
      const vidMsg   = effectiveRaw?.videoMessage;
      const audMsg   = effectiveRaw?.audioMessage;
      const stickMsg = effectiveRaw?.stickerMessage;

      let mediaBuffer = null;
      let mediaType   = null;

      if (imgMsg || vidMsg || audMsg) {
        try {
          let stream;
          if (imgMsg)      { stream = await downloadContentFromMessage(imgMsg,   'image');  mediaType = imgMsg   ? 'image'  : null; }
          else if (vidMsg) { stream = await downloadContentFromMessage(vidMsg,   'video');  mediaType = 'video'; }
          else if (audMsg) { stream = await downloadContentFromMessage(audMsg,   'audio');  mediaType = 'audio'; }
          if (stream) {
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            if (buf.length > 0) mediaBuffer = buf;
          }
        } catch (dlErr) {
          console.error('[ANTIDELETE] Media download failed:', dlErr.message);
        }
      } else if (stickMsg) {
        try {
          const stream = await downloadContentFromMessage(stickMsg, 'sticker');
          let buf = Buffer.from([]);
          for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
          if (buf.length > 0) { mediaBuffer = buf; mediaType = 'sticker'; }
        } catch (dlErr) {
          console.error('[ANTIDELETE] Sticker download failed:', dlErr.message);
        }
      }

      console.log(chalk.yellow(`[ANTIDELETE] Forwarding — type: ${mediaType || (msgText ? 'text' : 'unknown')} | voUnwrapped: ${isViewOnce}`));

      if (mediaBuffer && mediaType === 'image') {
        const cap = header + (isViewOnce ? '\n📎 ᴠɪᴇᴡ ᴏɴᴄᴇ ɪᴍᴀɢᴇ' : (msgText ? `\n💬 ᴄᴀᴘᴛɪᴏɴ: ${msgText}` : ''));
        await sock.sendMessage(ownerJid, { image: mediaBuffer, caption: cap, mentions });
      } else if (mediaBuffer && mediaType === 'video') {
        const cap = header + (isViewOnce ? '\n📎 ᴠɪᴇᴡ ᴏɴᴄᴇ ᴠɪᴅᴇᴏ' : (msgText ? `\n💬 ᴄᴀᴘᴛɪᴏɴ: ${msgText}` : ''));
        await sock.sendMessage(ownerJid, { video: mediaBuffer, caption: cap, mentions });
      } else if (mediaBuffer && mediaType === 'audio') {
        await sock.sendMessage(ownerJid, { text: header + (isViewOnce ? '\n📎 ᴠɪᴇᴡ ᴏɴᴄᴇ ᴀᴜᴅɪᴏ' : ''), mentions });
        await sock.sendMessage(ownerJid, { audio: mediaBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true });
      } else if (mediaBuffer && mediaType === 'sticker') {
        await sock.sendMessage(ownerJid, { text: header, mentions });
        await sock.sendMessage(ownerJid, { sticker: mediaBuffer });
      } else if (imgMsg || vidMsg || audMsg || stickMsg) {
        await sock.sendMessage(ownerJid, { text: header + '\n📎 ᴍᴇᴅɪᴀ (ᴇxᴘɪʀᴇᴅ ᴏʀ ᴜɴᴀᴠᴀɪʟᴀʙʟᴇ)', mentions });
      } else if (msgText) {
        await sock.sendMessage(ownerJid, { text: header + `\n\n💬 ᴍᴇssᴀɢᴇ: ${msgText}`, mentions });
      } else {
        const msgType = Object.keys(rawMsg || {})[0] || 'unknown';
        await sock.sendMessage(ownerJid, { text: header + `\n📎 ᴛʏᴘᴇ: ${msgType}`, mentions });
      }

    } catch (e) { console.error('[ANTIDELETE]', e.message); }
  };

  const _EDIT_LABEL_CANDIDATES = ['Message Edit', 'Edit Message', 'Secret Edit', 'Message Edit Response'];

  const _hmacSign = (data, key) => crypto.createHmac('sha256', key).update(data).digest();

  const _aesDecryptGCM = (ciphertext, key, iv, aad) => {
    const buf = Buffer.isBuffer(ciphertext) ? ciphertext : Buffer.from(ciphertext);
    const authTag = buf.subarray(buf.length - 16);
    const data = buf.subarray(0, buf.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    if (aad) decipher.setAAD(Buffer.isBuffer(aad) ? aad : Buffer.from(aad));
    return Buffer.concat([decipher.update(data), decipher.final()]);
  };

  const decryptSecretEditMessage = ({ encPayload, encIv }, { targetMsgId, creatorJid, editorJid, messageSecret }) => {
    const encPayloadBuf = Buffer.isBuffer(encPayload) ? encPayload : Buffer.from(encPayload);
    const encIvBuf      = Buffer.isBuffer(encIv) ? encIv : Buffer.from(encIv);
    const secretBuf      = Buffer.isBuffer(messageSecret) ? messageSecret : Buffer.from(messageSecret);
    const aad = Buffer.from(`${targetMsgId}\u0000${editorJid}`);

    let lastErr = null;
    for (const label of _EDIT_LABEL_CANDIDATES) {
      try {
        const sign = Buffer.concat([
          Buffer.from(targetMsgId),
          Buffer.from(creatorJid),
          Buffer.from(editorJid),
          Buffer.from(label),
          Buffer.from([1])
        ]);
        const key0 = _hmacSign(secretBuf, new Uint8Array(32));
        const decKey = _hmacSign(sign, key0);
        const decrypted = _aesDecryptGCM(encPayloadBuf, decKey, encIvBuf, aad);
        console.log(chalk.green(`[ANTIEDIT] Decrypted new content (label: "${label}")`));
        return { decrypted, labelUsed: label };
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('All label candidates failed');
  };

  const handleEditedMsg = async (originalKeyId, chatId, editorJid, editedMessageContent) => {
    const cfg = getConfig();
    if (!cfg.ANTI_EDIT) return;
    try {
      const ownerJid = cfg.OWNER_NUMBER + '@s.whatsapp.net';
      const editorNumOnly = (editorJid || '').split('@')[0].split(':')[0];
      if (editorNumOnly && editorNumOnly === String(cfg.OWNER_NUMBER).replace(/\D/g, '')) {
        return;
      }

      const cached = getCachedMessage(originalKeyId);

      const newText = editedMessageContent?.conversation ||
        editedMessageContent?.extendedTextMessage?.text ||
        editedMessageContent?.imageMessage?.caption ||
        editedMessageContent?.videoMessage?.caption || '';

      const editorNum = editorJid ? editorJid.split('@')[0] : (cached?.sender?.split('@')[0] || '?');
      let chatDisplay = chatId.split('@')[0];
      const isGroup = chatId.endsWith('@g.us');
      if (isGroup) {
        try { chatDisplay = (await sock.groupMetadata(chatId))?.subject || chatDisplay; } catch (_) {}
      }
      const timestamp = new Date().toLocaleString();
      const mentions = editorJid ? [editorJid] : (cached?.sender ? [cached.sender] : []);

      if (!cached) {
        const noCache =
          `✏️ *EDITED MESSAGE*\n\n` +
          `👤 Edited by: @${editorNum}\n` +
          (isGroup ? `📍 Chat: ${chatDisplay}\n` : `💬 DM: ${chatDisplay}\n`) +
          `🕐 Time: ${timestamp}\n\n` +
          `📝 Edited to:\n${newText || '🔒 (encrypted — could not decrypt new content)'}\n\n` +
          `⚠️ Original content unavailable (sent before bot started, or expired from cache)`;
        await sock.sendMessage(ownerJid, { text: noCache, mentions }).catch(() => {});
        return;
      }

      const senderNum  = cached.sender?.split('@')[0] || editorNum;
      const senderName = cached.pushName || senderNum;
      const originalText = cached.text || '(no text — original may have been media)';

      const header = [
        '╔═══════════════════════════════════════════╗',
        '║ ✏️ 𝐄𝐃𝐈𝐓𝐄𝐃 𝐌𝐄𝐒𝐒𝐀𝐆𝐄 ✏️',
        '╚═══════════════════════════════════════════╝',
        '',
        `👤 ғʀᴏᴍ: ${senderName} (@${senderNum})`,
        isGroup ? `📍 ɢʀᴏᴜᴘ: ${chatDisplay}` : `💬 ᴅᴍ: ${senderNum}`,
        `🕐 ᴛɪᴍᴇ: ${timestamp}`,
        '',
        '📝 ᴇᴅɪᴛᴇᴅ ᴛᴏ:',
        newText || '🔒 (encrypted — could not decrypt new content)',
        '',
        '╭─────────────────────────────────────────╮',
        '📜 ᴏʀɪɢɪɴᴀʟ ᴍᴇssᴀɢᴇ:',
        originalText,
        '╰─────────────────────────────────────────╯'
      ].join('\n');

      await sock.sendMessage(ownerJid, { text: header, mentions });
    } catch (e) { console.error('[ANTIEDIT]', e.message); }
  };

  const handleSecretEditMessage = async (sem, targetKey, chatId, editorJid) => {
    const cfg = getConfig();
    if (!cfg.ANTI_EDIT) return;
    const cached = getCachedMessage(targetKey.id);

    if (!cached) {
      await handleEditedMsg(targetKey.id, chatId, editorJid, null);
      return;
    }

    const messageSecret = cached.rawMessage?.messageContextInfo?.messageSecret;
    if (!messageSecret) {
      await handleEditedMsg(targetKey.id, chatId, editorJid, null);
      return;
    }

    try {
      const creatorJid = cached.sender || chatId;
      const { decrypted } = decryptSecretEditMessage(
        { encPayload: sem.encPayload, encIv: sem.encIv },
        { targetMsgId: targetKey.id, creatorJid, editorJid, messageSecret }
      );

      let decodedMessage;
      try {
        decodedMessage = proto.Message.decode(decrypted);
      } catch (decodeErr) {
        if (process.env.CRITTIX_DEBUG === '1') {
          console.log(chalk.yellow(`[ANTIEDIT] Decrypted but decode failed: ${decodeErr.message}`));
          console.log(chalk.gray(decrypted.toString('hex')));
        }
        await handleEditedMsg(targetKey.id, chatId, editorJid, null);
        return;
      }

      await handleEditedMsg(targetKey.id, chatId, editorJid, decodedMessage);
    } catch (e) {
      await handleEditedMsg(targetKey.id, chatId, editorJid, null);
    }
  };

  const handleDeletedMsgByChat = async (chatId, deleterJid = null) => {
    const cfg = getConfig();
    if (!cfg.ANTI_DELETE) return;
    try {
      const ownerJid  = cfg.OWNER_NUMBER + '@s.whatsapp.net';
      const cached = getCachedMessageByChat(chatId, deleterJid);
      console.log(chalk.yellow(`[ANTIDELETE-LID] Chat lookup: ${cached ? 'FOUND' : 'NOT FOUND'} | chat: ${chatId}`));
      if (!cached) {
        let chatDisplay = chatId.split('@')[0];
        if (chatId.endsWith('@g.us')) {
          try { chatDisplay = (await sock.groupMetadata(chatId))?.subject || chatDisplay; } catch (_) {}
        }
        const deleterNum = deleterJid ? deleterJid.split('@')[0] : null;
        const msg = deleterNum
          ? `🗑️ *DELETED MESSAGE*\n\n👤 Deleted by: @${deleterNum}\n📍 Chat: ${chatDisplay}\n⚠️ Content unavailable (LID mode — ID not matched)`
          : `🗑️ *DELETED MESSAGE*\n\n📍 Chat: ${chatDisplay}\n⚠️ Content unavailable (LID mode — ID not matched)`;
        await sock.sendMessage(ownerJid, { text: msg }).catch(() => {});
        return;
      }
      const fakeId = '__lid_fallback__';
      messageCache.set(fakeId, cached);
      await handleDeletedMsg(fakeId, chatId, deleterJid);
      messageCache.delete(fakeId);
    } catch (e) { console.error('[ANTIDELETE-LID]', e.message); }
  };

  sock.ev.on('messages.update', withInst(async (updates) => {
    for (const update of updates) {
      try {
        const protoMsg = update.update?.message?.protocolMessage || update.update?.protocolMessage;
        const isProtoRevoke = protoMsg?.type === 0 && protoMsg?.key;
        const isStubRevoke = update.update?.messageStubType === 1 && update.update?.key?.id;

        if (isProtoRevoke) {
          const deleter1 = update.key.participant || update.update?.participant || null;
          await handleDeletedMsg(protoMsg.key.id, update.key.remoteJid, deleter1);
        } else if (isStubRevoke) {
          const stubParams = update.update?.messageStubParameters;
          const targetId   = stubParams?.[0] || null;
          const chatId2    = update.key.remoteJid;
          const deleter2   = update.update?.key?.participantAlt ||
                             update.key.participant ||
                             update.update?.participant || null;

          if (targetId) {
            await handleDeletedMsg(targetId, chatId2, deleter2);
          } else {
            await handleDeletedMsgByChat(chatId2, deleter2);
          }
        }
      } catch (e) { console.error('[REVOKE ERR]', e.message); }
    }
  }));

  sock.ev.on('messages.delete', withInst(async (item) => {
    if ('keys' in item) {
      for (const key of item.keys) {
        await handleDeletedMsg(key.id, key.remoteJid, key.participant || null);
      }
    }
  }));

  const botSentIds = new Set();
  const _origSend = sock.sendMessage.bind(sock);
  sock._crittixRawSend = _origSend;
  sock.sendMessage = async (...args) => {
    const result = await _origSend(...args);
    if (result?.key?.id) {
      botSentIds.add(result.key.id);
      if (botSentIds.size > 500) botSentIds.delete(botSentIds.values().next().value);
    }
    return result;
  };

  //Main message handler
  sock.ev.on('messages.upsert', withInst(async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        if (!msg.message) continue;
        const _editorJid = msg.key.fromMe
          ? (sock.authState?.creds?.me?.id || '').replace(/:\d+@/, '@')
          : (msg.key.participant || msg.participant || msg.key.remoteJid || null);

        if (msg.message.protocolMessage) {
          const pm = msg.message.protocolMessage;
          if (pm.type === proto.Message.ProtocolMessage.Type.MESSAGE_EDIT && pm.key?.id) {
            handleEditedMsg(pm.key.id, msg.key.remoteJid, _editorJid, pm.editedMessage).catch(e =>
              console.error('[ANTIEDIT]', e.message)
            );
          }
          continue;
        }
        if (msg.message.secretEncryptedMessage) {
          const sem = msg.message.secretEncryptedMessage;
          const targetKey = sem.targetMessageKey;
          if (targetKey?.id) {
            console.log(chalk.magenta(`[ANTIEDIT] Edit detected (target: ${targetKey.id})`));
            handleSecretEditMessage(sem, targetKey, msg.key.remoteJid, _editorJid).catch(e =>
              console.error('[ANTIEDIT]', e.message)
            );
          }
          continue;
        }
        const _firstKey = Object.keys(msg.message)[0];
        if (
          _firstKey === 'retryRequestMessage' ||
          _firstKey === 'peerDataOperationRequestMessage'
        ) continue;
        // NOTE: senderKeyDistributionMessage is intentionally NOT filtered here.
        // Group messages frequently carry it bundled alongside the real
        // conversation/extendedTextMessage content (e.g. right after a
        // restart, before a fresh session is established with that group).
        // Dropping on its presence killed real commands outright. The
        // hasContent check right below already correctly drops messages
        // where senderKeyDistributionMessage is truly the ONLY key.

        const _msgType = Object.keys(msg.message)[0];
        const _isStatusMentionType =
          !!msg.message.statusMentionMessage ||
          !!msg.message.groupStatusMentionMessage;

        const _hasContent =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage ||
          msg.message.videoMessage ||
          msg.message.audioMessage ||
          msg.message.stickerMessage ||
          msg.message.documentMessage ||
          msg.message.buttonsResponseMessage ||
          msg.message.interactiveResponseMessage ||
          msg.message.reactionMessage ||
          msg.message.contactMessage ||
          msg.message.contactsArrayMessage ||
          msg.message.locationMessage ||
          msg.message.liveLocationMessage ||
          msg.message.viewOnceMessageV2 ||
          msg.message.viewOnceMessage ||
          msg.message.viewOnceMessageV2Extension ||
          msg.message.pollCreationMessage ||
          msg.message.pollCreationMessageV2 ||
          msg.message.pollCreationMessageV3 ||
          msg.message.editedMessage ||
          _isStatusMentionType;
        if (!_hasContent) continue;

        // Skip echoes 
        if (msg.key.id && botSentIds.has(msg.key.id)) continue;
        if (msg.key.id && processedMessages.has(msg.key.id)) continue;
        if (msg.key.id) {
          processedMessages.add(msg.key.id);
          if (processedMessages.size > 1000) {
            const first = processedMessages.values().next().value;
            processedMessages.delete(first);
          }
        }

        const chatId = msg.key.remoteJid;
        if (!chatId) continue;


        const isGroupMsg = chatId.endsWith('@g.us');
        const isChannelMsg = chatId.endsWith('@newsletter');
        let sender = isGroupMsg
          ? (msg.key.participant || msg.message?.extendedTextMessage?.contextInfo?.participant || '')
          : (msg.key.fromMe
              ? (sock.authState?.creds?.me?.id || '').replace(/:\d+@/, '@')
              : msg.key.remoteJid);
        if (isGroupMsg && sender && sender.endsWith('@lid')) {
          try {
            const _meta = await sock.groupMetadata(chatId);
            const _cleanSender = sender.replace(/:\d+@/, '@');
            const _match = _meta.participants.find(p => {
              const _cleanId  = (p.id  || '').replace(/:\d+@/, '@');
              const _cleanLid = (p.lid || '').replace(/:\d+@/, '@');
              return _cleanId === _cleanSender || _cleanLid === _cleanSender;
            });
            if (_match) {
              if (_match.phoneNumber) {
                sender = _match.phoneNumber.replace(/:\d+@/, '@');
              } else if (_match.id && !_match.id.endsWith('@lid')) {
                sender = _match.id.replace(/:\d+@/, '@');
              }
            }
          } catch (_) {}
        }
        if (!isGroupMsg && sender && sender.endsWith('@lid')) {
          sender = sender.replace('@lid', '@s.whatsapp.net');
        }

        const senderNumber = sender?.split('@')[0] || '';
        const cfg = getConfig();


        {
          let groupName = null;
          if (isGroupMsg) {
            try { groupName = (await sock.groupMetadata(chatId))?.subject; } catch (_) {}
          }
          const msgText = msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption || '';

          const cacheEntry = {
            rawMessage: msg.message,  
            text: msgText,
            sender,
            chatId,
            groupName,
            pushName: msg.pushName || senderNumber,
            timestamp: msg.messageTimestamp || Date.now()
          };

          cacheMessage(msg.key.id, cacheEntry);
        }

        if (cfg.ANTIONCEVIEW) {
          try {
            const isIncomingVO =
              msg.message?.viewOnceMessageV2 ||
              msg.message?.viewOnceMessage ||
              msg.message?.viewOnceMessageV2Extension ||
              msg.message?.imageMessage?.viewOnce ||
              msg.message?.videoMessage?.viewOnce ||
              msg.message?.audioMessage?.viewOnce;
              
            const ctx2 =
              msg.message?.extendedTextMessage?.contextInfo ||
              msg.message?.imageMessage?.contextInfo ||
              msg.message?.videoMessage?.contextInfo ||
              msg.message?.audioMessage?.contextInfo ||
              msg.message?.stickerMessage?.contextInfo ||
              msg.message?.buttonsResponseMessage?.contextInfo ||
              msg.message?.buttonsMessage?.contextInfo;

            const quotedMsg = ctx2?.quotedMessage;
            const isQuotedVO = quotedMsg && (
              quotedMsg.viewOnceMessageV2 ||
              quotedMsg.viewOnceMessage ||
              quotedMsg.viewOnceMessageV2Extension ||
              quotedMsg.imageMessage?.viewOnce ||
              quotedMsg.videoMessage?.viewOnce ||
              quotedMsg.audioMessage?.viewOnce
            );

            const voSource = isIncomingVO ? msg.message : (isQuotedVO ? quotedMsg : null);

            if (voSource) {
              const voV2Msg = voSource.viewOnceMessageV2?.message || voSource.viewOnceMessage?.message;
              const voV2Ext = voSource.viewOnceMessageV2Extension?.message;

              const voImg = voV2Msg?.imageMessage || voV2Ext?.imageMessage ||
                (voSource.imageMessage?.viewOnce ? voSource.imageMessage : null);
              const voVid = voV2Msg?.videoMessage || voV2Ext?.videoMessage ||
                (voSource.videoMessage?.viewOnce ? voSource.videoMessage : null);
              const voAud = voV2Msg?.audioMessage || voV2Ext?.audioMessage ||
                (voSource.audioMessage?.viewOnce ? voSource.audioMessage : null);

              if (voImg || voVid || voAud) {
                const ownerJid = cfg.OWNER_NUMBER + '@s.whatsapp.net';
                const voSender = ctx2?.participant || ctx2?.remoteJid || sender || '';
                if (voSender && voSender.includes(cfg.OWNER_NUMBER)) {
                } else {
                  try {
                    let buf = Buffer.from([]);
                    let stream;
                    if (voImg) stream = await downloadContentFromMessage(voImg, 'image');
                    else if (voVid) stream = await downloadContentFromMessage(voVid, 'video');
                    else if (voAud) stream = await downloadContentFromMessage(voAud, 'audio');
                    if (stream) {
                      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                    }
                    if (buf.length > 0) {
                      const chatName = isGroupMsg
                        ? (await sock.groupMetadata(chatId).catch(() => ({}))).subject || chatId
                        : 'DM';
                      const cap = [
                        '╔═══════════════════════════════════════════╗',
                        '║ 👁️ 𝐕𝐈𝐄𝐖 𝐎𝐍𝐂𝐄 𝐔𝐍𝐕𝐄𝐈𝐋𝐄𝐃 👁️',
                        '╚═══════════════════════════════════════════╝',
                        '',
                        '👤 From: @' + senderNumber,
                        '📍 ' + (isGroupMsg ? 'Group: ' + chatName : 'DM'),
                        '🕐 Time: ' + new Date().toLocaleString(),
                        '',
                        '⚠️ This was a view-once media'
                      ].join('\n');
                      if (voImg) await sock.sendMessage(ownerJid, { image: buf, caption: cap });
                      else if (voVid) await sock.sendMessage(ownerJid, { video: buf, caption: cap });
                      else if (voAud) {
                        await sock.sendMessage(ownerJid, { text: cap });
                        await sock.sendMessage(ownerJid, { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true });
                      }
                    }
                  } catch (voErr) { console.error('[ANTIONCEVIEW ERR]', voErr.message); }
                }
              }
            }
          } catch (voOuterErr) { console.error('[ANTIONCEVIEW OUTER]', voOuterErr.message); }
        }

        //Extract text
        let text = msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption || '';

        // Button response
        if (msg.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
          try {
            const p = JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
            if (p.id) text = p.id;
          } catch (_) {}
        }
        if (msg.message?.buttonsResponseMessage?.selectedButtonId) {
          text = msg.message.buttonsResponseMessage.selectedButtonId;
        }

        //Incoming message logger
        {
          const isOut      = msg.key.fromMe;
          const chatType   = isGroupMsg ? 'GROUP' : 'DM';
          const displayNum = senderNumber || chatId.split('@')[0];
          const msgPreview = text
            ? text.slice(0, 50) + (text.length > 50 ? '…' : '')
            : `<${_msgType}>`;

          //Color palette
          const C = {
            border:    chalk.hex('#9B59B6'),   // purple
            label:     chalk.hex('#00D4FF'),   // cyan
            value:     chalk.hex('#FFD700'),   // gold
            type:      chalk.hex('#FF6B9D'),   // pink  
            arrow:     chalk.hex('#7B2D8B'),   // deep purple
            dimBorder: chalk.hex('#5D2E8C'),   // dim purple
          };

          // resolve group
          let _logGrpName = '';
          if (isGroupMsg) {
            try {
              const _m = await sock.groupMetadata(chatId).catch(() => null);
              _logGrpName = _m?.subject || chatId.split('@')[0].slice(-6);
            } catch (_) { _logGrpName = chatId.split('@')[0].slice(-6); }
          }

          const dirLabel  = isOut ? C.type('[ OUT ]') : C.label('[  IN  ]');
          const now       = new Date();
          const timeStr   = now.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const dayStr    = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

          console.log(C.border('╔━━') + C.dimBorder('━━━━━━━━━━━━━━━━━━━━') + C.border('▣') + ' ' + dirLabel + ' ' + C.border('▣') + C.dimBorder('━━━━━━━━━━━━━━━━━━━━') + C.border('━━╗'));
          console.log(C.border('║ ') + C.label('» Type  : ') + C.type(_msgType)           + (isGroupMsg ? C.label('  » Chat  : ') + C.value(_logGrpName) : ''));
          console.log(C.border('║ ') + C.label('» Time  : ') + C.value(`${dayStr}, ${timeStr}`)  + C.label('  » Mode  : ') + C.value(chatType));
          console.log(C.border('║ ') + C.label('» From  : ') + C.value(displayNum));
          console.log(C.border('║ ') + C.label('» Msg   : ') + C.value(msgPreview));
          console.log(C.border('╚━━') + C.dimBorder('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━') + C.border('━━╝'));
        }

       //game checker
        if (isGroupMsg && text) {
          try {
            const _typerace = require('./plugins/games/typerace');
            if (_typerace.checkAnswer && _typerace.checkAnswer(chatId, sender, senderNumber, text, sock, msg)) return;
          } catch(_) {}
          try {
            const _scramble = require('./plugins/games/scramble');
            if (_scramble.checkAnswer && _scramble.checkAnswer(chatId, sender, senderNumber, text, sock, msg)) return;
          } catch(_) {}
          try {
            const _fastest = require('./plugins/games/fastest');
            if (_fastest.checkAnswer && _fastest.checkAnswer(chatId, sender, senderNumber, text, sock, msg)) return;
          } catch(_) {}
          try {
            const _riddle = require('./plugins/games/riddle');
            if (_riddle.checkAnswer && _riddle.checkAnswer(chatId, sender, senderNumber, text, sock, msg)) return;
          } catch(_) {}
          try {
            const _gamesNew = require('./plugins/games/games-new');
            if (_gamesNew.checkAnswer && _gamesNew.checkAnswer(chatId, sender, senderNumber, text, sock, msg)) return;
          } catch(_) {}
          try {
            const _wordgrid = require('./plugins/games/wordgrid');
            if (_wordgrid.checkAnswer && _wordgrid.checkAnswer(chatId, sender, senderNumber, text, sock, msg)) return;
          } catch(_) {}
        }

        //Crittix memory
        if (isGroupMsg && !msg.key.fromMe && text) {
          try {
            const _mem = require('./lib/crittix-memory');
            _mem.addMessage(chatId, sender, 'user', text.slice(0, 300));
          } catch(_) {}
        }

        //activity tracker
        if (isGroupMsg && !msg.key.fromMe) {
          try {
            const _act = require('./lib/activity-tracker');
            _act.recordActivity(chatId, sender);
          } catch(_) {}
        }

        //blacklist 
        try {
          const _gt = require('./plugins/owner/grouptools');
          const _isBlacklisted = _gt.find?.(m=>m?.isBlacklisted)?.isBlacklisted || _gt[_gt.length-1]?.isBlacklisted;
          if (_isBlacklisted && _isBlacklisted(sender)) return;
        } catch(_) {}

        //filter words
        if (isGroupMsg && !msg.key.fromMe && text) {
          try {
            const _gt2 = require('./plugins/owner/grouptools');
            const _gfw = _gt2.find?.(m=>m?.getFilterWords)?.getFilterWords || _gt2[_gt2.length-1]?.getFilterWords;
            if (_gfw) {
              const filterWords = _gfw(chatId);
              const ltext = text.toLowerCase();
              if (filterWords.some(w => ltext.includes(w))) {
                await sock.sendMessage(chatId, { delete: msg.key }).catch(()=>{});
                return;
              }
            }
          } catch(_) {}
        }

        //jail 
        if (isGroupMsg && !msg.key.fromMe) {
          try {
            const _jail = require('./lib/jail');
            if (_jail.isJailed(chatId, sender)) {
              await sock.sendMessage(chatId, { delete: msg.key }).catch(() => {});
              return;
            }
          } catch (_) {}
        }

        //spy
        if (isGroupMsg && !msg.key.fromMe && text) {
          try {
            const _spy = require('./plugins/owner/spy');
            const _isSpied = Array.isArray(_spy) ? _spy.find(m=>m?.isSpied)?.isSpied : _spy.isSpied;
            if (_isSpied && _isSpied(chatId)) {
              const _ownerJid = getConfig().OWNER_NUMBER + '@s.whatsapp.net';
              const _sNum = sender.split('@')[0];
              await sock.sendMessage(_ownerJid, {
                text: `👁️ *SPY* [${chatId.split('@')[0]}]
@${_sNum}: ${text}`
              }).catch(()=>{});
            }
          } catch(_) {}
        }

        //antiflood 
        if (isGroupMsg && !msg.key.fromMe) {
          try {
            const _gt3  = require('./plugins/owner/grouptools');
            const _gafd = _gt3.find?.(m=>m?.getAntiflood)?.getAntiflood || _gt3[_gt3.length-1]?.getAntiflood;
            const _ftk  = _gt3.find?.(m=>m?.floodTrack)?.floodTrack || _gt3[_gt3.length-1]?.floodTrack;
            if (_gafd && _ftk) {
              const cfg2 = _gafd(chatId);
              if (cfg2) {
                const now2 = Date.now();
                if (!_ftk[chatId]) _ftk[chatId] = {};
                if (!_ftk[chatId][sender]) _ftk[chatId][sender] = [];
                _ftk[chatId][sender] = _ftk[chatId][sender].filter(t => now2-t < cfg2.ms);
                _ftk[chatId][sender].push(now2);
                if (_ftk[chatId][sender].length >= cfg2.msgs) {
                  _ftk[chatId][sender] = [];
                  const isAdm = await h.isSenderAdmin(sock, chatId, sender).catch(()=>false);
                  if (!isAdm) {
                    await sock.groupParticipantsUpdate(chatId, [sender], 'remove').catch(()=>{});
                    await sock.sendMessage(chatId, { text: `🌊 @${sender.split('@')[0]} was kicked for flooding`, mentions:[sender] }).catch(()=>{});
                    return;
                  }
                }
              }
            }
          } catch(_) {}
        }

        if (isGroupMsg && !msg.key.fromMe && !isOwner(sender) && !isSudo(sender)) {
          try {
            const _db2    = require('./lib/db');
            const _sender = sender.replace(/:\d+@/, '@');

            const _isSenderAdmin = async () => {
              const meta = await sock.groupMetadata(chatId).catch(() => null);
              return !!meta?.participants?.some(p => {
                const cleanId    = (p.id          || '').replace(/:\d+@/, '@');
                const cleanLid   = (p.lid         || '').replace(/:\d+@/, '@');
                const cleanPhone = (p.phoneNumber || '').replace(/:\d+@/, '@');
                const isMatch    = cleanId === _sender || cleanLid === _sender ||
                                   (cleanPhone && cleanPhone === _sender);
                return isMatch && p.admin;
              });
            };

            //antisticker
            if (global.antiSticker?.[chatId] && msg.message?.stickerMessage) {
              const isAdm = await _isSenderAdmin();
              if (!isAdm) {
                await sock.sendMessage(chatId, { delete: msg.key }).catch(() => {});
                const pool = [
                  `No sticker allowed you stupid mf`,
                  `Can't you type? No sticker allowed`,
                  `You must be stupid for sending that sticker`
                ];
                await sock.sendMessage(chatId, {
                  text: `@${sender.split('@')[0]} ${pool[Math.floor(Math.random() * pool.length)]}`,
                  mentions: [sender]
                }, { quoted: msg });
              }
            }

            //antistatusmention 
            const _isStatusMsg =
              _isStatusMentionType ||
              msg.message?.extendedTextMessage?.contextInfo?.remoteJid === 'status@broadcast' ||
              msg.message?.extendedTextMessage?.contextInfo?.participant === 'status@broadcast';
            if (_isStatusMsg) {
              const antiMode = _db2.getAnti(chatId, 'antistatusmention');
              if (antiMode) {
                const isAdm = await _isSenderAdmin();
                if (!isAdm) {
                  await sock.sendMessage(chatId, { delete: msg.key }).catch(() => {});
                  const pool = [
                    `You're very stupid and dumb for mentioning this group to your status`,
                    `Your parent's didn't teach you how to respect rules? mention this group to your status again see my other side, stupid fool.`
                  ];
                  await sock.sendMessage(chatId, {
                    text: `@${sender.split('@')[0]} ${pool[Math.floor(Math.random() * pool.length)]}`,
                    mentions: [sender]
                  }, { quoted: msg });
                }
              }
            }
          } catch (_e) {}
        }

        //Auto-view / Auto-like status 
        if (chatId === 'status@broadcast' && !msg.key.fromMe) {
          const _statusParticipant = msg.key.participant || msg.participant || null;
          try {
            if (cfg.AUTO_VIEW_STATUS || cfg.AUTO_LIKE_STATUS) {
              await sock.readMessages([msg.key]);
              console.log(chalk.green(`[AUTOVIEW] Viewed status from ${_statusParticipant || 'unknown'}`));
            }
          } catch (svErr) {
            console.error('[AUTOVIEW]', svErr.message);
          }
          if (cfg.AUTO_LIKE_STATUS && _statusParticipant) {
            const _STATUS_EMOJIS = ['❤️','🔥','😍','🥰','💯','😂','🤩','👏','😎','💜','✨','🎉','😮','🫶','💫','🙌','😁','🤣','😜','🥳'];
            const _emoji = _STATUS_EMOJIS[Math.floor(Math.random() * _STATUS_EMOJIS.length)];
            try {
              let _reactJid = _statusParticipant;
              if (_reactJid.endsWith('@lid') && sock.signalRepository?.lidMapping?.getPNForLID) {
                try {
                  const _pn = await sock.signalRepository.lidMapping.getPNForLID(_reactJid);
                  if (_pn) _reactJid = _pn;
                } catch (_lidErr) {
                  console.error('[AUTOLIKE] LID→PN resolve failed:', _lidErr.message);
                }
              }
              console.log(chalk.gray(`[AUTOLIKE] participant=${_statusParticipant} resolvedJid=${_reactJid}`));
              const _reactKey = { ...msg.key, participant: _reactJid };
              await sock.sendMessage(
                'status@broadcast',
                { react: { text: _emoji, key: _reactKey } },
                { statusJidList: [_reactJid, sock.authState?.creds?.me?.id].filter(Boolean) }
              );
              console.log(chalk.green(`[AUTOLIKE] Reacted ${_emoji} to status from ${_reactJid}`));
            } catch (likeErr) {
              console.error('[AUTOLIKE]', likeErr.message);
              try {
                await sock.sendMessage(
                  'status@broadcast',
                  { react: { text: _emoji, key: msg.key } },
                  { statusJidList: [_statusParticipant, sock.authState?.creds?.me?.id].filter(Boolean) }
                );
                console.log(chalk.green(`[AUTOLIKE-FB] Reacted ${_emoji} via unresolved-JID fallback`));
              } catch (fbErr) {
                console.error('[AUTOLIKE-FB]', fbErr.message);
              }
            }
          }
          continue;
        }
        
        if (!text && isGroupMsg && !msg.key.fromMe && !isOwner(sender) && !isSudo(sender)) {
          try { await runAntiFeatures(sock, msg, chatId, sender); } catch (_) {}
          if (!isChannelMsg) {
            try { observer.trackMessage(sender, chatId, '', msg.pushName || senderNumber, false, null); } catch (_) {}
          }
          if (cfg.AUTO_READ) { try { await sock.readMessages([msg.key]); } catch (_) {} }
          if (cfg.AUTO_TYPING) { try { await sock.sendPresenceUpdate('composing', chatId); } catch (_) {} }
          else if (cfg.AUTO_RECORDING) { try { await sock.sendPresenceUpdate('recording', chatId); } catch (_) {} }
          if (cfg.AUTO_REACT) {
            try {
              const _P = ['💜','🔥','😈','⛧','👿','💀','🖤','😎','⚡','🌑','🩸','☠️','🫀','🌒','🕷️','🦂'];
              await sock.sendMessage(chatId, { react: { text: cfg.AUTO_REACT_EMOJI || _P[Math.floor(Math.random() * _P.length)], key: msg.key } });
            } catch (_) {}
          }
          continue;
        }
        
        if (cfg.AUTO_READ && !msg.key.fromMe) {
          try { await sock.readMessages([msg.key]); } catch (_) {}
        }

        //Auto-typing / Auto-recording
        if (!msg.key.fromMe) {
          if (cfg.AUTO_TYPING) {
            try { await sock.sendPresenceUpdate('composing', chatId); } catch (_) {}
          } else if (cfg.AUTO_RECORDING) {
            try { await sock.sendPresenceUpdate('recording', chatId); } catch (_) {}
          }
        }

        //Auto-react
        if (cfg.AUTO_REACT && !msg.key.fromMe) {
          try {
            const _REACT_POOL = ['💜','🔥','😈','⛧','👿','💀','🖤','😎','⚡','🌑','🩸','☠️','🫀','🌒','🕷️','🦂'];
            const _emoji = cfg.AUTO_REACT_EMOJI || _REACT_POOL[Math.floor(Math.random() * _REACT_POOL.length)];
            await sock.sendMessage(chatId, { react: { text: _emoji, key: msg.key } });
          } catch (_) {}
        }

        if (!text) continue;

        //Prefix
        const prefix = cfg.PREFIX || '.';

        //AFK notify
        if (global.afkStore && isGroupMsg && !msg.key.fromMe) {
          const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
          for (const jid of mentioned) {
            const afk = global.afkStore[jid];
            if (afk) {
              const since = Date.now() - afk.since;
              const mins = Math.floor(since / 60000);
              const hrs = Math.floor(mins / 60);
              const dur = hrs > 0 ? `${hrs}h ${mins % 60}m` : mins < 1 ? 'just now' : `${mins}m`;
              await sock.sendMessage(chatId, {
                text: `😴 @${jid.split('@')[0]} is AFK\n📝 Reason: ${afk.reason}\n⏱️ Since: ${dur}`,
                mentions: [jid]
              });
            }
          }
          if (global.afkStore[sender] && !text.startsWith(prefix)) {
            const afkData = global.afkStore[sender];
            const dur = Math.floor((Date.now() - afkData.since) / 60000);
            delete global.afkStore[sender];
            await sock.sendMessage(chatId, {
              text: `✅ @${senderNumber} is back! Was AFK for ${dur}m`,
              mentions: [sender]
            });
          }
        }

        //Crittix auto-roast
        const isCrittixActive = crittixDB.getCrittixStatus(cfg.OWNER_NUMBER);
        if (isCrittixActive && !text.startsWith(prefix)) {
          try {
            const userName = msg.pushName || senderNumber;
            const lowerText = text.toLowerCase();
            const isMentioned = lowerText.includes('crittix');
            const isReplyToBot = msg.message?.extendedTextMessage?.contextInfo?.participant === (cfg.OWNER_NUMBER + '@s.whatsapp.net');
            // Respond to all messages when chatbot is active, not just mentions
            const shouldRespond = true;

            let heatPoints = 2;
            if (isMentioned || isReplyToBot) heatPoints = 5;
            const currentHeat = crittixAura.updateHeat(sender, chatId, userName, heatPoints);

            if (shouldRespond) {
              await sock.sendPresenceUpdate('composing', chatId);
              await new Promise(r => setTimeout(r, Math.random() * 1800 + 700));
              const context = (isMentioned || isReplyToBot) ? 'chatbot' : 'chatbot';
              const roast = await crittixAI.generateRoast(text, userName, currentHeat, context, chatId, sender);
              await sock.sendMessage(chatId, { text: roast }, { quoted: msg });

              if (crittixStickers.shouldSendSticker()) {
                const sticker = crittixStickers.getRandomSticker();
                if (sticker) {
                  await new Promise(r => setTimeout(r, 500));
                  const stickerBuffer = fs.readFileSync(sticker.filepath);
                  await sock.sendMessage(chatId, { sticker: stickerBuffer });
                }
              }
            }
          } catch (e) {
            console.error(chalk.red('[CRITTIX AI]'), e.message);
          }
        }

        // Anti-features link, spam, swear, etc
        if (isGroupMsg && !msg.key.fromMe && !isOwner(sender) && !isSudo(sender)) {
          try {
            await runAntiFeatures(sock, msg, chatId, sender);
          } catch (e) {}
        }

        //Arena game handler
        {
          const arenaHandled = await arenaHandler(sock, msg, text, chatId, sender, senderNumber, cfg);
          if (arenaHandled) continue;
        }

        //Multiplayer
        if (text.toLowerCase().trim() === 'join') {
          try {
            const session = multiplayer.getSession(cfg.OWNER_NUMBER, chatId);
            if (session?.status === 'waiting') {
              const playerName = msg.pushName || senderNumber;
              if (!session.players.some(p => p.id === sender)) {
                const result = multiplayer.addPlayer(cfg.OWNER_NUMBER, chatId, sender, playerName);
                const updated = multiplayer.getSession(cfg.OWNER_NUMBER, chatId);
                if (updated?.players.length === 2) {
                  if (updated.gameType === 'tictactoe') {
                    const p1 = updated.players[0], p2 = updated.players[1];
                    const board = tictactoe.createBoard();
                    multiplayer.startGame(cfg.OWNER_NUMBER, chatId, { board, currentTurn: p1.id, turnStartTime: Date.now(), playerSymbols: { [p1.id]: 'X', [p2.id]: 'O' } });
                    await sock.sendMessage(chatId, {
                      text: `🎮 GAME STARTED!\n\n❌ @${p1.id.split('@')[0]}\n⭕ @${p2.id.split('@')[0]}\n\n${tictactoe.renderBoard(board)}\n\nTurn: @${p1.id.split('@')[0]}\nType 1-9 to play. 30s per turn.`,
                      mentions: [p1.id, p2.id]
                    });
                  } else if (updated.gameType === 'rps') {
                    const p1 = updated.players[0], p2 = updated.players[1];
                    const gs = rps.createGameState();
                    gs.scores[p1.id] = 0; gs.scores[p2.id] = 0;
                    gs.waitingFor = p1.id; gs.players = updated.players;
                    multiplayer.startGame(cfg.OWNER_NUMBER, chatId, gs);
                    await sock.sendMessage(chatId, {
                      text: `✊✋✌️ RPS STARTED!\n${p1.name} vs ${p2.name}\n\nROUND 1\n@${p1.id.split('@')[0]} choose: rock, paper, scissors`,
                      mentions: [p1.id, p2.id]
                    });
                  }
                } else {
                  await sock.sendMessage(chatId, { text: `✓ @${senderNumber} joined! Waiting for one more...`, mentions: [sender] });
                }
              }
              continue;
            }
          } catch (e) {}
        }

        //ttt
        const tttSession = multiplayer.getSession(cfg.OWNER_NUMBER, chatId);
        if (tttSession?.status === 'active' && tttSession.gameType === 'tictactoe') {
          const move = parseInt(text.trim());
          if (!isNaN(move) && move >= 1 && move <= 9 && tttSession.gameData?.currentTurn === sender) {
            const { board, playerSymbols } = tttSession.gameData;
            if (tictactoe.isValidMove(board, move)) {
              const symbol = playerSymbols[sender];
              const newBoard = tictactoe.makeMove(board, move, symbol);
              const winner = tictactoe.checkWinner(newBoard);
              const isDraw = !winner && tictactoe.isBoardFull(newBoard);
              const p1 = tttSession.players[0], p2 = tttSession.players[1];
              const next = tttSession.gameData.currentTurn === p1.id ? p2.id : p1.id;
              if (winner || isDraw) {
                multiplayer.endSession(cfg.OWNER_NUMBER, chatId);
                const result = winner
                  ? `🏆 @${sender.split('@')[0]} wins!\n\n${tictactoe.renderBoard(newBoard)}`
                  : `🤝 Draw!\n\n${tictactoe.renderBoard(newBoard)}`;
                await sock.sendMessage(chatId, { text: result, mentions: [p1.id, p2.id] });
              } else {
                multiplayer.updateGameData(cfg.OWNER_NUMBER, chatId, { board: newBoard, currentTurn: next, turnStartTime: Date.now() });
                await sock.sendMessage(chatId, {
                  text: `${tictactoe.renderBoard(newBoard)}\nTurn: @${next.split('@')[0]}`,
                  mentions: [p1.id, p2.id]
                });
              }
              continue;
            }
          }
        }

        //RPS moves
        if (tttSession?.status === 'active' && tttSession.gameType === 'rps') {
          if (rps.isValidChoice(text.trim()) && tttSession.players.some(p => p.id === sender)) {
            const { round, scores, currentRoundChoices, players } = tttSession.gameData;
            if (currentRoundChoices[sender]) { continue; }
            const choice = rps.normalizeChoice(text.trim());
            currentRoundChoices[sender] = choice;
            if (Object.keys(currentRoundChoices).length === 1) {
              const next = players.find(p => p.id !== sender);
              multiplayer.updateGameData(cfg.OWNER_NUMBER, chatId, { currentRoundChoices, waitingFor: next.id, roundStartTime: Date.now() });
              await sock.sendMessage(chatId, { text: `✓ Choice locked!\n@${next.id.split('@')[0]} your turn. Choose: rock, paper, scissors`, mentions: [next.id] });
              continue;
            }
            const p1 = players[0], p2 = players[1];
            const winnerId = rps.pickRandomWinner(p1.id, p2.id);
            scores[winnerId] = (scores[winnerId] || 0) + 1;
            const resultMsg = rps.formatRoundResult(p1.id, p1.name, currentRoundChoices[p1.id], p2.id, p2.name, currentRoundChoices[p2.id], winnerId, scores, round);
            await sock.sendMessage(chatId, { text: resultMsg, mentions: [p1.id, p2.id] });
            const gameWinner = rps.checkGameWinner(scores);
            if (gameWinner) {
              const w = players.find(p => p.id === gameWinner);
              await sock.sendMessage(chatId, { text: rps.formatGameOver(gameWinner, w.name, p1.id, p1.name, p2.id, p2.name, scores), mentions: [gameWinner] });
              multiplayer.endSession(cfg.OWNER_NUMBER, chatId);
            } else {
              multiplayer.updateGameData(cfg.OWNER_NUMBER, chatId, { round: round + 1, currentRoundChoices: {}, waitingFor: p1.id, roundStartTime: Date.now(), scores });
              await sock.sendMessage(chatId, { text: `✊✋✌️ ROUND ${round + 1}\n@${p1.id.split('@')[0]} your turn. Choose: rock, paper, scissors`, mentions: [p1.id] });
            }
            continue;
          }
        }

        //Bet accept
        if (text.toLowerCase().trim() === 'accept') {
          const quotedId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
          if (quotedId && global.activeBets?.[quotedId]) {
            const bet = global.activeBets[quotedId];
            if (bet.hostId !== sender) {
              const result = crittixAura.processBet(bet.hostId, sender, bet.amount);
              if (result.success) {
                delete global.activeBets[quotedId];
                await sock.sendMessage(chatId, {
                  text: `🎲 DUEL OVER!\n🏆 @${result.winnerId.split('@')[0]} wins +${bet.amount}\n💀 @${result.loserId.split('@')[0]} loses -${bet.amount}`,
                  mentions: [result.winnerId, result.loserId]
                });
              }
              continue;
            }
          }
        }

        //MENU command
        if (text.startsWith(cfg.PREFIX || '.')) {
          const _firstWord = text.slice((cfg.PREFIX || '.').length).trim().split(/\s+/)[0]?.toLowerCase();
          if (_firstWord === 'menu' || _firstWord === 'm') {
            if (cfg.MODE === 'self' && !isOwner(sender) && !isSudo(sender)) continue;
            const userName = msg.pushName || senderNumber;
            const menu = buildMenu(cfg.PREFIX || '.').replace('{USERNAME}', userName);
            const botPic = cfg.BOT_PIC;

            if (botPic) {
              await sock.sendMessage(chatId, {
                [cfg.BOT_PIC_TYPE === 'video' ? 'video' : 'image']: { url: botPic },
                caption: menu
              }, { quoted: msg });
            } else {
              await sock.sendMessage(chatId, { text: menu }, { quoted: msg });
            }
            continue;
          }
        }

        //riddle 
        if (!msg.key.fromMe && global.riddleStore && global.riddleStore.has(chatId) && !text.startsWith(cfg.PREFIX || '.')) {
          const riddle = global.riddleStore.get(chatId);
          if (riddle && Date.now() < riddle.expiry) {
            if (text.trim().toLowerCase().includes(riddle.answer)) {
              global.riddleStore.delete(chatId);
              const winnerNum = senderNumber;
              await sock.sendMessage(chatId, {
                text: `🎉 *Correct!* @${winnerNum} got it!\n\n✅ *Answer:* ${riddle.answer.charAt(0).toUpperCase() + riddle.answer.slice(1)}`,
                mentions: [sender]
              }, { quoted: msg });
              continue;
            }
          } else {
            global.riddleStore.delete(chatId);
          }
        }

        //Track non-command text messages
        if (!text.startsWith(cfg.PREFIX || '.') && !isChannelMsg) {
          try { observer.trackMessage(sender, isGroupMsg ? chatId : null, '', msg.pushName || senderNumber, false, null); } catch (_) {}
        }

        //Mode check
        if (cfg.MODE === 'self' && !isOwner(sender) && !isSudo(sender)) continue;
        if (msg.key.fromMe && !text.startsWith(prefix)) continue;
        if (!text.startsWith(prefix)) continue;
        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        if (!command) continue;

        const tag = msg.key.fromMe ? chalk.magenta('[CMD-OUT]') : chalk.cyan('[CMD-IN]');
        let grpName = '';
        let groupMetadata = null;
        if (isGroupMsg) {
          try {
            groupMetadata = await sock.groupMetadata(chatId);
            grpName = groupMetadata?.subject || '';
          } catch (_) {}
        }
        console.log(`${tag} ${grpName ? chalk.gray(grpName + ' › ') : ''}${chalk.white(senderNumber)}: ${chalk.yellow(text.slice(0, 80))}`);

        //Observer
        if (!isChannelMsg) {
          try {
            observer.trackMessage(sender, isGroupMsg ? chatId : null, grpName, msg.pushName || senderNumber, true, command);
          } catch (_) {}
        }

        //MENU command 
        if (command === 'menu' || command === 'm') continue;

        //BOTFONT command
        if (command === 'botfont' || command === 'changefont' || command === 'setfont' || command === 'fontset' || command === 'fontchange') {
          if (!isOwner(sender) && !isSudo(sender)) {
            await reply(sock, msg, helpers.demonFail('Owner/sudo only'));
            continue;
          }
          const { AVAILABLE_FONTS, applyFont } = require('./lib/fonts');
          const fontArg = args[0]?.toLowerCase();
          if (!fontArg) {
            const preview = AVAILABLE_FONTS.map(f => `➩ ${f} → ${applyFont('Hello World', f)}`).join('\n');
            await reply(sock, msg, `💜 Available fonts:\n\n${preview}\n\nUsage: .botfont <name>`);
            continue;
          }
          if (!AVAILABLE_FONTS.includes(fontArg)) {
            await reply(sock, msg, helpers.demonFail(`Unknown font. Use .botfont to see options`));
            continue;
          }
          const { set: setConf } = require('./lib/config');
          setConf({ FONT: fontArg });
          await reply(sock, msg, `✓ Bot font set to *${fontArg}*\n\nPreview: ${applyFont('Crittix-MD by LORD DEVINE', fontArg)}`);
          continue;
        }

        //SETBOTPIC command
        if (command === 'setbotpic') {
          if (!isOwner(sender) && !isSudo(sender)) { await reply(sock, msg, helpers.demonFail('Another Npc trying to use the Lord command, you are just stupid')); continue; }
          const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          const imgUrl = quoted?.imageMessage ? null : args[0];
          if (!quoted?.imageMessage && !imgUrl) {
            await reply(sock, msg, helpers.demonError('.setbotpic', 'Reply to an image or .setbotpic <url>'));
            continue;
          }
          const url = imgUrl || null;
          const { set: setConf } = require('./lib/config');
          if (url) {
            setConf({ BOT_PIC: url, BOT_PIC_TYPE: 'image' });
            await reply(sock, msg, '✓ Bot pic set from URL. Use .menu to preview.');
          } else {
            try {
              const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
              let buf = Buffer.from([]);
              for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
              // Save to local file
              const picPath = path.join(process.cwd(), 'database', 'bot-pic.jpg');
              fs.writeFileSync(picPath, buf);
              setConf({ BOT_PIC: picPath, BOT_PIC_TYPE: 'image' });
              await reply(sock, msg, '✓ Bot pic saved! Use .menu to preview.');
            } catch (e) {
              await reply(sock, msg, helpers.demonFail('Failed to save pic: ' + e.message));
            }
          }
          continue;
        }

        //SETPREFIX command
        if (command === 'setprefix') {
          if (!isOwner(sender) && !isSudo(sender)) { await reply(sock, msg, helpers.demonFail('Only the strong shall set prefix, you are just too stupid')); continue; }
          const np = args[0];
          if (!np) { await reply(sock, msg, helpers.demonError('.setprefix', '.setprefix <new prefix>')); continue; }
          const { set: setConf } = require('./lib/config');
          setConf({ PREFIX: np });
          await reply(sock, msg, `✓ Prefix changed to *${np}*`);
          continue;
        }

        //MODE command
        if (command === 'mode') {
          if (!isOwner(sender) && !isSudo(sender)) { await reply(sock, msg, helpers.demonFail('For my Lord only, stupid ass nigga.')); continue; }
          const newMode = args[0]?.toLowerCase();
          if (!['public', 'self'].includes(newMode)) { await reply(sock, msg, helpers.demonError('.mode', '.mode public OR .mode self')); continue; }
          const { set: setConf } = require('./lib/config');
          setConf({ MODE: newMode });
          await reply(sock, msg, `✓ Mode set to *${newMode}*`);
          continue;
        }

        //Lookup and execute plugin
        const plugin = plugins.get(command);
        if (!plugin) continue;

        // Permission check
        if (plugin.ownerOnly && !isOwner(sender)) {
          await reply(sock, msg, helpers.demonFail('This command is owner only'));
          continue;
        }
        if (plugin.sudoOnly && !isOwner(sender) && !isSudo(sender)) {
          await reply(sock, msg, helpers.demonFail('This ommand is for My Lord and sudo users only, you are Just an NPC'));
          continue;
        }
        if (plugin.adminOnly && isGroupMsg) {
          const isAdm = await helpers.isBotAdmin(sock, chatId);
          if (!isAdm) { await reply(sock, msg, helpers.demonFail('I need to be admin first, tell those stupid admins to promote my Lord')); continue; }
        }
        if (plugin.groupOnly && !isGroupMsg) {
          await reply(sock, msg, helpers.demonFail('Are you dumb? this is a group command only, stupid nigga'));
          continue;
        }

        //CMDSTATS
        try {
          const _cs = require('./plugins/owner/cmdstats');
          if (_cs.trackCmd) _cs.trackCmd(chatId, command);
        } catch(_) {}

        //GROUPLOCK
        try {
          const _gt4 = require('./plugins/owner/grouptools');
          const _igl = _gt4.find?.(m=>m?.isGroupLocked)?.isGroupLocked || _gt4[_gt4.length-1]?.isGroupLocked;
          if (_igl && _igl(chatId, command) && !isOwner(sender) && !isSudo(sender)) {
            await reply(`🔒 *.${command}* is locked in this group`);
            continue;
          }
        } catch(_) {}

        try {
          await plugin.execute({
            sock,
            msg,
            args,
            text: args.join(' '),
            command,
            sender,
            senderNumber,
            chatId,
            isGroupMsg,
            groupMetadata,
            isOwner: isOwner(sender),
            isSudo: isSudo(sender),
            cfg,
            prefix,
            reply: (t, extra) => {
              const _fn = getConfigFont();
              const _styled = (typeof t === 'string' && _fn !== 'default') ? applyFont(t, _fn) : t;
              return reply(sock, msg, _styled, extra);
            },
            font: (t) => applyFont(t, getConfigFont())
          });
        } catch (e) {
          console.error(chalk.red(`[PLUGIN:${command}] Error:`), e.message);
          try {
            await reply(sock, msg, helpers.demonFail(`Command error: ${e.message}`));
          } catch (_) {}
        }

      } catch (outer) {
        console.error(chalk.red('[DEVINE] Message handler error:'), outer.message);
      }
    }
  }));
};

module.exports.getPluginsMap  = getPluginsMap;
module.exports.getPluginCount = getPluginCount;