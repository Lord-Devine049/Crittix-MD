/*
 * MEME.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: 'meme',
  category: 'creativetools',
  description: 'Get a random meme',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const axios = require('axios');
    try {
      const res = await axios.get('https://meme-api.com/gimme', { timeout: 8000 });
      const meme = res.data;
      await sock.sendMessage(chatId, { image: { url: meme.url }, caption: '😂 ' + (meme.title||'Meme') }, { quoted: msg });
    } catch(e) { reply(p.phrases.error('could not fetch a meme. try again.')); }
  }
};
