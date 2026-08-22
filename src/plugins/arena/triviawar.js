/*
 * ============================================
 * TRIVIAWAR.JS - Trivia War
 * Crittix-MD Arena — LORD DEVINE
 * Works in: Groups AND DMs
 * Source: Open Trivia DB (no key required)
 * ============================================
 */

const arena  = require('../../lib/arena');
const globalXP = require('../../lib/global-xp');

const fetch  = require('node-fetch');
const p = require('../../lib/phrases');


const LOBBY_SECONDS    = 120;
const QUESTION_SECONDS = 15;
const TOTAL_QUESTIONS  = 15;
const MIN_PLAYERS      = 2;
const TRIVIA_API       = 'https://opentdb.com/api.php?amount=15&type=multiple';

// ── HTML entity decoder ────────────────────────────

const decodeHTML = (str) =>
  (str || '')
    .replace(/&amp;/g,    '&')
    .replace(/&lt;/g,     '<')
    .replace(/&gt;/g,     '>')
    .replace(/&quot;/g,   '"')
    .replace(/&#039;/g,   "'")
    .replace(/&ldquo;/g,  '"')
    .replace(/&rdquo;/g,  '"')
    .replace(/&laquo;/g,  '«')
    .replace(/&raquo;/g,  '»')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uuml;/g,   'ü')
    .replace(/&ndash;/g,  '–')
    .replace(/&mdash;/g,  '—')
    .replace(/&hellip;/g, '…')
    .replace(/&#x27;/g,   "'")
    .replace(/&#x2F;/g,   '/');

// ── Fetch questions ────────────────────────────────

const fetchQuestions = async () => {
  try {
    const res  = await fetch(TRIVIA_API, { timeout: 8000 });
    const json = await res.json();
    if (json.response_code !== 0 || !json.results?.length) return null;

    return json.results.map(q => {
      const options    = [...q.incorrect_answers, q.correct_answer]
        .map(decodeHTML)
        .sort(() => Math.random() - 0.5);
      const labelMap   = ['A', 'B', 'C', 'D'];
      const optionsMap = {};
      options.forEach((opt, i) => { optionsMap[labelMap[i]] = opt; });
      const correctLabel = Object.keys(optionsMap).find(k => optionsMap[k] === decodeHTML(q.correct_answer));

      return {
        question: decodeHTML(q.question),
        options:  optionsMap,
        correct:  correctLabel,
        category: decodeHTML(q.category),
      };
    });
  } catch (err) {
    console.error('[TRIVIAWAR] API error:', err.message);
    return null;
  }
};

// ── Scoreboard ─────────────────────────────────────

const buildScoreboard = (game) =>
  [...game.players]
    .sort((a, b) => (game.scores[b.id] || 0) - (game.scores[a.id] || 0))
    .map((p, i) => `${i + 1}. @${p.id.split('@')[0]}: ${game.scores[p.id] || 0} pts`)
    .join('\n');

// ── Join handler ───────────────────────────────────

const onJoin = async (sock, msg, chatId, sender, senderNumber, game, cfg) => {
  if (game.players.some(p => p.id === sender)) {
    await sock.sendMessage(chatId, { text: `✘ You already joined.` }, { quoted: msg });
    return true;
  }
  const name = msg.pushName || senderNumber;
  game.players.push({ id: sender, name });
  arena.setGame(chatId, game);
  await sock.sendMessage(chatId, {
    text: `✅ @${senderNumber} joined Trivia War! (${game.players.length} players)`,
    mentions: [sender]
  }, { quoted: msg });
  return true;
};

// ── Start game ─────────────────────────────────────

const startGame = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || game.status !== 'waiting') return;

  if (game.players.length < MIN_PLAYERS) {
    arena.endGame(chatId);
    await sock.sendMessage(chatId, { text: `⚠️ Trivia War cancelled — need at least ${MIN_PLAYERS} players.` });
    return;
  }

  await sock.sendMessage(chatId, { text: `🧠 Loading trivia questions...` });

  const questions = await fetchQuestions();
  if (!questions) {
    arena.endGame(chatId);
    await sock.sendMessage(chatId, { text: `⚠️ Trivia War cancelled — couldn't load questions. Try again.` });
    return;
  }

  game.status    = 'active';
  game.round     = 1;
  game.questions = questions;
  game.scores    = {};
  for (const p of game.players) game.scores[p.id] = 0;
  arena.setGame(chatId, game);

  const playerList = game.players.map(p => `• @${p.id.split('@')[0]}`).join('\n');
  await sock.sendMessage(chatId, {
    text:
      `🧠 *TRIVIA WAR — GAME START*\n\n` +
      `Players:\n${playerList}\n\n` +
      `${TOTAL_QUESTIONS} questions • ${QUESTION_SECONDS}s each\n` +
      `Type A, B, C, or D to answer first!`,
    mentions: game.players.map(p => p.id)
  });

  await new Promise(r => setTimeout(r, 2000));
  nextRound(sock, chatId, cfg);
};

// ── Next round ─────────────────────────────────────

const nextRound = async (sock, chatId, cfg) => {
  const game = arena.getGame(chatId);
  if (!game || game.status !== 'active') return;

  if (game.round > TOTAL_QUESTIONS) {
    return finishGame(sock, chatId, game);
  }

  if (game.round === 6 || game.round === 11) {
    await sock.sendMessage(chatId, {
      text: `📊 *SCOREBOARD (after ${game.round - 1} questions)*\n\n${buildScoreboard(game)}`,
      mentions: game.players.map(p => p.id)
    });
    await new Promise(r => setTimeout(r, 2000));
  }

  const q         = game.questions[game.round - 1];
  game.currentQ   = q;
  game.answered   = false;
  arena.setGame(chatId, game);

  const opts = Object.entries(q.options)
    .map(([k, v]) => `*${k}*: ${v}`)
    .join('\n');

  await sock.sendMessage(chatId, {
    text:
      `🧠 *QUESTION ${game.round}/${TOTAL_QUESTIONS}*\n` +
      `📂 ${q.category}\n\n` +
      `❓ ${q.question}\n\n` +
      `${opts}\n\n` +
      `⚡ First correct letter wins! (${QUESTION_SECONDS}s)`
  });

  const t = setTimeout(async () => {
    const g = arena.getGame(chatId);
    if (!g || g.answered || g.round !== game.round) return;
    await sock.sendMessage(chatId, {
      text: `⏰ Time's up! Correct answer: *${q.correct}* — ${q.options[q.correct]}\n\nNext question...`
    });
    g.round++;
    arena.setGame(chatId, g);
    await new Promise(r => setTimeout(r, 1500));
    nextRound(sock, chatId, cfg);
  }, QUESTION_SECONDS * 1000);

  game._roundTimer = t;
  arena.trackTimer(chatId, t);
  arena.setGame(chatId, game);
};

// ── Finish game ────────────────────────────────────

const finishGame = async (sock, chatId, game) => {
  const sorted   = [...game.players].sort((a, b) => (game.scores[b.id] || 0) - (game.scores[a.id] || 0));
  const topScore = game.scores[sorted[0].id] || 0;
  const tied     = sorted.filter(p => (game.scores[p.id] || 0) === topScore);

  if (tied.length > 1) {
    // Sudden death — fetch one more question
    const extra = await fetchQuestions();
    const sdQ   = extra ? extra[0] : {
      question: 'What is 7 × 8?', options: { A: '54', B: '56', C: '58', D: '64' }, correct: 'B', category: 'shadowgames'
    };
    game.round       = 'sudden-death';
    game.answered    = false;
    game.tiedPlayers = tied.map(p => p.id);
    game.currentQ    = sdQ;
    arena.setGame(chatId, game);

    const opts = Object.entries(sdQ.options).map(([k, v]) => `*${k}*: ${v}`).join('\n');
    await sock.sendMessage(chatId, {
      text:
        `🏁 *FINAL SCORES*\n\n${buildScoreboard(game)}\n\n` +
        `⚡ TIE! Sudden death:\n❓ ${sdQ.question}\n\n${opts}`,
      mentions: game.players.map(p => p.id)
    });

    const t = setTimeout(async () => {
      const g = arena.getGame(chatId);
      if (!g || g.answered) return;
      arena.endGame(chatId);
      await sock.sendMessage(chatId, {
        text: `⏰ Nobody answered! All tied players win! 🎉\nAnswer: *${sdQ.correct}* — ${sdQ.options[sdQ.correct]}`
      });
    }, QUESTION_SECONDS * 1000);

    arena.trackTimer(chatId, t);
    return;
  }

  const winner = sorted[0];
  for (const p of game.players) globalXP.addXP(p.id, p.name || p.id.split('@')[0]);
  arena.endGame(chatId);
  await sock.sendMessage(chatId, {
    text:
      `🏆 *TRIVIA WAR OVER!*\n\n` +
      `${buildScoreboard(game)}\n\n` +
      `🥇 Winner: @${winner.id.split('@')[0]} with *${game.scores[winner.id]}* points!`,
    mentions: [winner.id]
  });
};

// ── Input handler ──────────────────────────────────

const onInput = async (sock, msg, text, chatId, sender, senderNumber, game, cfg) => {
  if (!game.currentQ || game.answered) return false;
  if (!game.players.some(p => p.id === sender)) return false;
  if (game.round === 'sudden-death' && game.tiedPlayers && !game.tiedPlayers.includes(sender)) return false;

  const answer = text.trim().toUpperCase();
  if (!['A', 'B', 'C', 'D'].includes(answer)) return false;

  if (answer !== game.currentQ.correct) return false; // Wrong — no penalty, others can still answer

  if (game._roundTimer) { clearTimeout(game._roundTimer); game._roundTimer = null; }
  game.answered = true;

  if (game.round === 'sudden-death') {
    arena.endGame(chatId);
    await sock.sendMessage(chatId, {
      text:
        `⚡ *SUDDEN DEATH!*\n\n` +
        `🥇 @${sender.split('@')[0]} got it!\n` +
        `Answer: *${game.currentQ.correct}* — ${game.currentQ.options[game.currentQ.correct]}`,
      mentions: [sender]
    });
    return true;
  }

  game.scores[sender] = (game.scores[sender] || 0) + 1;
  game.round++;
  arena.setGame(chatId, game);

  await sock.sendMessage(chatId, {
    text:
      `✅ Correct! *${game.currentQ.correct}* — ${game.currentQ.options[game.currentQ.correct]}\n\n` +
      `🏅 @${sender.split('@')[0]} gets a point! (${game.scores[sender]} total)`,
    mentions: [sender]
  }, { quoted: msg });

  await new Promise(r => setTimeout(r, 1500));
  nextRound(sock, chatId, cfg);
  return true;
};

// ── Plugin export ──────────────────────────────────

module.exports = {
  command:     'triviawar',
  aliases:     [],
  category:    'arena',
  description: 'Trivia War — answer A/B/C/D fastest to score (15 questions)',

  execute: async ({ sock, msg, args, sender, senderNumber, chatId, isOwner, isSudo, cfg, prefix, reply }) => {
    const sub = args[0]?.toLowerCase();

    if (sub === 'stop') {
      const game = arena.getGame(chatId);
      if (!game || game.type !== 'triviawar') return reply('✘ No active Trivia War here.');
      if (!isOwner && !isSudo && game.host.id !== sender) return reply('✘ Only the host or admin can stop this.');
      arena.endGame(chatId);
      return reply('🛑 Trivia War stopped.');
    }

    if (sub !== 'start') {
      return reply(p.phrases.wrongUsage('use .triviawar start to begin. or .triviawar stop to end it.'));
    }

    if (arena.hasActiveGame(chatId)) {
      const g = arena.getGame(chatId);
      return reply(`⚠️ *${arena.GAME_TITLES[g.type]}* is already active.\nUse \`${arena.STOP_COMMANDS[g.type]}\` to end it first.`);
    }

    const name  = msg.pushName || senderNumber;
    const state = {
      type:      'triviawar',
      status:    'waiting',
      host:      { id: sender, name },
      players:   [{ id: sender, name }],
      scores:    {},
      round:     1,
      questions: [],
      currentQ:  null,
      answered:  false,
      _timers:   [],
      _onJoin:   onJoin,
      _onInput:  onInput,
    };

    arena.setGame(chatId, state);

    const lobbyT = setTimeout(() => startGame(sock, chatId, cfg), LOBBY_SECONDS * 1000);
    arena.trackTimer(chatId, lobbyT);

    await sock.sendMessage(chatId, {
      text:
        `🧠 *TRIVIA WAR — LOBBY OPEN*\n\n` +
        `@${sender.split('@')[0]} started a lobby!\n\n` +
        `Type *join* to enter.\n` +
        `Game starts in *2 minutes*.\n` +
        `Need at least ${MIN_PLAYERS} players.\n\n` +
        `Stop: \`${prefix}triviawar stop\``,
      mentions: [sender]
    }, { quoted: msg });
  }
};
