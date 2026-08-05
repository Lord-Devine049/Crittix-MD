/*
 * ============================================================
 * CRITTIX MD  index.js
 * Session ID based startup 
 * Created by: 𝗟𝗼𝗿𝗱 𝙳𝙴𝚅𝙸𝙽𝙴
 * ============================================================
 */
require('dotenv').config();

const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  delay,
  BufferJSON,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const fs       = require('fs-extra');
const path     = require('path');
const chalk    = require('chalk');
const pino     = require('pino');
const axios    = require('axios');
const readline = require('readline'); 

const { createOwnerConfig } = require('./src/lib/config');
const bootTime              = require('./src/lib/boot-time');
const { patchSocket }       = require('./src/lib/group-cache');

bootTime.initBootTime();

const OWNER_NUMBER = (process.env.OWNER_NUMBER || '').trim();
const SESSION_ID   = (process.env.SESSION_ID   || '').trim();
const PAIRING_API  = (process.env.PAIRING_API_BASE || 'https://crittixdomain.name.ng').trim();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const askQuestion = (text) => new Promise((resolve) => rl.question(text, resolve));

global.botStartTime  = bootTime.getStartedAt();
global.presenceCache = {};
global.afkStore      = {};
global.activeBets    = {};
global.BOT_LID_MAP   = {};

process.on('unhandledRejection', r => console.error(chalk.red('[ERROR]'), r?.message || r));
process.on('uncaughtException',  e => console.error(chalk.red('[CRASH]'), e.message));

console.clear();
console.log(chalk.magenta(`
 ██████╗██████╗ ██╗████████╗████████╗██╗██╗  ██╗
██╔════╝██╔══██╗██║╚══██╔══╝╚══██╔══╝██║╚██╗██╔╝
██║     ██████╔╝██║   ██║      ██║   ██║ ╚███╔╝ 
██║     ██╔══██╗██║   ██║      ██║   ██║ ██╔██╗ 
╚██████╗██║  ██║██║   ██║      ██║   ██║██╔╝ ██╗
 ╚═════╝╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝   ╚═╝╚═╝  ╚═╝
`));
console.log(chalk.cyan('═'.repeat(60)));
console.log(chalk.magenta('💜 Crittix-MD | Created by 闇 𝐋𝐎𝐑𝐃 𝐃𝐄𝐕𝐈𝐍𝐄 闇'));
console.log(chalk.cyan('═'.repeat(60)));

async function loadSessionFromId(sessionId, authPath) {
  if (!sessionId || !sessionId.startsWith('CRITTIX_')) {
    throw new Error('Invalid SESSION_ID. Must start with CRITTIX_');
  }

  let encodedCreds;
  try {
    const res = await axios.get(
      `${PAIRING_API}/api/pairing/session/${encodeURIComponent(sessionId)}`,
      { timeout: 15000 }
    );
    encodedCreds = res.data?.encodedCreds;
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    throw new Error(`Failed to fetch session from pairing API: ${msg}`);
  }

  if (!encodedCreds) {
    throw new Error('Pairing API returned no encodedCreds for this SESSION_ID.');
  }

  const base64 = encodedCreds.replace('CRITTIX_', '');
  const raw = Buffer.from(base64, 'base64').toString('utf8');

  await fs.ensureDir(authPath);

  let bundle;
  try {
    bundle = JSON.parse(raw);
  } catch (_) {
    bundle = null;
  }

  if (!bundle || typeof bundle !== 'object') {
    throw new Error('SESSION_ID format not recognized. Please re-pair.');
  }

  let fileCount = 0;
  for (const [filename, content] of Object.entries(bundle)) {
    if (!filename || !content) continue;
    const filePath = path.join(authPath, filename);
    const dir = path.dirname(filePath);
    await fs.ensureDir(dir);
    await fs.writeFile(filePath, content);
    fileCount++;
  }

  if (fileCount === 0) {
    throw new Error('SESSION_ID bundle is empty. Please re-pair.');
  }

  console.log(chalk.green(`✅ Session loaded from SESSION_ID (${fileCount} files)`));
}

async function startBot() {
  const authPath = path.join(process.cwd(), 'auth', 'session');
  await fs.ensureDir(authPath);

  const credsPath = path.join(authPath, 'creds.json');
  const alreadyHasLocalSession = await fs.pathExists(credsPath);

  if (SESSION_ID && !alreadyHasLocalSession) {
    await loadSessionFromId(SESSION_ID, authPath);
  } else if (SESSION_ID && alreadyHasLocalSession) {
    console.log(chalk.cyan('🔄 Reusing existing local session (skipping pairing API fetch)'));
  }

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  let version;
  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch (_) {
    version = [2, 3000, 1027934701];
  }

  const sock = makeWASocket({
    auth:                state,
    version,
    printQRInTerminal:   false,
    logger:              pino({ level: 'silent' }),
    browser:             Browsers.ubuntu('Chrome'),
    syncFullHistory:     false,
    markOnlineOnConnect: true,
    keepAliveIntervalMs: 25000,
    retryRequestDelayMs: 2000,
    connectTimeoutMs:    60000,
    getMessage:          async () => ({ conversation: '' }),
  });

  patchSocket(sock);

  if (!SESSION_ID && !state.creds.registered) {
    let phoneNumber = OWNER_NUMBER;
    if (!phoneNumber) {
      console.log(chalk.magenta('╔═══════════════════════════════════════╗'));
      console.log(chalk.magenta('║ ') + chalk.bold.white('闇 𝕮𝖗𝖎𝖙𝖙𝖎𝖝 𝕸𝕯 闇') + '   ' + chalk.magenta('📱 PAIRING SETUP'));
      console.log(chalk.magenta('╠═══════════════════════════════════════╣'));
      console.log(chalk.magenta('║ ') + chalk.cyan('No active session found.'));
      console.log(chalk.magenta('║ ') + chalk.cyan('Enter your WhatsApp number to pair the bot.'));
      console.log(chalk.magenta('║'));
      console.log(chalk.magenta('║ ') + chalk.yellow('Format : ') + chalk.white('country code + number'));
      console.log(chalk.magenta('║ ') + chalk.yellow('         ') + chalk.white('(no + sign, no leading 0)'));
      console.log(chalk.magenta('║ ') + chalk.yellow('Example: ') + chalk.white('2348012345678'));
      console.log(chalk.magenta('╚═══════════════════════════════════════╝'));
      phoneNumber = await askQuestion(chalk.green('📲 Number ➜ '));
    }
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    await delay(3000);
    try {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(chalk.magenta('╔═══════════════════════════════════════╗'));
      console.log(chalk.magenta('║ ') + chalk.bold.white('闇 𝕮𝖗𝖎𝖙𝖙𝖎𝖝 𝕸𝕯 闇') + '   ' + chalk.green('✅ PAIRING CODE'));
      console.log(chalk.magenta('╠═══════════════════════════════════════╣'));
      console.log(chalk.magenta('║ ') + chalk.green('Code: ') + chalk.bold.white(code));
      console.log(chalk.magenta('║'));
      console.log(chalk.magenta('║ ') + chalk.cyan('WhatsApp ➜ Linked Devices ➜ Link with'));
      console.log(chalk.magenta('║ ') + chalk.cyan('phone number ➜ enter the code above'));
      console.log(chalk.magenta('╚═══════════════════════════════════════╝'));
    } catch (e) {
      console.error(chalk.red('[PAIRING] Failed to get pairing code:'), e.message);
    }
  }

  sock.ev.on('creds.update', async (creds) => {
    await saveCreds(creds);
    if (creds?.me) {
      createOwnerConfig(OWNER_NUMBER || creds.me.id.split(':')[0].split('@')[0]);
    }
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(chalk.yellow('📱 QR code received — scan with WhatsApp'));
    }

    if (connection === 'open') {
      const me = sock.authState?.creds?.me;
      const resolvedOwnerNumber = OWNER_NUMBER || (me?.id ? me.id.split(':')[0].split('@')[0] : '');
      console.log(chalk.green(`\n✅ Connected: +${resolvedOwnerNumber}`));

      if (me?.lid) global.BOT_LID_MAP[resolvedOwnerNumber] = me.lid.replace(/:\d+@/, '@');
      if (me?.id)  global.BOT_LID_MAP[resolvedOwnerNumber + '_jid'] = me.id.replace(/:\d+@/, '@');

      createOwnerConfig(resolvedOwnerNumber);

      const startDevine = require('./src/devine');
      startDevine(sock, resolvedOwnerNumber);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode || 500) !== DisconnectReason.loggedOut;
      console.log(
        chalk.red(`❌ Connection closed. Code: ${lastDisconnect?.error?.output?.statusCode}`),
        shouldReconnect ? chalk.blue('(reconnecting...)') : chalk.red('(logged out)')
      );

      if (shouldReconnect) {
        setTimeout(() => startBot(), 5000);
      }
    }
  });
}

startBot().catch(err => {
  console.error(chalk.red('[FATAL]'), err.message);
  process.exit(1);
});
