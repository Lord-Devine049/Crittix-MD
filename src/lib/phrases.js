/*
 * PHRASES.JS Crittix-MD
 * Central admin module: phrase pools + all admin check functions
 * Created by: LORD DEVINE
 */

const owner = require('./owner');

//small caps
const SC = (t) => t
  .replace(/a/g,'ᴀ').replace(/b/g,'ʙ').replace(/c/g,'ᴄ').replace(/d/g,'ᴅ')
  .replace(/e/g,'ᴇ').replace(/f/g,'ғ').replace(/g/g,'ɢ').replace(/h/g,'ʜ')
  .replace(/i/g,'ɪ').replace(/j/g,'ᴊ').replace(/k/g,'ᴋ').replace(/l/g,'ʟ')
  .replace(/m/g,'ᴍ').replace(/n/g,'ɴ').replace(/o/g,'ᴏ').replace(/p/g,'ᴘ')
  .replace(/q/g,'Q').replace(/r/g,'ʀ').replace(/s/g,'s').replace(/t/g,'ᴛ')
  .replace(/u/g,'ᴜ').replace(/v/g,'ᴠ').replace(/w/g,'ᴡ').replace(/x/g,'x')
  .replace(/y/g,'ʏ').replace(/z/g,'ᴢ');

// When a non-admin tries an admin command
const ADMIN_ONLY = [
  SC("you're not an admin. sit the fuck down."),
  SC("this command doesn't exist for you. admins only."),
  SC("lol. you? using an admin command? try again when you matter."),
  SC("not your lane admins only move along, dumbfuck."),
  SC("the audacity. you're not an admin, fool."),
  SC("nice try stupid kid, you ain't an admin don't be retard."),
  SC("you have no power here. admins only."),
  SC("asshole. you don't have the clearance for this."),
  SC("access denied. are you stupid? you ain't an admin"),
  SC("who gave you the nerve? admins only, step back."),
  SC("you sure are foolish, admin only kid."),
  SC("I blame your dad for not using condom cuz you clearly know that you ain't an admin but still wanna stress me, stupid kid."),
];

// When the bot itself needs to be admin to execute
const BOT_NEEDS_ADMIN = [
  SC("make me admin first, stupid fool."),
  SC("i'm not an admin, dumbfuck."),
  SC("i need admin to do that. put me in charge or shut up."),
  SC("you again? make me admin."),
  SC("you want me to do that without admin? hilarious fool. promote me first."),
  SC("i can't move without admin rights. fix that."),
  SC("make me admin first foolish kid."),
  SC("no admin, no action. simple math."),
  SC("i'm not a guest here. make me admin and i'll handle it."),
  SC("promote me first. i don't take orders without authority."),
];

// When neither sender nor bot is admin (double failure)
const ACCESS_DENIED = [
  SC("access denied. you're neither an admin nor the owner. embarrassing."),
  SC("you have no authority here. get out of the command panel."),
  SC("this is way above your pay grade. denied."),
  SC("admins and owners only. you're neither. bye."),
  SC("you walked into the wrong room. this is admin territory."),
  SC("denied. come back when you actually have rank."),
  SC("you don't have the clearance. not even close."),
  SC("lmao. denied. go sit with the regular members."),
];

// Owner-only commands
const OWNER_ONLY = [
  SC("This is for My Lord Only, you worthless NPC."),
  SC("owner only. you're not him. move."),
  SC("are you mad? tryna use the Lord command, funny bastard"),
  SC("Owner cmd only, you're just a retard densed mf"),
  SC("owner-restricted, you like big things just like how your mom love your dad big dick."),
  SC("denied, go fuck yourself this is for my Owner only"),
  SC("you wish. owner only commands are sealed from you."),
  SC("not your command. owner only. get lost."),
];

// ─────────────────────────────────────────────
// When a user uses a command the wrong way
const WRONG_USAGE = [
  SC("are you stupid? that is not how you use this fool!"),
  SC("who taught you how to use a bot? embarrassing!"),
  SC("you used that command wrong and you look dumb doing it."),
  SC("not even close. you clearly have no idea what you are doing!"),
  SC("you broke the command like a broke phone."),
  SC("wrong! try again when you learn how to read."),
  SC("that is not how this works. that is not how any of this works!"),
  SC("bro what was that? use the command properly fool!"),
  SC("you really typed that and hit send? try again."),
  SC("wrong usage. you should be embarrassed honestly."),
  SC("did you even read the command description? clearly not!"),
  SC("this is painful to watch. fix your usage!"),
];


// When a command succeeds
const SUCCESS = [
  SC("done. no mercy."),
  SC("executed. no questions."),
  SC("handled. move on."),
  SC("consider it done."),
  SC("done. this is what power looks like."),
  SC("finished. clean."),
  SC("it is done. next."),
  SC("carried out. silently."),
  SC("done. without hesitation."),
  SC("executed. as commanded."),
  SC("sorted. do not test me again."),
  SC("dealt with. move along."),
];

// When something fails or errors
const ERROR = [
  SC("something broke. not my fault."),
  SC("that failed. try again later."),
  SC("crashed. the void consumed it."),
  SC("request failed. blame the servers."),
  SC("it died. try again."),
  SC("error. the darkness rejected it."),
  SC("failed. as expected honestly."),
  SC("something went wrong. again."),
  SC("could not complete that. try again."),
  SC("broke on impact. try again later."),
];

// When something is already enabled
const ALREADY_ENABLED = [
  SC("it is already on. were you not paying attention?"),
  SC("already active. calm down."),
  SC("already enabled. relax."),
  SC("that is already running fool."),
  SC("it is on already. stop pressing buttons."),
  SC("already on. do you even check before running commands?"),
  SC("still running from before. nothing changed."),
  SC("already enabled. you are just wasting my time."),
];

// When something is already disabled
const ALREADY_DISABLED = [
  SC("it is already off. relax."),
  SC("already disabled. nothing to do here."),
  SC("that is already off fool."),
  SC("already inactive. stop."),
  SC("it was never on. nothing changed."),
  SC("already off. do you even check before running commands?"),
  SC("disabled already. you are just wasting my time."),
  SC("already off. calm down."),
];

// When data or user is not found
const NOT_FOUND = [
  SC("nothing found. did you make that up?"),
  SC("does not exist. check yourself."),
  SC("not found. try something real."),
  SC("no results. that thing does not exist."),
  SC("found nothing. as expected."),
  SC("empty. there is nothing there."),
  SC("not a trace. it does not exist."),
  SC("zero results. maybe try spelling it right."),
];

// When the target is the bot itself
const CANT_TARGET_BOT = [
  SC("you cannot use that on me. nice try though."),
  SC("i am not your target fool."),
  SC("pointing that at me? bold. and stupid."),
  SC("not happening. pick someone else."),
  SC("you really tried that on me? embarrassing."),
  SC("i am untouchable. find another target."),
  SC("that command does not work on its creator."),
  SC("try that on someone who is not running this whole operation."),
];

// When the target is the owner
const CANT_TARGET_OWNER = [
  SC("that is my lord. not a chance."),
  SC("the owner is off limits. back off."),
  SC("you do not touch the owner. ever."),
  SC("lord devine is protected. find another target."),
  SC("not him. pick someone else."),
  SC("the owner cannot be touched by this command."),
  SC("that is the one person you cannot use this on."),
  SC("nice try. the owner is untouchable."),
];

// When command is group only
const GROUP_ONLY = [
  SC("this command only works in groups. where are you?"),
  SC("groups only. get in one first."),
  SC("take this to a group. it does not work here."),
  SC("wrong place. this is a group command fool."),
  SC("this is not a group. command rejected."),
  SC("group command used in dm. embarrassing."),
  SC("go to a group and try again."),
  SC("this command has no business being here. group only."),
];

// When command is DM only
const DM_ONLY = [
  SC("this only works in dm. take it there."),
  SC("dm only command. not here."),
  SC("slide into my dm for this one."),
  SC("wrong place. dm me this command."),
  SC("this does not work in groups. dm only."),
  SC("dm command used in group. not how this works."),
  SC("go to dm and try again."),
  SC("this command belongs in dm. not here."),
];
// RANDOM PICKER
// ─────────────────────────────────────────────
const rand = (pool) => pool[Math.floor(Math.random() * pool.length)];

const phrases = {
  adminOnly:        () => rand(ADMIN_ONLY),
  botNeedsAdmin:    (action = null) => action
    ? SC(`i need admin to ${action}. promote me first kid.`)
    : rand(BOT_NEEDS_ADMIN),
  accessDenied:     () => rand(ACCESS_DENIED),
  ownerOnly:        () => rand(OWNER_ONLY),
  wrongUsage:       (instruction) => `${rand(WRONG_USAGE)} ${SC(instruction)}`,
  success:          (detail = null) => detail ? `${rand(SUCCESS)} ${SC(detail)}` : rand(SUCCESS),
  error:            (detail = null) => detail ? `${rand(ERROR)} ${SC(detail)}` : rand(ERROR),
  alreadyEnabled:   (detail = null) => detail ? `${rand(ALREADY_ENABLED)} ${SC(detail)}` : rand(ALREADY_ENABLED),
  alreadyDisabled:  (detail = null) => detail ? `${rand(ALREADY_DISABLED)} ${SC(detail)}` : rand(ALREADY_DISABLED),
  notFound:         (detail = null) => detail ? `${rand(NOT_FOUND)} ${SC(detail)}` : rand(NOT_FOUND),
  cantTargetBot:    () => rand(CANT_TARGET_BOT),
  cantTargetOwner:  () => rand(CANT_TARGET_OWNER),
  groupOnly:        () => rand(GROUP_ONLY),
  dmOnly:           () => rand(DM_ONLY),
};

//admin check
const normalizeNumber = owner.normalizeNumber;

/**
 * Check if a sender is an admin in the group.
 * Matches by id, lid, jid, and phoneNumber to handle all WhatsApp JID forms.
 */
const isSenderAdmin = async (sock, groupId, senderJid) => {
  try {
    const cleanSender = senderJid.replace(/:\d+@/, '@');
    const numOnly     = (jid) => (jid || '').replace(/[^\d]/g, '').replace(/^0+/, '');
    const senderNum   = numOnly(cleanSender);
    const meta        = await sock.groupMetadata(groupId);
    return !!meta.participants.find(p => {
      const cleanId    = (p.id          || '').replace(/:\d+@/, '@');
      const cleanLid   = (p.lid         || '').replace(/:\d+@/, '@');
      const cleanJid   = (p.jid         || '').replace(/:\d+@/, '@');
      const cleanPhone = (p.phoneNumber || '').replace(/:\d+@/, '@');
      const isMatch    =
        cleanId    === cleanSender ||
        cleanLid   === cleanSender ||
        cleanJid   === cleanSender ||
        (cleanPhone && cleanPhone === cleanSender) ||
        (senderNum && senderNum.length >= 7 && (
          numOnly(cleanId)    === senderNum ||
          numOnly(cleanPhone) === senderNum
        ));
      const isAdm = p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true;
      return isMatch && isAdm;
    });
  } catch {
    return false;
  }
};

/** Alias same as isSenderAdmin */
const isAdmin = async (sock, groupId, userId) => isSenderAdmin(sock, groupId, userId);

/**
 * Check if the bot owner (from owner.json) is an admin in the group.
 */
const isOwnerAdmin = async (sock, groupId) => {
  try {
    const { loadDatabase } = require('./db');
    const ownerData = loadDatabase('owner.json');
    if (!ownerData?.owner) return false;
    const groupMetadata = await sock.groupMetadata(groupId);
    const cleanOwner    = normalizeNumber(ownerData.owner);
    const ownerJid      = cleanOwner + '@s.whatsapp.net';
    const participant   = groupMetadata.participants.find(p => p.id === ownerJid);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
  } catch {
    return false;
  }
};

/**
 * Returns the bot's own JID in both phone-number and LID form.
 * Use this alongside isBotParticipant() to safely check if a participant is the bot.
 */
const getBotJids = (sock) => {
  const rawId  = sock.authState?.creds?.me?.id;
  const botJid = rawId  ? rawId.replace(/:\d+@/, '@')  : null;
  const rawLid = sock.authState?.creds?.me?.lid;
  const botLid = rawLid ? rawLid.replace(/:\d+@/, '@') : null;
  return { botJid, botLid };
};

/**
 * Checks if a participant object refers to the bot itself.
 * Matches across all JID forms WhatsApp might return.
 */
const isBotParticipant = (p, botJid, botLid) => {
  if (!p) return false;
  const cleanId    = (p.id          || '').replace(/:\d+@/, '@');
  const cleanJid   = (p.jid         || '').replace(/:\d+@/, '@');
  const cleanPhone = (p.phoneNumber || '').replace(/:\d+@/, '@');
  const cleanLid   = (p.lid         || '').replace(/:\d+@/, '@');
  return (
    (botJid && (cleanId === botJid || cleanJid === botJid || cleanPhone === botJid)) ||
    (botLid && (cleanId === botLid || cleanJid === botLid || cleanLid  === botLid))
  );
};

/**
 * Check if the bot is an admin in the group.
 */
const isBotAdmin = async (sock, groupId) => {
  try {
    if (!sock.authState?.creds?.me?.id) return false;
    const { botJid, botLid } = getBotJids(sock);
    const meta = await sock.groupMetadata(groupId);
    return !!meta.participants.find(p => isBotParticipant(p, botJid, botLid) && p.admin);
  } catch (err) {
    console.error('[isBotAdmin] Error:', err.message);
    return false;
  }
};

/**
 * Detailed check of a specific user's admin status in a group.
 * Returns { found: boolean, isAdmin: boolean }
 */
const checkOwnerAdminStatus = async (sock, groupId, botPhoneNumber, groupMetadata = null) => {
  try {
    const metadata   = groupMetadata || await sock.groupMetadata(groupId);
    const cleanOwner = normalizeNumber(botPhoneNumber);
    let participant  = metadata.participants.find(p => {
      const pNum = normalizeNumber(p.id.split('@')[0].split(':')[0]);
      return pNum === cleanOwner || cleanOwner.endsWith(pNum) || pNum.endsWith(cleanOwner);
    });
    if (!participant) {
      for (const p of metadata.participants) {
        if (p.id.includes('@lid')) {
          const lidNum = p.id.split('@')[0].split(':')[0];
          if (lidNum && (lidNum === cleanOwner || cleanOwner.includes(lidNum))) {
            participant = p;
            break;
          }
        }
      }
    }
    if (!participant) return { found: false, isAdmin: false };
    const isAdminStatus = participant.admin === 'admin' || participant.admin === 'superadmin';
    return { found: true, isAdmin: isAdminStatus };
  } catch (e) {
    console.error('Error checking owner admin status:', e);
    return { found: false, isAdmin: false };
  }
};

/**
 * Returns true if sender is owner, sudo, or group admin. False otherwise.
 */
const ensureAdmin = async (sock, groupId, sender) => {
  try {
    if (owner.isOwner(sender)) return true;
    if (owner.isSudo(sender))  return true;
    return await isAdmin(sock, groupId, sender);
  } catch (e) {
    console.error('⚠️ Error checking admin permissions:', e);
    return false;
  }
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  ADMIN_ONLY,
  BOT_NEEDS_ADMIN,
  ACCESS_DENIED,
  OWNER_ONLY,
  WRONG_USAGE,
  SUCCESS,
  ERROR,
  ALREADY_ENABLED,
  ALREADY_DISABLED,
  NOT_FOUND,
  CANT_TARGET_BOT,
  CANT_TARGET_OWNER,
  GROUP_ONLY,
  DM_ONLY,
  phrases,
  isSenderAdmin,
  isAdmin,
  isOwnerAdmin,
  getBotJids,
  isBotParticipant,
  isBotAdmin,
  checkOwnerAdminStatus,
  ensureAdmin,
};
