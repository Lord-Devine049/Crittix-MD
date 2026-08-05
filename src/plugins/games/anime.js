/*
 * ANIME.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');

const REACTIONS = [
  'bite','blush','bonk','bully','cringe','dance','glomp',
  'happy','highfive','kill','lick','poke','smile','smug','wave','wink','yeet'
];

const reactionEmoji = {
  bite: '😬', blush: '😊', bonk: '🔨', bully: '😤', cringe: '😬',
  dance: '💃', glomp: '🤗', happy: '😄', highfive: '🙌', kill: '⚔️',
  lick: '👅', poke: '👉', smile: '😄', smug: '😏', wave: '👋',
  wink: '😉', yeet: '🚀'
};

module.exports = {
  command: REACTIONS.map(r => `anime${r}`).concat(REACTIONS),
  aliases: [],
  category: 'shadowstrike',
  description: 'Anime reaction GIFs',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = (command || 'wave').toLowerCase().replace(/^anime/, '');
    const reaction = REACTIONS.includes(cmd) ? cmd : 'wave';

    try {
      const res = await axios.get(`https://waifu.pics/api/sfw/${reaction}`, { timeout: 8000 });
      const gifUrl = res.data?.url;
      if (!gifUrl) return reply(h.demonFail(`No ${reaction} GIF found`));

      const emoji = reactionEmoji[reaction] || '✨';
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const target = ctx?.mentionedJid?.[0]
        ? `@${ctx.mentionedJid[0].split('@')[0]}`
        : '';

      await sock.sendMessage(chatId, {
        video: { url: gifUrl },
        gifPlayback: true,
        caption: `${emoji} *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗔𝗻𝗶𝗺𝗲*\n\n@${sender.split('@')[0]} ${reaction}s ${target}`.trim()
      }, { quoted: msg });
    } catch {
      reply(h.demonFail(`${reaction} GIF unavailable. Try again.`));
    }
  }
};
