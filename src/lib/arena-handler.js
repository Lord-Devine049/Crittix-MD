/*
 * ============================================
 * ARENA-HANDLER.JS - Arena Game Message Router
 * Created by: LORD DEVINE
 *
 * Called from devine.js BEFORE the self-mode check.
 * Routes every incoming message to the relevant game handler.
 * Returns true if the message was consumed (caller should `continue`).
 * ============================================
 */

const arena = require('./arena');
const { isOwner, isSudo } = require('./config');

/**
 * Check whether the sender is a group admin.
 */
const checkIsGroupAdmin = async (sock, chatId, sender) => {
  if (!chatId.endsWith('@g.us')) return false;
  try {
    const meta = await sock.groupMetadata(chatId);
    const clean = sender.replace(/:\d+@/, '@');
    return !!meta.participants.find(p =>
      p.id.replace(/:\d+@/, '@') === clean && p.admin
    );
  } catch (_) {
    return false;
  }
};

/**
 * Main arena message handler.
 *
 * @returns {boolean} true if the message was consumed.
 */
const arenaHandler = async (sock, msg, text, chatId, sender, senderNumber, cfg) => {
  if (!text) return false;

  const prefix    = cfg.PREFIX || '.';
  const cleanText = text.trim();
  const lower     = cleanText.toLowerCase();

  // ── 1. Detect prefixed stop command BEFORE mode check ──
  if (cleanText.startsWith(prefix)) {
    const parts = cleanText.slice(prefix.length).trim().toLowerCase().split(/\s+/);
    const cmd   = parts[0];
    const sub   = parts[1];

    if (sub === 'stop' && arena.GAME_CMD_MAP[cmd]) {
      const game = arena.getGame(chatId);
      if (!game) return false;
      if (game.type !== arena.GAME_CMD_MAP[cmd]) return false;

      // Permission check: host, owner, sudo, or group admin
      const canStop =
        isOwner(sender) || isSudo(sender) || game.host.id === sender ||
        await checkIsGroupAdmin(sock, chatId, sender);

      if (!canStop) {
        await sock.sendMessage(chatId, {
          text: `✘ Only the host or an admin can stop this game.`
        }, { quoted: msg });
        return true;
      }

      arena.endGame(chatId);
      const title = arena.GAME_TITLES[game.type] || game.type;
      await sock.sendMessage(chatId, {
        text: `🛑 *${title}* was stopped.`
      }, { quoted: msg });
      return true;
    }
    return false; // not a stop command
  }

  // ── 2. All other arena inputs (join, moves) ──
  const game = arena.getGame(chatId);
  if (!game) return false;

  // Rate limit (game inputs only)
  if (arena.isRateLimited(chatId, sender)) return false;

  // ── 2a. "join" during lobby ──
  if (lower === 'join' && game.status === 'waiting') {
    if (typeof game._onJoin === 'function') {
      return await game._onJoin(sock, msg, chatId, sender, senderNumber, game, cfg);
    }
    return false;
  }

  // ── 2b. Game move / answer during active phase ──
  if (game.status === 'active' && typeof game._onInput === 'function') {
    return await game._onInput(sock, msg, cleanText, chatId, sender, senderNumber, game, cfg);
  }

  return false;
};

module.exports = arenaHandler;
