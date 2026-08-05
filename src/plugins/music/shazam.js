/* SHAZAM.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'shazam',
  aliases: ['songid'],
  category: 'soultools',
  description: 'Identify a song from audio (requires AUDD_API_KEY)',
  execute: async ({ sock, msg, chatId, prefix, reply }) => {
    const AUDD_KEY = process.env.AUDD_API_KEY;
    if (!AUDD_KEY) return reply(`✘ ${h.toBoldItalic('AUDD_API_KEY not set in .env')} ${h.demonEmoji()}\n\nGet a free key at audd.io`);
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const audioMsg = msg.message?.audioMessage || msg.message?.documentMessage || quotedMsg?.audioMessage || quotedMsg?.documentMessage;
    if (!audioMsg) return reply(`✘ ${h.toBoldItalic('Reply to a voice note or audio file')} ${h.demonEmoji()}\n\n🎵 ${h.toBoldItalic("I'll identify the song!")}`);
    try {
      await reply(`🎵 ${h.toBoldItalic('Listening to the audio...')} ${h.demonEmoji()}`);
      let audioBuffer;
      if (msg.message?.audioMessage || msg.message?.documentMessage) audioBuffer = await downloadMediaMessage(msg, 'buffer', {});
      else {
        const type = quotedMsg?.audioMessage ? 'audio' : 'document';
        const stream = await downloadContentFromMessage(quotedMsg?.audioMessage || quotedMsg?.documentMessage, type);
        audioBuffer = Buffer.from([]);
        for await (const chunk of stream) audioBuffer = Buffer.concat([audioBuffer, chunk]);
      }
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', audioBuffer, { filename: 'audio.ogg', contentType: 'audio/ogg' });
      formData.append('api_token', AUDD_KEY);
      formData.append('return', 'spotify,apple_music');
      const response = await axios.post('https://api.audd.io/', formData, { headers: formData.getHeaders(), timeout: 30000 });
      const result = response.data;
      if (result.status !== 'success' || !result.result) return reply(`✘ ${h.toBoldItalic('Song not recognized')} ${h.demonEmoji()}\n\nTry with a clearer audio clip`);
      const song = result.result;
      const spotifyUrl = song.spotify?.external_urls?.spotify || '';
      const appleMusicUrl = song.apple_music?.url || '';
      const albumArt = song.spotify?.album?.images?.[0]?.url || song.apple_music?.artwork?.url?.replace('{w}x{h}','600x600') || null;
      let txt = `╔═══════════════════════════════╗\n║ 🎵 𝐒𝐎𝐍𝐆 𝐈𝐃𝐄𝐍𝐓𝐈𝐅𝐈𝐄𝐃\n╚═══════════════════════════════╝\n\n`;
      txt += `🎵 ${h.toBoldItalic('Title')}: ${song.title}\n🎤 ${h.toBoldItalic('Artist')}: ${song.artist}\n💿 ${h.toBoldItalic('Album')}: ${song.album || 'N/A'}\n📅 ${h.toBoldItalic('Released')}: ${song.release_date || 'N/A'}\n`;
      if (spotifyUrl) txt += `\n🎧 ${h.toBoldItalic('Spotify')}: ${spotifyUrl}\n`;
      if (appleMusicUrl) txt += `🍎 ${h.toBoldItalic('Apple Music')}: ${appleMusicUrl}\n`;
      txt += `\n💀 ${h.toBoldItalic('Powered by Audd.io')} ${h.demonEmoji()}`;
      if (albumArt) {
        await sock.sendMessage(chatId, { image: { url: albumArt }, caption: txt }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, { text: txt }, { quoted: msg });
      }
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Song recognition failed')} ${h.demonEmoji()}`);
    }
  }
};
