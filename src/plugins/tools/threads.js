/* THREADS.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
module.exports = {
  command: 'threads',
  category: 'darkweb',
  description: 'Get info about a Threads post from URL',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const threadsUrl = args[0];
    if (!threadsUrl || !threadsUrl.includes('threads.net')) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}threads <threads.net url>\n\n${h.toBoldItalic('Example')}: ${prefix}threads https://www.threads.net/@username/post/ABC123`);
    try {
      await reply(`🧵 ${h.toBoldItalic('Fetching thread...')} ${h.demonEmoji()}`);
      const res = await axios.get(`https://www.threads.net/oembed/?url=${encodeURIComponent(threadsUrl)}`, { headers: { 'User-Agent': 'CrittixMD/2.0 (whatsapp-bot)' }, timeout: 15000 });
      const data = res.data;
      let txt = `╔═══════════════════════════════╗\n║ 🧵 𝐓𝐇𝐑𝐄𝐀𝐃𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `👤 ${h.toBoldItalic(data.author_name || 'Unknown')}\n`;
      txt += `🔗 ${h.toBoldItalic('@' + (data.author_url?.split('/').pop() || '?'))}\n\n`;
      if (data.html) {
        const textContent = data.html.replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim().slice(0,500);
        if (textContent) txt += `💬 ${h.toBoldItalic('Post')}:\n${textContent}\n\n`;
      }
      txt += `🔗 ${h.toBoldItalic('View')}: ${threadsUrl}\n\n💀 ${h.toBoldItalic('Powered by Threads oEmbed')} ${h.demonEmoji()}`;
      if (data.thumbnail_url) {
        try {
          const thumbBuffer = await axios.get(data.thumbnail_url, { responseType: 'arraybuffer', timeout: 10000 });
          await sock.sendMessage(chatId, { image: Buffer.from(thumbBuffer.data), caption: txt, mimetype: 'image/jpeg' }, { quoted: msg });
        } catch { await sock.sendMessage(chatId, { text: txt }, { quoted: msg }); }
      } else {
        await sock.sendMessage(chatId, { text: txt }, { quoted: msg });
      }
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Could not fetch thread')} ${h.demonEmoji()}\n\nMake sure the post is public and URL is valid`);
    }
  }
};
