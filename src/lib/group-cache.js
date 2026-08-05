/*
 * ============================================================
 * GROUP METADATA CACHE
 * ------------------------------------------------------------
 * Every plugin/handler in this codebase calls sock.groupMetadata()
 * directly, and there was no caching anywhere. That means a single
 * group message could trigger 2-4 full network round trips to fetch
 * the full participant list before a command even ran — the bigger
 * the group, the slower every single message, while DMs (which never
 * touch groupMetadata) stayed instant.
 *
 * patchSocket() wraps sock.groupMetadata with a cache ONCE, right
 * after the socket is created in index.js. Every existing call site
 * (devine.js, anti-handlers.js, helpers.js, arena-handler.js, etc.)
 * keeps calling sock.groupMetadata(chatId) exactly as before — no
 * other file needs to change — but now hits the cache instead of the
 * network on repeat calls.
 *
 * Correctness: the cache is actively invalidated (not just left to
 * expire) on 'group-participants.update' (promote/demote/add/remove)
 * and 'groups.update' (subject/settings changes), so admin checks,
 * promotions, demotions, and membership changes are always reflected
 * on the very next message — never stale.
 * ============================================================
 */

const NodeCache = require('node-cache');

// Safety-net TTL. In practice almost every entry gets invalidated
// explicitly (see below) long before this expires.
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });

const patchSocket = (sock) => {
  if (!sock || sock.__groupCachePatched) return sock;

  const realGroupMetadata = sock.groupMetadata.bind(sock);

  sock.groupMetadata = async (jid) => {
    const cached = cache.get(jid);
    if (cached) return cached;

    const meta = await realGroupMetadata(jid);
    cache.set(jid, meta);
    return meta;
  };

  // Invalidate immediately on anything that changes group state, so
  // stale data is never served after a promote/demote/add/remove or
  // a subject/settings change.
  sock.ev.on('group-participants.update', ({ id }) => {
    if (id) cache.del(id);
  });

  sock.ev.on('groups.update', (updates) => {
    for (const u of updates || []) {
      if (u?.id) cache.del(u.id);
    }
  });

  sock.__groupCachePatched = true;
  console.log('[GROUP-CACHE] sock.groupMetadata patched with caching layer');
  return sock;
};

// Exposed in case any handler ever needs to force a refresh manually
// (e.g. right after the bot itself changes group settings).
const invalidate = (jid) => cache.del(jid);

module.exports = { patchSocket, invalidate };
