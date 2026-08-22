/*
 * GAMES-NEW1.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: wordsearch, guessthenumber, guesstheflag, guesstheemoji,
 *           guessthecountry, akinator, twentyquestions, storychain,
 *           simonsays, memorygame, reactiontest, snake, connect4, pvp
 */
const h = require('../../lib/helpers');
const globalXP = require('../../lib/global-xp');
const p = require('../../lib/phrases');


const gameSessions = {};

module.exports = [

  {
    command: 'wordsearch',
    aliases: ['wsearch', 'wordfind'],
    category: 'arena',
    description: 'Generate a text word search puzzle. Usage: wordsearch cat dog sun moon',
    execute: async ({ args, reply }) => {
      const words = args.map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length >= 3).slice(0, 6);
      if (!words.length) return reply(p.phrases.wrongUsage('provide 3 to 6 words to build a word search. example! .wordsearch crittix dark night raiders'));
      const SIZE = 12;
      const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
      const placed = [];
      const dirs = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];
      const placeWord = (word) => {
        for (let attempt = 0; attempt < 50; attempt++) {
          const dir = dirs[Math.floor(Math.random() * dirs.length)];
          const row = Math.floor(Math.random() * SIZE);
          const col = Math.floor(Math.random() * SIZE);
          let r = row, c = col, ok = true;
          for (const letter of word) {
            if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) { ok = false; break; }
            if (grid[r][c] !== '' && grid[r][c] !== letter) { ok = false; break; }
            r += dir[0]; c += dir[1];
          }
          if (!ok) continue;
          r = row; c = col;
          for (const letter of word) { grid[r][c] = letter; r += dir[0]; c += dir[1]; }
          return true;
        }
        return false;
      };
      words.forEach(w => placeWord(w) && placed.push(w));
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!grid[r][c]) grid[r][c] = alpha[Math.floor(Math.random() * 26)];
      const display = grid.map(row => row.join(' ')).join('\n');
      reply(`🔍 *WORD SEARCH*\n\nFind: *${placed.join(' | ')}*\n\n\`\`\`\n${display}\`\`\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'guessthenumber',
    aliases: ['numbguess', 'gnum'],
    category: 'arena',
    description: 'Classic number guessing game. Usage: guessthenumber start | guessthenumber 42',
    execute: async ({ chatId, sender, args, prefix, reply }) => {
      const key = `numguess_${chatId}_${sender}`;
      const action = args[0];
      if (!gameSessions[key] || action === 'start' || action === 'new') {
        const max = 100, secret = Math.floor(Math.random() * max) + 1;
        gameSessions[key] = { secret, attempts: 0, maxAttempts: 7 };
        return reply(`🎯 *NUMBER GUESSING GAME*\n\nI'm thinking of a number between 1 and 100.\nYou have *7 attempts*.\n\nGuess with: ${prefix}guessthenumber <number>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const guess = parseInt(action);
      if (isNaN(guess) || guess < 1 || guess > 100) return reply(p.phrases.error('give me a number between 1 and 100'));
      game.attempts++;
      const remaining = game.maxAttempts - game.attempts;
      if (guess === game.secret) {
        delete gameSessions[key];
        return reply(`🎉 *CORRECT!*\n\nThe number was *${game.secret}*!\nYou got it in ${game.attempts} attempt(s).\n\nI'm shook. Didn't think you had it 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (remaining <= 0) {
        delete gameSessions[key];
        return reply(`💀 *GAME OVER!*\n\nThe number was *${game.secret}*. And you couldn't get it.\n\nTry again with ${prefix}guessthenumber start\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const hint = guess < game.secret ? '📈 TOO LOW' : '📉 TOO HIGH';
      reply(`${hint}\n\nGuess: ${guess} | Attempts left: *${remaining}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'guesstheflag',
    aliases: ['flagguess', 'countryflags'],
    category: 'arena',
    description: 'Guess the country from its flag emoji. Usage: guesstheflag',
    execute: async ({ chatId, args, prefix, reply }) => {
      const flags = [
        { flag:'🇳🇬', country:'Nigeria' }, { flag:'🇺🇸', country:'United States' },
        { flag:'🇬🇧', country:'United Kingdom' }, { flag:'🇯🇵', country:'Japan' },
        { flag:'🇫🇷', country:'France' }, { flag:'🇩🇪', country:'Germany' },
        { flag:'🇧🇷', country:'Brazil' }, { flag:'🇨🇳', country:'China' },
        { flag:'🇮🇳', country:'India' }, { flag:'🇿🇦', country:'South Africa' },
        { flag:'🇰🇪', country:'Kenya' }, { flag:'🇬🇭', country:'Ghana' },
        { flag:'🇦🇺', country:'Australia' }, { flag:'🇨🇦', country:'Canada' },
        { flag:'🇲🇽', country:'Mexico' }, { flag:'🇮🇹', country:'Italy' },
        { flag:'🇷🇺', country:'Russia' }, { flag:'🇰🇷', country:'South Korea' },
        { flag:'🇿🇼', country:'Zimbabwe' }, { flag:'🇪🇹', country:'Ethiopia' },
        { flag:'🇦🇷', country:'Argentina' }, { flag:'🇵🇰', country:'Pakistan' },
        { flag:'🇹🇷', country:'Turkey' }, { flag:'🇸🇦', country:'Saudi Arabia' },
      ];
      if (!args[0] || args[0].toLowerCase() === 'start') {
        const q = flags[Math.floor(Math.random() * flags.length)];
        gameSessions[`flag_${chatId}`] = { answer: q.country.toLowerCase(), started: Date.now() };
        return reply(`🏳️ *GUESS THE FLAG*\n\n${q.flag}\n\nWhich country is this?\nAnswer with: ${prefix}guesstheflag <country name>\n\n⏰ You have 30 seconds!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[`flag_${chatId}`];
      if (!game) return reply(p.phrases.error(`no active flag game — start one with ${prefix}guesstheflag`));
      if (Date.now() - game.started > 30000) { delete gameSessions[`flag_${chatId}`]; return reply(`⏰ Time's up! The answer was *${game.answer}*. Too slow 💀`); }
      const guess = args.join(' ').toLowerCase();
      if (guess.includes(game.answer) || game.answer.includes(guess)) {
        delete gameSessions[`flag_${chatId}`];
        return reply(p.phrases.success(`correct! it was ${game.answer.toUpperCase()}.`) Shocked.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(`❌ Wrong. That's not *${game.answer}*. Try again — ${game.started + 30000 - Date.now() > 0 ? Math.ceil((game.started + 30000 - Date.now()) / 1000) + 's left' : 'time almost up'}`);
    }
  },

  {
    command: 'guesstheemoji',
    aliases: ['emojiguess', 'emojiriddle'],
    category: 'arena',
    description: 'Guess the phrase/movie from emoji combo. Usage: guesstheemoji',
    execute: async ({ chatId, args, prefix, reply }) => {
      const puzzles = [
        { emoji:'🦁👑', answer:'lion king' }, { emoji:'🕷️👨', answer:'spider man' },
        { emoji:'❄️👸', answer:'frozen' }, { emoji:'🧙‍♂️💍', answer:'lord of the rings' },
        { emoji:'🦇🤵', answer:'batman' }, { emoji:'🐟🔵', answer:'finding nemo' },
        { emoji:'🚀👫💕', answer:'gravity' }, { emoji:'💀🏴‍☠️⚓', answer:'pirates of the caribbean' },
        { emoji:'🧱🏃', answer:'great wall of china' }, { emoji:'👸🐸', answer:'princess and the frog' },
        { emoji:'🎭🤡', answer:'joker' }, { emoji:'👽🏠', answer:'et' },
        { emoji:'🤖🚗', answer:'transformers' }, { emoji:'⚡🧙‍♂️📚', answer:'harry potter' },
        { emoji:'🦸‍♂️🔴🔵', answer:'superman' }, { emoji:'🌊🦈', answer:'jaws' },
      ];
      if (!args[0] || args[0] === 'start') {
        const q = puzzles[Math.floor(Math.random() * puzzles.length)];
        gameSessions[`emoji_${chatId}`] = { answer: q.answer, started: Date.now() };
        return reply(`🎭 *GUESS THE EMOJI*\n\n${q.emoji}\n\nWhat movie/phrase does this represent?\nAnswer: ${prefix}guesstheemoji <answer>\n\n⏰ 45 seconds!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[`emoji_${chatId}`];
      if (!game) return reply(p.phrases.error(`start a game first with ${prefix}guesstheemoji`));
      if (Date.now() - game.started > 45000) { delete gameSessions[`emoji_${chatId}`]; return reply(`⏰ Too slow! Answer was *${game.answer}* 💀`); }
      const guess = args.join(' ').toLowerCase();
      if (guess.includes(game.answer) || game.answer.split(' ').every(w => guess.includes(w))) {
        delete gameSessions[`emoji_${chatId}`];
        return reply(p.phrases.success(`correct! it was ${game.answer.toUpperCase()}.`));
      }
      reply(`❌ Nope. Keep trying — time's running out`);
    }
  },

  {
    command: 'guessthecountry',
    aliases: ['countryguess', 'geoquiz'],
    category: 'arena',
    description: 'Guess the country from a fact/clue. Usage: guessthecountry',
    execute: async ({ chatId, args, prefix, reply }) => {
      const questions = [
        { clue:'This country is the most populous in Africa and has Lagos as its largest city.', answer:'nigeria' },
        { clue:'This island nation is known for sushi, anime, and being extremely polite.', answer:'japan' },
        { clue:'Home to the pyramids of Giza and the Nile River.', answer:'egypt' },
        { clue:'This country has the most spoken language on Earth by native speakers.', answer:'china' },
        { clue:'Known for tea, cricket, and an empire that no longer exists.', answer:'united kingdom' },
        { clue:'This country gave us the internet, Hollywood, and fast food.', answer:'united states' },
        { clue:'Home to the Amazon rainforest and Carnival festival.', answer:'brazil' },
        { clue:'Known for the Eiffel Tower, wine, and existential philosophy.', answer:'france' },
        { clue:'This country has 11 official languages and is at the southern tip of Africa.', answer:'south africa' },
        { clue:'Known for samba, fufu, and being the birthplace of Nollywood.', answer:'nigeria' },
        { clue:'Home to the Great Barrier Reef and kangaroos.', answer:'australia' },
        { clue:'This country invented pizza and has more UNESCO sites than any other.', answer:'italy' },
      ];
      if (!args[0] || args[0] === 'start') {
        const q = questions[Math.floor(Math.random() * questions.length)];
        gameSessions[`country_${chatId}`] = { answer: q.answer, started: Date.now() };
        return reply(`🌍 *GUESS THE COUNTRY*\n\n📋 Clue: _${q.clue}_\n\nAnswer: ${prefix}guessthecountry <country name>\n\n⏰ 45 seconds!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[`country_${chatId}`];
      if (!game) return reply(p.phrases.error(`start with ${prefix}guessthecountry`));
      if (Date.now() - game.started > 45000) { delete gameSessions[`country_${chatId}`]; return reply(`⏰ Time's up! Answer: *${game.answer}*`); }
      const guess = args.join(' ').toLowerCase();
      if (guess.includes(game.answer) || game.answer.includes(guess)) {
        delete gameSessions[`country_${chatId}`];
        return reply(p.phrases.success(`correct! it was ${game.answer.toUpperCase()}.`));
      }
      reply(`❌ Wrong. That's not it.`);
    }
  },

  {
    command: 'akinator',
    aliases: ['aki', 'twentyq2'],
    category: 'arena',
    description: 'Think of a character — bot asks yes/no questions to guess it. Usage: akinator start',
    execute: async ({ chatId, sender, args, prefix, reply }) => {
      const key = `aki_${chatId}_${sender}`;
      if (args[0] === 'start' || !gameSessions[key]) {
        gameSessions[key] = {
          q: 0, answers: [],
          questions: [
            'Is your character real (not fictional)?',
            'Is your character male?',
            'Is your character from a movie or TV show?',
            'Is your character known for fighting/action?',
            'Is your character from the last 20 years?',
            'Is your character famous worldwide?',
            'Does your character have superpowers?',
            'Is your character a villain?',
            'Is your character from an animated show/movie?',
            'Is your character associated with sports?',
          ]
        };
        const game = gameSessions[key];
        return reply(`🔮 *AKINATOR*\n\nThink of a character (real or fictional).\n\nQuestion 1: *${game.questions[0]}*\n\nAnswer: ${prefix}akinator yes | ${prefix}akinator no\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const ans = args[0]?.toLowerCase();
      if (ans !== 'yes' && ans !== 'no') return reply(p.phrases.error(`answer with "${prefix}akinator yes" or "${prefix}akinator no"`));
      game.answers.push(ans);
      game.q++;
      if (game.q >= game.questions.length) {
        delete gameSessions[key];
        const guesses = ['Naruto', 'Batman', 'Cristiano Ronaldo', 'Elon Musk', 'Sherlock Holmes', 'Iron Man', 'Michael Jackson'];
        const guess = guesses[Math.floor(Math.random() * guesses.length)];
        return reply(`🔮 *AKINATOR GUESS*\n\nAfter careful analysis of your ${game.q} answers...\n\nAre you thinking of... *${guess}*? 🧐\n\n_I am Akinator. My power is unmatched._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(`🔮 *AKINATOR — Q${game.q + 1}/${game.questions.length}*\n\n${game.questions[game.q]}\n\nAnswer: ${prefix}akinator yes | ${prefix}akinator no\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'twentyquestions',
    aliases: ['20q', 'yesno'],
    category: 'arena',
    description: 'Bot picks an object — you ask yes/no questions to guess it. Usage: twentyquestions start',
    execute: async ({ chatId, sender, args, prefix, reply }) => {
      const key = `tq_${chatId}_${sender}`;
      const objects = ['pizza','elephant','guitar','volcano','diamond','airplane','cactus','submarine','hurricane','telescope','lighthouse','mushroom'];
      if (args[0] === 'start' || !gameSessions[key]) {
        const obj = objects[Math.floor(Math.random() * objects.length)];
        gameSessions[key] = { obj, asked: 0, max: 20 };
        return reply(`🎮 *20 QUESTIONS*\n\nI've picked something. You have 20 yes/no questions to figure it out.\n\nAsk anything: ${prefix}twentyquestions is it alive?\n\nOr guess: ${prefix}twentyquestions guess <thing>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      if (args[0] === 'guess') {
        const guess = args.slice(1).join(' ').toLowerCase();
        if (guess === game.obj || game.obj.includes(guess)) {
          delete gameSessions[key];
          return reply(p.phrases.success(`correct! it was ${game.obj}.`) You got it in ${game.asked} questions. Not bad.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
        return reply(`❌ Not *${guess}*. ${game.asked} questions used. Keep going (${game.max - game.asked} left)`);
      }
      if (game.asked >= game.max) {
        const obj = game.obj;
        delete gameSessions[key];
        return reply(`💀 *20 QUESTIONS UP!*\n\nYou couldn't guess it. It was *${obj}*.\n\nL. Major L.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      game.asked++;
      const q = args.join(' ').toLowerCase();
      const isAlive = ['alive','living','animal','breathe','organism'].some(k => q.includes(k));
      const isManmade = ['manmade','made','created','built','human'].some(k => q.includes(k));
      const answers = ['Yes.','No.','Sort of.','Absolutely.','No way.',"That's a great question — yes.",'Nope.','Correct.'];
      const heuristic = isAlive ? (game.obj === 'elephant' ? 'Yes.' : 'No.') : isManmade ? (game.obj === 'pizza' || game.obj === 'guitar' || game.obj === 'airplane' || game.obj === 'telescope' || game.obj === 'submarine' || game.obj === 'lighthouse' ? 'Yes.' : 'No.') : answers[Math.floor(Math.random() * answers.length)];
      reply(`Q${game.asked}: ${heuristic}\n\n_${game.max - game.asked} questions left_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'storychain',
    aliases: ['story2', 'collabstory'],
    category: 'arena',
    description: 'Collaborative story building — each user adds a sentence. Usage: storychain start <opening> | storychain add <sentence>',
    groupOnly: true,
    execute: async ({ chatId, args, senderNumber, prefix, reply }) => {
      const key = `story_${chatId}`;
      if (args[0] === 'start') {
        const opening = args.slice(1).join(' ');
        if (!opening) return reply(p.phrases.wrongUsage('provide an opening sentence. example! .storychain start it was a dark and stormy night'));
        gameSessions[key] = { lines: [`*@${senderNumber}:* ${opening}`], started: Date.now() };
        return reply(`📖 *STORY CHAIN STARTED*\n\nAdd sentences with: ${prefix}storychain add <sentence>\nEnd with: ${prefix}storychain end\n\n📖 *Chapter 1:*\n${gameSessions[key].lines[0]}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const chain = gameSessions[key];
      if (!chain) return reply(p.phrases.error(`no story active — start one with ${prefix}storychain start <sentence>`));
      if (args[0] === 'end') {
        const story = chain.lines.join('\n');
        delete gameSessions[key];
        return reply(`📖 *STORY COMPLETE*\n\n${story}\n\n*THE END* ✨\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      if (args[0] === 'add') {
        const sentence = args.slice(1).join(' ');
        if (!sentence) return reply(p.phrases.wrongUsage('add the next sentence to the story. example! .storychain add then the lights went out'));
        if (chain.lines.length >= 20) return reply(p.phrases.error(`story is getting long — end it with ${prefix}storychain end`));
        chain.lines.push(`*@${senderNumber}:* ${sentence}`);
        return reply(`📖 Added! Story so far (${chain.lines.length} lines):\n\n${chain.lines.join('\n')}\n\n_${prefix}storychain add <next line>_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      reply(p.phrases.wrongUsage('use .storychain start your sentence. or add your sentence. or end to finish the story.'));
    }
  },

  {
    command: 'simonsays',
    aliases: ['simon', 'sequence'],
    category: 'arena',
    description: 'Memory sequence game. Usage: simonsays start | simonsays 1 3 2',
    execute: async ({ chatId, sender, args, prefix, reply }) => {
      const key = `simon_${chatId}_${sender}`;
      const emojis = ['🔴','🟡','🟢','🔵'];
      if (args[0] === 'start' || !gameSessions[key]) {
        const seq = [Math.floor(Math.random() * 4)];
        gameSessions[key] = { seq, round: 1, waiting: true };
        return reply(`🎮 *SIMON SAYS*\n\nWatch the sequence and repeat it!\n\nSequence: ${emojis[seq[0]]}\n\nRepeat it: ${prefix}simonsays <position(s)>\nPositions: 1=🔴 2=🟡 3=🟢 4=🔵\n\nExample: ${prefix}simonsays 1\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const answers = args.map(a => parseInt(a) - 1);
      const correct = game.seq.every((v, i) => answers[i] === v) && answers.length === game.seq.length;
      if (!correct) {
        delete gameSessions[key];
        return reply(`💀 *WRONG!*\n\nSequence was: ${game.seq.map(i => emojis[i]).join(' ')}\nYou entered: ${answers.map(i => emojis[i] || '❓').join(' ')}\n\nGame over. Round ${game.round}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      game.round++;
      game.seq.push(Math.floor(Math.random() * 4));
      reply(p.phrases.success(`correct! round ${game.round}.`)\n\nNew sequence: ${game.seq.map(i => emojis[i]).join(' ')}\n\nRepeat it: ${prefix}simonsays ${game.seq.map((_, i) => i+1).join(' <> ')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'memorygame',
    aliases: ['match', 'pairs'],
    category: 'arena',
    description: 'Card matching memory game. Usage: memorygame start | memorygame flip A1 B2',
    execute: async ({ chatId, sender, args, prefix, reply }) => {
      const key = `memo_${chatId}_${sender}`;
      const icons = ['🍎','🍎','🚗','🚗','⭐','⭐','🔥','🔥','💎','💎','🎵','🎵'];
      if (args[0] === 'start' || !gameSessions[key]) {
        const shuffled = [...icons].sort(() => Math.random() - 0.5);
        const grid = []; const rows = ['A','B','C'];
        for (let r = 0; r < 3; r++) { grid.push(shuffled.slice(r*4, r*4+4).map((v, c) => ({ val: v, flipped: false, col: c+1, row: rows[r] }))); }
        gameSessions[key] = { grid, moves: 0, matched: 0 };
        const display = gameSessions[key].grid.map((row, ri) => `${rows[ri]}: ${row.map((_, ci) => `[${rows[ri]}${ci+1}]`).join(' ')}`).join('\n');
        return reply(`🃏 *MEMORY GAME*\n\n\`\`\`\n${display}\`\`\`\n\nFlip 2 cards: ${prefix}memorygame flip A1 B3\nMatch all 6 pairs to win!\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      if (args[0] !== 'flip' || !args[1] || !args[2]) return reply(`Flip cards with: ${prefix}memorygame flip A1 B2`);
      const rows = ['A','B','C'];
      const parse = (s) => { const r = rows.indexOf(s[0]?.toUpperCase()); const c = parseInt(s[1]) - 1; return { r, c }; };
      const p1 = parse(args[1]), p2 = parse(args[2]);
      if (p1.r < 0 || p1.c < 0 || p2.r < 0 || p2.c < 0 || p1.r >= 3 || p1.c >= 4 || p2.r >= 3 || p2.c >= 4) return reply(p.phrases.error('invalid card position — use like A1, B3, C4'));
      const c1 = game.grid[p1.r][p1.c], c2 = game.grid[p2.r][p2.c];
      if (c1.flipped || c2.flipped) return reply(p.phrases.error('those cards are already matched/flipped'));
      game.moves++;
      if (c1.val === c2.val) { c1.flipped = c2.flipped = true; game.matched++; }
      const display = game.grid.map((row, ri) => `${rows[ri]}: ${row.map(c => c.flipped ? c.val : '⬛').join(' ')}`).join('\n');
      if (game.matched === 6) { delete gameSessions[key]; return reply(`🎉 *ALL MATCHED!*\n\nYou won in *${game.moves} moves*!\n\n\`\`\`\n${display}\`\`\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`); }
      reply(`${c1.val === c2.val ? '✅ Match!' : '❌ No match'}\n\n\`\`\`\n${display}\`\`\`\n\nMoves: ${game.moves} | Pairs found: ${game.matched}/6\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'reactiontest',
    aliases: ['react', 'reacttest'],
    category: 'arena',
    description: 'Test your reaction time. Usage: reactiontest',
    execute: async ({ chatId, sender, args, prefix, reply }) => {
      const key = `react_${chatId}_${sender}`;
      if (args[0] === 'tap') {
        const game = gameSessions[key];
        if (!game || !game.started) return reply(p.phrases.error(`no active test — run ${prefix}reactiontest first`));
        const elapsed = Date.now() - game.started;
        delete gameSessions[key];
        const rating = elapsed < 150 ? '🔥 GODLIKE' : elapsed < 250 ? '⚡ FAST' : elapsed < 400 ? '✅ GOOD' : elapsed < 600 ? '😐 AVERAGE' : '🐌 SLOW';
        return reply(`⚡ *REACTION TEST*\n\nTime: *${elapsed}ms*\nRating: *${rating}*\n\n${elapsed < 200 ? 'You are built different.' : elapsed < 400 ? 'Decent reflexes.' : 'Touch your face less. It won\'t help but maybe.'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      gameSessions[key] = { ready: false };
      reply(`⚡ *REACTION TEST*\n\nGet ready... Type *${prefix}reactiontest tap* as fast as you can when you see 🟢!\n\n⏳ Wait for it...`);
      const delay = 2000 + Math.random() * 3000;
      setTimeout(() => {
        if (gameSessions[key]) { gameSessions[key].started = Date.now(); }
      }, delay);
      setTimeout(async () => {
        if (gameSessions[key] && !gameSessions[key].started) return;
        await reply(`🟢 *NOW! Type: ${prefix}reactiontest tap*`);
      }, delay);
    }
  },

  {
    command: 'connect4',
    aliases: ['c4', 'connectfour'],
    category: 'arena',
    description: 'Play Connect 4 vs bot or another player. Usage: connect4 start | connect4 drop 3',
    execute: async ({ chatId, sender, args, prefix, reply }) => {
      const key = `c4_${chatId}`;
      const COLS = 7, ROWS = 6;
      const makeGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      if (args[0] === 'start' || !gameSessions[key]) {
        gameSessions[key] = { grid: makeGrid(), turn: 1, p1: sender };
        const display = gameSessions[key].grid.map(r => r.map(c => c === 0 ? '⬛' : c === 1 ? '🔴' : '🟡').join('')).join('\n');
        return reply(`🎮 *CONNECT 4*\n\n${display}\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n\n🔴 You go first!\nDrop a piece: ${prefix}connect4 drop <column 1-7>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = gameSessions[key];
      const col = parseInt(args[1]) - 1;
      if (isNaN(col) || col < 0 || col >= COLS) return reply(p.phrases.error('pick a column 1-7'));
      const drop = (g, col, piece) => {
        for (let r = ROWS - 1; r >= 0; r--) { if (g[r][col] === 0) { g[r][col] = piece; return r; } }
        return -1;
      };
      const check4 = (g, piece) => {
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          if ([[[0,1],[0,2],[0,3]],[[1,0],[2,0],[3,0]],[[1,1],[2,2],[3,3]],[[1,-1],[2,-2],[3,-3]]].some(dir => dir.every(([dr,dc]) => r+dr>=0&&r+dr<ROWS&&c+dc>=0&&c+dc<COLS&&g[r+dr][c+dc]===piece) && g[r][c]===piece)) return true;
        }
        return false;
      };
      const row = drop(game.grid, col, 1);
      if (row === -1) return reply(p.phrases.error('that column is full'));
      if (check4(game.grid, 1)) {
        const d = game.grid.map(r => r.map(c => c === 0 ? '⬛' : c === 1 ? '🔴' : '🟡').join('')).join('\n');
        delete gameSessions[key];
        return reply(`🎉 *YOU WIN!*\n\n${d}\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      // Bot move
      const botCol = Math.floor(Math.random() * COLS);
      for (let i = 0; i < COLS; i++) if (drop(game.grid, (botCol + i) % COLS, 2) !== -1) break;
      if (check4(game.grid, 2)) {
        const d = game.grid.map(r => r.map(c => c === 0 ? '⬛' : c === 1 ? '🔴' : '🟡').join('')).join('\n');
        delete gameSessions[key];
        return reply(`💀 *BOT WINS!*\n\n${d}\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n\nGot outplayed by a bot. Embarrassing.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const d = game.grid.map(r => r.map(c => c === 0 ? '⬛' : c === 1 ? '🔴' : '🟡').join('')).join('\n');
      reply(`🎮 *CONNECT 4*\n\n${d}\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n\n🔴 Your turn!\n${prefix}connect4 drop <column>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'pvp',
    aliases: ['battle', '1v1'],
    category: 'arena',
    description: '1v1 stat battle between two users. Usage: pvp @user',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, senderNumber, reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const targets = h.getTarget(msg, _gtP);
      const opponent = targets?.[0];
      if (!opponent) return reply(p.phrases.wrongUsage('tag your opponent to start a pvp battle. example! .pvp @user'));
      if (opponent === sender) return reply(p.phrases.error('you cannot fight yourself. pick someone else.'));
      const sbal = require('../../lib/vault').getBalance(sender);
      const obal = require('../../lib/vault').getBalance(opponent);
      const sxp = globalXP.getXP(sender) || 0;
      const oxp = globalXP.getXP(opponent) || 0;
      const spower = (sbal?.balance || 0) + sxp * 10 + Math.random() * 100;
      const opower = (obal?.balance || 0) + oxp * 10 + Math.random() * 100;
      const opponentNum = opponent.split('@')[0];
      const winner = spower > opower ? senderNumber : opponentNum;
      const loser = spower > opower ? opponentNum : senderNumber;
      await sock.sendMessage(chatId, {
        text: `⚔️ *PVP BATTLE*\n\n🔴 @${senderNumber} (Power: ${Math.round(spower)})\nvs\n🔵 @${opponentNum} (Power: ${Math.round(opower)})\n\n🏆 *WINNER: @${winner}*\n💀 *LOSER: @${loser}*\n\nCombat complete. The numbers don't lie.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
        mentions: [sender, opponent]
      }, { quoted: msg });
    }
  }

];
