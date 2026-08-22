/*
 * GAMES-NEW3.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: guildjoin, guildwar, wordbomb2, mathrace2, guessthelyric, bluffgame,
 *           chessmove, truthorlie, whoismostlikely, speedtyping, emojistory,
 *           riddleduel, colorguess, flagrace, petrace, luckydraw, spotthedifference,
 *           chainreaction, impostorgame, truthbomb
 */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const DB = (file) => path.join(process.cwd(), 'database', file);
const loadDB = (file) => { try { return fs.existsSync(DB(file)) ? JSON.parse(fs.readFileSync(DB(file), 'utf8')) : {}; } catch { return {}; } };
const saveDB = (file, data) => { try { fs.ensureDirSync(path.dirname(DB(file))); fs.writeFileSync(DB(file), JSON.stringify(data, null, 2)); } catch {} };

const gameSessions = {};

module.exports = [

  {
    command: 'guildjoin',
    aliases: ['joinguild', 'enterguild'],
    category: 'arena',
    description: 'Join an existing guild in the group. Usage: guildjoin <guild name>',
    groupOnly: true,
    execute: async ({ sender, senderNumber, chatId, args, reply }) => {
      const name = args.join(' ').toLowerCase();
      if (!name) return reply(p.phrases.wrongUsage('provide the guild name to join. example! .guildjoin night raiders'));
      const guilds = loadDB('guilds.json');
      const chatGuilds = guilds[chatId] || {};
      const guild = Object.values(chatGuilds).find(g => g.name?.toLowerCase() === name);
      if (!guild) return reply(p.phrases.error(`no guild named "${name}" found in this group. Check *.guildlist* for available guilds.`));
      if (guild.members?.includes(sender)) return reply(p.phrases.alreadyEnabled('you are already in this guild. can\'t double-join.'));
      const userGuild = Object.values(chatGuilds).find(g => g.members?.includes(sender));
      if (userGuild) return reply(p.phrases.error(`you\'re already in "*${userGuild.name}*". Leave first or ask your guild leader.`));
      if (!guild.members) guild.members = [];
      guild.members.push(sender);
      saveDB('guilds.json', guilds);
      reply(`⚔️ *GUILD JOIN*\n\n@${senderNumber} has joined *${guild.name}*!\nMembers: ${guild.members.length}\n\nWelcome to the faction. Don't embarrass them. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'guildwar',
    aliases: ['startguildwar', 'warmode'],
    category: 'arena',
    description: 'Score-based guild vs guild battle event. Usage: guildwar <guild1> vs <guild2>',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, args, reply, isOwner, isSudo, sender }) => {
      if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const vsIdx = args.findIndex(a => a.toLowerCase() === 'vs');
      if (vsIdx < 1) return reply(p.phrases.wrongUsage('format it correctly. example! .guildwar night raiders vs peaky blinders'));
      const g1Name = args.slice(0, vsIdx).join(' ');
      const g2Name = args.slice(vsIdx + 1).join(' ');
      const guilds = loadDB('guilds.json');
      const chatGuilds = guilds[chatId] || {};
      const g1 = Object.values(chatGuilds).find(g => g.name?.toLowerCase() === g1Name.toLowerCase());
      const g2 = Object.values(chatGuilds).find(g => g.name?.toLowerCase() === g2Name.toLowerCase());
      if (!g1 || !g2) return reply(p.phrases.error(`couldn't find both guilds. Check names carefully.`));
      const g1Score = Math.floor(Math.random() * 50) + (g1.members?.length || 1) * 10;
      const g2Score = Math.floor(Math.random() * 50) + (g2.members?.length || 1) * 10;
      const winner = g1Score > g2Score ? g1 : g2;
      const loser = g1Score > g2Score ? g2 : g1;
      sock.sendMessage(chatId, {
        text: `⚔️ *GUILD WAR RESULTS*\n\n🏰 *${g1.name}* — ${g1Score} pts\n🏰 *${g2.name}* — ${g2Score} pts\n\n🏆 WINNER: *${winner.name}*\n💀 DEFEATED: *${loser.name}*\n\n${winner.name} stands victorious. ${loser.name} needs to go regroup. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    }
  },



  {
    command: 'guessthelyric',
    aliases: ['lyricquiz', 'lyricsguess'],
    category: 'arena',
    description: 'Guess the song from an original lyric clue. Usage: guessthelyric',
    execute: async ({ chatId, args, prefix, reply }) => {
      const key = `lyricguess_${chatId}`;
      const clues = [
        { clue: '"We will, we will… [blank] you" — what\'s the word?', answer: 'rock', song: '"We Will Rock You" by Queen' },
        { clue: '"Just a small-town girl, livin\' in a [blank] world" — fill the blank', answer: 'lonely', song: '"Don\'t Stop Believin\'" by Journey' },
        { clue: '"I\'m a survivor, I\'m not gonna [blank]" — fill the blank', answer: 'give up', song: '"Survivor" by Destiny\'s Child' },
        { clue: '"Started from the [blank], now we\'re here" — fill it', answer: 'bottom', song: '"Started From the Bottom" by Drake' },
        { clue: '"Can\'t stop, won\'t stop, [blank]" — complete it', answer: 'moving', song: '"Can\'t Stop the Feeling!" by Justin Timberlake' },
        { clue: '"Hello, it\'s me, I was wondering if after all these [blank]" — fill in', answer: 'years', song: '"Hello" by Adele' },
        { clue: '"Shake it off, shake it off… [blank], [blank], [blank]" — the repeated word', answer: 'shake', song: '"Shake It Off" by Taylor Swift' }
      ];
      if (!gameSessions[key] || args[0] === 'new') {
        const q = clues[Math.floor(Math.random() * clues.length)];
        gameSessions[key] = { answer: q.answer, song: q.song, time: Date.now() };
        return reply(`🎶 *GUESS THE LYRIC*\n\n${q.clue}\n\nUse: ${prefix}guessthelyric <your answer>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const guess = args.join(' ').toLowerCase().trim();
      if (guess.includes(game.answer)) {
        delete gameSessions[key];
        return reply(`🎉 *CORRECT!*\n\nThe answer was: *"${game.answer}"*\nFrom: *${game.song}*\n\nYou know your music. Crittix approves. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(`❌ Nope. Try again. Hint: "${game.answer.slice(0,1)}..."`);
    }
  },

  {
    command: 'bluffgame',
    aliases: ['bluff', 'callyourbluff'],
    category: 'arena',
    description: 'Bluffing mini-game. Claim a card value, opponent calls bluff or passes. Usage: bluffgame start | bluffgame claim <value> | bluffgame callbluff',
    execute: async ({ chatId, sender, senderNumber, args, prefix, reply }) => {
      const key = `bluff_${chatId}`;
      const action = args[0]?.toLowerCase();
      if (action === 'start' || !gameSessions[key]) {
        const cards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
        const hand = [cards[Math.floor(Math.random() * cards.length)], cards[Math.floor(Math.random() * cards.length)]];
        gameSessions[key] = { player: sender, hand, claimed: null };
        return reply(`🃏 *BLUFF GAME*\n\n@${senderNumber}'s hand: ||${hand.join(', ')}||\n\nClaim any value to bluff or tell truth: ${prefix}bluffgame claim <value>\nOpponents call: ${prefix}bluffgame callbluff\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      if (action === 'claim') {
        const claimedVal = args[1]?.toUpperCase() || '?';
        game.claimed = claimedVal;
        game.claimTime = Date.now();
        return reply(`🃏 @${senderNumber} claims: *${claimedVal}*\n\nDo you believe them?\n✅ Pass: ${prefix}bluffgame pass\n❌ Call bluff: ${prefix}bluffgame callbluff\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (action === 'callbluff') {
        if (!game.claimed) return reply(p.phrases.error('no claim to call yet'));
        const wasBluffing = !game.hand.includes(game.claimed);
        delete gameSessions[key];
        return reply(wasBluffing
          ? `🎯 *BLUFF CAUGHT!*\n\nTheir hand was: *${game.hand.join(', ')}* — NOT *${game.claimed}*\nYou called it perfectly. Sharp eyes. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
          : `💀 *WRONG CALL!*\n\nTheir hand was: *${game.hand.join(', ')}* — they told the truth!\nYou called bluff on an honest player. Embarrassing. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }
      if (action === 'pass') { return reply(p.phrases.success("passed. new round starting." The player gets away with it… for now. New round with ${prefix}bluffgame start`); }
      reply(p.phrases.wrongUsage('use .bluffgame start. or claim value. or callbluff. or pass.'));
    }
  },

  {
    command: 'chessmove',
    aliases: ['playchess', 'chessturn'],
    category: 'arena',
    description: 'Simplified text-based chess move tracker. Usage: chessmove start | chessmove <move e.g. e2-e4>',
    execute: async ({ chatId, sender, senderNumber, args, prefix, reply }) => {
      const key = `chess_${chatId}`;
      const action = args[0]?.toLowerCase();
      if (action === 'start' || !gameSessions[key]) {
        gameSessions[key] = { moves: [], turn: 'White', players: { White: sender } };
        return reply(`♟️ *CHESS TRACKER*\n\n*White* goes first: @${senderNumber}\nNext player joins as Black.\n\nEnter moves in notation e.g: ${prefix}chessmove e2-e4\nUse: ${prefix}chessmove resign to end.\n\nNo engine — just tracking. Play honor-based. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      if (action === 'resign') {
        const winner = game.turn === 'White' ? 'Black' : 'White';
        delete gameSessions[key];
        return reply(`🏳️ @${senderNumber} resigns. *${winner} wins!*\n\nGame over. ${game.moves.length} moves played.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (!game.players.Black && game.turn === 'White' && game.moves.length > 0) game.players.Black = sender;
      const move = args.join('-').replace(/\s/g, '');
      game.moves.push(`${game.turn}: ${move}`);
      const nextTurn = game.turn === 'White' ? 'Black' : 'White';
      game.turn = nextTurn;
      reply(`♟️ *${nextTurn === 'Black' ? 'White' : 'Black'}* played: *${move}*\n\nMove #${game.moves.length}\n*${nextTurn}*'s turn.\n\nHistory: ${game.moves.slice(-5).join(' | ')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'truthorlie',
    aliases: ['truthlie', 'trueorfalse2'],
    category: 'arena',
    description: 'Submit a statement, group guesses truth or lie. Usage: truthorlie <statement> | truthorlie reveal',
    execute: async ({ chatId, sender, senderNumber, args, prefix, reply }) => {
      const key = `tol_${chatId}`;
      const action = args[0]?.toLowerCase();
      if (action === 'reveal') {
        const game = gameSessions[key];
        if (!game) return reply(p.phrases.error('no active truth-or-lie game'));
        delete gameSessions[key];
        return reply(`🎭 *TRUTH OR LIE — REVEAL*\n\nStatement: "${game.statement}"\nSubmitted by: @${game.submitterNum}\n\nIt was: *${game.truth ? 'TRUTH ✅' : 'LIE ❌'}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const statement = args.slice(0, -1).join(' ') || args.join(' ');
      const truthFlag = args[args.length - 1]?.toLowerCase();
      if (!statement || (!['truth','lie'].includes(truthFlag) && args.length < 2)) return reply(p.phrases.wrongUsage('provide a statement then truth or lie. example! .truthorlie i have been to paris truth. or .truthorlie reveal.'));
      const isTruth = truthFlag === 'truth';
      const stmt = args.filter(a => a !== truthFlag).join(' ');
      gameSessions[key] = { statement: stmt, truth: isTruth, submitter: sender, submitterNum: senderNumber };
      reply(`🎭 *TRUTH OR LIE*\n\n@${senderNumber} says: "*${stmt}*"\n\nVote — Truth or Lie?\nReveal answer: ${prefix}truthorlie reveal\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'whoismostlikely',
    aliases: ['mostlikely', 'whosmost'],
    category: 'arena',
    description: 'Bot randomly picks a group member as "most likely to..." Usage: whoismostlikely <prompt>',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const prompt = args.join(' ') || 'do something completely unhinged';
      try {
        const meta = await sock.groupMetadata(chatId);
        const members = meta.participants.filter(p => !p.admin);
        if (!members.length) return reply(p.phrases.adminOnly());
        const picked = members[Math.floor(Math.random() * members.length)];
        const num = picked.id.split('@')[0];
        await sock.sendMessage(chatId, {
          text: `🎯 *WHO IS MOST LIKELY TO...*\n\n"...${prompt}"\n\n👉 *@${num}* 💀\n\nSorry not sorry. The algorithm decided. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: [picked.id]
        }, { quoted: msg });
      } catch (e) { reply(p.phrases.error(`couldn\'t get group members — ${e.message}`)); }
    }
  },

  {
    command: 'speedtyping',
    aliases: ['typetest', 'typingspeed'],
    category: 'arena',
    description: 'Typing speed test — retype the given sentence quickly. Usage: speedtyping start | speedtyping <sentence>',
    execute: async ({ chatId, sender, args, prefix, reply }) => {
      const key = `speed_${chatId}_${sender}`;
      const sentences = [
        'The quick brown fox jumps over the lazy dog',
        'Crittix Empire is built different and you know it',
        'Speed is nothing without accuracy so get both right',
        'Night Raiders never sleep while the weak rest easy',
        'Every second counts when you are racing against time'
      ];
      if (!gameSessions[key] || args[0] === 'start') {
        const sentence = sentences[Math.floor(Math.random() * sentences.length)];
        gameSessions[key] = { sentence, start: Date.now() };
        return reply(`⌨️ *SPEED TYPING TEST*\n\nType this EXACTLY:\n\n"*${sentence}*"\n\nUse: ${prefix}speedtyping <the sentence>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const typed = args.join(' ');
      const ms = Date.now() - game.start;
      const wpm = Math.round((game.sentence.split(' ').length / (ms / 60000)));
      const correct = typed.trim().toLowerCase() === game.sentence.toLowerCase();
      delete gameSessions[key];
      if (correct) return reply(p.phrases.success("correct!"\n\nTime: *${(ms / 1000).toFixed(2)}s*\nSpeed: *${wpm} WPM*\n\n${wpm >= 60 ? 'Blazing fast. Crittix approves. 😤' : wpm >= 40 ? 'Solid. Not bad.' : 'Slow but accurate. Work on the speed.'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      reply(`❌ *WRONG!*\n\nExpected: "${game.sentence}"\nYou typed: "${typed}"\n\nTry again with ${prefix}speedtyping start`);
    }
  },

  {
    command: 'emojistory',
    aliases: ['emojiread', 'storyemoji'],
    category: 'arena',
    description: 'Bot posts an emoji story, guess what it says. Usage: emojistory',
    execute: async ({ chatId, args, prefix, reply }) => {
      const key = `emstory_${chatId}`;
      const stories = [
        { emojis: '🧑‍🎤🎸🔥🏟️👏💰', meaning: 'A musician rocks a concert and gets rich' },
        { emojis: '🧙‍♂️📚✨🐉⚔️🏆', meaning: 'A wizard studies magic, fights a dragon, wins' },
        { emojis: '👩🍎📖🏫🧠🎓', meaning: 'A woman learns at school and graduates smart' },
        { emojis: '🐟🎣🏠🍳🍽️😋', meaning: 'Fishing, going home, cooking, and eating the catch' },
        { emojis: '🚀🌙👨‍🚀🏳️😤🌍', meaning: 'Astronaut goes to the moon, fails, returns to Earth' }
      ];
      if (!gameSessions[key] || args[0] === 'new') {
        const s = stories[Math.floor(Math.random() * stories.length)];
        gameSessions[key] = { meaning: s.meaning };
        return reply(`📖 *EMOJI STORY*\n\n${s.emojis}\n\nTranslate this story into words!\nUse: ${prefix}emojistory <your translation>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const guess = args.join(' ').toLowerCase();
      const keywords = game.meaning.toLowerCase().split(/\s+/);
      const hits = keywords.filter(w => w.length > 3 && guess.includes(w)).length;
      delete gameSessions[key];
      reply(`🎭 *EMOJI STORY RESULT*\n\nThe story was: *${game.meaning}*\nYour answer: "${args.join(' ')}"\nKeyword matches: *${hits}/${keywords.filter(w => w.length > 3).length}*\n\n${hits >= 3 ? '🎉 Great interpretation!' : '❌ Not quite — try another with emojistory new'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'riddleduel',
    aliases: ['riddle2p', 'riddlerace'],
    category: 'arena',
    description: 'Two users race to answer the same riddle. Usage: riddleduel start | riddleduel <answer>',
    execute: async ({ chatId, sender, senderNumber, args, prefix, reply }) => {
      const key = `rduel_${chatId}`;
      const riddles = [
        { q: 'I speak without a mouth and hear without ears. I have no body but I come alive with wind. What am I?', a: 'echo' },
        { q: 'The more you take, the more you leave behind. What am I?', a: 'footsteps' },
        { q: 'I have cities but no houses, mountains but no trees, water but no fish. What am I?', a: 'map' },
        { q: 'What gets wetter the more it dries?', a: 'towel' },
        { q: 'I have hands but can\'t clap. What am I?', a: 'clock' }
      ];
      if (!gameSessions[key] || args[0] === 'start') {
        const r = riddles[Math.floor(Math.random() * riddles.length)];
        gameSessions[key] = { riddle: r.q, answer: r.a, started: Date.now() };
        return reply(`🧩 *RIDDLE DUEL*\n\nFirst correct answer wins!\n\n❓ "${r.q}"\n\nAnswer: ${prefix}riddleduel <your answer>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const guess = args.join(' ').toLowerCase().trim();
      if (guess.includes(game.answer)) {
        const ms = Date.now() - game.started;
        delete gameSessions[key];
        return reply(`🏆 *@${senderNumber} WINS THE DUEL!*\n\nAnswer: *${game.answer}*\n⚡ In ${(ms / 1000).toFixed(1)}s\n\nBig brain energy. Crittix certified. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(`❌ Wrong answer. Keep trying — first correct answer wins!`);
    }
  },

  {
    command: 'colorguess',
    aliases: ['guesscolor', 'hexguess'],
    category: 'arena',
    description: 'Guess the name of a random hex color. Usage: colorguess | colorguess <color name>',
    execute: async ({ chatId, args, prefix, reply }) => {
      const key = `colorguess_${chatId}`;
      const colors = [
        { hex: '#FF0000', name: 'red' }, { hex: '#00FF00', name: 'lime' }, { hex: '#0000FF', name: 'blue' },
        { hex: '#FFFF00', name: 'yellow' }, { hex: '#FF00FF', name: 'magenta' }, { hex: '#00FFFF', name: 'cyan' },
        { hex: '#FF6600', name: 'orange' }, { hex: '#800080', name: 'purple' }, { hex: '#FFC0CB', name: 'pink' },
        { hex: '#A52A2A', name: 'brown' }, { hex: '#808080', name: 'gray' }, { hex: '#000000', name: 'black' },
        { hex: '#FFFFFF', name: 'white' }, { hex: '#40E0D0', name: 'turquoise' }, { hex: '#FFD700', name: 'gold' }
      ];
      if (!gameSessions[key]) {
        const c = colors[Math.floor(Math.random() * colors.length)];
        gameSessions[key] = { color: c };
        return reply(`🎨 *COLOR GUESS*\n\nHex code: *${c.hex}*\n\nWhat color is this?\nAnswer: ${prefix}colorguess <color name>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const guess = args.join(' ').toLowerCase().trim();
      if (!guess) return reply(`Current color: *${game.color.hex}* — What's its name?\nAnswer: ${prefix}colorguess <name>`);
      if (guess === game.color.name || game.color.name.includes(guess)) {
        delete gameSessions[key];
        return reply(`🎉 *CORRECT!*\n\n${game.color.hex} = *${game.color.name}*\n\nYour eyes work. Respect. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(`❌ Nope. Hint: starts with "${game.color.name[0].toUpperCase()}"\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'flagrace',
    aliases: ['flagspeedgame', 'flagblitz'],
    category: 'arena',
    description: 'Timed multi-round flag guessing game. Usage: flagrace start | flagrace <country>',
    execute: async ({ chatId, sender, senderNumber, args, prefix, reply }) => {
      const key = `flagrace_${chatId}`;
      const flags = [
        { flag:'🇳🇬', country:'Nigeria' }, { flag:'🇯🇵', country:'Japan' }, { flag:'🇧🇷', country:'Brazil' },
        { flag:'🇩🇪', country:'Germany' }, { flag:'🇫🇷', country:'France' }, { flag:'🇮🇳', country:'India' },
        { flag:'🇿🇦', country:'South Africa' }, { flag:'🇰🇷', country:'South Korea' }, { flag:'🇦🇺', country:'Australia' },
        { flag:'🇲🇽', country:'Mexico' }, { flag:'🇨🇳', country:'China' }, { flag:'🇷🇺', country:'Russia' },
        { flag:'🇬🇭', country:'Ghana' }, { flag:'🇮🇹', country:'Italy' }, { flag:'🇹🇷', country:'Turkey' }
      ];
      if (!gameSessions[key] || args[0] === 'start') {
        const shuffled = flags.sort(() => Math.random() - 0.5).slice(0, 5);
        gameSessions[key] = { rounds: shuffled, current: 0, scores: {}, started: Date.now() };
        const first = shuffled[0];
        return reply(`🏁 *FLAG RACE — 5 Rounds*\n\nRound 1/${shuffled.length}: ${first.flag}\n\nWhat country is this?\nAnswer: ${prefix}flagrace <country>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const round = game.rounds[game.current];
      const guess = args.join(' ').toLowerCase().trim();
      const correct = round.country.toLowerCase().includes(guess) || guess.includes(round.country.toLowerCase());
      if (correct) {
        if (!game.scores[sender]) game.scores[sender] = { num: senderNumber, pts: 0 };
        game.scores[sender].pts++;
      }
      game.current++;
      if (game.current >= game.rounds.length) {
        const sorted = Object.entries(game.scores).sort((a, b) => b[1].pts - a[1].pts);
        const top = sorted.map(([, v], i) => `${i + 1}. @${v.num} — ${v.pts} pts`).join('\n');
        delete gameSessions[key];
        return reply(`🏆 *FLAG RACE RESULTS*\n\n${correct ? `✅ ${round.country} — Correct!` : `❌ ${round.country} — Wrong!`}\n\n*Final Scores:*\n${top || 'No correct answers. Embarassing.'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const next = game.rounds[game.current];
      reply(`${correct ? '✅ Correct!' : `❌ It was ${round.country}!`}\n\nRound ${game.current + 1}/${game.rounds.length}: ${next.flag}\n\nWhat country?\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'petrace',
    aliases: ['racepet', 'petsprint'],
    category: 'arena',
    description: 'Race your adopted pet against another user\'s pet. Usage: petrace @user',
    execute: async ({ sender, senderNumber, msg, reply }) => {
      const petData = loadDB('pets.json');
      const myPet = petData[sender];
      if (!myPet) return reply(p.phrases.notFound('you do not have a pet yet. adopt one with .petadopt.'));
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const oppPet = mentioned ? petData[mentioned] : null;
      const oppName = oppPet?.name || 'a random wild creature';
      const mySpeed = (myPet.speed || 50) + Math.floor(Math.random() * 30);
      const oppSpeed = (oppPet?.speed || 40) + Math.floor(Math.random() * 30);
      const won = mySpeed > oppSpeed;
      if (won) { myPet.wins = (myPet.wins || 0) + 1; vault.updateBalance(sender, 50, 0); saveDB('pets.json', petData); }
      reply(
        `🏁 *PET RACE*\n\n` +
        `🐾 *${myPet.name}* (Yours) — ${mySpeed} speed\n` +
        `🐾 *${oppName}* (Opponent) — ${oppSpeed} speed\n\n` +
        `${won ? `🏆 *${myPet.name} WINS!* +🪙 50 prize money 😤` : `💀 *${oppName} won.* Your pet needs training.`}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'luckydraw',
    aliases: ['spinluck', 'fortunedraw'],
    category: 'arena',
    description: 'Instant-win lucky draw — heavily rate-limited. Usage: luckydraw',
    execute: async ({ sender, reply }) => {
      const cd = loadDB('luckydraw-cd.json');
      const now = Date.now();
      const WAIT = 7200000;
      if (cd[sender] && now - cd[sender] < WAIT) {
        const rem = Math.ceil((WAIT - (now - cd[sender])) / 60000);
        return reply(p.phrases.error(`lucky draw recharges every 2 hours. ${rem} minutes left. Patience.`));
      }
      const outcomes = [
        { label: '💀 Nothing', prize: 0, chance: 0.5 },
        { label: '🥉 Small win', prize: 30, chance: 0.25 },
        { label: '🥈 Medium win', prize: 100, chance: 0.15 },
        { label: '🥇 Big win', prize: 300, chance: 0.08 },
        { label: '👑 JACKPOT', prize: 1000, chance: 0.02 }
      ];
      const roll = Math.random();
      let cumulative = 0;
      let result = outcomes[0];
      for (const o of outcomes) { cumulative += o.chance; if (roll < cumulative) { result = o; break; } }
      if (result.prize > 0) vault.updateBalance(sender, result.prize, 0);
      cd[sender] = now;
      saveDB('luckydraw-cd.json', cd);
      reply(`🍀 *LUCKY DRAW*\n\nResult: *${result.label}*\n${result.prize > 0 ? `💰 You won 🪙 ${result.prize}!` : '💀 Better luck next time (2h cooldown)'}\n\nNext draw in 2 hours.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'spotthedifference',
    aliases: ['spotdiff', 'finddiff'],
    category: 'arena',
    description: 'Find the difference between two described scenarios. Usage: spotthedifference',
    execute: async ({ chatId, args, prefix, reply }) => {
      const key = `spotdiff_${chatId}`;
      const puzzles = [
        {
          a: 'Scene A: A man in a red hat walks past a blue bakery. He carries 3 bags and a newspaper. The clock shows 10am.',
          b: 'Scene B: A man in a red hat walks past a green bakery. He carries 3 bags and a newspaper. The clock shows 10am.',
          diff: 'The bakery color changed from blue to green'
        },
        {
          a: 'Scene A: A girl with pigtails rides a yellow bicycle. There are 5 stars in the sky. A dog sits by the tree.',
          b: 'Scene B: A girl with pigtails rides a yellow bicycle. There are 4 stars in the sky. A cat sits by the tree.',
          diff: '5 stars became 4 stars, and the dog became a cat (2 differences)'
        },
        {
          a: 'Scene A: A chef holds a pizza in his left hand. He wears a white apron. The oven door is open.',
          b: 'Scene B: A chef holds a pizza in his right hand. He wears a white apron. The oven door is open.',
          diff: 'The pizza moved from the left hand to the right hand'
        }
      ];
      if (!gameSessions[key] || args[0] === 'new') {
        const p = puzzles[Math.floor(Math.random() * puzzles.length)];
        gameSessions[key] = { diff: p.diff };
        return reply(`🔍 *SPOT THE DIFFERENCE*\n\n${p.a}\n\n${p.b}\n\nWhat changed between Scene A and B?\nAnswer: ${prefix}spotthedifference <what you found>\nReveal: ${prefix}spotthedifference reveal\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      if (args[0] === 'reveal') { delete gameSessions[key]; return reply(`🎯 *ANSWER*\n\n${game.diff}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      const guess = args.join(' ').toLowerCase();
      const keywords = game.diff.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const hits = keywords.filter(w => guess.includes(w)).length;
      if (hits >= 2) { delete gameSessions[key]; return reply(`🎉 *SPOT ON!*\n\nAnswer: ${game.diff}\n\nYou noticed. Sharp eyes. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      reply(`🤔 Not quite. Try again or type ${prefix}spotthedifference reveal\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'chainreaction',
    aliases: ['wordchain2', 'chainword'],
    category: 'arena',
    description: 'Group chain game — each message must start with the last letter of the previous word. Usage: chainreaction start | chainreaction <word>',
    execute: async ({ chatId, sender, senderNumber, args, prefix, reply }) => {
      const key = `chain_${chatId}`;
      const action = args[0]?.toLowerCase();
      if (action === 'start' || !gameSessions[key]) {
        const startWord = 'crittix';
        gameSessions[key] = { lastWord: startWord, lastLetter: startWord.slice(-1), chain: [startWord], count: 1 };
        return reply(`🔗 *CHAIN REACTION*\n\nRule: Each word must START with the last letter of the previous word.\n\nFirst word: *${startWord.toUpperCase()}*\nNext must start with: *${startWord.slice(-1).toUpperCase()}*\n\nRespond: ${prefix}chainreaction <word>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const word = args[0]?.toLowerCase().replace(/[^a-z]/g, '');
      if (!word || word.length < 2) return reply(p.phrases.error('give a valid word (letters only, 2+ chars)'));
      if (word[0] !== game.lastLetter) return reply(`❌ Must start with *${game.lastLetter.toUpperCase()}* — "${word}" starts with "${word[0].toUpperCase()}". Try again.`);
      if (game.chain.includes(word)) return reply(`❌ "${word}" already used in this chain. Find a new one.`);
      game.chain.push(word);
      game.lastWord = word;
      game.lastLetter = word.slice(-1);
      game.count++;
      reply(p.phrases.success(`${word.toUpperCase()} accepted. chain continues.`) ${game.count}\nNext must start with: *${game.lastLetter.toUpperCase()}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'impostorgame',
    aliases: ['imposter2', 'findimpostor'],
    category: 'arena',
    description: 'Multi-round impostor game — one player gets a different word. Usage: impostorgame start | impostorgame vote @user',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, senderNumber, args, prefix, reply }) => {
      const action = args[0]?.toLowerCase();
      const key = `impostor_${chatId}`;
      const wordPairs = [
        ['lion', 'tiger'], ['pizza', 'burger'], ['ocean', 'lake'], ['guitar', 'violin'], ['sun', 'moon']
      ];
      if (action === 'start') {
        try {
          const meta = await sock.groupMetadata(chatId);
          const members = meta.participants.slice(0, 8);
          if (members.length < 3) return reply(p.phrases.error('need at least 3 members to play'));
          const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
          const impostorIdx = Math.floor(Math.random() * members.length);
          const impostorJid = members[impostorIdx].id;
          gameSessions[key] = { impostor: impostorJid, impostorNum: impostorJid.split('@')[0], votes: {} };
          for (const m of members) {
            const word = m.id === impostorJid ? pair[1] : pair[0];
            await sock.sendMessage(m.id, { text: `🎭 *IMPOSTOR GAME*\n\nYour secret word: *${word}*\n\n${m.id === impostorJid ? '⚠️ You are the IMPOSTOR — your word is different!' : '✅ You are crew — describe your word without saying it directly.'}\n\nVote: ${prefix}impostorgame vote @someone in the group\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` });
          }
          await sock.sendMessage(chatId, { text: `🎭 *IMPOSTOR GAME STARTED!*\n\n${members.length} players got their secret words via DM.\nDiscuss and find the impostor!\n\nVote: ${prefix}impostorgame vote @someone\nReveal: ${prefix}impostorgame reveal (admin only)\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        } catch (e) { reply(p.phrases.error(`couldn't start — ${e.message}`)); }
        return;
      }
      if (action === 'reveal') {
        const game = gameSessions[key];
        if (!game) return reply(p.phrases.error('no active game'));
        if (!await h.isSenderAdmin(sock, chatId, sender)) return reply(p.phrases.adminOnly());
        if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
        delete gameSessions[key];
        return sock.sendMessage(chatId, {
          text: `🎭 *IMPOSTOR REVEALED!*\n\nThe impostor was: @${game.impostorNum}\n\nDid the group find them? 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
          mentions: [game.impostor]
        }, { quoted: msg });
      }
      reply(p.phrases.wrongUsage('use .impostorgame start to begin. or .impostorgame reveal to expose the impostor.'));
    }
  },

  {
    command: 'truthbomb',
    aliases: ['anontruth', 'bombyou'],
    category: 'arena',
    description: 'Bot generates an anonymous truth prompt for group truth-or-dare style play. Usage: truthbomb',
    execute: async ({ reply }) => {
      const prompts = [
        'What\'s the most embarrassing thing you\'ve done in this group chat that no one knows about?',
        'Tell us one thing you pretend to like but actually can\'t stand.',
        'What\'s the worst lie you\'ve told someone in this group?',
        'Who in this chat do you disagree with the most — and why?',
        'What\'s one habit you have that you\'re lowkey ashamed of?',
        'What\'s the most childish thing you still do as an adult?',
        'Who was the last person you talked about behind their back?',
        'What\'s a skill you claimed to have but don\'t actually possess?',
        'What\'s the most dramatic thing you\'ve done for attention?',
        'What\'s an opinion you hold that you\'d never say out loud in public?'
      ];
      const prompt = prompts[Math.floor(Math.random() * prompts.length)];
      reply(`💣 *TRUTH BOMB*\n\n❓ "${prompt}"\n\nAnswer anonymously… or don\'t. The bomb is dropped either way. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }

];
