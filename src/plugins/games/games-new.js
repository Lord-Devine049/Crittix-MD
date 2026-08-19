/*
 * GAMES-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: kingofthehill, survivor, crimescene, drawthat, solveit, fortuneteller,
 *           powerranking, impersonator, confessionbox, wouldyoufight, deathroll, guessthevoice
 */
const globalXP = require('../../lib/global-xp');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (f) => path.join(process.cwd(), 'database', f);
const loadDB = (f) => { try { return fs.existsSync(DB(f)) ? JSON.parse(fs.readFileSync(DB(f),'utf8')) : {}; } catch { return {}; } };
const saveDB = (f, d) => { try { fs.ensureDirSync(path.dirname(DB(f))); fs.writeFileSync(DB(f), JSON.stringify(d,null,2)); } catch {} };

const FORTUNES = [
  "Your wallet will cry before the month ends. Not a prediction, just math.",
  "Someone in your contacts is talking about you RIGHT NOW. Doesn't matter — they're wrong.",
  "You will make a decision this week that seems smart but is obviously not. Good luck.",
  "The universe has a plan for you. The plan is called consequences.",
  "A great opportunity is coming. You will overthink it and miss it.",
  "Money is coming your way. Very slowly. Possibly never.",
  "Your enemies are losing. Your allies are also losing. Everyone is losing.",
  "A loyal friend is watching over you. They're also judging your choices.",
  "Change is near. You are not ready. Nobody ever is.",
  "Your potential is unlimited. Unfortunately, so is your procrastination.",
];

const DESCRIBE_THINGS = [
  'A melting ice cream cone on a hot day',
  'A WiFi router that keeps disconnecting',
  'Someone trying to parallel park for 10 minutes',
  'A phone battery at 1% during an important call',
  'The feeling of stepping on Lego in the dark',
  'A cat knocking things off a table on purpose',
  'Sending a risky text and immediately regretting it',
  'Running to catch a bus and it pulls off anyway',
];

const LOGIC_PUZZLES = [
  { q: 'A man walks into a restaurant and orders albatross soup. He goes home and kills himself. Why?', hint: 'Think about what he discovered.', a: 'echo' },
  { q: 'I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?', hint: "It's a riddle about sound.", a: 'echo' },
  { q: 'The more you take, the more you leave behind. What am I?', hint: null, a: 'footsteps' },
  { q: 'What has hands but cannot clap?', hint: null, a: 'clock' },
  { q: 'I have cities but no houses, mountains but no trees, water but no fish. What am I?', hint: null, a: 'map' },
];

const MURDER_SCENES = [
  { setup: 'A CEO is found dead in his locked penthouse. No signs of forced entry. The only person with a key is his assistant.', clues: ['A cup of untouched coffee on the desk', 'The window was cracked open', 'A note saying "I know what you did"'], suspects: ['Assistant','Business rival','Estranged wife'], killer: 'Business rival', explain: "The rival climbed the fire escape, slipped through the cracked window, killed him, and used a copied key. The note was a bluff planted to implicate the assistant." },
];

// ─── Active game state (in-memory) ────────────────────────────────────────
// Keyed as: `draw_<chatId>`, `solve_<chatId>`, `voice_<chatId>`
const activeGames = new Map();

// ─── checkAnswer — wire into message handler (like fastest.js) ────────────
// Returns true if a game answer was handled (so the handler can skip further processing)
const checkAnswer = (chatId, sender, senderName, text, sock, msg) => {
  const body = (text || '').trim().toLowerCase();
  const senderNum = sender.split('@')[0];

  // drawthat
  const drawKey = `draw_${chatId}`;
  if (activeGames.has(drawKey)) {
    const game = activeGames.get(drawKey);
    if (Date.now() < game.expires && body === game.answer) {
      activeGames.delete(drawKey);
      const newXP = globalXP.addXP(sender, senderName || senderNum);
      sock.sendMessage(chatId, {
        text: `🎨 *DRAW THAT — WINNER!*\n\n@${senderNum} got it!\n\n📝 It was: *${game.full}*\n\n🏆 +${globalXP.XP_PER_GAME} XP | Total: *${newXP} XP*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
        mentions: [sender],
      }, { quoted: msg });
      return true;
    }
  }

  // solveit
  const solveKey = `solve_${chatId}`;
  if (activeGames.has(solveKey)) {
    const game = activeGames.get(solveKey);
    if (Date.now() < game.expires && game.answers.some(a => body.includes(a))) {
      activeGames.delete(solveKey);
      const newXP = globalXP.addXP(sender, senderName || senderNum);
      sock.sendMessage(chatId, {
        text: `🧩 *PUZZLE SOLVED!*\n\n@${senderNum} cracked it first!\n\n💡 Answer: *${game.answers[0]}*\n\n🏆 +${globalXP.XP_PER_GAME} XP | Total: *${newXP} XP*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
        mentions: [sender],
      }, { quoted: msg });
      return true;
    }
  }

  // guessthevoice
  const voiceKey = `voice_${chatId}`;
  if (activeGames.has(voiceKey)) {
    const game = activeGames.get(voiceKey);
    if (Date.now() < game.expires && game.answers.some(a => body.includes(a))) {
      activeGames.delete(voiceKey);
      const newXP = globalXP.addXP(sender, senderName || senderNum);
      sock.sendMessage(chatId, {
        text: `🎙️ *VOICE GUESS — CORRECT!*\n\n@${senderNum} knew it!\n\n🎭 It was: *${game.full}*\n\n🏆 +${globalXP.XP_PER_GAME} XP | Total: *${newXP} XP*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
        mentions: [sender],
      }, { quoted: msg });
      return true;
    }
  }

  // wouldyoufight — only the challenged person can respond yes/no
  // Compare by phone number (strip @domain) to survive LID vs @s.whatsapp.net mismatch
  const fightKey = `fight_${chatId}`;
  if (activeGames.has(fightKey)) {
    const game = activeGames.get(fightKey);
    if (Date.now() > game.expires) {
      activeGames.delete(fightKey);
    } else {
      const senderPhone  = sender.split('@')[0].replace(/:\d+$/, '');
      const targetPhone  = game.targetPhone; // always the raw phone digits
      const isTarget     = senderPhone === targetPhone;
      if (isTarget && (body === 'yes' || body === 'no')) {
        activeGames.delete(fightKey);
        const challengerNum = game.challengerPhone;
        const targetNum     = game.targetPhone;
        const challengerJid = game.challenger;
        const targetJid     = game.targetJid;

        if (body === 'no') {
          // Target backed down — challenger wins by default, target loses aura
          const noLines = [
            `@${targetNum} said *No*. Smart move. Or just terrified. Hard to tell. 🐔`,
            `@${targetNum} declined. Peaceful soul. Definitely not shaking inside. 🕊️`,
            `@${targetNum} is too evolved for violence. Sure. 🙄`,
            `@${targetNum} backed out. @${challengerNum} wins the group's respect by default. 😏`,
          ];
          sock.sendMessage(chatId, {
            text: `🏳️ *FIGHT DECLINED*\n\n${noLines[Math.floor(Math.random() * noLines.length)]}\n\n` +
              `@${challengerNum} 🏆 wins without throwing a single punch.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
            mentions: [challengerJid, targetJid],
          }, { quoted: msg });
          return true;
        }

        // ── YES — run the fight simulation ──────────────────────────────
        // Generate stats seeded from phone numbers (consistent per person, but with round randomness)
        const seed = (num) => {
          let h = 0;
          for (let i = 0; i < num.length; i++) h = (Math.imul(31, h) + num.charCodeAt(i)) | 0;
          return Math.abs(h);
        };
        const statOf = (num, offset) => 40 + ((seed(num) + offset * 7) % 61); // 40-100
        const rand   = () => Math.random();

        const cStats = {
          str:   statOf(challengerNum, 0),
          spd:   statOf(challengerNum, 1),
          iq:    statOf(challengerNum, 2),
          trash: statOf(challengerNum, 3),
          dirty: statOf(challengerNum, 4),
        };
        const tStats = {
          str:   statOf(targetNum, 0),
          spd:   statOf(targetNum, 1),
          iq:    statOf(targetNum, 2),
          trash: statOf(targetNum, 3),
          dirty: statOf(targetNum, 4),
        };

        // Round scoring: each stat contributes with some randomness
        const roundScore = (s) =>
          s.str * (0.4 + rand() * 0.4) +
          s.spd * (0.2 + rand() * 0.3) +
          s.iq  * (0.1 + rand() * 0.2) +
          s.dirty * (0.1 + rand() * 0.3);

        const r1c = roundScore(cStats), r1t = roundScore(tStats);
        const r2c = roundScore(cStats), r2t = roundScore(tStats);
        const r3c = roundScore(cStats), r3t = roundScore(tStats);

        const cWins = [r1c > r1t, r2c > r2t, r3c > r3t].filter(Boolean).length;
        const tWins = 3 - cWins;
        const challengerWon = cWins > tWins;

        const winnerNum  = challengerWon ? challengerNum : targetNum;
        const loserNum   = challengerWon ? targetNum     : challengerNum;
        const winnerJid  = challengerWon ? challengerJid : targetJid;
        const loserJid   = challengerWon ? targetJid     : challengerJid;

        const roundLine = (rnd, cScore, tScore) => {
          const cW = cScore > tScore;
          const margin = Math.abs(cScore - tScore);
          const close  = margin < 8;
          const oneLiners = cW
            ? [`🥊 Round ${rnd}: @${challengerNum} connects clean — @${targetNum} wobbles`,
               `💥 Round ${rnd}: @${challengerNum} lands the combo — @${targetNum} barely keeps standing`]
            : [`🥊 Round ${rnd}: @${targetNum} slips the punch and counters hard`,
               `💥 Round ${rnd}: @${targetNum} finds the gap — @${challengerNum} takes the hit`];
          return close
            ? `⚡ Round ${rnd}: Too close to call — both fighters dig deep`
            : oneLiners[Math.floor(rand() * oneLiners.length)];
        };

        const winnerLines = [
          `🏆 @${winnerNum} WINS! @${loserNum} never had a chance.`,
          `🏆 @${winnerNum} is the last one standing. @${loserNum} needs a minute.`,
          `🏆 Unanimous: @${winnerNum} takes it. @${loserNum} has questions for their trainer.`,
          `🏆 @${winnerNum} by unanimous decision. The crowd goes wild. @${loserNum} does not.`,
        ];

        const xpGained   = globalXP.XP_PER_GAME;
        const newWinXP   = globalXP.addXP(winnerJid, winnerNum, xpGained);

        const bar = (val) => '█'.repeat(Math.round(val / 10)) + '░'.repeat(10 - Math.round(val / 10));

        sock.sendMessage(chatId, {
          text:
            `👊 *FIGHT ACCEPTED — LET'S GO!*\n\n` +
            `┌─ 🥊 FIGHTER CARDS ─────────────\n` +
            `│ @${challengerNum}\n` +
            `│ 💪 ${bar(cStats.str)} ${cStats.str}\n` +
            `│ ⚡ ${bar(cStats.spd)} ${cStats.spd}\n` +
            `│ 🧠 ${bar(cStats.iq)}  ${cStats.iq}\n` +
            `│ 🗣️ ${bar(cStats.trash)} ${cStats.trash}\n` +
            `│ 🤛 ${bar(cStats.dirty)} ${cStats.dirty}\n` +
            `├────── VS ───────────────────────\n` +
            `│ @${targetNum}\n` +
            `│ 💪 ${bar(tStats.str)} ${tStats.str}\n` +
            `│ ⚡ ${bar(tStats.spd)} ${tStats.spd}\n` +
            `│ 🧠 ${bar(tStats.iq)}  ${tStats.iq}\n` +
            `│ 🗣️ ${bar(tStats.trash)} ${tStats.trash}\n` +
            `│ 🤛 ${bar(tStats.dirty)} ${tStats.dirty}\n` +
            `└────────────────────────────────\n\n` +
            `${roundLine(1, r1c, r1t)}\n` +
            `${roundLine(2, r2c, r2t)}\n` +
            `${roundLine(3, r3c, r3t)}\n\n` +
            `*Score: ${cWins}-${tWins}*\n\n` +
            `${winnerLines[Math.floor(rand() * winnerLines.length)]}\n\n` +
            `🏅 @${winnerNum} earned *+${xpGained} XP* | Total: *${newWinXP} XP*\n\n` +
            `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: [challengerJid, targetJid],
        }, { quoted: msg });
        return true;
      }
    }
  }

  return false;
};

// ─── Commands ─────────────────────────────────────────────────────────────

module.exports = [

  {
    command: 'kingofthehill',
    aliases: ['koth', 'hillking'],
    category: 'arena',
    description: 'Start/view King of the Hill. Win grouptrivia to dethrone the king. Usage: .kingofthehill',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      const db = loadDB('koth.json');
      if (!db[chatId]) {
        db[chatId] = { king: sender, kingName: msg.pushName || sender.split('@')[0], wins: 0, since: Date.now() };
        saveDB('koth.json', db);
        // First king gets a small crown XP bonus
        globalXP.addXP(sender, msg.pushName || sender.split('@')[0], 3);
        return reply(
          `👑 *KING OF THE HILL STARTED!*\n\n` +
          `@${sender.split('@')[0]} is the first king!\n\n` +
          `👑 +3 XP for claiming the throne first.\n\n` +
          `Beat the king in *.grouptrivia* to dethrone them!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }
      const k = db[chatId];
      const daysOnThrone = Math.floor((Date.now() - k.since) / 86400000);
      const kingXP = globalXP.getUserXP(k.king);
      reply(
        `👑 *KING OF THE HILL*\n\n` +
        `*Current King:* @${k.kingName || k.king?.split('@')[0]}\n` +
        `*Reign:* ${daysOnThrone} day(s)\n` +
        `*Wins:* ${k.wins}\n` +
        `*King's XP:* ${kingXP?.xp || 0}\n\n` +
        `👊 Dethrone them — beat them in *.grouptrivia* and claim the throne!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'survivor',
    aliases: ['survivorgame', 'elimination'],
    category: 'arena',
    description: 'Survivor elimination game. Usage: .survivor start|vote @user|tally|status',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, args, reply, isOwner, isSudo }) => {
      const db = loadDB('survivor.json');
      const action = (args[0] || 'status').toLowerCase();

      if (action === 'start') {
        if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
        if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
        const meta = await sock.groupMetadata(chatId);
        const players = meta.participants.map(p => p.id);
        db[chatId] = { active: true, players, eliminated: [], round: 1, votes: {}, startedBy: sender, startedAt: Date.now() };
        saveDB('survivor.json', db);
        return reply(
          `🏝️ *SURVIVOR STARTED!*\n\n*${players.length} players* are in.\n\n` +
          `Vote to eliminate: *.survivor vote @user*\n` +
          `Admin tallies: *.survivor tally*\n` +
          `*Last one standing wins XP!* 🏆\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }

      if (action === 'vote') {
        const game = db[chatId];
        if (!game?.active) return reply(h.demonFail('No Survivor game active. Start one with .survivor start'));
        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return reply(h.demonFail('Mention who you want to vote out: .survivor vote @user'));
        if (!game.players.includes(target)) return reply(h.demonFail('That player is not in the game.'));
        if (game.eliminated.includes(target)) return reply(h.demonFail('That player is already eliminated.'));
        game.votes[sender] = target;
        saveDB('survivor.json', db);
        return reply(h.demonSuccess(`Vote cast for @${target.split('@')[0]}. Others can vote too.`));
      }

      if (action === 'tally') {
        if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
        if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
        const game = db[chatId];
        if (!game?.active) return reply(h.demonFail('No active game.'));
        const counts = {};
        Object.values(game.votes).forEach(jid => { counts[jid] = (counts[jid] || 0) + 1; });
        const eliminated = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
        if (!eliminated) return reply(h.demonFail('No votes cast this round.'));
        game.eliminated.push(eliminated[0]);
        game.players = game.players.filter(p => p !== eliminated[0]);
        game.votes = {};
        game.round++;
        if (game.players.length <= 1) {
          const winner = game.players[0];
          game.active = false;
          saveDB('survivor.json', db);
          if (winner) {
            const winName = winner.split('@')[0];
            const newXP = globalXP.addXP(winner, winName);
            return sock.sendMessage(chatId, {
              text:
                `🏆 *SURVIVOR OVER!*\n\n` +
                `👑 Winner: @${winName}\n\n` +
                `Last one standing. Truly survived.\n\n` +
                `🏆 +${globalXP.XP_PER_GAME} XP | Total: *${newXP} XP*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
              mentions: [winner],
            });
          }
          return reply(`🏝️ Everyone got eliminated. Nobody wins. Absolutely tragic.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
        saveDB('survivor.json', db);
        reply(
          `🔥 *ROUND ${game.round - 1} RESULTS*\n\n` +
          `❌ Eliminated: @${eliminated[0].split('@')[0]} (${eliminated[1]} votes)\n\n` +
          `*${game.players.length} players remain.*\n` +
          `Round ${game.round} — vote again!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
        return;
      }

      const game = db[chatId];
      if (!game?.active) return reply(`🏝️ No active Survivor game.\n\nStart one: *.survivor start* (admin)\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      reply(
        `🏝️ *SURVIVOR — Round ${game.round}*\n\n` +
        `*Players left:* ${game.players.length}\n` +
        `*Eliminated:* ${game.eliminated.length}\n` +
        `*Votes cast this round:* ${Object.keys(game.votes).length}\n\n` +
        `.survivor vote @user | .survivor tally (admin)\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'crimescene',
    aliases: ['murdermystery', 'whodunit'],
    category: 'arena',
    description: 'Murder mystery — vote on the killer from clues. Most correct voters share XP. Usage: .crimescene',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, reply }) => {
      const scene = MURDER_SCENES[Math.floor(Math.random() * MURDER_SCENES.length)];
      const clueList = scene.clues.map((c,i) => `🔍 Clue ${i+1}: ${c}`).join('\n');
      const suspectList = scene.suspects.map((s,i) => `${i+1}. ${s}`).join('\n');

      // Collect votes: jid → suspectName
      const votes = {};

      await sock.sendMessage(chatId, {
        text:
          `🔍 *MURDER MYSTERY*\n\n📍 *Scene:*\n${scene.setup}\n\n` +
          `${clueList}\n\n*Suspects:*\n${suspectList}\n\n` +
          `Reply the suspect's *name* to vote! Reveal in 2 minutes.\n` +
          `Correct voters earn *+${globalXP.XP_PER_GAME} XP* each!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });

      // Store pending vote collector in activeGames so message handler can feed votes
      activeGames.set(`crime_${chatId}`, {
        votes,
        killer: scene.killer.toLowerCase(),
        expires: Date.now() + 120000,
      });

      setTimeout(async () => {
        const game = activeGames.get(`crime_${chatId}`);
        if (!game) return;
        activeGames.delete(`crime_${chatId}`);

        // Find most-voted suspect
        const counts = {};
        Object.values(game.votes).forEach(v => { counts[v] = (counts[v]||0)+1; });
        const topGuess = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
        const groupGuess = topGuess?.[0] || 'nobody';
        const correct = groupGuess === game.killer;

        // Award XP to everyone who voted correctly
        const correctVoters = Object.entries(game.votes)
          .filter(([,v]) => v === game.killer)
          .map(([jid]) => jid);
        for (const jid of correctVoters) {
          globalXP.addXP(jid, jid.split('@')[0]);
        }

        await sock.sendMessage(chatId, {
          text:
            `🔍 *MYSTERY SOLVED*\n\n*Real killer:* ${scene.killer}\n\n${scene.explain}\n\n` +
            `${correct ? '✅ The group got it right! Certified detectives.' : "❌ Wrong! Y'all are terrible at this."}\n\n` +
            `${correctVoters.length ? `🏆 +${globalXP.XP_PER_GAME} XP each for: ${correctVoters.map(j=>'@'+j.split('@')[0]).join(', ')}` : '💀 Nobody voted correctly.'}\n\n` +
            `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: correctVoters,
        });
      }, 120000);
    }
  },

  {
    command: 'drawthat',
    aliases: ['guessit', 'pictiochat'],
    category: 'arena',
    description: 'Pictionary-style — bot describes, first correct guess wins XP. Usage: .drawthat',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, reply }) => {
      if (activeGames.has(`draw_${chatId}`)) return reply(h.demonFail('A drawthat round is already active! Guess it or wait for timeout.'));
      const thing = DESCRIBE_THINGS[Math.floor(Math.random() * DESCRIBE_THINGS.length)];
      const word = thing.split(' ').slice(-1)[0].toLowerCase().replace(/[^a-z]/g,'');
      const blanks = word.split('').map((c,i) => i === 0 ? c : '_').join(' ');
      activeGames.set(`draw_${chatId}`, { answer: word, full: thing, expires: Date.now() + 45000 });
      setTimeout(() => {
        if (activeGames.has(`draw_${chatId}`)) {
          activeGames.delete(`draw_${chatId}`);
          sock.sendMessage(chatId, {
            text: `⏰ Time's up! Nobody got it.\n\n📝 It was: *${thing}*\nNo XP for you lot.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
          });
        }
      }, 45000);
      await sock.sendMessage(chatId, {
        text:
          `🎨 *DRAW THAT*\n\n📝 Description:\n"${thing}"\n\n` +
          `❓ What is this? First correct guess wins *+${globalXP.XP_PER_GAME} XP*!\n` +
          `Hint: ${blanks}\n\n⏱️ 45 seconds!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  },

  {
    command: 'solveit',
    aliases: ['logicpuzzle', 'riddleme'],
    category: 'arena',
    description: 'Logic puzzle — first correct answer wins XP. Usage: .solveit',
    execute: async ({ sock, msg, chatId, reply }) => {
      if (activeGames.has(`solve_${chatId}`)) return reply(h.demonFail('A puzzle is already active! Solve it first.'));
      const puzzle = LOGIC_PUZZLES[Math.floor(Math.random() * LOGIC_PUZZLES.length)];
      // Store all acceptable answer variants
      const answers = [puzzle.a.toLowerCase()];
      activeGames.set(`solve_${chatId}`, { answers, fullAnswer: puzzle.a, expires: Date.now() + 60000 });
      setTimeout(() => {
        if (activeGames.has(`solve_${chatId}`)) {
          activeGames.delete(`solve_${chatId}`);
          sock.sendMessage(chatId, {
            text: `⏰ Nobody solved it!\n\n💡 Answer: *${puzzle.a}*\nNo XP. Embarrassing.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
          });
        }
      }, 60000);
      await sock.sendMessage(chatId, {
        text:
          `🧩 *LOGIC PUZZLE*\n\n${puzzle.q}\n\n` +
          `${puzzle.hint ? `💡 Hint: ${puzzle.hint}\n\n` : ''}` +
          `First correct answer wins *+${globalXP.XP_PER_GAME} XP*! 60 seconds.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  },

  {
    command: 'fortuneteller',
    aliases: ['myfuture', 'crystalball'],
    category: 'arena',
    description: 'Sarcastic fortune reading. Usage: .fortuneteller',
    execute: async ({ msg, reply }) => {
      const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      const name = msg.pushName || 'you';
      reply(
        `🔮 *FORTUNE READING*\n\n` +
        `_Consulting the ancient spirits for ${name}..._\n\n` +
        `*Your fortune:*\n"${fortune}"\n\n` +
        `⭐ Accuracy: ${Math.floor(Math.random() * 30 + 60)}%\n` +
        `🎱 Trust this: *at your own risk*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'powerranking',
    aliases: ['rankus', 'groupranking'],
    category: 'arena',
    description: 'Vote to rank group members on a trait. Top vote-getter wins XP. adminOnly to start. Usage: .powerranking <trait>',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, text, args, reply, isOwner, isSudo }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const trait = text || args.join(' ');
      if (!trait) return reply(h.demonError('.powerranking', '.powerranking <trait>', 'e.g. .powerranking most likely to go broke'));
      const db = loadDB('powerrankings.json');
      db[chatId] = { trait, votes: {}, startedAt: Date.now(), active: true };
      saveDB('powerrankings.json', db);
      setTimeout(async () => {
        const g = loadDB('powerrankings.json');
        if (!g[chatId]?.active) return;
        g[chatId].active = false;
        saveDB('powerrankings.json', g);
        const counts = {};
        Object.values(g[chatId].votes).forEach(jid => { counts[jid] = (counts[jid]||0)+1; });
        const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
        const list = sorted.slice(0,5).map(([jid,c],i) => `${i+1}. @${jid.split('@')[0]} — ${c} vote(s)`).join('\n');
        // Award XP to the most-voted person
        let xpLine = '';
        if (sorted[0]) {
          const topJid = sorted[0][0];
          const newXP = globalXP.addXP(topJid, topJid.split('@')[0]);
          xpLine = `\n\n🏆 @${topJid.split('@')[0]} earns +${globalXP.XP_PER_GAME} XP | Total: *${newXP} XP*`;
        }
        await sock.sendMessage(chatId, {
          text:
            `🏆 *POWER RANKING RESULTS*\n\n🎯 Trait: "${trait}"\n\n` +
            `${list || 'No votes cast. Cowards.'}${xpLine}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: sorted[0] ? [sorted[0][0]] : [],
        });
      }, 2 * 60 * 1000);
      await sock.sendMessage(chatId, {
        text:
          `🏆 *POWER RANKING*\n\n🎯 Who in this group is most: *"${trait}"*?\n\n` +
          `Vote by mentioning them: *.rankfor @user*\n` +
          `Most-voted wins *+${globalXP.XP_PER_GAME} XP*! Results in 2 minutes!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  },

  {
    command: 'impersonator',
    aliases: ['impersonate', 'mimicgame'],
    category: 'arena',
    description: 'Bot picks a member for others to impersonate. Usage: .impersonator',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, reply }) => {
      try {
        const meta = await sock.groupMetadata(chatId);
        const { botJid: _botJid, botLid: _botLid } = h.getBotJids(sock);
        const members = meta.participants.filter(p => !p.admin && !h.isBotParticipant(p, _botJid, _botLid));
        if (members.length < 2) return reply(p.phrases.adminOnly());
        const target = members[Math.floor(Math.random() * members.length)];
        const num = target.id.split('@')[0];
        await sock.sendMessage(chatId, {
          text:
            `🎭 *IMPERSONATOR GAME*\n\nTarget: @${num}\n\n` +
            `Everyone has *2 minutes* to impersonate how @${num} usually texts in this group.\n\n` +
            `Best impersonator gets bragging rights + *+${globalXP.XP_PER_GAME} XP* (admin picks the winner with .impersonatorwinner @user).\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: [target.id]
        }, { quoted: msg });
        // Store the active impersonator round so .impersonatorwinner can close it
        activeGames.set(`impersonate_${chatId}`, { target: target.id, expires: Date.now() + 120000 });
        setTimeout(() => {
          if (activeGames.has(`impersonate_${chatId}`)) {
            activeGames.delete(`impersonate_${chatId}`);
            const verdicts = [
              "The winner is obvious — you know who you are. 👑 Use *.impersonatorwinner @user* next time.",
              `Everyone was terrible. The real @${num} is irreplaceable.`,
              "Honestly? None of you captured the energy. Try harder next time.",
              "I refuse to pick a winner. This was embarrassing for all involved.",
            ];
            sock.sendMessage(chatId, {
              text: `🎭 *IMPERSONATOR OVER*\n\n${verdicts[Math.floor(Math.random()*verdicts.length)]}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
            });
          }
        }, 120000);
      } catch (e) { reply(h.demonFail(`Impersonator failed: ${e.message}`)); }
    }
  },

  {
    command: 'impersonatorwinner',
    aliases: ['impwinner', 'bestmimic'],
    category: 'arena',
    description: 'Admin crowns the best impersonator and awards them XP. Usage: .impersonatorwinner @user',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const game = activeGames.get(`impersonate_${chatId}`);
      if (!game) return reply(h.demonFail('No active impersonator round. Start one with .impersonator first.'));
      const winner = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!winner) return reply(h.demonFail('Mention who won: .impersonatorwinner @user'));
      activeGames.delete(`impersonate_${chatId}`);
      const winName = winner.split('@')[0];
      const newXP = globalXP.addXP(winner, winName);
      await sock.sendMessage(chatId, {
        text:
          `🎭 *IMPERSONATOR WINNER*\n\n` +
          `👑 @${winName} nailed it best.\n\n` +
          `Target was @${game.target.split('@')[0]} — and @${winName} captured the whole vibe.\n\n` +
          `🏆 +${globalXP.XP_PER_GAME} XP | Total: *${newXP} XP*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
        mentions: [winner, game.target],
      });
    }
  },

  {
    command: 'confessionbox',
    aliases: ['anonconfess', 'confession'],
    category: 'arena',
    description: 'Anonymous confession system. DM bot: .confessionbox <text>. Admins: .confessionbox open|close',
    execute: async ({ sock, msg, chatId, sender, text, args, isGroup, reply }) => {
      const action = (args[0] || '').toLowerCase();
      if (isGroup && (action === 'open' || action === 'close')) {
        if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
        if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
        const db = loadDB('confessionbox.json');
        if (!db[chatId]) db[chatId] = { open: false, count: 0 };
        db[chatId].open = action === 'open';
        saveDB('confessionbox.json', db);
        return reply(h.demonSuccess(`Confession box: *${action === 'open' ? 'OPEN' : 'CLOSED'}*\n\nMembers DM the bot: *.confessionbox <their confession>*`));
      }
      const confession = text?.replace(/^confessionbox\s*/i, '').trim() || args.slice(1).join(' ');
      if (!confession) return reply(h.demonFail('Include your confession: .confessionbox <text>'));
      const db = loadDB('confessionbox.json');
      const targetGroup = Object.entries(db).find(([gid, data]) => data?.open && gid !== chatId)?.[0];
      if (!targetGroup) return reply(p.phrases.adminOnly());
      db[targetGroup].count = (db[targetGroup].count || 0) + 1;
      const confNum = db[targetGroup].count;
      saveDB('confessionbox.json', db);
      await sock.sendMessage(targetGroup, {
        text: `💬 *ANONYMOUS CONFESSION #${confNum}*\n\n_"${confession}"_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      });
      reply(h.demonSuccess(`Confession #${confNum} posted anonymously. They'll never know it was you.`));
    }
  },

  {
    command: 'wouldyoufight',
    aliases: ['fightme', 'wouldufight'],
    category: 'arena',
    description: 'Bot picks a random group member and asks if you\'d fight them. Usage: .wouldyoufight',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      try {
        const meta = await sock.groupMetadata(chatId);

        // Filter out the challenger — also handle LID by comparing phone digits
        const challengerPhone = sender.split('@')[0].replace(/:\d+$/, '');
        const others = meta.participants.filter(p => {
          const pPhone = (p.phoneNumber || p.id || '').split('@')[0].replace(/:\d+$/, '');
          return pPhone !== challengerPhone;
        });
        if (!others.length) return reply(h.demonFail("Who are you gonna fight? The walls?"));

        const target = others[Math.floor(Math.random() * others.length)];

        // Resolve target phone number safely (prefer phoneNumber field, fall back to id digits)
        const targetPhone = (target.phoneNumber || target.id || '').split('@')[0].replace(/:\d+$/, '');
        // Resolve target JID to @s.whatsapp.net for mentions/XP
        const targetJid   = target.phoneNumber || (targetPhone + '@s.whatsapp.net');

        const flavors = [
          `@${targetPhone} has that quiet energy. Those are the most dangerous ones. 👀`,
          `@${targetPhone} looks like they bite first and ask questions never. 😤`,
          `@${targetPhone} would probably talk their way out before you land a punch. 🗣️`,
          `@${targetPhone} has nothing to lose and everything to gain. Walk away. 🚶`,
          `@${targetPhone} is not to be underestimated. Neither are you. But one of you is wrong. ⚠️`,
        ];

        // Store with phone-based fields so checkAnswer can match LID-resolved senders
        activeGames.set(`fight_${chatId}`, {
          challenger:      sender,
          challengerPhone: challengerPhone,
          targetJid:       targetJid,
          targetPhone:     targetPhone,
          expires:         Date.now() + 60 * 1000,
        });

        await sock.sendMessage(chatId, {
          text:
            `👊 *WOULD YOU FIGHT?*\n\n` +
            `${flavors[Math.floor(Math.random() * flavors.length)]}\n\n` +
            `@${targetPhone} — *@${challengerPhone}* is asking... would you fight them?\n\n` +
            `Reply *Yes* to throw hands or *No* to back down 💀 _(60 seconds)_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: [targetJid]            // ← only tag the challenged person
        }, { quoted: msg });
      } catch (e) { reply(h.demonFail(`Game failed: ${e.message}`)); }
    }
  },

  {
    command: 'deathroll',
    aliases: ['rolldie', 'deathdice'],
    category: 'arena',
    description: 'Deathroll — take turns rolling shrinking dice. Roll 1 and you lose. Previous roller wins XP. Usage: .deathroll [start <max>]',
    execute: async ({ sock, msg, chatId, sender, args, reply }) => {
      const db = loadDB('deathroll.json');
      const action = (args[0] || '').toLowerCase();
      const senderNum = sender.split('@')[0];
      const senderName = msg.pushName || senderNum;

      if (action === 'start' || !db[chatId]?.active) {
        const maxRoll = parseInt(args[1] || args[0]) || 100;
        if (isNaN(maxRoll) || maxRoll < 2 || maxRoll > 10000) return reply(h.demonFail('Starting roll must be between 2 and 10000.'));
        db[chatId] = { active: true, current: maxRoll, lastPlayer: null, lastPlayerName: null, round: 1 };
        saveDB('deathroll.json', db);
        return reply(
          `🎲 *DEATHROLL STARTED*\n\nStarting dice: *1-${maxRoll}*\n` +
          `Use *.deathroll* to roll. Whoever rolls *1* loses!\n` +
          `Survivor wins *+${globalXP.XP_PER_GAME} XP* 🏆\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }

      if (!db[chatId]?.active) return reply(h.demonFail('No active deathroll. Start one with: .deathroll start [max]'));
      const game = db[chatId];

      // Track previous player BEFORE updating to current sender
      const prevPlayer = game.lastPlayer;
      const prevPlayerName = game.lastPlayerName;

      const roll = Math.floor(Math.random() * game.current) + 1;
      game.round++;
      game.lastPlayer = sender;
      game.lastPlayerName = senderName;

      if (roll === 1) {
        game.active = false;
        saveDB('deathroll.json', db);

        // The previous roller is the winner (they survived)
        if (prevPlayer && prevPlayer !== sender) {
          const newXP = globalXP.addXP(prevPlayer, prevPlayerName || prevPlayer.split('@')[0]);
          return sock.sendMessage(chatId, {
            text:
              `🎲 *DEATHROLL*\n\n@${senderNum} rolled... *1*\n\n💀 *DEAD.* You lose.\n\n` +
              `🏆 @${prevPlayer.split('@')[0]} survives and wins *+${globalXP.XP_PER_GAME} XP* | Total: *${newXP} XP*\n\n` +
              `Game over in ${game.round} rounds.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
            mentions: [prevPlayer],
          });
        }
        // No previous player (first roll was 1) — no XP awarded
        return reply(
          `🎲 *DEATHROLL*\n\n@${senderNum} rolled *1* on the very first roll. 💀\n\nGame over instantly. No XP — not even a real game.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }

      game.current = roll;
      saveDB('deathroll.json', db);
      reply(
        `🎲 *DEATHROLL*\n\n@${senderNum} rolled: *${roll}*\n\nNext roll: *1-${roll}*\nDon't roll 1.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'guessthevoice',
    aliases: ['whosvoice', 'voiceguess'],
    category: 'arena',
    description: 'Guess the anime character from a voice description. First correct wins XP. Usage: .guessthevoice',
    execute: async ({ sock, msg, chatId, reply }) => {
      if (activeGames.has(`voice_${chatId}`)) return reply(h.demonFail('A voice guess round is already active!'));
      const voices = [
        { clue: 'High-energy, loud, always yelling about friendship and never giving up. Signature phrase involves "Nakama".', answers: ['luffy', 'monkey d luffy', 'monkey d. luffy'], full: 'Monkey D. Luffy (One Piece)' },
        { clue: 'Calm, calculating, and speaks only when necessary. Known for writing names in a notebook.', answers: ['light yagami', 'light', 'kira'], full: 'Light Yagami / Kira (Death Note)' },
        { clue: 'Speaks very little, often just grunts or says a number. Obsessed with training and being the strongest.', answers: ['goku', 'son goku', 'kakarot'], full: 'Son Goku (Dragon Ball)' },
        { clue: 'Polite but intense. Uses water-breathing techniques. Tends to have emotional monologues.', answers: ['tanjiro', 'tanjiro kamado'], full: 'Tanjiro Kamado (Demon Slayer)' },
        { clue: 'Extremely loud and easily panicked. Says "NANI?!" a lot. Extremely loyal to his comrades.', answers: ['naruto', 'naruto uzumaki'], full: 'Naruto Uzumaki (Naruto)' },
      ];
      const v = voices[Math.floor(Math.random() * voices.length)];
      activeGames.set(`voice_${chatId}`, { answers: v.answers, full: v.full, expires: Date.now() + 45000 });
      setTimeout(() => {
        if (activeGames.has(`voice_${chatId}`)) {
          activeGames.delete(`voice_${chatId}`);
          sock.sendMessage(chatId, {
            text: `⏰ Nobody guessed it!\n\n🎙️ It was: *${v.full}*\nWeeb credentials revoked. No XP.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
          });
        }
      }, 45000);
      await sock.sendMessage(chatId, {
        text:
          `🎙️ *GUESS THE VOICE*\n\n📝 Voice description:\n"${v.clue}"\n\n` +
          `Which anime character is this? First correct answer wins *+${globalXP.XP_PER_GAME} XP*!\n` +
          `⏱️ 45 seconds!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  }

];

module.exports.activeGames = activeGames;
module.exports.checkAnswer = checkAnswer;
