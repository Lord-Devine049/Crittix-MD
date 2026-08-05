const axios = require('axios');

const NEKO_BASE = 'https://nekos.life/api/v2/img';

const reactions = [
  { command: 'laugh',     aliases: ['lol','haha'],            endpoint: 'laugh',    emoji: '😂', verb: 'is laughing' },
  { command: 'bored',     aliases: ['boring','meh'],          endpoint: 'bored',    emoji: '😑', verb: 'is bored' },
  { command: 'facepalm',  aliases: ['fp','facedesk'],         endpoint: 'facepalm', emoji: '🤦', verb: 'is facepalming' },
  { command: 'feed',      aliases: ['feedanime','givefood'],  endpoint: 'feed',     emoji: '🍜', verb: 'fed' },
  { command: 'cuddle',    aliases: ['snuggle','heldclose'],   endpoint: 'cuddle',   emoji: '🥰', verb: 'cuddled' },
  { command: 'pout',      aliases: ['sulk','grumpy'],         endpoint: 'pout',     emoji: '😤', verb: 'is pouting at' },
  { command: 'stare',     aliases: ['gaze','eyeing'],         endpoint: 'stare',    emoji: '👀', verb: 'is staring at' },
  { command: 'think',     aliases: ['thinking','ponder'],     endpoint: 'think',    emoji: '🤔', verb: 'is thinking about' },
  { command: 'awoo',      aliases: ['howl','wolf'],           endpoint: 'awoo',     emoji: '🐺', verb: 'awoos at' },
  { command: 'confused',  aliases: ['confuse','bewildered'],  endpoint: 'confused', emoji: '😕', verb: 'is confused at' },
  { command: 'nod',       aliases: ['agree','yesyes'],        endpoint: 'nod',      emoji: '✅', verb: 'nodded at' },
  { command: 'nom',       aliases: ['eating','munch'],        endpoint: 'nom',      emoji: '🍪', verb: 'is nomming' },
  { command: 'triggered', aliases: ['angry2','angery'],       endpoint: 'triggered', emoji: '😡', verb: 'is triggered at' },
  { command: 'shocked',   aliases: ['gasp','surprised2'],     endpoint: 'shocked',  emoji: '😱', verb: 'is shocked at' },
  { command: 'spin',      aliases: ['spinning'],     endpoint: 'spin',     emoji: '🌀', verb: 'is spinning' },
];

module.exports = reactions.map(r => ({
  command: r.command,
  aliases: r.aliases,
  category: 'shadowstrike',
  description: `${r.emoji} ${r.command} reaction. Usage: ${r.command} @user`,
  execute: async ({ sock, chatId, msg, text, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const sender = msg.key.participant || msg.key.remoteJid;
    const sNum = sender.split('@')[0];
    const tNum = mentioned ? mentioned.split('@')[0] : null;

    try {
      const res = await axios.get(`${NEKO_BASE}/${r.endpoint}`, { timeout: 8000 });
      const gifUrl = res.data.url;

      const caption = tNum
        ? `${r.emoji} *@${sNum}* ${r.verb} *@${tNum}*!`
        : `${r.emoji} *@${sNum}* ${r.verb}!`;

      await sock.sendMessage(chatId, {
        video: { url: gifUrl },
        gifPlayback: true,
        caption,
        mentions: mentioned ? [sender, mentioned] : [sender]
      }, { quoted: msg });
    } catch {
      const caption = tNum
        ? `${r.emoji} *@${sNum}* ${r.verb} *@${tNum}*!`
        : `${r.emoji} *@${sNum}* ${r.verb}!`;
      reply(caption);
    }
  }
}));
