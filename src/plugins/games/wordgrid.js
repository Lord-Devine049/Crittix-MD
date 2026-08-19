/*
 * WORDGRID.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: wordgrid, stopwordgrid
 * A group word-search game rendered live with @napi-rs/canvas
 */
const { createCanvas } = require('canvas');
const globalXP = require('../../lib/global-xp');
const h       = require('../../lib/helpers');
const fs      = require('fs-extra');
const path    = require('path');
const p = require('../../lib/phrases');


// ─── Constants ────────────────────────────────────────────────────────────────
const GRID_SIZE   = 8;
const CELL        = 56;
const PAD         = 20;
const CANVAS_W    = GRID_SIZE * CELL + PAD * 2;   // 468
const CANVAS_H    = GRID_SIZE * CELL + PAD * 2;   // 468
const AURA_PER_WORD = 50;
const XP_PER_WORD   = globalXP.XP_PER_GAME;
const TIMEOUT_MS    = 10 * 60 * 1000; // 10 minutes inactivity

const HIGHLIGHT_COLORS = [
  '#ff6b9d', '#ffd700', '#00e676', '#ff9800',
  '#00bcd4', '#e040fb', '#ff5722', '#69f0ae',
  '#40c4ff', '#ffea00', '#f06292', '#b39ddb',
];

const DIRECTIONS = [
  [0,  1], [0, -1], [1,  0], [-1,  0],
  [1,  1], [1, -1], [-1,  1], [-1, -1],
];

// ─── Word list (3-8 letters, varied difficulty) ───────────────────────────────
const WORD_LIST = [
  'ACE','ARC','ASH','AXE','BAT','BIG','BOX','BUG','CAB','CAP',
  'COP','CRY','CUP','CUT','DAM','DEN','DIM','DIP','DOT','DRY',
  'DUB','EEL','EGG','ELK','FAD','FAN','FAR','FIG','FIN','FIT',
  'FLY','FOG','FOR','FOX','FRY','GEM','GIG','GIN','GNU','GOT',
  'GUM','GUN','GUT','HIT','HOG','HOP','HUB','HUE','JET','JIG',
  'JOT','JUG','JUT','KEG','KIT','LAB','LAD','LAP','LAX','LAY',
  'LEG','LET','LID','LIP','LIT','LOG','MAP','MAT','MAW','MOB',
  'MOD','MOP','MUG','NAB','NAP','NET','NIB','NIT','NOB','NUB',
  'OAF','OAK','OAR','ODD','OPT','ORB','ORE','OWL','PAD','PAN',
  'PAP','PAR','PAW','PAY','PEA','PEG','PEN','PET','PIE','PIG',
  // 4-letter words
  'ACID','AGED','AIDE','ALMS','ALPS','ALSO','ALTO','AMEN','AMID',
  'AMOK','ANTE','ANTI','APEX','ARCH','ACHE','AXLE','BALE','BALK',
  'BAND','BARE','BARK','BARN','BASE','BATH','BEAD','BEAM','BEAN',
  'BEAR','BEAT','BEEF','BEER','BELL','BELT','BEND','BILE','BIRD',
  'BITE','BLOT','BLOW','BLUE','BLUR','BOLD','BOLT','BOND','BONE',
  'BOOK','BOOM','BOOT','BORN','BOSS','BOTH','BOWL','BUMP','BURN',
  'BURP','BUST','BYTE','CAFE','CAGE','CAKE','CALM','CAME','CANE',
  'CAPE','CARD','CARE','CART','CASE','CAVE','CHAD','CHEF','CHIP',
  'CHOP','CHUG','CITE','CLAM','CLAP','CLAY','CLIP','CLOT','CLUE',
  'COAL','COAT','COIL','COIN','COLD','COME','CONE','COOK','CORD',
  'CORE','CORK','CORN','COST','COUP','COVE','CRAB','CRAM','CREW',
  'CROP','CROW','CRUD','CULL','CURB','CURE','CURL','CUTE','DARK',
  'DART','DASH','DATE','DAWN','DEAL','DEAR','DECK','DEEP','DEER',
  'DEMO','DENY','DESK','DIAL','DICE','DIET','DIME','DIRE','DIRT',
  'DISK','DOME','DONE','DOOR','DOSE','DOWN','DRAB','DRAG','DRAW',
  'DREW','DRIP','DROP','DRUB','DRUM','DUAL','DUCK','DUEL','DUFF',
  'DUMB','DUNE','DUSK','DUST','DUTY','EACH','EARL','EARN','EASE',
  'EDGE','EJECT','EPIC','EVEN','EVIL','EXAM','EXIT','FACE','FACT',
  'FADE','FAIL','FAIR','FAKE','FALL','FAME','FANG','FARM','FAST',
  'FATE','FEAT','FEEL','FEET','FELL','FELT','FILE','FILL','FILM',
  'FIND','FIRE','FIRM','FISH','FIST','FLAG','FLAT','FLAW','FLEW',
  'FLEX','FLIP','FLIT','FLOG','FLOW','FOAM','FOIL','FOLD','FOLK',
  'FOND','FONT','FOOD','FOOL','FORD','FORE','FORK','FORM','FORT',
  'FOUL','FOUR','FOWL','FREE','FROG','FROM','FUEL','FULL','FUND',
  'FURY','FUSE','FUSS','GALE','GAME','GANG','GASH','GASP','GATE',
  'GAVE','GAZE','GEAR','GIFT','GIRL','GIVE','GLAD','GLEE','GLEN',
  'GLOW','GLUE','GOAT','GOLD','GOLF','GOOD','GRAB','GRAD','GRAN',
  'GRAY','GRIN','GRIP','GRIT','GROW','GRUB','GULF','GUST','HACK',
  'HALE','HALL','HALT','HAND','HANG','HARD','HARE','HARM','HARP',
  'HATE','HAUL','HAVE','HAWK','HEAD','HEAL','HEAP','HEAT','HEEL',
  'HELD','HELM','HELP','HEMP','HERB','HERE','HIGH','HIKE','HILL',
  'HINT','HIRE','HIVE','HOLD','HOLE','HOME','HOOD','HOOK','HOPE',
  'HORN','HOST','HOUR','HULL','HUMP','HUNT','HURL','HURT','HYMN',
  // 5-letter words
  'ABUSE','ACTOR','ACUTE','ADULT','AFTER','AGENT','AGILE','AGING',
  'AISLE','ALARM','ALBUM','ALGAE','ALIEN','ALIGN','ALIVE','ALLOT',
  'ALLOW','ALOOF','ALTAR','ALTER','ANGEL','ANGER','ANGLE','ANKLE',
  'ANNEX','ANTIC','ANVIL','APART','APPLE','APTLY','ARENA','ARGON',
  'ARMOR','ARRAY','ARROW','ATEST','ATLAS','ATONE','ATTIC','AUDIO',
  'AUDIT','AVAIL','AWARE','BADLY','BADGE','BASIC','BASIS','BATCH',
  'BLADE','BLAND','BLANK','BLAST','BLAZE','BLEAK','BLEED','BLESS',
  'BLIND','BLOCK','BLOOD','BLOOM','BLOWN','BOARD','BONUS','BOUND',
  'BRACE','BRAIN','BRAKE','BRAND','BRAVE','BREAK','BREED','BRIBE',
  'BRIDE','BRIEF','BRINE','BRINK','BRISK','BROKE','BROOK','BROTH',
  'BRUSH','BUILD','BUILT','BURST','BUYER','CABLE','CANAL','CANDY',
  'CARRY','CAUSE','CHAIN','CHAIR','CHALK','CHARM','CHART','CHASE',
  'CHEAP','CHEAT','CHECK','CHEEK','CHESS','CHEST','CHIEF','CHILD',
  'CHORD','CHOSE','CIVIL','CLAIM','CLASH','CLASP','CLASS','CLEAN',
  'CLEAR','CLERK','CLICK','CLIFF','CLIMB','CLING','CLOCK','CLONE',
  'CLOSE','CLOTH','CLOUD','CLUCK','COLON','COLOR','COMIC','COMMA',
  'CORAL','COUCH','COUGH','COUNT','COURT','COVER','CRACK','CRAFT',
  'CRANE','CRASH','CRAVE','CRAZE','CRAZY','CREEK','CREEP','CREST',
  'CRIME','CRISP','CROSS','CROWD','CROWN','CRUEL','CRUSH','CRUST',
  'CRYPT','CUBIC','CURVE','CYCLE','DAILY','DANCE','DEBUT','DECAY',
  'DECOY','DELTA','DEMON','DENSE','DEPTH','DERBY','DIGIT','DINGO',
  'DISCO','DITCH','DIVER','DIZZY','DODGE','DOING','DONOR','DOUBT',
  'DOUGH','DRAFT','DRAIN','DRAPE','DREAM','DRESS','DRIFT','DRILL',
  'DRINK','DRIVE','DRONE','DROVE','DRUNK','DRYER','DWARF','DYING',
  'EAGLE','EARLY','EARTH','EIGHT','ELITE','EMBER','EMPTY','ENEMY',
  'ENJOY','ENTER','ENTRY','EPOCH','EQUAL','ERROR','ERUPT','ESSAY',
  'EVENT','EXACT','EXIST','EXTRA','FABLE','FACET','FAIRY','FAITH',
  'FAINT','FANCY','FATAL','FAULT','FEAST','FENCE','FETCH','FEVER',
  'FIBER','FIELD','FIEND','FIFTH','FIFTY','FIGHT','FINAL','FIRST',
  'FIXED','FLAME','FLANK','FLARE','FLASH','FLAIR','FLAUNT','FLESH',
  'FLOCK','FLOOD','FLOOR','FLOUR','FLUID','FLUTE','FOCUS','FORCE',
  'FORGE','FORTH','FORUM','FOUND','FRAIL','FRAUD','FRESH','FRONT',
  'FROST','FROWN','FROZE','FRUIT','FUNGI','FUNNY','GAUGE','GIANT',
  'GIVEN','GLAND','GLASS','GLAZE','GLIDE','GLOOM','GLORY','GLOSS',
  'GLOVE','GNOME','GOING','GRACE','GRADE','GRASP','GRASS','GRATE',
  'GRAVE','GRAZE','GREED','GREET','GRIEF','GROAN','GROPE','GROVE',
  'GROWL','GUARD','GUESS','GUEST','GUIDE','GUILD','GUILT','GUISE',
  'HABIT','HAPPY','HARSH','HASTE','HAVEN','HEARD','HEART','HEAVE',
  'HEAVY','HEDGE','HENCE','HERON','HONOR','HOTEL','HOUSE','HUMAN',
  'HUMOR','HURRY','HYENA','IDEAL','ICING','IMAGE','INDEX','INDIE',
  'INERT','INFIX','INLET','INNER','INPUT','INTER','INTRO','IRONY',
  'ISSUE','IVORY','JAPAN','JELLY','JEWEL','JOINT','JOKER','JOUST',
  'JUDGE','JUICE','JUICY','JUNTO','KARMA','KAYAK','KINKY','KIOSK',
  'KNACK','KNEEL','KNIFE','KNOCK','KNOWN','KUDOS','LABEL','LARGE',
  'LASER','LATCH','LATER','LEARN','LEASE','LEVEL','LIGHT','LIMIT',
  'LINER','LINGO','LIVER','LLAMA','LOCAL','LODGE','LOGIC','LOOSE',
  'LOVER','LOWER','LOYAL','LUCKY','LUNAR','LYRIC','MAGIC','MAJOR',
  'MAKER','MANOR','MAPLE','MATCH','MAYOR','MEDAL','MEDIA','MERCY',
  'MERIT','METAL','MIGHT','MINCE','MINOR','MINUS','MIRTH','MISER',
  'MIXED','MODEL','MONEY','MONTH','MORAL','MOTEL','MOUSE','MOUTH',
  'MURAL','MUSIC','NAIVE','NAVAL','NERVE','NEVER','NIGHT','NOBLE',
  'NOISE','NORTH','NOTED','NOVEL','NUDGE','NURSE','NYMPH','OASIS',
  'OCCUR','OCEAN','OFFER','OFTEN','OLIVE','ONSET','OPERA','ORBIT',
  'ORDER','OTHER','OUTER','OUTDO','OVARY','OXIDE','OZONE','OWNER',
  'PAINT','PANEL','PANIC','PAPER','PARTY','PASTE','PATCH','PAUSE',
  'PEACE','PEARL','PHASE','PHONE','PHOTO','PIANO','PITCH','PIXEL',
  'PIZZA','PLACE','PLAIN','PLANE','PLANT','PLATE','PLAZA','PLEAD',
  'PLUMP','PLUNK','POEM','POINT','POISE','POKER','POLAR','PORCH',
  'POWER','PRESS','PRICE','PRIDE','PRIME','PRINT','PRIOR','PRIZE',
  'PROBE','PRONE','PROOF','PROSE','PROUD','PROVE','PROXY','PSALM',
  'PULSE','PUNCH','PUPIL','PURGE','QUEEN','QUERY','QUEST','QUEUE',
  'QUICK','QUIET','QUOTA','QUOTE','RADAR','RADIO','RAISE','RALLY',
  'RANGE','RAPID','RATIO','REACH','READY','REALM','RELAY','RELIC',
  'REPEL','REPAY','RESET','RIDGE','RIGHT','RISKY','RIVAL','RIVER',
  'ROBIN','ROBOT','ROCKY','ROGUE','ROMAN','ROUGH','ROUND','ROUTE',
  'ROYAL','RULER','RUMOR','RURAL','SAINT','SALAD','SAUCE','SCALE',
  'SCARE','SCENE','SCOLD','SCONE','SCOPE','SCORE','SCOUT','SCRAM',
  'SEIZE','SENSE','SERVE','SETUP','SEVEN','SEWER','SHAFT','SHADE',
  'SHAKE','SHALL','SHAME','SHAPE','SHARE','SHARK','SHARP','SHELF',
  'SHELL','SHIFT','SHINE','SHOCK','SHORE','SHOUT','SHRUG','SIGHT',
  'SKILL','SKULL','SLATE','SLAVE','SLEEP','SLIDE','SLOPE','SMART',
  'SMASH','SMILE','SMOKE','SNACK','SNAKE','SOLID','SOLVE','SONIC',
  'SOUTH','SPACE','SPARE','SPARK','SPEAK','SPEND','SPIKE','SPILL',
  'SPINE','SPOKE','SPOOK','SPORT','SPRAY','SQUAD','SQUID','STAGE',
  'STAIN','STALE','STALL','STAMP','STAND','STARK','START','STATE',
  'STEAM','STEEL','STEEP','STEER','STERN','STICK','STIFF','STILL',
  'STING','STOCK','STOMP','STONE','STORM','STORY','STOUT','STOVE',
  'STRAP','STRAW','STRAY','STRIP','STUDY','STUMP','STUNT','STYLE',
  'SUGAR','SUITE','SUPER','SURGE','SWAMP','SWARM','SWEAR','SWEET',
  'SWEEP','SWELL','SWIFT','SWIPE','SWIRL','SWOOP','SWORD','SWORN',
  'SYRUP','TABLE','TALON','TEASE','TENSE','TERRA','THEFT','THICK',
  'THING','THINK','THORN','THOSE','THREE','TIGER','TIGHT','TIMER',
  'TITAN','TITLE','TOAST','TODAY','TOKEN','TORCH','TOTAL','TOUCH',
  'TOUGH','TOWEL','TOWER','TOXIC','TRACE','TRACK','TRADE','TRAIL',
  'TRAIN','TRAIT','TRAMP','TRASH','TREAD','TRICK','TRIED','TROOP',
  'TRUCK','TRUNK','TRUTH','TUNER','TUTOR','TWIST','ULTRA','UNITY',
  'UNTIL','UPPER','UPSET','URBAN','USAGE','USHER','VALID','VALUE',
  'VAPOR','VAULT','VENOM','VERSE','VIGOR','VIRAL','VIRUS','VISIT',
  'VITAL','VOCAL','VOICE','VOTER','WAGES','WASTE','WATCH','WATER',
  'WEAVE','WEIGH','WEIRD','WHILE','WHOLE','WHOSE','WIELD','WILDE',
  'WITCH','WOMAN','WORLD','WORRY','WORSE','WORTH','WOULD','WOUND',
  'WRATH','WRONG','WROTE','YAHOO','YOUNG','YOUTH','ZEBRA','ZESTY',
].filter(w => w.length >= 3 && w.length <= 8);

// ─── Aura helper (inline — no exported addAura in crittix-aura.js) ──────────
const AURA_DB = path.join(process.cwd(), 'database', 'crittix-aura.json');
const addAura = (jid, userName, points) => {
  try {
    if (jid.endsWith('@lid')) jid = jid.replace('@lid', '@s.whatsapp.net');
    const data = fs.existsSync(AURA_DB)
      ? JSON.parse(fs.readFileSync(AURA_DB, 'utf8'))
      : {};
    if (!data[jid]) data[jid] = { userId: jid, userName, aura: 0, lastFarm: 0, registeredAt: Date.now() };
    data[jid].aura    = (data[jid].aura || 0) + points;
    data[jid].userName = userName;
    fs.ensureDirSync(path.dirname(AURA_DB));
    fs.writeFileSync(AURA_DB, JSON.stringify(data, null, 2));
    return data[jid].aura;
  } catch { return 0; }
};

// ─── Grid generation ─────────────────────────────────────────────────────────
const buildGrid = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
const LETTERS   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const randLetter = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];

const placeWord = (grid, word) => {
  const shuffledDirs = [...DIRECTIONS].sort(() => Math.random() - 0.5);
  const N = GRID_SIZE;
  for (const [dr, dc] of shuffledDirs) {
    // Build list of valid start positions for this direction
    const starts = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const endR = r + dr * (word.length - 1);
        const endC = c + dc * (word.length - 1);
        if (endR >= 0 && endR < N && endC >= 0 && endC < N) starts.push([r, c]);
      }
    }
    starts.sort(() => Math.random() - 0.5);
    for (const [sr, sc] of starts) {
      const path = [];
      let valid = true;
      for (let i = 0; i < word.length; i++) {
        const r = sr + dr * i;
        const c = sc + dc * i;
        const existing = grid[r][c];
        if (existing !== null && existing !== word[i]) { valid = false; break; }
        path.push({ row: r, col: c });
      }
      if (!valid) continue;
      for (let i = 0; i < word.length; i++) {
        grid[path[i].row][path[i].col] = word[i];
      }
      return path;
    }
  }
  return null;
};

const generateGame = (chatId) => {
  // Pick candidate words: shuffle the list, try to place 10 words
  const candidates = [...WORD_LIST].sort(() => Math.random() - 0.5);
  const grid = buildGrid();
  const placed = [];
  let tried = 0;
  for (const raw of candidates) {
    if (placed.length >= 10 || tried > 200) break;
    tried++;
    const word = raw.toUpperCase();
    const wordPath = placeWord(grid, word);
    if (wordPath) {
      placed.push({ word, path: wordPath, found: false, foundBy: null, foundByName: null });
    }
  }
  if (placed.length < 5) return null; // couldn't place enough words
  // Fill remaining nulls with random letters
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) grid[r][c] = randLetter();
    }
  }
  return {
    groupId:    chatId,
    grid,
    words:      placed,
    highlights: [],
    startedAt:  Date.now(),
    startedBy:  null,
    startedByName: null,
    colorIndex: 0,
    lastFoundAt: Date.now(),
    timeoutHandle: null,
    scores:     {}, // jid → { name, count }
  };
};

// ─── Canvas rendering ─────────────────────────────────────────────────────────
const renderGrid = (game) => {
  const canvas = createCanvas(CANVAS_W, CANVAS_H);
  const ctx    = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Subtle inner border
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(PAD - 2, PAD - 2, GRID_SIZE * CELL + 4, GRID_SIZE * CELL + 4);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(PAD + i * CELL, PAD);
    ctx.lineTo(PAD + i * CELL, PAD + GRID_SIZE * CELL);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(PAD, PAD + i * CELL);
    ctx.lineTo(PAD + GRID_SIZE * CELL, PAD + i * CELL);
    ctx.stroke();
  }

  // Word highlights (draw UNDER letters)
  ctx.lineCap  = 'round';
  ctx.lineJoin = 'round';
  for (const hl of game.highlights) {
    const first = hl.path[0];
    const last  = hl.path[hl.path.length - 1];
    ctx.beginPath();
    ctx.strokeStyle = hl.color + 'aa'; // semi-transparent fill
    ctx.lineWidth   = Math.floor(CELL * 0.75);
    ctx.moveTo(PAD + first.col * CELL + CELL / 2, PAD + first.row * CELL + CELL / 2);
    ctx.lineTo(PAD + last.col  * CELL + CELL / 2, PAD + last.row  * CELL + CELL / 2);
    ctx.stroke();
  }

  // Letters (on top of highlights)
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.floor(CELL * 0.46);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = PAD + c * CELL + CELL / 2;
      const y = PAD + r * CELL + CELL / 2;
      // Shadow for contrast
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font      = `bold ${fontSize}px Arial`;
      ctx.fillText(game.grid[r][c], x + 1, y + 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(game.grid[r][c], x, y);
    }
  }

  return canvas.toBuffer('image/png');
};

// ─── Caption helpers ──────────────────────────────────────────────────────────
const wordHint = (entry) => {
  if (entry.found) return `✓ *${entry.word}*`;
  const letters = entry.word.split('');
  return `◎ ${letters[0]} ${letters.slice(1).map(() => '_').join(' ')}`;
};

const buildCaption = (game) => {
  const remaining = game.words.filter(w => !w.found).length;
  const lines     = game.words.map(wordHint).join('\n');
  return (
    `🔠 *Word Grid — find the hidden words!*\n\n` +
    `${lines}\n\n` +
    `✯ *${remaining} Word${remaining !== 1 ? 's' : ''} Left*`
  );
};

// ─── Active games (in-memory per group) ──────────────────────────────────────
const activeGames = new Map(); // chatId → game state

const sendGrid = async (sock, chatId, game, caption, quotedMsg = null) => {
  const buf     = renderGrid(game);
  const tmpPath = path.join(process.cwd(), 'tmp', `wordgrid_${chatId}_${Date.now()}.png`);
  fs.ensureDirSync(path.dirname(tmpPath));
  fs.writeFileSync(tmpPath, buf);
  const opts = quotedMsg ? { quoted: quotedMsg } : {};
  await sock.sendMessage(chatId, { image: { url: tmpPath }, caption }, opts);
  fs.removeSync(tmpPath);
};

// ─── Timeout management ───────────────────────────────────────────────────────
const resetTimeout = (chatId, sock) => {
  const game = activeGames.get(chatId);
  if (!game) return;
  if (game.timeoutHandle) clearTimeout(game.timeoutHandle);
  game.timeoutHandle = setTimeout(async () => {
    if (!activeGames.has(chatId)) return;
    const g = activeGames.get(chatId);
    activeGames.delete(chatId);
    const remaining = g.words.filter(w => !w.found).length;
    const buf = renderGrid(g);
    const tmpPath = path.join(process.cwd(), 'tmp', `wordgrid_to_${chatId}_${Date.now()}.png`);
    fs.ensureDirSync(path.dirname(tmpPath));
    fs.writeFileSync(tmpPath, buf);
    const caption = `⏰ *Word Grid Timed Out!*\n\n${remaining} word(s) still hidden.\n\n` +
      g.words.map(w => w.found ? `✓ ${w.word}` : `✗ ${w.word}`).join('\n') +
      `\n\n_Nobody found all the words. Embarrassing._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
    await sock.sendMessage(chatId, { image: { url: tmpPath }, caption });
    fs.removeSync(tmpPath);
  }, TIMEOUT_MS);
};

// ─── checkAnswer — wired into devine.js message handler ──────────────────────
const checkAnswer = (chatId, sender, senderName, text, sock, msg) => {
  const game = activeGames.get(chatId);
  if (!game) return false;

  const guess = text.trim().toUpperCase();
  const entry = game.words.find(w => !w.found && w.word === guess);
  if (!entry) return false;

  // Mark found
  entry.found      = true;
  entry.foundBy    = sender;
  entry.foundByName = senderName;

  // Pick highlight color
  const color = HIGHLIGHT_COLORS[game.colorIndex % HIGHLIGHT_COLORS.length];
  game.colorIndex++;
  game.highlights.push({ path: entry.path, color });

  // Update scores
  if (!game.scores[sender]) game.scores[sender] = { name: senderName, count: 0 };
  game.scores[sender].count++;

  // Award aura + XP
  const newAura = addAura(sender, senderName, AURA_PER_WORD);
  const newXP   = globalXP.addXP(sender, senderName, XP_PER_WORD);

  const remaining = game.words.filter(w => !w.found).length;

  // Check game over
  if (remaining === 0) {
    activeGames.delete(chatId);
    if (game.timeoutHandle) clearTimeout(game.timeoutHandle);

    // Build leaderboard
    const board = Object.values(game.scores)
      .sort((a, b) => b.count - a.count)
      .map((p, i) => `${i + 1}. @${p.name} — ${p.count} word${p.count !== 1 ? 's' : ''}`)
      .join('\n');

    const finalCaption =
      `🏆 *WORD GRID COMPLETE!*\n\n` +
      `★ 闇 ${senderName} 闇 found the last word → *${entry.word}*\n\n` +
      `All ${game.words.length} words found!\n\n` +
      `*🏅 Leaderboard:*\n${board}\n\n` +
      `+${AURA_PER_WORD} Aura | +${XP_PER_WORD} XP to last finder\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

    setImmediate(() => sendGrid(sock, chatId, game, finalCaption));
    return true;
  }

  // Reset inactivity timeout
  resetTimeout(chatId, sock);

  // Word found — resend updated grid
  const foundCaption =
    `★ 闇 ${senderName} 闇 have Found → *${entry.word}*\n` +
    `+${AURA_PER_WORD} Aura (${newAura} total) | +${XP_PER_WORD} XP (${newXP} total)\n\n` +
    buildCaption(game);

  setImmediate(() => sendGrid(sock, chatId, game, foundCaption, msg));
  return true;
};

// ─── Commands ─────────────────────────────────────────────────────────────────
module.exports = [

  {
    command: 'wordgrid',
    aliases: ['wgame', 'wsearch'],
    category: 'shadowgames',
    description: 'Start a group word-search game. Find hidden words by typing them. Usage: .wordgrid',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      if (activeGames.has(chatId)) {
        return reply(`🔠 A Word Grid game is already in progress!\n\nFind the hidden words — type them in chat.\n\nUse *.stopwordgrid* to end the current game.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      }
      const game = generateGame(chatId);
      if (!game) return reply(h.demonFail('Failed to generate grid. Try again.'));
      game.startedBy     = sender;
      game.startedByName = msg.pushName || sender.split('@')[0];
      activeGames.set(chatId, game);
      resetTimeout(chatId, sock);

      const caption = buildCaption(game);
      await sendGrid(sock, chatId, game, caption, msg);
    }
  },

  {
    command: 'stopwordgrid',
    aliases: ['endwordgrid', 'cancelwg'],
    category: 'shadowgames',
    description: 'Stop the active Word Grid game. Host or admin only. Usage: .stopwordgrid',
    groupOnly: true,
    execute: async ({ sock, msg, chatId, sender, reply }) => {
      const game = activeGames.get(chatId);
      if (!game) return reply(h.demonFail('No active Word Grid game to stop.'));
      const isHost  = game.startedBy === sender;
      const isAdmin = await h.isSenderAdmin(sock, chatId, sender).catch(() => false);
      if (!isHost && !isAdmin) return reply(p.phrases.adminOnly());

      activeGames.delete(chatId);
      if (game.timeoutHandle) clearTimeout(game.timeoutHandle);

      const found     = game.words.filter(w => w.found).length;
      const remaining = game.words.filter(w => !w.found).length;
      const caption   =
        `🛑 *Word Grid Stopped*\n\n` +
        `Words found: ${found} / ${game.words.length}\n\n` +
        game.words.map(w => w.found ? `✓ ${w.word} (${w.foundByName})` : `✗ ${w.word}`).join('\n') +
        `\n\n_Game ended by ${msg.pushName || sender.split('@')[0]}_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

      await sendGrid(sock, chatId, game, caption, msg);
    }
  }

];

module.exports.activeGames  = activeGames;
module.exports.checkAnswer  = checkAnswer;
