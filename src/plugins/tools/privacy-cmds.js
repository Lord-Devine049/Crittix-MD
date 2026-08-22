/*
 * PRIVACY-CMDS.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: archive, unarchive, pinchat, unpinchat, forward, blocklist,
 *           lastseen, mystatus, mypp, readreceipts, gcaddprivacy
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = [

  {
    command: 'archive',
    aliases: ['archivechat'],
    category: 'soultools',
    description: 'Archive the current chat. Usage: .archive',
    execute: async ({ sock, msg, chatId, sender, isOwner, isSudo, reply }) => {
      if (!isOwner && !isSudo) return reply(p.phrases.ownerOnly());
      try {
        await sock.chatModify({ archive: true, lastMessages: [{ key: msg.key, messageTimestamp: msg.messageTimestamp }] }, chatId);
        reply(p.phrases.success(`Chat archived. Out of sight, out of mind.`));
      } catch (e) { reply(p.phrases.error(`Archive failed: ${e.message}`)); }
    }
  },

  {
    command: 'unarchive',
    aliases: ['unarchivechat'],
    category: 'soultools',
    description: 'Unarchive the current chat. Usage: .unarchive',
    execute: async ({ sock, msg, chatId, isOwner, isSudo, reply }) => {
      if (!isOwner && !isSudo) return reply(p.phrases.ownerOnly());
      try {
        await sock.chatModify({ archive: false, lastMessages: [{ key: msg.key, messageTimestamp: msg.messageTimestamp }] }, chatId);
        reply(p.phrases.success(`Chat unarchived. Welcome back to the chaos.`));
      } catch (e) { reply(p.phrases.error(`Unarchive failed: ${e.message}`)); }
    }
  },

  {
    command: 'pinchat',
    aliases: ['pinconvo'],
    category: 'soultools',
    description: 'Pin the current chat. Usage: .pinchat',
    execute: async ({ sock, chatId, isOwner, isSudo, reply }) => {
      if (!isOwner && !isSudo) return reply(p.phrases.error('Only the owner can pin chats.'));
      try {
        await sock.chatModify({ pin: true }, chatId);
        reply(p.phrases.success(`Chat pinned. You care about this one.`));
      } catch (e) { reply(p.phrases.error(`Pin failed: ${e.message}`)); }
    }
  },

  {
    command: 'unpinchat',
    aliases: ['unpinconvo'],
    category: 'soultools',
    description: 'Unpin the current chat. Usage: .unpinchat',
    execute: async ({ sock, chatId, isOwner, isSudo, reply }) => {
      if (!isOwner && !isSudo) return reply(p.phrases.error('Only the owner can unpin chats.'));
      try {
        await sock.chatModify({ pin: false }, chatId);
        reply(p.phrases.success(`Chat unpinned. Back to the pile.`));
      } catch (e) { reply(p.phrases.error(`Unpin failed: ${e.message}`)); }
    }
  },

  {
    command: 'forward',
    aliases: ['fwdmsg', 'forwardmsg'],
    category: 'soultools',
    description: 'Forward a quoted message to a number. Usage: .forward <number> (reply to a message)',
    execute: async ({ sock, msg, args, chatId, isOwner, isSudo, reply }) => {
      if (!isOwner && !isSudo) return reply(p.phrases.error('Only owner/sudo can forward messages.'));
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const quotedMsg = ctx?.quotedMessage;
      if (!quotedMsg) return reply(p.phrases.error('Reply to the message you want to forward first.'));
      const num = args[0]?.replace(/[^0-9]/g, '');
      if (!num) return reply(p.phrases.wrongUsage('reply to a message and provide the number to forward to. example! .forward 2348012345678'));
      const target = `${num}@s.whatsapp.net`;
      try {
        await sock.sendMessage(target, { forward: { key: { remoteJid: chatId, id: ctx.stanzaId, fromMe: false, participant: ctx.participant }, message: quotedMsg } });
        reply(p.phrases.success(`forwarded to ${num}.`));
      } catch (e) { reply(p.phrases.error(`Forward failed: ${e.message}`)); }
    }
  },

  {
    command: 'blocklist',
    aliases: ['myblocks', 'showblocked'],
    category: 'soultools',
    description: 'Show the bot\'s blocked contacts list. Usage: .blocklist',
    execute: async ({ sock, isOwner, isSudo, reply }) => {
      if (!isOwner && !isSudo) return reply(p.phrases.error('Only owner/sudo can view the blocklist.'));
      try {
        const blocked = await sock.fetchBlocklist();
        if (!blocked || !blocked.length) return reply(`🚫 *BLOCKLIST*\n\nNobody blocked. You're too forgiving.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        const list = blocked.map((jid, i) => `${i + 1}. @${jid.split('@')[0]}`).join('\n');
        reply(`🚫 *BLOCKLIST (${blocked.length})*\n\n${list}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`Couldn't fetch blocklist: ${e.message}`)); }
    }
  },

  {
    command: 'lastseen',
    aliases: ['lastseenprivacy', 'setlastseen'],
    category: 'soultools',
    description: 'Toggle bot last-seen visibility. ownerOnly. Usage: .lastseen everyone|contacts|nobody',
    ownerOnly: true,
    execute: async ({ sock, args, reply }) => {
      const value = (args[0] || 'contacts').toLowerCase();
      const valid = ['everyone', 'contacts', 'contact_blacklist', 'nobody'];
      const mapped = value === 'nobody' ? 'none' : value === 'everyone' ? 'all' : value === 'contacts' ? 'contacts' : null;
      if (!mapped) return reply(p.phrases.error('Use: .lastseen everyone | contacts | nobody'));
      try {
        await sock.updateLastSeenPrivacy(mapped);
        reply(p.phrases.success(`Last seen set to *${value}*. Privacy is a virtue.`));
      } catch (e) { reply(p.phrases.error(`Last seen privacy failed: ${e.message}`)); }
    }
  },

  {
    command: 'mystatus',
    aliases: ['statusprivacy', 'setstatusprivacy'],
    category: 'soultools',
    description: 'Toggle bot status/story visibility. ownerOnly. Usage: .mystatus everyone|contacts|nobody',
    ownerOnly: true,
    execute: async ({ sock, args, reply }) => {
      const value = (args[0] || 'contacts').toLowerCase();
      const mapped = value === 'everyone' ? 'all' : value === 'nobody' ? 'none' : 'contacts';
      try {
        await sock.updateStatusPrivacy(mapped);
        reply(p.phrases.success(`Status visibility set to *${value}*. Choose your audience wisely.`));
      } catch (e) { reply(p.phrases.error(`Status privacy failed: ${e.message}`)); }
    }
  },

  {
    command: 'mypp',
    aliases: ['ppprivacy', 'profilepicprivacy'],
    category: 'soultools',
    description: 'Toggle bot profile picture visibility. ownerOnly. Usage: .mypp everyone|contacts|nobody',
    ownerOnly: true,
    execute: async ({ sock, args, reply }) => {
      const value = (args[0] || 'contacts').toLowerCase();
      const mapped = value === 'everyone' ? 'all' : value === 'nobody' ? 'none' : 'contacts';
      try {
        await sock.updateProfilePicturePrivacy(mapped);
        reply(p.phrases.success(`Profile picture visibility set to *${value}*. Stay mysterious.`));
      } catch (e) { reply(p.phrases.error(`Profile pic privacy failed: ${e.message}`)); }
    }
  },

  {
    command: 'readreceipts',
    aliases: ['readreceiptsprivacy', 'bluetick'],
    category: 'soultools',
    description: 'Toggle bot read receipts (blue ticks). ownerOnly. Usage: .readreceipts on|off',
    ownerOnly: true,
    execute: async ({ sock, args, reply }) => {
      const toggle = (args[0] || 'on').toLowerCase();
      const value = toggle === 'off' ? 'none' : 'all';
      try {
        await sock.updateReadReceiptsPrivacy(value);
        reply(p.phrases.success(`Read receipts: *${toggle === 'off' ? 'OFF — ghost mode activated' : 'ON — they know you\'ve seen it'}*`));
      } catch (e) { reply(p.phrases.error(`Read receipts toggle failed: ${e.message}`)); }
    }
  },

  {
    command: 'gcaddprivacy',
    aliases: ['groupaddprivacy', 'whocanaddme'],
    category: 'soultools',
    description: 'Toggle who can add bot to groups. ownerOnly. Usage: .gcaddprivacy everyone|contacts|admins',
    ownerOnly: true,
    execute: async ({ sock, args, reply }) => {
      const value = (args[0] || 'contacts').toLowerCase();
      const mapped = value === 'everyone' ? 'all' : value === 'admins' ? 'none' : 'contacts';
      try {
        await sock.updateGroupsAddPrivacy(mapped);
        reply(p.phrases.success(`Group-add privacy set to *${value}*. Control who can drag you into chaos.`));
      } catch (e) { reply(p.phrases.error(`Group-add privacy failed: ${e.message}`)); }
    }
  }

];
