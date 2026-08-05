/*
 * ============================================
 * TICTACTOE.JS - Crittix-MD Arena
 * Full Rewrite — LORD DEVINE
 * Works in: Groups AND DMs
 * ============================================
 */

const arena = require('../../lib/arena');
const globalXP = require('../../lib/global-xp');


// ── Board helpers ──────────────────────────────────

const createBoard = () => Array(9).fill(null);

const renderBoard = (board) => {
  const cell = (i) => {
    if (board[i] === 'X') return '❌';
    if (board[i] === 'O') return '⭕';
    return `${i + 1}`;
  };
  return (
    `  ${cell(0)} │ ${cell(1)} │ ${cell(2)}\n` +
    `  ──┼───┼──\n` +
    `  ${cell(3)} │ ${cell(4)} │ ${cell(5)}\n` +
    `  ──┼───┼──\n` +
    `  ${cell(6)} │ ${cell(7)} │ ${cell(8)}`
  );
};

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

const checkWinner = (board) => {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
};

const isFull = (board) => board.every(c => c !== null);

// ── Turn timer ─────────────────────────────────────

const TURN_SECONDS = 30;

const startTurnTimer = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game) return;

  // Clear any old timer first
  if (game._turnTimer) clearTimeout(game._turnTimer);

  const t = setTimeout(async () => {
    const g = arena.getGame(chatId);
    if (!g || g.status !== 'active') return;
    const mover = g.players.find(p => p.id === g.currentTurn);
    if (!mover) return;

    // Forfeit turn (no elimination — just skip)
    const other = g.players.find(p => p.id !== g.currentTurn);
    g.currentTurn = other.id;
    g.turnStartTime = Date.now();
    arena.setGame(chatId, g);

    await sock.sendMessage(chatId, {
      text:
        `⏰ @${mover.id.split('@')[0]} took too long — turn skipped!\n\n` +
        renderBoard(g.board) + `\n\n` +
        `📌 Turn: @${other.id.split('@')[0]} — type 1–9`,
      mentions: [mover.id, other.id]
    });

    // Restart timer for the next player
    startTurnTimer(sock, chatId, cfg);
  }, TURN_SECONDS * 1000);

  game._turnTimer = t;
  arena.trackTimer(chatId, t);
};

// ── Join handler ───────────────────────────────────

const onJoin = async (sock, msg, chatId, sender, senderNumber, game, cfg) => {
  if (game.players.some(p => p.id === sender)) {
    await sock.sendMessage(chatId, { text: `✘ You already joined.` }, { quoted: msg });
    return true;
  }
  if (game.players.length >= 2) {
    await sock.sendMessage(chatId, { text: `✘ Game is already full.` }, { quoted: msg });
    return true;
  }

  const name = msg.pushName || senderNumber;
  game.players.push({ id: sender, name });

  const p1 = game.players[0];
  const p2 = game.players[1];

  // Assign symbols
  game.symbols      = { [p1.id]: 'X', [p2.id]: 'O' };
  game.board        = createBoard();
  game.currentTurn  = p1.id;
  game.turnStartTime = Date.now();
  game.status       = 'active';
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text:
      `🎮 *TIC TAC TOE — GAME START*\n\n` +
      `❌ @${p1.id.split('@')[0]} (X)\n` +
      `⭕ @${p2.id.split('@')[0]} (O)\n\n` +
      renderBoard(game.board) + `\n\n` +
      `📌 Turn: @${p1.id.split('@')[0]} — type 1–9\n` +
      `⏱️ 30s per turn`,
    mentions: [p1.id, p2.id]
  });

  startTurnTimer(sock, chatId, cfg);
  return true;
};

// ── Move handler ───────────────────────────────────

const onInput = async (sock, msg, text, chatId, sender, senderNumber, game, cfg) => {
  if (game.currentTurn !== sender) return false;

  const move = parseInt(text.trim());
  if (isNaN(move) || move < 1 || move > 9) return false;

  const idx = move - 1;
  if (game.board[idx] !== null) {
    await sock.sendMessage(chatId, {
      text: `✘ That spot is taken. Pick another (1–9).`
    }, { quoted: msg });
    return true;
  }

  // Clear turn timer
  if (game._turnTimer) { clearTimeout(game._turnTimer); game._turnTimer = null; }

  const symbol = game.symbols[sender];
  game.board[idx] = symbol;

  const winner = checkWinner(game.board);
  const draw   = !winner && isFull(game.board);
  const p1     = game.players[0];
  const p2     = game.players[1];

  if (winner || draw) {
    for (const p of [p1, p2]) globalXP.addXP(p.id, p.name || p.id.split('@')[0]);
    arena.endGame(chatId);
    const result = winner
      ? `🏆 @${sender.split('@')[0]} wins!\n\n${renderBoard(game.board)}`
      : `🤝 It's a draw!\n\n${renderBoard(game.board)}`;
    await sock.sendMessage(chatId, { text: result, mentions: [p1.id, p2.id] });
    return true;
  }

  // Next turn
  const next = p1.id === sender ? p2 : p1;
  game.currentTurn  = next.id;
  game.turnStartTime = Date.now();
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text:
      renderBoard(game.board) + `\n\n` +
      `📌 Turn: @${next.id.split('@')[0]} — type 1–9`,
    mentions: [p1.id, p2.id]
  });

  startTurnTimer(sock, chatId, cfg);
  return true;
};

// ── Plugin export ──────────────────────────────────

module.exports = {
  command:     ['tictactoe', 'ttt'],
  aliases:     [],
  category: 'shadowgames',
  description: '1v1 Tic Tac Toe game',

  execute: async ({ sock, msg, args, sender, senderNumber, chatId, isGroupMsg, isOwner, isSudo, cfg, prefix, reply }) => {
    // .ttt stop  (also handled by arena-handler before mode check, but keep here as fallback)
    if (args[0]?.toLowerCase() === 'stop') {
      const game = arena.getGame(chatId);
      if (!game || game.type !== 'tictactoe') return reply('✘ No active Tic Tac Toe game here.');
      const isAdm = isOwner || isSudo || game.host.id === sender;
      if (!isAdm) return reply('✘ Only the host or an admin can stop this game.');
      arena.endGame(chatId);
      return reply('🛑 Tic Tac Toe stopped.');
    }

    // Check for any active arena game first
    if (arena.hasActiveGame(chatId)) {
      const g = arena.getGame(chatId);
      const title = arena.GAME_TITLES[g.type] || g.type;
      const stop  = arena.STOP_COMMANDS[g.type] || '.endgame';
      return reply(
        `⚠️ *${title}* is already active here.\n` +
        `Use \`${stop}\` to end it first.`
      );
    }

    const name  = msg.pushName || senderNumber;
    const state = {
      type:    'tictactoe',
      status:  'waiting',
      host:    { id: sender, name },
      players: [{ id: sender, name }],
      board:   null,
      symbols: {},
      currentTurn:   null,
      turnStartTime: null,
      _turnTimer: null,
      _timers:   [],
      _onJoin:  onJoin,
      _onInput: onInput,
    };

    arena.setGame(chatId, state);

    await sock.sendMessage(chatId, {
      text:
        `🎮 *TIC TAC TOE*\n\n` +
        `@${sender.split('@')[0]} opened a lobby!\n\n` +
        `Type *join* to play against them.\n` +
        `Stop: ${prefix}ttt stop`,
      mentions: [sender]
    }, { quoted: msg });
  }
};
