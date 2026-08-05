const axios = require('axios');

const NEKOS_ENDPOINTS = {
  shinobu:  'https://nekos.life/api/v2/img/shinobu',
  handhold: 'https://nekos.life/api/v2/img/holdhands',
  nekogif:  'https://nekos.life/api/v2/img/neko',
  tickle:   'https://nekos.life/api/v2/img/tickle',
};

module.exports = Object.entries(NEKOS_ENDPOINTS).map(([cmd, apiUrl]) => ({
  command: cmd,
  aliases: [],
  category: 'arena',
  description: `Send a ${cmd} anime reaction GIF`,
  execute: async ({ sock, msg, sender, chatId, reply }) => {
    try {
      const res = await axios.get(apiUrl);
      const url = res.data?.url;
      if (!url) return reply(`❌ *No ${cmd} GIF found*`);

      const target =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      const senderNum = `+${sender.split('@')[0]}`;
      const targetNum = target ? `+${target.split('@')[0]}` : 'themselves';

      const captions = {
        nom:      `😋 ${senderNum} is nomming ${targetNum}`,
        slap:     `👋 ${senderNum} slapped ${targetNum}`,
        cuddle:   `🤗 ${senderNum} is cuddling ${targetNum}`,
        awoo:     `🐺 ${senderNum} let out an AWOO!`,
        shinobu:  `🦋 ${senderNum} sent Shinobu`,
        handhold: `🤝 ${senderNum} is holding hands with ${targetNum}`,
        neko:     `🐱 Neko energy from ${senderNum}`,
        smug2:    `😏 ${senderNum} is being smug`,
        tickle:   `🤣 ${senderNum} tickled ${targetNum}`,
        feed:     `🍱 ${senderNum} fed ${targetNum}`
      };

      await sock.sendMessage(chatId, {
        image: { url },
        caption: `${captions[cmd] || `${senderNum} — ${cmd}`}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
    } catch {
      reply(`❌ *Failed to fetch ${cmd} image*`);
    }
  }
}));
