const fs    = require("fs");
const path  = require("path");
const chalk = require("chalk");
const db    = require("./db");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// GROQ VISION
let _groqReady = false;

const initGroq = () => {
  if (process.env.GROQ_API_KEY) {
    _groqReady = true;
    console.log(chalk.green("[ANTINSFW] ✅ Groq Vision NSFW detection ready"));
  } else {
    console.error(chalk.red("[ANTINSFW] ❌ GROQ_API_KEY not set — NSFW detection disabled"));
  }
};

const getNsfwModel = async () => _groqReady ? true : null;

initGroq();

const checkBotAdmin = async (sock, chatId) => {
  try {
    const botJid = (sock.authState?.creds?.me?.id || '').replace(/:\d+@/, '@');
    const botLid = (sock.authState?.creds?.me?.lid || '').replace(/:\d+@/, '@') || null;
    const meta   = await sock.groupMetadata(chatId);

    return !!meta.participants.find(p => {
      const cleanId  = p.id.replace(/:\d+@/, '@');
      const cleanJid = (p.jid || '').replace(/:\d+@/, '@');
      const isBot    =
        cleanId  === botJid ||
        cleanJid === botJid ||
        (botLid && (cleanId === botLid || cleanJid === botLid));
      return isBot && p.admin;
    });
  } catch {
    return false;
  }
};

const checkSenderAdmin = async (sock, chatId, senderJid) => {
  try {
    const cleanSender = senderJid.replace(/:\d+@/, '@');
    const numOnly = (jid) => (jid || '').replace(/[^\d]/g, '').replace(/^0+/, '');
    const senderNum = numOnly(cleanSender);
    const meta        = await sock.groupMetadata(chatId);
    return !!meta.participants.find(p => {
      const cleanId    = (p.id          || '').replace(/:\d+@/, '@');
      const cleanLid   = (p.lid         || '').replace(/:\d+@/, '@');
      const cleanJid   = (p.jid         || '').replace(/:\d+@/, '@');
      const cleanPhone = (p.phoneNumber || '').replace(/:\d+@/, '@');
      const isMatch    = cleanId    === cleanSender ||
                         cleanLid   === cleanSender ||
                         cleanJid   === cleanSender ||
                         (cleanPhone && cleanPhone === cleanSender) ||
                         (senderNum && senderNum.length >= 7 && (
                           numOnly(cleanId)    === senderNum ||
                           numOnly(cleanPhone) === senderNum
                         ));
      const isAdm      = p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true;
      return isMatch && isAdm;
    });
  } catch {
    return false;
  }
};

if (!global.spamTracker) global.spamTracker = {};

const normalizeJid = (jid) => {
  if (!jid || typeof jid !== 'string') return jid;
  return jid.replace(/:\d+@.*/, '').replace(/@.*/, '');
};

const trackSpam = (groupId, senderJid, windowMs = 30000, threshold = 5) => {
  const now     = Date.now();
  const sender  = normalizeJid(senderJid);
  const group   = normalizeJid(groupId);
  const key     = `${group}:${sender}`;
  const times   = (global.spamTracker[key] || []).filter(t => now - t < windowMs);
  times.push(now);
  global.spamTracker[key] = times;
  return times.length >= threshold;
};


if (!global.sameMessageTracker) global.sameMessageTracker = {};

const ANTISPAM2_FILE = path.join(process.cwd(), 'database', 'antispam2.json');

function loadAntispam2() {
  try { return JSON.parse(fs.readFileSync(ANTISPAM2_FILE, 'utf8')); } catch { return {}; }
}

const trackSameMessage = (groupId, senderJid, msgText, windowMs = 10000, threshold = 3) => {
  if (!msgText || msgText.length < 2) return false;
  const now    = Date.now();
  const sender = normalizeJid(senderJid);
  const group  = normalizeJid(groupId);
  const key    = `${group}:${sender}`;

  if (!global.sameMessageTracker[key]) {
    global.sameMessageTracker[key] = { text: msgText, times: [] };
  }
  const entry = global.sameMessageTracker[key];
  if (entry.text !== msgText) {
    global.sameMessageTracker[key] = { text: msgText, times: [now] };
    return false;
  }

  entry.times = entry.times.filter(t => now - t < windowMs);
  entry.times.push(now);
  return entry.times.length >= threshold;
};

// ANTIBEG TRACKER
const ANTIBEG_FILE = path.join(process.cwd(), 'database', 'antibeg.json');

function loadAntibeg() {
  try { return JSON.parse(fs.readFileSync(ANTIBEG_FILE, 'utf8')); } catch { return {}; }
}

const BEG_KEYWORDS = [
  'please send', 'pls send', 'plz send', 'send me', 'give me money', 'give me airtime',
  'please help me', 'pls help me', 'i need money', 'i need airtime', 'i need help',
  'i am broke', "i'm broke", 'no money', 'no airtime', 'donate to me', 'send donation',
  'please donate', 'pls donate', 'begging', 'i beg you', 'please give', 'pls give',
  'cash me', 'lend me', 'borrow me', 'need', 'need cash', 'kindly send',
];

const BANK_ACCOUNT_REGEX = /\b\d{10}\b/;

const ANTILINK_WARN = [
  "ᴡʜᴏ sᴀɪᴅ ʏᴏᴜʀ ᴄᴀɴ sᴇɴᴅ ʟɪɴᴋ ʜᴇʀᴇ? ᴀʀᴇ ʏᴏᴜ sᴛᴜᴘɪᴅ? ᴅᴏɴ'ᴛ ᴇᴠᴇʀ ᴛʀʏ ᴛʜᴀᴛ ɪɴ ʏᴏᴜʀ ʟɪғᴇ ᴀɢᴀɪɴ, ᴍᴏʀᴏɴ.",
  "ɴᴏʙᴏᴅʏ ɪɴ ʜᴇʀᴇ ᴡᴀɴᴛs ʏᴏᴜʀ ғᴜᴄᴋɪɴɢ ʟɪɴᴋ, ᴍᴇ ᴘᴇʀsᴏɴᴀʟʟʏ ᴅᴏɴ'ᴛ ᴡᴀɴᴛ ʏᴏᴜ ʜᴇʀᴇ, ᴡᴀsᴛᴇᴅ sᴘᴇʀᴍ",
  "ᴅɪᴅɴ'ᴛ ʏᴏᴜʀ ᴅᴀᴅ ᴛᴀᴜɢʜᴛ ʏᴏᴜ ʜᴏᴡ ᴛᴏ ᴏʙᴇʏ ɢʀᴏᴜᴘ ʀᴜʟᴇs ᴏʀ ɪs ʜᴇ ᴊᴜsᴛ ᴀs sᴛᴜᴘɪᴅ ᴀs ʏᴏᴜ?, sᴛᴜᴘɪᴅ ʟɪɴᴋ sᴘᴀᴍᴍᴇʀ",
  "ɴᴏ ʟɪɴᴋs, ɴᴏ ᴇxᴄᴇᴘᴛɪᴏɴs, ʏᴏᴜ sᴛᴜᴘɪᴅ ᴍᴏʀᴏɴ! Yᴏᴜ ᴄᴀɴ'ᴛ ʀᴇᴀᴅ ʀᴜʟᴇs, ʏᴏᴜ ᴄᴀɴ'ᴛ ғᴏʟʟᴏᴡ sɪᴍᴘʟᴇ ɪɴsᴛʀᴜᴄᴛɪᴏɴs... ᴡʜᴀᴛ ᴛʜᴇ ғᴜᴄᴋ ᴄᴀɴ ʏᴏᴜ ᴅᴏ ʙᴇsɪᴅᴇs ᴡᴀsᴛᴇ ᴏxʏɢᴇɴ?"
];

const ANTILINK_KICK = [
  "ᴛʜɪʀᴅ sᴛʀɪᴋᴇ ɢᴇᴛ ᴛʜᴇ ғᴜᴄᴋ ᴏᴜᴛ! ʟɪɴᴋ sᴘᴀᴍᴍᴇʀ ʀᴇᴍᴏᴠᴇᴅ",
  "ʀᴇᴍᴏᴠᴇᴅ.... ᴀ ᴄᴏɴᴅᴏᴍ ᴡᴏᴜʟᴅ ʜᴀᴠᴇ ᴀᴠᴏɪᴅᴇᴅ ᴛʜɪs ʟɪɴᴋ sᴘᴀᴍ",
  "ᴋɪᴄᴋᴇᴅ... ʏᴏᴜʀ ᴘᴀʀᴇɴᴛs ᴍᴜsᴛ ʜᴀᴠᴇ ʀᴇɢʀᴇᴛᴛᴇᴅ ɴᴏᴛ ᴜsɪɴɢ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ"
];

const ANTISPAM_WARN = [
  "Sᴘᴀᴍ ᴅᴇᴛᴇᴄᴛᴇᴅ, ʏᴏᴜ sᴛᴜᴘɪᴅ ғᴜᴄᴋ! Yᴏᴜʀ sᴘᴀᴍ ɢᴀᴍᴇ ɪs ᴡᴇᴀᴋᴇʀ ᴛʜᴀɴ ʏᴏᴜʀ ᴄʜᴀʀᴀᴄᴛᴇʀ. Kᴇᴇᴘ ᴛʜᴀᴛ sʜɪᴛ ᴛᴏ ʏᴏᴜʀsᴇʟғ ᴏʀ ɢᴇᴛ sᴡᴇᴘᴛ ɪɴᴛᴏ ᴛʜᴇ ᴛʀᴀsʜ ʙɪɴ ᴡʜᴇʀᴇ ʏᴏᴜ ʙᴇʟᴏɴɢ.",
  "Sᴛᴏᴘ ғʟᴏᴏᴅɪɴɢ ᴛʜᴇ ᴄʜᴀᴛ, ʏᴏᴜ ʙʀᴀɪɴ-ᴅᴇᴀᴅ ɪᴅɪᴏᴛ! Yᴏᴜʀ ᴍᴇssᴀɢᴇs ᴀʀᴇ ʟɪᴋᴇ ᴅɪᴀʀʀʜᴇᴀ ᴄᴏɴsᴛᴀɴᴛ, sᴛɪɴᴋʏ, ᴀɴᴅ ɴᴏʙᴏᴅʏ ᴡᴀɴᴛs ɪᴛ. Tᴀᴋᴇ ᴀ sᴇᴀᴛ ᴀɴᴅ sʜᴜᴛ ᴛʜᴇ ғᴜᴄᴋ ᴜᴘ.",
  "Tᴏᴏ ᴍᴜᴄʜ ɴᴏɪsᴇ, ʏᴏᴜ ᴇɴᴛɪᴛʟᴇᴅ ᴄʟᴏᴡɴ! Yᴏᴜʀ ᴄᴏɴsᴛᴀɴᴛ ʙᴜʟʟsʜɪᴛ ɪs ʟᴏᴜᴅᴇʀ ᴛʜᴀɴ ʏᴏᴜʀ ᴇɢᴏ ᴛᴜʀɴ ɪᴛ ᴅᴏᴡɴ ᴏʀ ɢᴇᴛ ʙʟᴏᴄᴋᴇᴅ ʟɪᴋᴇ ᴛʜᴇ ᴛʀᴀsʜ ʏᴏᴜ ᴀʀᴇ."
];
const ANTISPAM_KICK_REPLIES = [
  "ʟᴇᴀʀɴ ᴛᴏ sʜᴜᴛ ᴛʜᴇ ғᴜᴄᴋ ᴜᴘ.",
  "ᴀᴛᴛᴇɴᴛɪᴏɴ sᴇᴇᴋɪɴɢ ʙɪᴛᴄʜ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ ғʟᴏᴏᴅɪɴɢ",
  "ʏᴏᴜʀ ᴋᴇʏʙᴏᴀʀᴅ ᴍᴜsᴛ ʙᴇ ʙʀᴏᴋᴇɴ ʟɪᴋᴇ ʏᴏᴜʀ ʙʀᴀɪɴ"
];

const ANTISPAM2_WARN = [
  `𝒔𝒕𝒐𝒑 𝒔𝒑𝒂𝒎𝒎𝒊𝒏𝒈 𝒕𝒉𝒆 𝒔𝒂𝒎𝒆 𝒎𝒆𝒔𝒔𝒂𝒈𝒆 𝒐𝒗𝒆𝒓 𝒂𝒏𝒅 𝒐𝒗𝒆𝒓`,
  `𝒅𝒐𝒏'𝒕 𝒓𝒆𝒑𝒆𝒂𝒕 𝒕𝒉𝒆 𝒔𝒂𝒎𝒆 𝒎𝒆𝒔𝒔𝒂𝒈𝒆, 𝒅𝒆𝒍𝒆𝒕𝒆𝒅`,
  `𝒚𝒐𝒖𝒓 𝒔𝒑𝒂𝒎 𝒘𝒂𝒔 𝒅𝒆𝒍𝒆𝒕𝒆𝒅, 𝒔𝒕𝒐𝒑 𝒓𝒆𝒑𝒆𝒂𝒕𝒊𝒏𝒈 𝒎𝒆𝒔𝒔𝒂𝒈𝒆𝒔`
];
const ANTISPAM2_KICK = [
  `𝒌𝒆𝒑𝒕 𝒔𝒑𝒂𝒎𝒎𝒊𝒏𝒈 𝒕𝒉𝒆 𝒔𝒂𝒎𝒆 𝒎𝒆𝒔𝒔𝒂𝒈𝒆, 𝒓𝒆𝒎𝒐𝒗𝒆𝒅`,
  `𝒓𝒆𝒑𝒆𝒂𝒕 𝒔𝒑𝒂𝒎𝒎𝒆𝒓 𝒌𝒊𝒄𝒌𝒆𝒅`
];

const ANTIBEG_WARN = [
  "ᴡᴏᴡ, ʙᴇɢɢɪɴɢ? ʏᴏᴜ'ʀᴇ ᴊᴜsᴛ ᴀ ᴘᴏᴏʀ ʙᴀsᴛᴀʀᴅ ᴛʜᴀᴛ ʟᴏᴠᴇs ʙᴇɢɢɪɴɢ ᴅᴏᴇs ᴛʜɪs ɢʀᴏᴜᴘ ʟᴏᴏᴋ ʟɪᴋᴇ ᴜɴᴅᴇʀ ʙʀɪᴅɢᴇ? ᴡʜʏ ɴᴏᴛ ɢᴏ ᴊᴏɪɴ ʏᴏᴜʀ ғᴇʟʟᴏᴡ ʙᴇɢɢᴇʀs ᴛʜᴇʀᴇ, ᴘᴏᴏʀ ғᴏᴏʟ.",
  "ɴᴏʙᴏᴅʏ ᴏᴡᴇs ʏᴏᴜ ᴀɴʏᴛʜɪɴɢ ʜᴇʀᴇ, ᴛᴀᴋᴇ ʏᴏᴜʀ ʙᴇɢɢɪɴɢ ᴇʟsᴇᴡʜᴇʀᴇ. ɪᴛ ʜᴀs ɴᴏ ᴘʟᴀᴄᴇ ʜᴇʀᴇ.",
  "ᴅᴏᴇs ᴛʜɪs ɢʀᴏᴜᴘ ʜᴀs ʏᴏᴜʀ ᴅᴀᴅ ɴᴀᴍᴇ ɪɴ ɪᴛ ᴏʀ ᴅᴏ ᴡᴇ ʟᴏᴏᴋ ʟɪᴋᴇ ʏᴏᴜʀ ᴅᴀᴅ? ᴡʜʏ ɴᴏᴛ ɢᴏ ʙᴇɢ ʜɪᴍ? ʏᴏᴜ'ʀᴇ ᴊᴜsᴛ ᴀ sᴛᴜᴘɪᴅ ᴏʀᴘʜᴀɴ."
];

const ANTIBOT_WARN = [
  "ᴜɴᴀᴜᴛʜᴏʀɪᴢᴇᴅ ʙᴏᴛ ᴅᴇᴛᴇᴄᴛᴇᴅ. ᴏɴʟʏ ᴍᴇ ᴏᴘᴇʀᴀᴛᴇs ʜᴇʀᴇ. ʀᴇᴍᴏᴠᴇ ʏᴏᴜʀs ᴏʀ ɢᴇᴛ ʀᴇᴍᴏᴠᴇᴅ.",
  "ᴡʜᴀᴛ? ᴜsɪɴɢ ᴀ ᴡᴇᴀᴋ ʙᴏᴛ ᴛʜᴀᴛ ᴀɪɴ'ᴛ ᴍᴇ ɪs ᴅɪsʀᴇsᴘᴇᴄᴛғᴜʟ ᴀɴᴅ ʏᴏᴜ'ʀᴇ ᴠᴇʀʏ sᴛᴜᴘɪᴅ ғᴏʀ ᴛʜᴀᴛ, ɪ ʙʟᴀᴍᴇ ʏᴏᴜʀ ᴅᴀᴅ ғᴏʀ ᴛʜɪs ʀᴜʙʙɪsʜ.",
  "ɴᴏ ᴜɴᴀᴜᴛʜᴏʀɪᴢᴇᴅ ʙᴏᴛs. ɴᴏ ᴇxᴄᴇᴘᴛɪᴏɴs. ʀᴇᴍᴏᴠᴇ ɪᴛ ɴᴏᴡ ᴏʀ ᴡᴇ ᴡɪʟʟ."
];

const ANTIBOT_KICK = [
  "ɪ ʀᴇᴍᴇᴍʙᴇʀ ᴛᴇʟʟɪɴɢ ᴛʜɪs ғᴏᴏʟ ᴛʜᴀᴛ ɪ'ᴍ ᴛʜᴇ ᴏɴʟʏ ʙᴏᴛ ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ.",
  "ᴜɴᴀᴜᴛʜᴏʀɪᴢᴇᴅ ʙᴏᴛ ᴋɪᴄᴋᴇᴅ. ɴᴏ ᴡᴀʀɴɪɴɢs ʟᴇғᴛ.",
  "ᴏʜʜʜ, ʏᴏᴜʀ ᴅᴜᴍʙ ʙᴏᴛ.",
  "ᴋɪᴄᴋᴇᴅ. ɴᴏ ᴅɪsᴄᴜssɪᴏɴ."
];

const ANTIFORWARD_WARN = [
  "Fᴏʀᴡᴀʀᴅᴇᴅ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ, ʏᴏᴜ ᴘᴀᴛʜᴇᴛɪᴄ ғᴏʀᴡᴀʀᴅɪɴɢ ᴄʟᴏᴡɴ! Yᴏᴜ ᴛʜɪɴᴋ ᴡᴇ ᴡᴀɴᴛ ʏᴏᴜʀ ʀᴇᴄʏᴄʟᴇᴅ ɢᴀʀʙᴀɢᴇ ɪɴ ʜᴇʀᴇ? Sʜᴏᴠᴇ ɪᴛ ʙᴀᴄᴋ ɪɴᴛᴏ ʏᴏᴜʀ sᴛᴀʀᴛᴇᴅ ᴄʜᴀɪɴ ᴀɴᴅ ᴅɪsᴀᴘᴘᴇᴀʀ, ʙɪᴛᴄʜ!",
  "Sᴛᴏᴘ ғᴏʀᴡᴀʀᴅɪɴɢ, ʏᴏᴜ ʟᴀᴢʏ ғᴜᴄᴋɪɴɢ ᴘᴀʀᴀsɪᴛᴇ! Can't even type your own damn thoughts? Keep recycling that stale garbage somewhere else before I report your worthless ass and get you banned for life, you brain-dead copy machine.",
  "ᴡᴇ ᴅɪᴅɴ'ᴛ ᴀsᴋ ғᴏʀ ᴛʜᴀᴛ ғᴏʀᴡᴀʀᴅᴇᴅ ᴛʀᴀsʜ. ʏᴏᴜʀ ᴘᴀʀᴇɴᴛs ᴅɪᴅɴ'ᴛ ᴀsᴋ ғᴏʀ ʏᴏᴜ ᴇɪᴛʜᴇʀ, ᴡᴀsᴛᴇᴅ sᴘᴇʀᴍ"
];

const ANTIFORWARD_KICK = [
  "ᴅɪᴅ ᴀɴʏᴏɴᴇ ᴀsᴋ ғᴏʀ ᴛʜɪs? ɴᴏ. ɢᴇᴛ ᴏᴜᴛ",
  "ʏᴏᴜʀ ᴘᴀʀᴇɴᴛs ᴍᴜsᴛ ʜᴀᴠᴇ ʀᴇɢʀᴇᴛᴛᴇᴅ ɴᴏᴛ ᴀʙᴏʀᴛɪɴɢ ʏᴏᴜ",
  "ɴᴏ ᴏɴᴇ ᴀsᴋᴇᴅ ғᴏʀ ʏᴏᴜʀ ᴜsᴇʟᴇss ғᴏʀᴡᴀʀᴅs"
];

const ANTICAPS_DELETE = [
  "ᴏʜ ʏᴏᴜ'ʀᴇ ᴛʏᴘɪɴɢ ɪɴ ᴄᴀᴘs? ᴄᴜᴛᴇ. ᴅᴇʟᴇᴛᴇᴅ.",
  "ʏᴏᴜ'ʀᴇ ɴᴏᴛ ᴛʜᴀᴛ ɪᴍᴘᴏʀᴛᴀɴᴛ. ʟᴏᴡᴇʀᴄᴀsᴇ ᴇxɪsᴛs ғᴏʀ ᴀ ʀᴇᴀsᴏɴ.",
  "ʀᴇʟᴀx. ɴᴏʙᴏᴅʏ ᴄᴀʀᴇs ᴇɴᴏᴜɢʜ ᴛᴏ ʀᴇᴀᴅ ᴄᴀᴘs. ᴅᴇʟᴇᴛᴇᴅ."
];

const ANTIEMOJI_DELETE = [
  "ᴡᴇ ᴜsᴇ ᴡᴏʀᴅs ʜᴇʀᴇ. ᴅᴇʟᴇᴛᴇᴅ.",
  "ᴇᴍᴏᴊɪ-ᴏɴʟʏ? ʀᴇᴀʟʟʏ? ᴅᴇʟᴇᴛᴇᴅ.",
  "ᴛʜɪs ɪsɴ'ᴛ ᴀ ᴋɪɴᴅᴇʀɢᴀʀᴛᴇɴ ᴄʜᴀᴛ. ᴜsᴇ ʏᴏᴜʀ ᴡᴏʀᴅs.",
  "ɴᴏʙᴏᴅʏ ᴀsᴋᴇᴅ ғᴏʀ ʏᴏᴜʀ ᴇᴍᴏᴊɪ. ɢᴏɴᴇ.",
  "sᴀʏ sᴏᴍᴇᴛʜɪɴɢ ᴏʀ sᴀʏ ɴᴏᴛʜɪɴɢ. ᴇᴍᴏᴊɪs ᴀʀᴇɴ'ᴛ ɪᴛ. ᴅᴇʟᴇᴛᴇᴅ.",
  "ʏᴏᴜ ʜᴀᴠᴇ ᴀ ᴋᴇʏʙᴏᴀʀᴅ. ᴜsᴇ ɪᴛ ᴘʀᴏᴘᴇʀʟʏ."
];

const ANTISWEAR_WARN = [
  "Sᴡᴇᴀʀ ᴡᴏʀᴅs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ, ʏᴏᴜ ᴍɪsᴇʀᴀʙʟᴇ ʜᴏʟɪᴇʀ-ᴛʜᴀɴ-ᴛʜᴏᴜ ғᴜᴄᴋ!",
  "Wᴀᴛᴄʜ ʏᴏᴜʀ ᴍᴏᴜᴛʜ, ʏᴏᴜ ғᴜᴄᴋɪɴɢ ʜʏᴘᴏᴄʀɪᴛᴇ!",
  "Kᴇᴇᴘ ɪᴛ ᴄʟᴇᴀɴ, ʏᴏᴜ ᴇɴᴛɪᴛʟᴇᴅ ᴘɪᴇᴄᴇ ᴏғ sʜɪᴛ!!"
];

const ANTISWEAR_KICK = [
  "ʏᴏᴜʀ ᴠᴏᴄᴀʙᴜʟᴀʀʏ ɪs ᴀs ᴡᴇᴀᴋ ᴀs ʏᴏᴜʀ ᴅᴀᴅ's ᴘᴜʟʟᴏᴜᴛ ɢᴀᴍᴇ",
  "ʏᴏᴜʀ ᴍᴏᴍ ᴍᴜsᴛ ʀᴇɢʀᴇᴛ ɴᴏᴛ ᴛᴇᴀᴄʜɪɴɢ ʏᴏᴜ ʀᴇsᴘᴇᴄᴛ",
  "ʟᴇᴀʀɴ sᴏᴍᴇ ᴍᴀɴɴᴇʀs ʏᴏᴜ ᴜɴᴛʀᴀɪɴᴇᴅ ᴅᴏɢ"
];

const ANTISTATUS_WARN = [
  "ᴍᴇɴᴛɪᴏɴɪɴɢ ᴛʜɪs ɢʀᴏᴜᴘ ᴛᴏ ʏᴏᴜʀ sᴛᴀᴛᴜs? ᴜɴᴛʀᴀɪɴᴇᴅ ᴅᴏɢ ᴡʜᴀᴛ ᴀ ᴡᴀsᴛᴇ ɪғ ʏᴏᴜ ᴡᴇʀᴇ ᴍʏ ᴄʜɪʟᴅ ɪ ᴡᴏᴜʟᴅ ʜᴀᴠᴇ ʀᴇɢʀᴇᴛ ɢɪᴠᴇɴ ʙɪʀᴛʜ ᴛᴏ ᴀ ᴍᴏʀᴏɴ ʟɪᴋᴇ ʏᴏᴜ.",
  "ᴡᴇ ᴅᴏɴ'ᴛ ᴡᴀɴᴛ ᴛᴏ sᴇᴇ ʏᴏᴜʀ ʟᴀᴍᴇ sᴛᴀᴛᴜs sᴏ sᴛᴏᴘ ᴍᴇɴᴛɪᴏɴɪɴɢ ᴛʜɪs ɢʀᴏᴜᴘ ᴛᴏ ɪᴛ ғᴏᴏʟ.",
  "ʏᴏᴜ'ʀᴇ ᴠᴇʀʏ sᴛᴜᴘɪᴅ ғᴏʀ ᴍᴇɴᴛɪᴏɴɪɴɢ ᴛʜɪs ɢʀᴏᴜᴘ ᴛᴏ ʏᴏᴜʀ sᴛᴀᴛᴜs, ᴀʟʟ ʏᴏᴜ ᴅᴏ ɪs ᴡᴀsᴛᴇ ᴏxʏɢᴇɴ."
];
const ANTISTATUS_KICK = [
  "ᴡᴀʀɴᴇᴅ ʏᴏᴜ. ᴋɪᴄᴋᴇᴅ.",
  "sᴛᴀᴛᴜs ᴍᴇɴᴛɪᴏɴs ᴀғᴛᴇʀ ᴀ ᴡᴀʀɴɪɴɢ? ɢᴏɴᴇ.",
  "ʏᴏᴜ ʜᴀᴅ ʏᴏᴜʀ ᴄʜᴀɴᴄᴇ. ʀᴇᴍᴏᴠᴇᴅ.",
  "ᴋᴇᴘᴛ ᴘᴜsʜɪɴɢ. ɢᴏᴛ ᴋɪᴄᴋᴇᴅ. sɪᴍᴘʟᴇ."
];

const ANTITAGALL_WARN = [
  "ʏᴏᴜ sᴛᴜᴘɪᴅ ғᴜᴄᴋɪɴɢ ɪᴅɪᴏᴛ ᴡʜᴏ ᴛᴏʟᴅ ʏᴏᴜ ᴛᴏ ᴛᴀɢ ᴇᴠᴇʀʏᴏɴᴇ? ɴᴏʙᴏᴅʏ ᴡᴀɴᴛs ʏᴏᴜʀ ᴜsᴇʟᴇss ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴ sᴘᴀᴍ ʏᴏᴜ ᴀᴛᴛᴇɴᴛɪᴏɴ-sᴇᴇᴋɪɴɢ ᴄʟᴏᴡɴ.",
  "ᴛᴀɢɢɪɴɢ ᴇᴠᴇʀʏᴏɴᴇ ʟɪᴋᴇ ʏᴏᴜʀ ᴍᴇssᴀɢᴇ ᴀᴄᴛᴜᴀʟʟʏ ᴍᴀᴛᴛᴇʀs? ɪᴛ ᴅᴏᴇsɴ'ᴛ. ʏᴏᴜ ᴅᴏɴ'ᴛ. ᴅᴇʟᴇᴛᴇᴅ ʏᴏᴜ ᴀᴛᴛᴇɴᴛɪᴏɴ-ʜᴜɴɢʀʏ ᴘɪᴇᴄᴇ ᴏғ sʜɪᴛ.",
  "ᴏʜ ʏᴏᴜ ᴛʜᴏᴜɢʜᴛ ᴛᴀɢɢɪɴɢ ᴇᴠᴇʀʏᴏɴᴇ ᴡᴀs sᴍᴀʀᴛ? ʏᴏᴜʀ ᴇɴᴛɪʀᴇ ᴇxɪsᴛᴇɴᴄᴇ ɪs ᴀ ᴍɪsᴛᴀᴋᴇ. ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ ʏᴏᴜ ᴡᴀsᴛᴇ ᴏғ ᴀɪʀ.",
  "ɴᴏʙᴏᴅʏ ᴀsᴋᴇᴅ ғᴏʀ ʏᴏᴜʀ @ᴇᴠᴇʀʏᴏɴᴇ sᴘᴀᴍ ʏᴏᴜ ʙʀᴀɪɴ-ᴅᴇᴀᴅ ᴍᴏʀᴏɴ. ᴛʜɪɴᴋ ʙᴇғᴏʀᴇ ʏᴏᴜ ᴛᴀɢ ᴏʀ ʙᴇᴛᴛᴇʀ ʏᴇᴛ ᴅᴏɴ'ᴛ ᴛʜɪɴᴋ ᴊᴜsᴛ sʜᴜᴛ ᴛʜᴇ ғᴜᴄᴋ ᴜᴘ.",
  "ᴡᴏᴡ ʏᴏᴜ ᴅɪsᴄᴏᴠᴇʀᴇᴅ ᴛʜᴇ @ᴀʟʟ ʙᴜᴛᴛᴏɴ, ᴄᴏɴɢʀᴀᴛᴜʟᴀᴛɪᴏɴs ʏᴏᴜ ᴀʙsᴏʟᴜᴛᴇ ᴅɪᴍᴡɪᴛ. ᴅᴇʟᴇᴛᴇᴅ ʙᴇᴄᴀᴜsᴇ ɴᴏʙᴏᴅʏ ᴡᴀɴᴛs ʏᴏᴜʀ ᴜsᴇʟᴇss ᴘɪɴɢ."
];

const ANTITAGALL_KICK = [
  "ᴛᴀɢɢᴇᴅ ᴇᴠᴇʀʏᴏɴᴇ ᴏɴᴇ ᴛᴏᴏ ᴍᴀɴʏ ᴛɪᴍᴇs. ʀᴇᴍᴏᴠᴇᴅ.",
  "ɴᴏʙᴏᴅʏ ᴡᴀɴᴛᴇᴅ ᴛʜᴀᴛ ᴛᴀɢ. ɢᴏɴᴇ.",
  "ᴡᴀʀɴᴇᴅ ᴀɴᴅ sᴛɪʟʟ ᴅɪᴅ ɪᴛ. ᴋɪᴄᴋᴇᴅ.",
  "ᴛʜɪs ɪsɴ'ᴛ ᴀ ʙʀᴏᴀᴅᴄᴀsᴛ ᴄʜᴀɴɴᴇʟ. ʀᴇᴍᴏᴠᴇᴅ."
];

const ANTIAZA_WARN = [
  "ᴀᴄᴄᴏᴜɴᴛ ɴᴜᴍʙᴇʀs ᴀʀᴇɴ'ᴛ ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ. ᴅᴇʟᴇᴛᴇᴅ.",
  "ᴡʜʏ ᴀʀᴇ ʏᴏᴜ sᴇɴᴅɪɴɢ ᴀᴄᴄᴏᴜɴᴛ ɴᴜᴍʙᴇʀ ʜᴇʀᴇ sᴏ ᴡᴇ ᴄᴀɴ sᴇɴᴅ ʏᴏᴜ ᴍᴏɴᴇʏ? ᴡʜʏ ɴᴏᴛ ᴡᴏʀᴋ ʏᴏᴜ sᴛᴜᴘɪᴅ ғᴜᴄᴋ, ʟᴀᴢʏ ʙᴀsᴛᴀʀᴅ.",
  "ʏᴏᴜ ᴅᴀᴍɴ ғᴏᴏʟ ᴀᴛ ɪᴛ ᴀɢᴀɪɴ ɢᴏɪɴɢ ᴀʀᴏᴜɴᴅ sᴇɴᴅɪɴɢ ʏᴏᴜʀ ᴀᴄᴄᴏᴜɴᴛ ɴᴜᴍʙᴇʀ sᴏ ᴡᴇ ᴅᴏɴᴀᴛᴇ ғᴏʀ ʏᴏᴜʀ ᴘᴏᴏʀ ғᴀᴛʜᴇʀ ʟᴀᴢʏ ғᴏᴏʟs.",
  "ᴛʜɪs ɪsɴ'ᴛ ᴀ ᴘᴀʏᴍᴇɴᴛ ɢʀᴏᴜᴘ. ᴋᴇᴇᴘ ᴀᴢᴀ ᴏᴜᴛ. ᴡᴀʀɴɪɴɢ ɪssᴜᴇᴅ."
];

const ANTIAZA_KICK = [
  "sᴛɪʟʟ ᴘᴏsᴛɪɴɢ ᴀᴄᴄᴏᴜɴᴛ ɴᴜᴍʙᴇʀs ᴀғᴛᴇʀ ᴀ ᴡᴀʀɴɪɴɢ. ʀᴇᴍᴏᴠᴇᴅ.",
  "ᴀᴢᴀ sᴘᴀᴍᴍᴇʀ ᴋɪᴄᴋᴇᴅ. ᴅᴏɴ'ᴛ ᴄᴏᴍᴇ ʙᴀᴄᴋ ᴡɪᴛʜ ᴛʜᴇ sᴀᴍᴇ ɴᴏɴsᴇɴsᴇ.",
  "ᴡᴀʀɴᴇᴅ ʏᴏᴜ. ʏᴏᴜ ɪɢɴᴏʀᴇᴅ ɪᴛ. ɢᴏɴᴇ.",
];

const ANTIPROMOTE_REPLIES = [
  "ʏᴏᴜ ᴅᴜᴍʙ ᴀss ᴛʜɪɴᴋ ʏᴏᴜ ᴄᴀɴ ᴊᴜsᴛ ᴘʀᴏᴍᴏᴛᴇ ᴡʜᴏᴇᴠᴇʀ ᴛʜᴇ ғᴜᴄᴋ ʏᴏᴜ ᴡᴀɴᴛ? ɴᴏᴛ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ ʏᴏᴜ ʙʀᴀɪɴ-ᴅᴇᴀᴅ ᴄʟᴏᴡɴ.",
  "ᴡʜᴏ ᴛʜᴇ ғᴜᴄᴋ ᴛᴏʟᴅ ʏᴏᴜ ᴛʜᴀᴛ ᴡᴀs ᴀʟʟᴏᴡᴇᴅ? ʀᴇᴠᴇʀsᴇᴅ ʏᴏᴜʀ sᴛᴜᴘɪᴅ ᴀss ᴅᴇᴄɪsɪᴏɴ ʙᴇᴄᴀᴜsᴇ ʏᴏᴜ ᴄʟᴇᴀʀʟʏ ᴄᴀɴ'ᴛ ʙᴇ ᴛʀᴜsᴛᴇᴅ.",
  "ᴘʀᴏᴍᴏᴛɪɴɢ ᴘᴇᴏᴘʟᴇ ʟɪᴋᴇ ɪᴛ's ʏᴏᴜʀ ɢʀᴏᴜᴘ? ʏᴏᴜ ᴡɪsʜ, ʏᴏᴜ ᴇɴᴛɪᴛʟᴇᴅ ᴘɪᴇᴄᴇ ᴏғ sʜɪᴛ. ᴜɴᴅᴏɴᴇ."
];

const ANTIDEMOTE_REPLIES = [
  "ʏᴏᴜ sɴᴀᴋᴇ ᴀss ᴛʀʏɪɴɢ ᴛᴏ ᴅᴇᴍᴏᴛᴇ ᴘᴇᴏᴘʟᴇ ʟɪᴋᴇ ᴀ ᴘᴏᴡᴇʀ-ʜᴜɴɢʀʏ ɪᴅɪᴏᴛ? ɴᴏᴛ ᴏɴ ᴍʏ ᴡᴀᴛᴄʜ, ʀᴇᴠᴇʀsᴇᴅ.",
  "ᴡʜᴏ ᴛʜᴇ ғᴜᴄᴋ ᴅᴏ ʏᴏᴜ ᴛʜɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴅᴇᴍᴏᴛɪɴɢ ᴘᴇᴏᴘʟᴇ? ᴘᴜᴛ ᴛʜᴇᴍ ʙᴀᴄᴋ ᴡʜᴇʀᴇ ᴛʜᴇʏ ʙᴇʟᴏɴɢ ʏᴏᴜ ᴘᴏᴡᴇʀ-ᴛʀɪᴘᴘɪɴɢ ᴄʟᴏᴡɴ.",
  "ᴅᴇᴍᴏᴛɪɴɢ ᴘᴇᴏᴘʟᴇ ʟɪᴋᴇ ᴀ ᴄᴏᴡᴀʀᴅ ᴇʜ? ɴᴀʜ ɪ ᴅᴏɴ'ᴛ ᴛʜɪɴᴋ sᴏ. ᴜɴᴅᴏɴᴇ ʏᴏᴜ sɴᴀᴋᴇ."
];

const ANTINSFW_WARN = [
  "ᴡʜᴀᴛ ᴛʜᴇ ғᴜᴄᴋ ɪs ᴛʜᴀᴛ?! ᴋᴇᴇᴘ ʏᴏᴜʀ ᴅɪsɢᴜsᴛɪɴɢ ᴘᴏʀɴ ᴛᴏ ʏᴏᴜʀsᴇʟғ, ʏᴏᴜ ᴅɪʀᴛʏ ᴅᴇɢᴇɴᴇʀᴀᴛᴇ. ᴅᴇʟᴇᴛᴇᴅ.",
  "ɴᴏʙᴏᴅʏ ᴀsᴋᴇᴅ ᴛᴏ sᴇᴇ ʏᴏᴜʀ ᴅɪʀᴛʏ ɴsғᴡ sʜɪᴛ ɪɴ ʜᴇʀᴇ, ʏᴏᴜ sɪᴄᴋ ᴅᴇɢᴇɴᴇʀᴀᴛᴇ. ᴅᴇʟᴇᴛᴇᴅ ᴀɴᴅ ᴡᴀʀɴᴇᴅ.",
  "ᴡᴏᴡ, sᴇɴᴅɪɴɢ ɴsғᴡ ɢᴀʀʙᴀɢᴇ? ᴡʜᴀᴛ's ɴᴇxᴛ, ʏᴏᴜ ɢᴏɴɴᴀ sᴇɴᴅ ʏᴏᴜʀ ᴍᴏᴍ's ɴᴜᴅᴇs ᴛᴏᴏ? ᴋᴇᴇᴘ ᴛʜᴀᴛ ᴅɪsɢᴜsᴛɪɴɢ ᴄʀᴀᴘ ᴏᴜᴛ ᴏғ ʜᴇʀᴇ.",
  "ᴅɪᴅ ʏᴏᴜʀ ᴅᴀᴅ ᴛᴇᴀᴄʜ ʏᴏᴜ ᴛᴏ sᴇɴᴅ ᴘᴏʀɴ ɪɴ ɢʀᴏᴜᴘ ᴄʜᴀᴛs? ᴅᴇʟᴇᴛᴇᴅ ʏᴏᴜ ᴅɪsɢᴜsᴛɪɴɢ ᴘɪᴇᴄᴇ ᴏғ ᴛʀᴀsʜ."
];

const ANTINSFW_KICK = [
  "ᴋᴇᴘᴛ sᴇɴᴅɪɴɢ ɴsғᴡ ᴄᴏɴᴛᴇɴᴛ ᴀғᴛᴇʀ ᴍᴜʟᴛɪᴘʟᴇ ᴡᴀʀɴɪɴɢs. ʀᴇᴍᴏᴠᴇᴅ, ʏᴏᴜ ʜᴏʀɴʏ ɪᴅɪᴏᴛ.",
  "ᴛʜɪʀᴅ sᴛʀɪᴋᴇ — ʏᴏᴜʀ ᴅɪʀᴛʏ ᴀss ɪs ᴏᴜᴛ. ɢᴏ ᴡᴀᴛᴄʜ ᴘᴏʀɴ ᴀʟᴏɴᴇ ɪɴ ʏᴏᴜʀ ʙᴀsᴇᴍᴇɴᴛ.",
  "ᴋɪᴄᴋᴇᴅ ғᴏʀ sᴇɴᴅɪɴɢ ɴsғᴡ ᴄᴏɴᴛᴇɴᴛ. ᴀ ᴄᴏɴᴅᴏᴍ ᴡᴏᴜʟᴅ'ᴠᴇ ᴀᴠᴏɪᴅᴇᴅ ʙʀᴇᴇᴅɪɴɢ sᴏᴍᴇᴏɴᴇ ᴛʜɪs sᴛᴜᴘɪᴅ."
];

// NSFW domain list
const NSFW_DOMAIN_REGEX = /(pornhub|xvideos|xnxx|xhamster|redtube|youporn|rule34|nhentai|hentai2read|hentaifox|hanime|e-hentai|gelbooru|danbooru|onlyfans|fapello|eporner|spankbang|motherless|chaturbate|livejasmin|cam4|bongacams|stripchat|sexvid|tube8|xtube|drtuber|beeg|porntrex|porndig|fux)/i;

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const act = async (sock, msg, chatId, senderJid, feature, warnPool, kickPool, mode) => {

  try {
    await sock.sendMessage(chatId, { delete: msg.key });
  } catch { /* silent — bot may not be admin */ }

  const num = senderJid.split('@')[0];

  //delete mode
  if (mode === 'delete') {
    await sock.sendMessage(
      chatId,
      { text: `@${num} ${rand(warnPool)}`, mentions: [senderJid] },
      { quoted: msg }
    );
    return true;
  }

  //kick mode
  if (mode === 'kick') {
    await sock.sendMessage(
      chatId,
      { text: `@${num} ${rand(kickPool)}`, mentions: [senderJid] },
      { quoted: msg }
    );
    try {
      await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove');
    } catch (err) {
      console.error(chalk.red(`[ANTI] kick failed:`), err.message);
    }
    return true;
  }

  // ── warn mode
  if (mode === 'warn') {
    const count = db.addWarning(chatId, senderJid, feature);

    if (count >= 3) {
      await sock.sendMessage(
        chatId,
        { text: `@${num} ${rand(kickPool)}`, mentions: [senderJid] },
        { quoted: msg }
      );
      try {
        await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove');
      } catch (err) {
        console.error(chalk.red(`[ANTI] kick failed:`), err.message);
      }
      db.clearWarnings(chatId, senderJid, feature);
    } else {
      await sock.sendMessage(
        chatId,
        {
          text: `@${num} ${rand(warnPool)} — warning ${count}/3`,
          mentions: [senderJid]
        },
        { quoted: msg }
      );
    }
    return true;
  }

  return false;
};

//text extractor
const getText = (msg) =>
  msg.message?.conversation ||
  msg.message?.extendedTextMessage?.text ||
  msg.message?.imageMessage?.caption ||
  msg.message?.videoMessage?.caption || '';

//antilink
const LINK_REGEX = /https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+|wa\.me\/[^\s]+/i;

const handleAntiLink = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antilink');
  if (!mode) return false;
  if (!LINK_REGEX.test(getText(msg))) return false;
  console.log(chalk.yellow(`[ANTILINK] ${mode} — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antilink', ANTILINK_WARN, ANTILINK_KICK, mode);
};

//antispam
const handleAntiSpam = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antispam');
  if (!mode) return false;
  if (!trackSpam(chatId, senderJid)) return false;
  console.log(chalk.yellow(`[ANTISPAM] ${mode} — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antispam', ANTISPAM_WARN, ANTISPAM_KICK, mode);
};

//antispam 2
const handleAntiSpam2 = async (sock, msg, chatId, senderJid) => {
  const data = loadAntispam2();
  const cfg  = data[chatId];
  if (!cfg?.enabled) return false;

  const msgText = getText(msg);
  if (!msgText) return false;

  if (!trackSameMessage(chatId, senderJid, msgText)) return false;

  console.log(chalk.yellow(`[ANTISPAM2] repeat-message — ${senderJid.split('@')[0]}`));
  const mode = cfg.action === 'kick' ? 'warn' : 'warn'; // always warn→kick for repeat spam
  return act(sock, msg, chatId, senderJid, 'antispam2', ANTISPAM2_WARN, ANTISPAM2_KICK, mode);
};

//antibot
const handleAntiBot = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antibot');
  if (!mode) return false;

  const botJid = (sock.authState?.creds?.me?.id || '').replace(/:\d+@/, '@');
  if (senderJid === botJid) return false;

  const message      = msg.message || {};
  const isLikelyBot  =
    !!message.buttonsMessage      ||
    !!message.listMessage         ||
    !!message.templateMessage     ||
    !!message.interactiveMessage  ||
    /:\d+@s\.whatsapp\.net$/.test(senderJid);

  if (!isLikelyBot) return false;
  console.log(chalk.yellow(`[ANTIBOT] ${mode} — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antibot', ANTIBOT_WARN, ANTIBOT_KICK, mode);
};

//anticaps
const handleAntiCaps = async (sock, msg, chatId, senderJid) => {
  if (!global.antiCaps || !global.antiCaps[chatId]) return false;
  const text = getText(msg);
  if (!text || text.length < 2) return false;

  const words   = text.split(/\s+/);
  const hasCapsWord = words.some(w => {
    const letters = w.replace(/[^a-zA-Z]/g, '');
    return letters.length >= 2 && letters === letters.toUpperCase();
  });

  if (!hasCapsWord) {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (!letters) return false;
    const upCount = (letters.match(/[A-Z]/g) || []).length;
    if (upCount / letters.length < 0.7) return false;
  }

  console.log(chalk.yellow(`[ANTICAPS] delete — ${senderJid.split('@')[0]}`));
  try { await sock.sendMessage(chatId, { delete: msg.key }); } catch { /* silent */ }
  const num = senderJid.split('@')[0];
  await sock.sendMessage(chatId,
    { text: `@${num} ${rand(ANTICAPS_DELETE)}`, mentions: [senderJid] },
    { quoted: msg }
  );
  return true;
};

//antiemoji 
const EMOJI_ONLY_RE = /^[\s\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\udfff\ud83d\ud000-\udfff\ud83e\ud000-\udfff]+$/u;

const handleAntiEmoji = async (sock, msg, chatId, senderJid) => {
  if (!global.antiEmoji || !global.antiEmoji[chatId]) return false;
  const text = getText(msg);
  if (!text || text.trim().length < 1) return false;
  
  const stripped = text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
    .replace(/\u200d/g, '')
    .replace(/\s+/g, '')
    .trim();

  if (stripped.length > 0) return false;
  if (text.trim().length === 0) return false;

  console.log(chalk.yellow(`[ANTIEMOJI] delete — ${senderJid.split('@')[0]}`));
  try { await sock.sendMessage(chatId, { delete: msg.key }); } catch { /* silent */ }
  const num = senderJid.split('@')[0];
  await sock.sendMessage(chatId,
    { text: `@${num} ${rand(ANTIEMOJI_DELETE)}`, mentions: [senderJid] },
    { quoted: msg }
  );
  return true;
};

//antiforward 
const handleAntiForward = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antiforward');
  if (!mode) return false;

  const isForwarded = Object.values(msg.message || {}).some(m =>
    m?.contextInfo?.isForwarded === true || (m?.contextInfo?.forwardingScore || 0) > 0
  );
  if (!isForwarded) return false;

  console.log(chalk.yellow(`[ANTIFORWARD] ${mode} — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antiforward', ANTIFORWARD_WARN, ANTIFORWARD_KICK, mode);
};

//antiswear 
const SWEAR_REGEX = /\b(fuck|shit|bitch|ass|bastard|cunt|dick|pussy|nigga|nigger|whore|slut|motherfucker|fag|retard)\b/i;

const handleAntiSwear = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antiswear');
  if (!mode) return false;
  if (!SWEAR_REGEX.test(getText(msg))) return false;
  console.log(chalk.yellow(`[ANTISWEAR] ${mode} — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antiswear', ANTISWEAR_WARN, ANTISWEAR_KICK, mode);
};

//antistatusmention 
const handleAntiStatusMention = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antistatusmention');
  if (!mode) return false;

  const message = msg.message || {};
  const ctx =
    message.extendedTextMessage?.contextInfo ||
    message.imageMessage?.contextInfo        ||
    message.videoMessage?.contextInfo        ||
    message.stickerMessage?.contextInfo      ||
    message.audioMessage?.contextInfo        ||
    null;

  const isStatusMention =
    !!message.statusMentionMessage                          ||
    !!message.groupStatusMentionMessage                     ||
    (ctx?.mentionedJid || []).includes('status@broadcast') ||
    ctx?.participant === 'status@broadcast'                 ||
    ctx?.remoteJid   === 'status@broadcast';

  if (!isStatusMention) return false;

  console.log(chalk.yellow(`[ANTISTATUS] ${mode} — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antistatusmention', ANTISTATUS_WARN, ANTISTATUS_KICK, mode);
};

//antitagall
const handleAntiTagAll = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antitagall');
  if (!mode) return false;

  const text      = getText(msg);
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (!text.includes('@all') && mentioned.length < 5) return false;
  const isAdmin = await checkSenderAdmin(sock, chatId, senderJid).catch(() => false);
  if (isAdmin) return false;

  console.log(chalk.yellow(`[ANTITAGALL] ${mode} — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antitagall', ANTITAGALL_WARN, ANTITAGALL_KICK, mode);
};

//antiaza
const ACCOUNT_REGEX = /\b\d{7,10}\b/;

const handleAntiAza = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antiaza');
  if (!mode) return false;
  const text = getText(msg);
  if (!text || !ACCOUNT_REGEX.test(text)) return false;
  console.log(chalk.yellow(`[ANTIAZA] ${mode} — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antiaza', ANTIAZA_WARN, ANTIAZA_KICK, mode);
};

//antibadword
const ANTIBADWORD_WARN = [
  `𝒘𝒂𝒕𝒄𝒉 𝒚𝒐𝒖𝒓 𝒍𝒂𝒏𝒈𝒖𝒂𝒈𝒆 𝒊𝒏 𝒉𝒆𝒓𝒆`,
  `𝒕𝒉𝒂𝒕 𝒘𝒐𝒓𝒅 𝒊𝒔𝒏'𝒕 𝒂𝒍𝒍𝒐𝒘𝒆𝒅, 𝒅𝒆𝒍𝒆𝒕𝒆𝒅`
];
const ANTIBADWORD_KICK = [
  `𝒌𝒆𝒑𝒕 𝒖𝒔𝒊𝒏𝒈 𝒃𝒂𝒏𝒏𝒆𝒅 𝒘𝒐𝒓𝒅𝒔, 𝒓𝒆𝒎𝒐𝒗𝒆𝒅`,
  `𝒘𝒐𝒓𝒅𝒔 𝒉𝒂𝒗𝒆 𝒄𝒐𝒏𝒔𝒆𝒒𝒖𝒆𝒏𝒄𝒆𝒔, 𝒌𝒊𝒄𝒌𝒆𝒅`
];

const handleAntiBadWord = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antibadword');
  if (!mode) return false;

  const badWords = db.getBadWords(chatId);
  if (!badWords.length) return false;

  const text = getText(msg).toLowerCase();
  if (!text) return false;

  const found = badWords.find(w => text.includes(w));
  if (!found) return false;

  console.log(chalk.yellow(`[ANTIBADWORD] "${found}" — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antibadword', ANTIBADWORD_WARN, ANTIBADWORD_KICK, mode);
};

//antibeg
const handleAntiBeg = async (sock, msg, chatId, senderJid) => {
  const data = loadAntibeg();
  if (!data[chatId]?.enabled) return false;

  const text = getText(msg).toLowerCase();
  if (!text) return false;

  const hasBankNumber = BANK_ACCOUNT_REGEX.test(text);
  const hasBegKeyword = BEG_KEYWORDS.some(kw => text.includes(kw));

  if (!hasBankNumber && !hasBegKeyword) return false;

  console.log(chalk.yellow(`[ANTIBEG] triggered (bank=${hasBankNumber}, beg=${hasBegKeyword}) — ${senderJid.split('@')[0]}`));

  try {
    await sock.sendMessage(chatId, { delete: msg.key });
  } catch { /* silent */ }

  const num = senderJid.split('@')[0];
  await sock.sendMessage(
    chatId,
    { text: `@${num} ${rand(ANTIBEG_WARN)}`, mentions: [senderJid] },
    { quoted: msg }
  );
  return true;
};


//antinsfw 
const handleAntiNSFW = async (sock, msg, chatId, senderJid) => {
  const mode = db.getAnti(chatId, 'antinsfw');
  if (!mode) return false;

  const message = msg.message || {};
  const msgType = Object.keys(message)[0];

  if (msgType === 'conversation' || msgType === 'extendedTextMessage') {
    const text = getText(msg);
    if (text && NSFW_DOMAIN_REGEX.test(text)) {
      console.log(chalk.yellow());
      return act(sock, msg, chatId, senderJid, 'antinsfw', ANTINSFW_WARN, ANTINSFW_KICK, 'warn');
    }
    return false;
  }

  const isImage   = msgType === 'imageMessage';
  const isVideo   = msgType === 'videoMessage';
  const isSticker = msgType === 'stickerMessage';

  if (!isImage && !isVideo && !isSticker) return false;

  if (!_groqReady) return false;

  try {
    const mediaMsg  = message[msgType];
    const mediaType = isImage ? 'image' : isVideo ? 'video' : 'sticker';

    if (isVideo) {
      const thumb = mediaMsg?.jpegThumbnail;
      if (!thumb || thumb.length === 0) return false;
      const thumbBuf = Buffer.isBuffer(thumb) ? thumb : Buffer.from(thumb);
      return await _classifyBuffer(sock, msg, chatId, senderJid, thumbBuf, false);
    }

    let buffer = null;
    try {
      const stream = await downloadContentFromMessage(mediaMsg, mediaType);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      buffer = Buffer.concat(chunks);
    } catch (dlErr) {
      console.error(chalk.red('[ANTINSFW] Media download failed:'), dlErr.message);
      return false;
    }

    if (!buffer || buffer.length === 0) return false;

    return await _classifyBuffer(sock, msg, chatId, senderJid, buffer, isSticker);

  } catch (err) {
    console.error(chalk.red('[ANTINSFW] Error:'), err.message);
    return false;
  }
};

const _classifyBuffer = async (sock, msg, chatId, senderJid, buffer, convertFromWebP) => {
  try {
    const axios = require('axios');
    let imgBuf = buffer;

    if (convertFromWebP) {
      try {
        const Jimp = require('jimp');
        const jimg = await Jimp.read(buffer);
        imgBuf = await jimg.getBufferAsync(Jimp.MIME_JPEG);
      } catch (e) {
        console.error(chalk.red('[ANTINSFW] WebP→JPEG conversion failed:'), e.message);
        return false;
      }
    }

    const b64 = imgBuf.toString('base64');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${b64}` }
              },
              {
                type: 'text',
                text: 'Is this image pornographic, sexually explicit, hentai, or NSFW (not safe for work)? Reply with only YES or NO.'
              }
            ]
          }
        ],
        max_tokens: 5,
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const answer = (response.data?.choices?.[0]?.message?.content || '').trim().toUpperCase();
    if (!answer.startsWith('YES')) return false;

    console.log(chalk.yellow('[ANTINSFW] 🔞 NSFW content detected via Groq Vision'));
    return act(sock, msg, chatId, senderJid, 'antinsfw', ANTINSFW_WARN, ANTINSFW_KICK, 'warn');
  } catch (err) {
    console.error(chalk.red('[ANTINSFW] Groq classification error:'), err.message);
    return false;
  }
};

const loadJson = (file) => {
  try {
    const p = path.join(process.cwd(), 'database', file);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
  } catch { return {}; }
};

const ANTI_MEDIA_WARN = [
  'ɪs ʏᴏᴜʀ ᴅᴀᴅ ғᴏᴏʟɪsʜ? ᴄᴀɴ\'ᴛ ʏᴏᴜ ᴍᴀᴋᴇ ᴜsᴇ ᴏғ ʏᴏᴜʀ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴀʀᴇ ᴛʀʏɪɴɢ ᴛᴏ ғᴜʟʟ ᴍʏ sᴛᴏʀᴀɢᴇ ᴡɪᴛʜ ᴛʜɪs ʏᴏᴜʀ sᴛᴜᴘɪᴅ ᴍᴇᴅɪᴀ? ',
  'ᴀʀᴇ ʏᴏᴜ sᴛᴜᴘɪᴅ? ᴛʜᴀᴛ ɪs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ',
  'ᴀʀᴇ ʏᴏᴜ ᴅᴜᴍʙ? ᴜsᴇ ᴠɪᴇᴡ ᴏɴᴄᴇ sᴛᴜᴘɪᴅ ᴋɪᴅ.'
];

const delNotify = async (sock, msg, chatId, senderJid, notice) => {
  try { await sock.sendMessage(chatId, { delete: msg.key }); } catch {}
  await sock.sendMessage(chatId,
    { text: `@${senderJid.split('@')[0]} ${notice}`, mentions: [senderJid] },
    { quoted: msg }).catch(() => {});
  return true;
};

//antivn
const handleAntiVoiceNote = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antivoicenote.json')[chatId]) return false;
  if (!msg.message?.audioMessage?.ptt) return false;
  console.log(chalk.yellow(`[ANTIVOICENOTE] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ᴠᴏɪᴄᴇ ɴᴏᴛᴇs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ, ᴛʏᴘᴇ ɪᴛ');
};

//antiaudio 
const handleAntiAudio = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antiaudio.json')[chatId]) return false;
  if (!msg.message?.audioMessage) return false;
  const isPtt = msg.message.audioMessage?.ptt === true;
  const notice = isPtt ? 'ᴠᴏɪᴄᴇ ɴᴏᴛᴇs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ, ᴛʏᴘᴇ ɪᴛ' : rand(ANTI_MEDIA_WARN);
  console.log(chalk.yellow(`[ANTIAUDIO] ${isPtt ? 'PTT' : 'audio'} — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, notice);
};

//antivideo 
const handleAntiVideo = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antivideo.json')[chatId]) return false;
  if (!msg.message?.videoMessage || msg.message.videoMessage?.gifPlayback) return false;
  console.log(chalk.yellow(`[ANTIVIDEO] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, rand(ANTI_MEDIA_WARN));
};

//antigif
const handleAntiGif = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antigif.json')[chatId]) return false;
  if (!msg.message?.videoMessage?.gifPlayback) return false;
  console.log(chalk.yellow(`[ANTIGIF] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ɴᴏ ɢɪғs ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ');
};

//antiimage 
const handleAntiImage = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antiimage.json')[chatId]) return false;
  if (!msg.message?.imageMessage) return false;
  console.log(chalk.yellow(`[ANTIIMAGE] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, rand(ANTI_MEDIA_WARN));
};

//antidocs
const handleAntiDocument = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antidocument.json')[chatId]) return false;
  if (!msg.message?.documentMessage) return false;
  console.log(chalk.yellow(`[ANTIDOCUMENT] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ɴᴏ ᴅᴏᴄᴜᴍᴇɴᴛs ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ');
};

//anticontact 
const handleAntiContact = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('anticontact.json')[chatId]) return false;
  if (!msg.message?.contactMessage && !msg.message?.contactsArrayMessage) return false;
  console.log(chalk.yellow(`[ANTICONTACT] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ᴄᴏɴᴛᴀᴄᴛ sʜᴀʀɪɴɢ ɪs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ');
};

//antilocation 
const handleAntiLocation = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antilocation.json')[chatId]) return false;
  if (!msg.message?.locationMessage && !msg.message?.liveLocationMessage) return false;
  console.log(chalk.yellow(`[ANTILOCATION] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ʟᴏᴄᴀᴛɪᴏɴ sʜᴀʀɪɴɢ ɪs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ');
};

//antipoll
const handleAntiPoll = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antipoll.json')[chatId]) return false;
  const isPoll = !!(msg.message?.pollCreationMessage || msg.message?.pollCreationMessageV2 || msg.message?.pollCreationMessageV3);
  if (!isPoll) return false;
  console.log(chalk.yellow(`[ANTIPOLL] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ᴘᴏʟʟs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ, ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴘᴏʟʟ');
};

//antireaction
const handleAntiReaction = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antireaction.json')[chatId]) return false;
  if (!msg.message?.reactionMessage) return false;
  const reactKey = msg.message.reactionMessage?.key;
  if (!reactKey) return false;
  console.log(chalk.yellow(`[ANTIREACTION] remove — ${senderJid.split('@')[0]}`));
  try { await sock.sendMessage(chatId, { react: { text: '', key: reactKey } }); } catch {}
  return true;
};

//antimentionall 
const handleAntiMentionAll = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antimentionall.json')[chatId]) return false;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentioned.length < 5) return false;
  console.log(chalk.yellow(`[ANTIMENTIONALL] ${mentioned.length} mentions — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ᴍᴀss ᴍᴇɴᴛɪᴏɴɪɴɢ ɪs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ, ᴅᴇʟᴇᴛᴇᴅ');
};

// ============================================
// ANTI-ANIMATED-STICKER — database/anticstic.json  { chatId: true/false }
// stickerMessage where isAnimated = true
// ============================================
const handleAntiAnimatedSticker = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('anticstic.json')[chatId]) return false;
  if (!msg.message?.stickerMessage?.isAnimated) return false;
  console.log(chalk.yellow(`[ANTICSTIC] animated sticker — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ᴀɴɪᴍᴀᴛᴇᴅ sᴛɪᴄᴋᴇʀs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ');
};

// ============================================
// ANTI-COMMAND — database/anticommand.json  { chatId: true/false }
// Non-admins cannot use bot commands in this group
// ============================================
const handleAntiCommand = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('anticommand.json')[chatId]) return false;
  const text = getText(msg);
  if (!text) return false;
  if (!/^[.!/,;#$@]/.test(text)) return false;
  console.log(chalk.yellow(`[ANTICOMMAND] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴄᴏᴍᴍᴀɴᴅs ʜᴇʀᴇ');
};

// ============================================
// ANTI-INVITE — database/antiinvite.json  { chatId: true/false }
// WhatsApp group invite links (chat.whatsapp.com/)
// ============================================
const INVITE_LINK_RE = /chat\.whatsapp\.com\/[A-Za-z0-9]+/i;

const handleAntiInvite = async (sock, msg, chatId, senderJid) => {
  if (!loadJson('antiinvite.json')[chatId]) return false;
  const text = getText(msg);
  if (!text || !INVITE_LINK_RE.test(text)) return false;
  console.log(chalk.yellow(`[ANTIINVITE] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ɢʀᴏᴜᴘ ɪɴᴠɪᴛᴇ ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ');
};

// ============================================
// ANTI-REPEAT — database/antirepeat.json  { chatId: { enabled, maxRepeat, windowSecs } }
// ============================================
if (!global._antiRepeatTrack) global._antiRepeatTrack = {};

const handleAntiRepeat = async (sock, msg, chatId, senderJid) => {
  const data = loadJson('antirepeat.json');
  const cfg2 = data[chatId];
  if (!cfg2?.enabled) return false;
  const text = getText(msg);
  if (!text || text.length < 2) return false;

  const key = `${chatId}:${senderJid}`;
  const now = Date.now();
  const windowMs = (cfg2.windowSecs || 60) * 1000;
  const max = cfg2.maxRepeat || 3;

  if (!global._antiRepeatTrack[key] || global._antiRepeatTrack[key].text !== text) {
    global._antiRepeatTrack[key] = { text, times: [now] };
    return false;
  }
  const entry = global._antiRepeatTrack[key];
  entry.times = entry.times.filter(t => now - t < windowMs);
  entry.times.push(now);
  if (entry.times.length < max) return false;

  console.log(chalk.yellow(`[ANTIREPEAT] ${entry.times.length}x — ${senderJid.split('@')[0]}`));
  global._antiRepeatTrack[key] = { text: '', times: [] };
  return delNotify(sock, msg, chatId, senderJid, 'sᴛᴏᴘ ʀᴇᴘᴇᴀᴛɪɴɢ ᴛʜᴇ sᴀᴍᴇ ᴍᴇssᴀɢᴇ');
};

// ============================================
// ANTI-TROLL — database/antitroll.json  { chatId: { enabled, threshold, window } }
// Warn→kick on same-message repeat with configurable window
// ============================================
if (!global._antiTrollTrack) global._antiTrollTrack = {};

const handleAntiTroll = async (sock, msg, chatId, senderJid) => {
  const data = loadJson('antitroll.json');
  const cfg2 = data[chatId];
  if (!cfg2?.enabled) return false;
  const text = getText(msg);
  if (!text || text.length < 2) return false;

  const key = `${chatId}:${senderJid}`;
  const now = Date.now();
  const windowMs = cfg2.window || 30000;
  const threshold = cfg2.threshold || 5;

  if (!global._antiTrollTrack[key] || global._antiTrollTrack[key].text !== text) {
    global._antiTrollTrack[key] = { text, times: [now] };
    return false;
  }
  const entry = global._antiTrollTrack[key];
  entry.times = entry.times.filter(t => now - t < windowMs);
  entry.times.push(now);
  if (entry.times.length < threshold) return false;

  console.log(chalk.yellow(`[ANTITROLL] triggered — ${senderJid.split('@')[0]}`));
  global._antiTrollTrack[key] = { text: '', times: [] };
  try { await sock.sendMessage(chatId, { delete: msg.key }); } catch {}
  const count = db.addWarning(chatId, senderJid, 'antitroll');
  const num = senderJid.split('@')[0];
  if (count >= 3) {
    await sock.sendMessage(chatId, { text: `@${num} ᴛʀᴏʟʟɪɴɢ ᴀғᴛᴇʀ ᴡᴀʀɴɪɴɢs, ᴋɪᴄᴋᴇᴅ`, mentions: [senderJid] }, { quoted: msg }).catch(() => {});
    try { await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove'); } catch {}
    db.clearWarnings(chatId, senderJid, 'antitroll');
  } else {
    await sock.sendMessage(chatId, { text: `@${num} sᴛᴏᴘ ᴛʀᴏʟʟɪɴɢ — ᴡᴀʀɴɪɴɢ ${count}/3`, mentions: [senderJid] }, { quoted: msg }).catch(() => {});
  }
  return true;
};

// ============================================
// ANTI-SCAM — database/antiscam.json  { chatId: { enabled, keywords:[] } }
// ============================================
const handleAntiScam = async (sock, msg, chatId, senderJid) => {
  const data = loadJson('antiscam.json');
  const cfg2 = data[chatId];
  if (!cfg2?.enabled || !cfg2.keywords?.length) return false;
  const text = getText(msg).toLowerCase();
  if (!text) return false;
  const found = cfg2.keywords.find(kw => text.includes(kw.toLowerCase()));
  if (!found) return false;
  console.log(chalk.yellow(`[ANTISCAM] "${found}" — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'sᴄᴀᴍ ᴄᴏɴᴛᴇɴᴛ ᴅᴇᴛᴇᴄᴛᴇᴅ ᴀɴᴅ ʀᴇᴍᴏᴠᴇᴅ');
};

// ============================================
// ANTI-PHISHING — database/antiphishing.json  { chatId: { enabled, domains:[] } }
// ============================================
const handleAntiPhishing = async (sock, msg, chatId, senderJid) => {
  const data = loadJson('antiphishing.json');
  const cfg2 = data[chatId];
  if (!cfg2?.enabled || !cfg2.domains?.length) return false;
  const text = getText(msg).toLowerCase();
  if (!text) return false;
  const found = cfg2.domains.find(d => text.includes(d.toLowerCase()));
  if (!found) return false;
  console.log(chalk.yellow(`[ANTIPHISHING] "${found}" — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'ᴘʜɪsʜɪɴɢ ʟɪɴᴋ ᴅᴇᴛᴇᴄᴛᴇᴅ ᴀɴᴅ ʀᴇᴍᴏᴠᴇᴅ');
};

// ============================================
// ANTI-HATE SPEECH — database/antihatespeech.json  { chatId: { enabled, terms:[] } }
// ============================================
const handleAntiHateSpeech = async (sock, msg, chatId, senderJid) => {
  const data = loadJson('antihatespeech.json');
  const cfg2 = data[chatId];
  if (!cfg2?.enabled || !cfg2.terms?.length) return false;
  const text = getText(msg).toLowerCase();
  if (!text) return false;
  const found = cfg2.terms.find(t => text.includes(t.toLowerCase()));
  if (!found) return false;
  console.log(chalk.yellow(`[ANTIHATESPEECH] "${found}" — ${senderJid.split('@')[0]}`));
  return act(sock, msg, chatId, senderJid, 'antihatespeech',
    ['ʜᴀᴛᴇ sᴘᴇᴇᴄʜ ɪs ɴᴏᴛ ᴛᴏʟᴇʀᴀᴛᴇᴅ ʜᴇʀᴇ, ᴡᴀᴛᴄʜ ʏᴏᴜʀ ᴍᴏᴜᴛʜ'],
    ['ʜᴀᴛᴇ sᴘᴇᴇᴄʜ ᴀғᴛᴇʀ ᴍᴜʟᴛɪᴘʟᴇ ᴡᴀʀɴɪɴɢs, ᴋɪᴄᴋᴇᴅ'], 'warn');
};

// ============================================
// ANTI-DOXX — database/antidoxx.json  { chatId: { enabled, patterns:[] } }
// ============================================
const handleAntiDoxx = async (sock, msg, chatId, senderJid) => {
  const data = loadJson('antidoxx.json');
  const cfg2 = data[chatId];
  if (!cfg2?.enabled || !cfg2.patterns?.length) return false;
  const text = getText(msg);
  if (!text) return false;
  const found = cfg2.patterns.find(p => { try { return new RegExp(p, 'i').test(text); } catch { return false; } });
  if (!found) return false;
  console.log(chalk.yellow(`[ANTIDOXX] — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'sʜᴀʀɪɴɢ ᴘᴇʀsᴏɴᴀʟ ɪɴғᴏ ɪs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ, ᴅᴇʟᴇᴛᴇᴅ');
};

// ============================================
// ANTI-SHORT URL — database/antishorturl.json  { chatId: { enabled, domains:[] } }
// ============================================
const handleAntiShortUrl = async (sock, msg, chatId, senderJid) => {
  const data = loadJson('antishorturl.json');
  const cfg2 = data[chatId];
  if (!cfg2?.enabled || !cfg2.domains?.length) return false;
  const text = getText(msg).toLowerCase();
  if (!text) return false;
  const found = cfg2.domains.find(d => text.includes(d.toLowerCase()));
  if (!found) return false;
  console.log(chalk.yellow(`[ANTISHORTURL] "${found}" — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, 'sʜᴏʀᴛ ᴜʀʟs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ — ᴜsᴇ ᴀ ᴅɪʀᴇᴄᴛ ʟɪɴᴋ');
};

// ============================================
// ANTI-FORWARD SPAM — database/antiforwardspam.json  { chatId: { enabled, maxPerHour } }
// Tracks forwards per user per hour
// ============================================
if (!global._fwdSpamTrack) global._fwdSpamTrack = {};

const handleAntiForwardSpam = async (sock, msg, chatId, senderJid) => {
  const data = loadJson('antiforwardspam.json');
  const cfg2 = data[chatId];
  if (!cfg2?.enabled) return false;
  const isForwarded = Object.values(msg.message || {}).some(m2 =>
    m2?.contextInfo?.isForwarded || (m2?.contextInfo?.forwardingScore || 0) > 0
  );
  if (!isForwarded) return false;

  const key = `${chatId}:${senderJid}`;
  const now = Date.now();
  if (!global._fwdSpamTrack[key]) global._fwdSpamTrack[key] = [];
  global._fwdSpamTrack[key] = global._fwdSpamTrack[key].filter(t => now - t < 3600000);
  global._fwdSpamTrack[key].push(now);
  const max = cfg2.maxPerHour || 3;
  if (global._fwdSpamTrack[key].length <= max) return false;

  console.log(chalk.yellow(`[ANTIFORWARDSPAM] ${global._fwdSpamTrack[key].length}/hr — ${senderJid.split('@')[0]}`));
  return delNotify(sock, msg, chatId, senderJid, `ᴛᴏᴏ ᴍᴀɴʏ ғᴏʀᴡᴀʀᴅs — ʟɪᴍɪᴛ ɪs ${max}/ʜʀ`);
};

// ============================================
// ANTIPROMOTE / ANTIDEMOTE
// Called from group-participants.update in devine.js
// ============================================
const resolveParticipantJid = async (sock, chatId, rawJid) => {
  if (!rawJid) return rawJid;
  if (!rawJid.endsWith('@lid')) return rawJid.replace(/:\d+@/, '@');
  try {
    const meta = await sock.groupMetadata(chatId);
    const cleanRaw = rawJid.replace(/:\d+@/, '@');
    const match = meta.participants.find(p => {
      const cId  = (p.id  || '').replace(/:\d+@/, '@');
      const cLid = (p.lid || '').replace(/:\d+@/, '@');
      return cId === cleanRaw || cLid === cleanRaw;
    });
    if (match) {
      if (match.phoneNumber) return match.phoneNumber.replace(/:\d+@/, '@');
      if (match.id && !match.id.endsWith('@lid')) return match.id.replace(/:\d+@/, '@');
      if (match.lid && !match.lid.endsWith('@lid')) return match.lid.replace(/:\d+@/, '@');
    }
  } catch { /* fall through */ }
  return rawJid.replace('@lid', '@s.whatsapp.net').replace(/:\d+@/, '@');
};

const handleAntiPromote = async (sock, chatId, actorJid, targetJid) => {
  if (!db.getAnti(chatId, 'antipromote')) return false;
  const resolvedTarget = await resolveParticipantJid(sock, chatId, targetJid);
  const resolvedActor  = await resolveParticipantJid(sock, chatId, actorJid);

  try { await sock.groupParticipantsUpdate(chatId, [resolvedTarget], 'demote'); } catch { /* silent */ }

  await sock.sendMessage(chatId, {
    text: `@${resolvedActor?.split('@')[0]} ${rand(ANTIPROMOTE_REPLIES)}`,
    mentions: [resolvedActor]
  });

  console.log(chalk.yellow(`[ANTIPROMOTE] reversed — ${resolvedActor?.split('@')[0]}`));
  return true;
};

const handleAntiDemote = async (sock, chatId, actorJid, targetJid) => {
  if (!db.getAnti(chatId, 'antidemote')) return false;
  const resolvedTarget = await resolveParticipantJid(sock, chatId, targetJid);
  const resolvedActor  = await resolveParticipantJid(sock, chatId, actorJid);

  try { await sock.groupParticipantsUpdate(chatId, [resolvedTarget], 'promote'); } catch { /* silent */ }

  await sock.sendMessage(chatId, {
    text: `@${resolvedActor?.split('@')[0]} ${rand(ANTIDEMOTE_REPLIES)}`,
    mentions: [resolvedActor]
  });

  console.log(chalk.yellow(`[ANTIDEMOTE] reversed — ${resolvedActor?.split('@')[0]}`));
  return true;
};

// ============================================
// ANTIRAID
// Called from group-participants.update in devine.js
// 5+ joins within 60s = raid detected
// ============================================
const handleAntiRaid = async (sock, groupId, participants) => {
  if (!db.getAnti(groupId, 'antiraid')) return;

  if (!global.raidTracker) global.raidTracker = {};
  if (!global.raidTracker[groupId]) global.raidTracker[groupId] = [];

  const now = Date.now();
  global.raidTracker[groupId] = global.raidTracker[groupId].filter(t => now - t.time < 60000);
  participants.forEach(p => global.raidTracker[groupId].push({ jid: p, time: now }));

  const joinCount = global.raidTracker[groupId].length;

  if (joinCount >= 5) {
    for (const entry of global.raidTracker[groupId]) {
      try { await sock.groupParticipantsUpdate(groupId, [entry.jid], 'remove'); } catch { /* silent */ }
    }

    await sock.sendMessage(groupId, {
      text: `⚠️ 𝑹𝑨𝑰𝑫 𝑫𝑬𝑻𝑬𝑪𝑻𝑬𝑫 — ${joinCount} accounts removed. group is locked.`
    });

    global.raidTracker[groupId] = [];
  }
};

// MAIN RUNNER
const runAntiFeatures = async (sock, msg, chatId, senderJid) => {
  try {
    const isAdmin = await checkSenderAdmin(sock, chatId, senderJid).catch(() => false);
    if (isAdmin) return false;

    //Text-based
    if (await handleAntiLink(sock, msg, chatId, senderJid))           return true;
    if (await handleAntiInvite(sock, msg, chatId, senderJid))         return true;
    if (await handleAntiShortUrl(sock, msg, chatId, senderJid))       return true;
    if (await handleAntiSwear(sock, msg, chatId, senderJid))          return true;
    if (await handleAntiScam(sock, msg, chatId, senderJid))           return true;
    if (await handleAntiPhishing(sock, msg, chatId, senderJid))       return true;
    if (await handleAntiHateSpeech(sock, msg, chatId, senderJid))     return true;
    if (await handleAntiDoxx(sock, msg, chatId, senderJid))           return true;
    if (await handleAntiBadWord(sock, msg, chatId, senderJid))        return true;
    if (await handleAntiBeg(sock, msg, chatId, senderJid))            return true;
    if (await handleAntiCaps(sock, msg, chatId, senderJid))           return true;
    if (await handleAntiEmoji(sock, msg, chatId, senderJid))          return true;
    if (await handleAntiAza(sock, msg, chatId, senderJid))            return true;
    if (await handleAntiCommand(sock, msg, chatId, senderJid))        return true;

    //Spam / rate trackers
    if (await handleAntiSpam(sock, msg, chatId, senderJid))           return true;
    if (await handleAntiSpam2(sock, msg, chatId, senderJid))          return true;
    if (await handleAntiRepeat(sock, msg, chatId, senderJid))         return true;
    if (await handleAntiTroll(sock, msg, chatId, senderJid))          return true;
    if (await handleAntiForward(sock, msg, chatId, senderJid))        return true;
    if (await handleAntiForwardSpam(sock, msg, chatId, senderJid))    return true;

    // ── User / bot behaviour ──
    if (await handleAntiBot(sock, msg, chatId, senderJid))            return true;
    if (await handleAntiStatusMention(sock, msg, chatId, senderJid))  return true;
    if (await handleAntiTagAll(sock, msg, chatId, senderJid))         return true;
    if (await handleAntiMentionAll(sock, msg, chatId, senderJid))     return true;

    // ── Media type ──
    if (await handleAntiVoiceNote(sock, msg, chatId, senderJid))      return true;
    if (await handleAntiAudio(sock, msg, chatId, senderJid))          return true;
    if (await handleAntiVideo(sock, msg, chatId, senderJid))          return true;
    if (await handleAntiGif(sock, msg, chatId, senderJid))            return true;
    if (await handleAntiImage(sock, msg, chatId, senderJid))          return true;
    if (await handleAntiDocument(sock, msg, chatId, senderJid))       return true;
    if (await handleAntiContact(sock, msg, chatId, senderJid))        return true;
    if (await handleAntiLocation(sock, msg, chatId, senderJid))       return true;
    if (await handleAntiPoll(sock, msg, chatId, senderJid))           return true;
    if (await handleAntiReaction(sock, msg, chatId, senderJid))       return true;
    if (await handleAntiAnimatedSticker(sock, msg, chatId, senderJid)) return true;

    // ── AI / content ──
    if (await handleAntiNSFW(sock, msg, chatId, senderJid))           return true;

    return false;
  } catch (err) {
    console.error(chalk.red('[ANTI-HANDLERS] Error:'), err.message);
    return false;
  }
};

module.exports = {
  runAntiFeatures,
  handleAntiPromote,
  handleAntiDemote,
  handleAntiRaid,
  checkBotAdmin,
  checkSenderAdmin,
  getNsfwModel
};
