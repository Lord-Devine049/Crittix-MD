/*
 * ============================================
 * MURDER.JS - Murder Mystery Game
 * Crittix-MD Arena — LORD DEVINE
 * Works in: GROUPS ONLY
 * ============================================
 */

const arena = require('../../lib/arena');
const globalXP = require('../../lib/global-xp');


const LOBBY_SECONDS   = 120;
const VOTE_SECONDS    = 60;
const MIN_PLAYERS     = 4;

// ── Role assignment ────────────────────────────────

const assignRoles = (players) => {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const roles    = {};
  roles[shuffled[0].id] = 'killer';
  roles[shuffled[1].id] = 'detective';
  for (let i = 2; i < shuffled.length; i++) {
    roles[shuffled[i].id] = 'civilian';
  }
  return roles;
};

// ── Join handler ───────────────────────────────────

const onJoin = async (sock, msg, chatId, sender, senderNumber, game, cfg) => {
  if (!chatId.endsWith('@g.us')) {
    await sock.sendMessage(chatId, { text: `✘ Murder Mystery is for groups only.` }, { quoted: msg });
    return true;
  }
  if (game.players.some(p => p.id === sender)) {
    await sock.sendMessage(chatId, { text: `✘ You already joined.` }, { quoted: msg });
    return true;
  }
  const name = msg.pushName || senderNumber;
  game.players.push({ id: sender, name });
  arena.setGame(chatId, game);
  await sock.sendMessage(chatId, {
    text: `✅ @${senderNumber} joined Murder Mystery! (${game.players.length} players)`,
    mentions: [sender]
  }, { quoted: msg });
  return true;
};

// ── DM roles to players ────────────────────────────

const sendRoles = async (sock, game) => {
  const roleEmoji = { killer: '🔪', detective: '🕵️', civilian: '👤' };
  for (const p of game.players) {
    const role = game.roles[p.id];
    const dmJid = p.id.endsWith('@s.whatsapp.net') ? p.id : p.id.replace(/@.*/, '@s.whatsapp.net');
    const hints = {
      killer:    'Kill all civilians before being voted out. Stay hidden.',
      detective: 'Help civilians find the killer. Your vote matters most.',
      civilian:  'Vote out the killer before they eliminate you.',
    };
    try {
      await sock.sendMessage(dmJid, {
        text:
          `🎭 *MURDER MYSTERY — SECRET ROLE*\n\n` +
          `${roleEmoji[role]} Your role: *${role.toUpperCase()}*\n\n` +
          `📌 ${hints[role]}\n\n` +
          `_Do NOT reveal your role to others!_`
      });
    } catch (err) {
      console.error('[MURDER] DM failed for', p.id, err.message);
    }
  }
};

// ── Start game ─────────────────────────────────────

const startGame = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || game.status !== 'waiting') return;

  if (game.players.length < MIN_PLAYERS) {
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text: `⚠️ Murder Mystery cancelled — need at least ${MIN_PLAYERS} players.`
    });
    return;
  }

  game.status = 'active';
  game.alive  = game.players.map(p => p.id);
  game.roles  = assignRoles(game.players);
  game.round  = 1;
  arena.setGame(chatId, game);

  const playerList = game.players.map(p => `• @${p.id.split('@')[0]}`).join('\n');

  await sock.sendMessage(chatId, {
    text:
      `🔪 *MURDER MYSTERY — GAME START*\n\n` +
      `Players:\n${playerList}\n\n` +
      `Roles are being sent to each player via DM...\n\n` +
      `🔴 1 Killer is among you.\n🕵️ 1 Detective.\n👤 Rest are Civilians.\n\n` +
      `Rules:\n` +
      `• Each round a civilian is found dead\n` +
      `• All alive players vote someone out\n` +
      `• Most votes = eliminated\n` +
      `• Civilians win if killer voted out\n` +
      `• Killer wins if only 1 civilian remains`,
    mentions: game.players.map(p => p.id)
  });

  // Send DMs
  await sendRoles(sock, game);
  await new Promise(r => setTimeout(r, 3000));
  nextRound(sock, chatId, cfg);
};

// ── Next round ─────────────────────────────────────

const nextRound = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || game.status !== 'active') return;

  // Check win conditions
  const aliveRoles = game.alive.map(id => game.roles[id]);
  const killerAlive = game.alive.some(id => game.roles[id] === 'killer');
  const civilianCount = game.alive.filter(id =>
    game.roles[id] === 'civilian' || game.roles[id] === 'detective'
  ).length;

  if (!killerAlive) {
    // Killer was already eliminated
    const allCivNames = game.alive.map(id => `@${id.split('@')[0]}`).join(', ');
    for (const p of game.players) globalXP.addXP(p.id, p.name || p.id.split('@')[0]);
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text:
        `🏆 *CIVILIANS & DETECTIVE WIN!*\n\n` +
        `The killer has been eliminated.\n` +
        `Survivors: ${allCivNames}`,
      mentions: game.alive
    });
    return;
  }

  if (civilianCount <= 1) {
    // Killer wins
    const killer = game.alive.find(id => game.roles[id] === 'killer');
    const kName  = game.players.find(p => p.id === killer)?.name || killer?.split('@')[0];
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text:
        `🔪 *KILLER WINS!*\n\n` +
        `@${killer.split('@')[0]} (${kName}) was the killer all along!\n` +
        `They eliminated all the civilians. 💀`,
      mentions: [killer]
    });
    return;
  }

  // Pick a random civilian to "die" (not killer, not detective)
  const civilians = game.alive.filter(id => game.roles[id] === 'civilian');
  const detective = game.alive.find(id => game.roles[id] === 'detective');
  if (!civilians.length && detective) {
    // Only detective and killer left
    const killer     = game.alive.find(id => game.roles[id] === 'killer');
    const detName    = game.players.find(p => p.id === detective)?.name || detective.split('@')[0];
    const killerName = game.players.find(p => p.id === killer)?.name || killer.split('@')[0];
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text:
        `🔪 *KILLER WINS!*\n\n` +
        `Only @${detective.split('@')[0]} (detective) remains.\n` +
        `The killer was @${killer.split('@')[0]} (${killerName}). 💀`,
      mentions: [detective, killer]
    });
    return;
  }

  const victim    = civilians[Math.floor(Math.random() * civilians.length)];
  const victimObj = game.players.find(p => p.id === victim);
  game.alive       = game.alive.filter(id => id !== victim);
  game.votes       = {};
  game.votingOpen  = true;
  arena.setGame(chatId, game);

  const aliveList = game.alive.map(id => `• @${id.split('@')[0]}`).join('\n');

  await sock.sendMessage(chatId, {
    text:
      `🔪 *ROUND ${game.round}*\n\n` +
      `💀 @${victim.split('@')[0]} (${victimObj?.name || ''}) was found dead!\n\n` +
      `Alive players:\n${aliveList}\n\n` +
      `🗳️ *VOTE NOW* — who is the killer?\n` +
      `Type a player's name or number to cast your vote.\n` +
      `You have *${VOTE_SECONDS} seconds!*`,
    mentions: [...game.alive, victim]
  });

  const t = setTimeout(() => closeVote(sock, chatId, cfg), VOTE_SECONDS * 1000);
  game._voteTimer = t;
  arena.trackTimer(chatId, t);
  arena.setGame(chatId, game);
};

// ── Close vote ─────────────────────────────────────

const closeVote = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || !game.votingOpen) return;

  game.votingOpen = false;
  arena.setGame(chatId, game);

  const voteCounts = {};
  for (const [voter, target] of Object.entries(game.votes)) {
    voteCounts[target] = (voteCounts[target] || 0) + 1;
  }

  if (!Object.keys(voteCounts).length) {
    await sock.sendMessage(chatId, {
      text: `🗳️ No votes were cast! No elimination this round.\n\nMoving to next round...`
    });
    game.round++;
    arena.setGame(chatId, game);
    await new Promise(r => setTimeout(r, 2000));
    nextRound(sock, chatId, cfg);
    return;
  }

  const topVotes   = Math.max(...Object.values(voteCounts));
  const topTargets = Object.keys(voteCounts).filter(k => voteCounts[k] === topVotes);

  if (topTargets.length > 1) {
    await sock.sendMessage(chatId, {
      text: `🗳️ *TIE VOTE!* — No elimination this round.\n\nMoving to next round...`
    });
    game.round++;
    arena.setGame(chatId, game);
    await new Promise(r => setTimeout(r, 2000));
    nextRound(sock, chatId, cfg);
    return;
  }

  // Find the eliminated player by partial name match
  const targetName = topTargets[0].toLowerCase();
  const eliminated = game.alive.find(id => {
    const num  = id.split('@')[0];
    const pObj = game.players.find(p => p.id === id);
    const name = (pObj?.name || '').toLowerCase();
    return name.includes(targetName) || num.includes(targetName);
  });

  if (!eliminated) {
    await sock.sendMessage(chatId, {
      text: `🗳️ Couldn't identify who was voted for. No elimination.\n\nMoving to next round...`
    });
    game.round++;
    arena.setGame(chatId, game);
    await new Promise(r => setTimeout(r, 2000));
    nextRound(sock, chatId, cfg);
    return;
  }

  const elimRole    = game.roles[eliminated];
  const elimName    = game.players.find(p => p.id === eliminated)?.name || eliminated.split('@')[0];
  const roleReveal  = `@${eliminated.split('@')[0]} (${elimName}) was *${elimRole.toUpperCase()}*!`;
  const roleEmoji   = { killer: '🔪', detective: '🕵️', civilian: '👤' }[elimRole];

  game.alive = game.alive.filter(id => id !== eliminated);
  game.round++;
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text: `🗳️ *ELIMINATED:* ${roleReveal} ${roleEmoji}`,
    mentions: [eliminated]
  });

  await new Promise(r => setTimeout(r, 2500));
  nextRound(sock, chatId, cfg);
};

// ── Input handler ──────────────────────────────────

const onInput = async (sock, msg, text, chatId, sender, senderNumber, game, cfg) => {
  if (!game.votingOpen) return false;
  if (!game.alive.includes(sender)) return false;
  if (game.votes[sender]) return false; // Already voted

  const vote = text.trim().toLowerCase();
  if (!vote || vote.length < 2) return false;

  // Validate that the target exists
  const target = game.alive.find(id => {
    if (id === sender) return false; // Can't vote yourself
    const num  = id.split('@')[0];
    const pObj = game.players.find(p => p.id === id);
    const name = (pObj?.name || '').toLowerCase();
    return name.includes(vote) || num.includes(vote);
  });

  if (!target) return false;

  const targetObj = game.players.find(p => p.id === target);
  game.votes[sender] = (targetObj?.name || target.split('@')[0]).toLowerCase();
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text: `🗳️ @${senderNumber} voted for *${targetObj?.name || target.split('@')[0]}*`,
    mentions: [sender]
  }, { quoted: msg });

  // Auto-close if everyone voted
  if (Object.keys(game.votes).length >= game.alive.length) {
    if (game._voteTimer) { clearTimeout(game._voteTimer); game._voteTimer = null; }
    await closeVote(sock, chatId, cfg);
  }

  return true;
};

// ── Plugin export ──────────────────────────────────

module.exports = {
  command:     'murder',
  aliases:     ['murdermy', 'murdermystery'],
  category:    'shadowgames',
  description: 'Murder Mystery — find the killer before it\'s too late (groups only)',
  groupOnly:   true,

  execute: async ({ sock, msg, args, sender, senderNumber, chatId, isGroupMsg, isOwner, isSudo, cfg, prefix, reply }) => {
    if (!isGroupMsg) return reply('✘ Murder Mystery can only be played in groups.');

    const sub = args[0]?.toLowerCase();

    if (sub === 'stop') {
      const game = arena.getGame(chatId);
      if (!game || game.type !== 'murder') return reply('✘ No active Murder Mystery here.');
      if (!isOwner && !isSudo && game.host.id !== sender) return reply('✘ Only the host or admin can stop this.');
      arena.endGame(chatId);
      return reply('🛑 Murder Mystery stopped.');
    }

    if (sub !== 'start') {
      return reply(`Usage: \`${prefix}murder start\` or \`${prefix}murder stop\``);
    }

    if (arena.hasActiveGame(chatId)) {
      const g = arena.getGame(chatId);
      return reply(`⚠️ *${arena.GAME_TITLES[g.type]}* is already active.\nUse \`${arena.STOP_COMMANDS[g.type]}\` to end it first.`);
    }

    const name  = msg.pushName || senderNumber;
    const state = {
      type:        'murder',
      status:      'waiting',
      host:        { id: sender, name },
      players:     [{ id: sender, name }],
      alive:       [],
      roles:       {},
      round:       1,
      votes:       {},
      votingOpen:  false,
      _timers:     [],
      _onJoin:     onJoin,
      _onInput:    onInput,
    };

    arena.setGame(chatId, state);

    const lobbyT = setTimeout(() => startGame(sock, chatId, cfg), LOBBY_SECONDS * 1000);
    arena.trackTimer(chatId, lobbyT);

    await sock.sendMessage(chatId, {
      text:
        `🔪 *MURDER MYSTERY — LOBBY OPEN*\n\n` +
        `@${sender.split('@')[0]} started a lobby!\n\n` +
        `Type *join* to enter.\n` +
        `Game starts in *2 minutes*.\n` +
        `Need at least ${MIN_PLAYERS} players.\n\n` +
        `Stop: \`${prefix}murder stop\``,
      mentions: [sender]
    }, { quoted: msg });
  }
};
