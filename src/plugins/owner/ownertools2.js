const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = [
  {
    command: 'listgroups',
    aliases: ['allgroups', 'botgroups'],
    category: 'voidsystem',
    description: 'List all groups the bot is in',
    ownerOnly: true,
    execute: async ({ sock, reply }) => {
      try {
        const groups = await sock.groupFetchAllParticipating();
        const list = Object.values(groups);
        const text = list.map((g,i) => `${i+1}. *${g.subject}* (${g.participants.length} members)`).join('\n');
        reply(`👥 *Bot Groups (${list.length})*\n\n${text}`);
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'leavegroup',
    aliases: ['quitgroup', 'exitgc'],
    category: 'voidsystem',
    description: 'Make bot leave a specific group by JID. Usage: leavegroup [group-jid]',
    ownerOnly: true,
    execute: async ({ args, sock, chatId, reply }) => {
      const jid = args[0] || chatId;
      if (!jid) return reply(p.phrases.wrongUsage('provide the group jid or use the command inside the target group. example! .leavegroup 1234567890@g.us'));
      try {
        await reply('👋 *Leaving group...*');
        await sock.groupLeave(jid);
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
  {
    command: 'deletemsg',
    aliases: ['delmsg', 'unsend'],
    category: 'voidsystem',
    description: 'Delete (unsend) a bot message. Reply to it with this command',
    ownerOnly: true,
    execute: async ({ sock, msg, chatId, reply }) => {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctx) return reply('❌ *Reply to a message to delete it*');
      try {
        await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: true, id: ctx.stanzaId } });
      } catch(e) { reply(p.phrases.error('could not delete message. ' + e.message)); }
    }
  },
  {
    command: 'sendmsg',
    aliases: ['pm', 'directmsg'],
    category: 'voidsystem',
    description: 'Send a message to any JID. Usage: sendmsg 2348012345678 Hello!',
    ownerOnly: true,
    execute: async ({ args, sock, reply }) => {
      const jid = args[0];
      const message = args.slice(1).join(' ');
      if (!jid || !message) return reply(p.phrases.wrongUsage('provide the number then your message. example! .sendmsg 2348012345678 hello there!'));
      const formattedJid = jid.includes('@') ? jid : jid.replace(/[^0-9]/g,'') + '@s.whatsapp.net';
      try {
        await sock.sendMessage(formattedJid, { text: message });
        reply(p.phrases.success(`message sent to ${jid}.`));
      } catch(e) { reply(p.phrases.error('failed. ' + e.message)); }
    }
  },
  {
    command: 'setbio',
    aliases: ['changebio', 'updatebio'],
    category: 'voidsystem',
    description: 'Set the bot\'s about/bio text. Usage: setbio Your new bio here',
    ownerOnly: true,
    execute: async ({ text, sock, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type the new bio after the command. example! .setbio the realest bot in the game.'));
      try {
        await sock.updateProfileStatus(text);
        reply(p.phrases.success(`bio updated.`));
      } catch(e) { reply(p.phrases.error('failed to update bio. ' + e.message)); }
    }
  },
  {
    command: 'acceptgroupinvite',
    aliases: ['joiningc', 'joinvialink2'],
    category: 'voidsystem',
    description: 'Accept a group invite link. Usage: acceptgroupinvite https://chat.whatsapp.com/...',
    ownerOnly: true,
    execute: async ({ args, sock, reply }) => {
      const url = args[0];
      if (!url || !url.includes('chat.whatsapp.com')) return reply(p.phrases.wrongUsage('provide the whatsapp group invite link. example! .acceptgroupinvite https://chat.whatsapp.com/xxx'));
      const code = url.split('/').pop();
      try {
        await sock.groupAcceptInvite(code);
        reply(p.phrases.success('joined the group successfully.'));
      } catch(e) { reply(p.phrases.error('failed to join group. ' + e.message)); }
    }
  },
  {
    command: 'dumpgroups',
    aliases: ['exportgroups', 'groupjids'],
    category: 'voidsystem',
    description: 'Export all group JIDs the bot is in',
    ownerOnly: true,
    execute: async ({ sock, reply }) => {
      try {
        const groups = await sock.groupFetchAllParticipating();
        const jids = Object.keys(groups);
        const list = jids.map((j,i) => `${i+1}. \`${j}\``).join('\n');
        reply(`📋 *Group JIDs (${jids.length})*\n\n${list}`);
      } catch(e) { reply(p.phrases.error(e.message)); }
    }
  },
];
